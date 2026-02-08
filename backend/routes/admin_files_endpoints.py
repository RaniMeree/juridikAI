"""
Admin File Management Endpoints
Add these to admin.py
"""


# ============================================
# FILE MANAGEMENT - Uploaded Files
# ============================================

@router.get("/files")
async def get_uploaded_files(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    user_id: Optional[str] = None,
    conversation_id: Optional[str] = None,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all uploaded files with filters"""
    
    # Build query to get files from messages.attached_documents
    query = """
        SELECT 
            m.message_id,
            m.conversation_id,
            m.created_at as uploaded_at,
            c.user_id,
            u.email,
            u.first_name,
            u.last_name,
            c.title as conversation_title,
            m.attached_documents
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.conversation_id
        JOIN users u ON c.user_id = u.user_id
        WHERE m.attached_documents IS NOT NULL 
        AND jsonb_array_length(m.attached_documents) > 0
    """
    
    params = {}
    
    if user_id:
        query += " AND c.user_id = :user_id"
        params["user_id"] = uuid.UUID(user_id)
    
    if conversation_id:
        query += " AND m.conversation_id = :conversation_id"
        params["conversation_id"] = uuid.UUID(conversation_id)
    
    query += " ORDER BY m.created_at DESC LIMIT :limit OFFSET :offset"
    params["limit"] = limit
    params["offset"] = (page - 1) * limit
    
    # Get files
    result = await db.execute(text(query), params)
    rows = result.all()
    
    # Format response
    files = []
    for row in rows:
        attached_docs = row[8]  # attached_documents JSONB
        if attached_docs:
            for doc in attached_docs:
                files.append({
                    "messageId": str(row[0]),
                    "conversationId": str(row[1]),
                    "uploadedAt": row[2].isoformat() if row[2] else None,
                    "userId": str(row[3]),
                    "userEmail": row[4],
                    "userName": f"{row[5] or ''} {row[6] or ''}".strip(),
                    "conversationTitle": row[7],
                    "file": {
                        "fileId": doc.get("file_id"),
                        "filename": doc.get("filename"),
                        "fileType": doc.get("file_type"),
                        "fileSize": doc.get("file_size"),
                        "wordCount": doc.get("word_count"),
                        "chunkCount": doc.get("chunk_count"),
                        "r2ObjectKey": doc.get("r2_object_key"),
                        "r2FileUrl": doc.get("r2_file_url")
                    }
                })
    
    # Get total count
    count_query = """
        SELECT COUNT(*)
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.conversation_id
        WHERE m.attached_documents IS NOT NULL 
        AND jsonb_array_length(m.attached_documents) > 0
    """
    
    count_params = {}
    if user_id:
        count_query += " AND c.user_id = :user_id"
        count_params["user_id"] = uuid.UUID(user_id)
    if conversation_id:
        count_query += " AND m.conversation_id = :conversation_id"
        count_params["conversation_id"] = uuid.UUID(conversation_id)
    
    count_result = await db.execute(text(count_query), count_params)
    total = count_result.scalar()
    
    return {
        "files": files,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit if total else 0
        }
    }


@router.get("/files/stats")
async def get_file_stats(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get file upload statistics"""
    
    query = """
        SELECT 
            COUNT(DISTINCT m.message_id) as total_messages_with_files,
            SUM((m.attached_documents->0->>'file_size')::bigint) as total_size,
            COUNT(DISTINCT c.user_id) as users_with_uploads
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.conversation_id
        WHERE m.attached_documents IS NOT NULL 
        AND jsonb_array_length(m.attached_documents) > 0
    """
    
    result = await db.execute(text(query))
    row = result.first()
    
    return {
        "totalFilesUploaded": row[0] or 0,
        "totalStorageUsed": row[1] or 0,
        "usersWithUploads": row[2] or 0
    }
