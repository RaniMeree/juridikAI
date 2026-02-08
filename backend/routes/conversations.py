"""
Conversation and Message routes for Juridik AI
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Column, String, Integer, DateTime, Text, func, desc
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base
from pydantic import BaseModel
from datetime import datetime
from jose import JWTError, jwt
import uuid
import os
import json
from typing import List, Optional
from openai import OpenAI

from database import get_db
from file_processing import FileProcessor
from r2_storage import get_r2_storage

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Models
Base = declarative_base()

class Conversation(Base):
    __tablename__ = "conversations"
    
    conversation_id = Column(UUID(as_uuid=True), primary_key=True)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    title = Column(String(255))
    status = Column(String(20))
    message_count = Column(Integer)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    last_message_at = Column(DateTime)


class Message(Base):
    __tablename__ = "messages"
    
    message_id = Column(UUID(as_uuid=True), primary_key=True)
    conversation_id = Column(UUID(as_uuid=True), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    sources = Column(JSONB)
    attached_documents = Column(JSONB)
    tokens_used = Column(Integer)
    response_time = Column(Integer)
    feedback = Column(String(20))
    created_at = Column(DateTime)


# Pydantic schemas
class SendMessageRequest(BaseModel):
    content: str
    attachments: Optional[List[str]] = None


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    sources: Optional[List[dict]] = []
    createdAt: str


class ConversationResponse(BaseModel):
    id: str
    title: str
    messageCount: int
    lastMessageAt: Optional[str]
    createdAt: str


# Router
router = APIRouter(prefix="/conversations", tags=["conversations"])

# JWT settings (should match auth.py)
SECRET_KEY = "juridik-ai-secret-key-2026-change-this-in-production"
ALGORITHM = "HS256"


async def get_current_user_id(authorization: str = Header(None)) -> str:
    """Extract user ID from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.replace("Bearer ", "")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


