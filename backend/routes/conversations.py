"""
Conversation and Message routes for Juridik AI
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Column, String, Integer, DateTime, Text, func, desc
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base
from pydantic import BaseModel
from datetime import datetime
from jose import JWTError, jwt
import uuid
from typing import List, Optional

from database import get_db

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
            "sources": msg.sources or [],
            "createdAt": msg.created_at.isoformat() if msg.created_at else None
        }
        for msg in messages
    ]


@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    request: SendMessageRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Send a message and get AI response"""
    
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
    
    # Save user message
    user_message = Message(
        message_id=uuid.uuid4(),
        conversation_id=uuid.UUID(conversation_id),
        role="user",
        content=request.content,
        attached_documents=request.attachments or [],
        created_at=datetime.utcnow()
    )
    db.add(user_message)
    
    # TODO: Integrate with AI service (RAG, LangChain, OpenAI, etc.)
    # For now, return a simple echo response
    assistant_content = f"Thank you for your message. I received: '{request.content}'. The AI integration is pending."
    
    # Save assistant message
    assistant_message = Message(
        message_id=uuid.uuid4(),
        conversation_id=uuid.UUID(conversation_id),
        role="assistant",
        content=assistant_content,
        sources=[],
        created_at=datetime.utcnow()
    )
    db.add(assistant_message)
    
    # Update conversation
    conversation.message_count = (conversation.message_count or 0) + 2
    conversation.last_message_at = datetime.utcnow()
    conversation.updated_at = datetime.utcnow()
    
    # Generate title from first message
    if conversation.message_count == 2:
        title = request.content[:50] + ("..." if len(request.content) > 50 else "")
        conversation.title = title
    
    await db.commit()
    await db.refresh(user_message)
    await db.refresh(assistant_message)
    
    return {
        "userMessage": {
            "id": str(user_message.message_id),
            "role": "user",
            "content": user_message.content,
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