@router.get("")
async def get_conversations(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get all conversations for the current user"""
    
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == uuid.UUID(user_id))
        .where(Conversation.status == "active")
        .order_by(desc(Conversation.last_message_at))
    )
    conversations = result.scalars().all()
    
    return [
        {
            "id": str(conv.conversation_id),
            "title": conv.title or "New Conversation",
            "messageCount": conv.message_count or 0,
            "lastMessageAt": conv.last_message_at.isoformat() if conv.last_message_at else None,
            "createdAt": conv.created_at.isoformat() if conv.created_at else None
        }
        for conv in conversations
    ]


@router.post("")
async def create_conversation(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new conversation"""
    
    conversation = Conversation(
        conversation_id=uuid.uuid4(),
        user_id=uuid.UUID(user_id),
        title="New Conversation",
        status="active",
        message_count=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    
    return {
        "id": str(conversation.conversation_id),
        "title": conversation.title,
        "messageCount": 0,
        "lastMessageAt": None,
        "createdAt": conversation.created_at.isoformat()
    }


@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific conversation"""
    
    result = await db.execute(
        select(Conversation)
        .where(Conversation.conversation_id == uuid.UUID(conversation_id))
        .where(Conversation.user_id == uuid.UUID(user_id))
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return {
        "id": str(conversation.conversation_id),
        "title": conversation.title or "New Conversation",
        "messageCount": conversation.message_count or 0,
        "lastMessageAt": conversation.last_message_at.isoformat() if conversation.last_message_at else None,
        "createdAt": conversation.created_at.isoformat() if conversation.created_at else None
    }


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Delete a conversation"""
    
    result = await db.execute(
        select(Conversation)
        .where(Conversation.conversation_id == uuid.UUID(conversation_id))
        .where(Conversation.user_id == uuid.UUID(user_id))
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Soft delete by setting status to archived
    conversation.status = "archived"
    await db.commit()
    
    return {"message": "Conversation deleted successfully"}


@router.get("/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get all messages for a conversation"""
    
    # Verify conversation belongs to user
    conv_result = await db.execute(
        select(Conversation)
        .where(Conversation.conversation_id == uuid.UUID(conversation_id))
        .where(Conversation.user_id == uuid.UUID(user_id))
    )
    conversation = conv_result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Get messages
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == uuid.UUID(conversation_id))
        .order_by(Message.created_at)
    )
    messages = result.scalars().all()
    
    return [
        {
            "id": str(msg.message_id),
            "role": msg.role,
            "content": msg.content,
            "attachedDocuments": msg.attached_documents or [],
            "sources": msg.sources or [],
            "createdAt": msg.created_at.isoformat() if msg.created_at else None
        }
        for msg in messages
    ]


@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    content: str = Form(...),
    files: Optional[List[UploadFile]] = File(None)
):
    """Send a message and get AI response (with optional file attachments)"""
    
    message_content = content
    
    # Verify conversation belongs to user
    conv_result = await db.execute(
        select(Conversation)
        .where(Conversation.conversation_id == uuid.UUID(conversation_id))
        .where(Conversation.user_id == uuid.UUID(user_id))
    )
    conversation = conv_result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Process uploaded files if any
    processed_files = []
    extracted_texts = []
    r2_storage = get_r2_storage()
    
    if files:
        for file in files:
            try:
                # Read file content
                file_content = await file.read()
                
                # Process the file (extract text)
                file_data = FileProcessor.process_file(
                    file_content=file_content,
                    content_type=file.content_type,
                    filename=file.filename
                )
                
                # Upload to R2 storage
                upload_result = r2_storage.upload_file(
                    file_content=file_content,
                    filename=file.filename,
                    content_type=file.content_type,
                    user_id=user_id,
                    conversation_id=conversation_id,
                    metadata={
                        'word_count': file_data['word_count'],
                        'chunk_count': file_data['chunk_count']
                    }
                )
                
                if not upload_result.get('success'):
                    raise Exception(upload_result.get('message', 'Upload failed'))
                
                # Store metadata with R2 URL
                processed_files.append({
                    "file_id": file_data["file_id"],
                    "filename": file_data["filename"],
                    "file_type": file_data["file_type"],
                    "file_size": file_data["file_size"],
                    "word_count": file_data["word_count"],
                    "chunk_count": file_data["chunk_count"],
                    "processed_at": file_data["processed_at"],
                    "r2_object_key": upload_result["object_key"],
                    "r2_file_url": upload_result["file_url"]
                })
                
                # Keep extracted text for AI context
                extracted_texts.append({
                    "filename": file_data["filename"],
                    "text": file_data["extracted_text"],
                    "chunks": file_data["chunks"]
                })
                
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to process file '{file.filename}': {str(e)}"
                )
    
    # Save user message
    user_message = Message(
        message_id=uuid.uuid4(),
        conversation_id=uuid.UUID(conversation_id),
        role="user",
        content=message_content,
        attached_documents=processed_files if processed_files else [],
        created_at=datetime.utcnow()
    )
    db.add(user_message)
    
    # Generate AI response using OpenAI
    try:
        # Get conversation history for context
        history_result = await db.execute(
            select(Message)
            .where(Message.conversation_id == uuid.UUID(conversation_id))
            .order_by(Message.created_at)
            .limit(10)  # Last 10 messages for context
        )
        history_messages = history_result.scalars().all()
        
        # Build conversation context
        system_prompt = (
            "You are Anna, a knowledgeable Swedish legal AI assistant. "
            "You help users understand Swedish law and legal matters. "
            "Provide clear, accurate, and helpful legal information. "
            "Always remind users to consult a qualified lawyer for specific legal advice. "
            "Respond in the same language the user uses (Swedish or English)."
        )
        
        # If user uploaded documents, add instructions for document analysis
        if extracted_texts:
            system_prompt += (
                "\n\nThe user has uploaded document(s). Analyze the documents carefully and answer questions based on their content. "
                "Reference specific parts of the documents in your response when relevant."
            )
        
        messages_for_ai = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        for msg in history_messages:
            messages_for_ai.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Build current user message with document context
        current_message = message_content
        
        # Add document content to the message
        if extracted_texts:
            current_message += "\n\n--- ATTACHED DOCUMENTS ---\n"
            for doc in extracted_texts:
                current_message += f"\n[File: {doc['filename']}]\n"
                # Use chunking for better context
                context = FileProcessor.create_context_for_ai(doc['chunks'], message_content)
                current_message += context + "\n"
        
        messages_for_ai.append({
            "role": "user",
            "content": current_message
        })
        
        # Call OpenAI API
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",  # Using mini for cost efficiency
            messages=messages_for_ai,
            temperature=0.7,
            max_tokens=1500  # Increased for document analysis
        )
        
        assistant_content = response.choices[0].message.content
        tokens_used = response.usage.total_tokens if response.usage else 0
        
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        assistant_content = (
            "I apologize, but I'm having trouble processing your request right now. "
            "Please try again in a moment."
        )
        tokens_used = 0
    
    # Save assistant message
    assistant_message = Message(
        message_id=uuid.uuid4(),
        conversation_id=uuid.UUID(conversation_id),
        role="assistant",
        content=assistant_content,
        sources=[],
        tokens_used=tokens_used,
        created_at=datetime.utcnow()
    )
    db.add(assistant_message)
    
    # Update conversation
    conversation.message_count = (conversation.message_count or 0) + 2
    conversation.last_message_at = datetime.utcnow()
    conversation.updated_at = datetime.utcnow()
    
    # Generate title from first message
    if conversation.message_count == 2:
        title = message_content[:50] + ("..." if len(message_content) > 50 else "")
        if processed_files:
            title = f"📎 {title}"  # Add file indicator
        conversation.title = title
    
    await db.commit()
    await db.refresh(user_message)
    await db.refresh(assistant_message)
    
    return {
        "userMessage": {
            "id": str(user_message.message_id),
            "role": "user",
            "content": user_message.content,
            "attachedDocuments": processed_files,
            "createdAt": user_message.created_at.isoformat()
        },
        "assistantMessage": {
            "id": str(assistant_message.message_id),
            "role": "assistant",
            "content": assistant_message.content,
            "sources": assistant_message.sources or [],
            "createdAt": assistant_message.created_at.isoformat()
        }
    }
