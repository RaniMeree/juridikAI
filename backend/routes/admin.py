"""
Admin routes for Juridik AI - Admin Panel
Requires admin role to access
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, or_, text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timedelta
from jose import JWTError, jwt
import uuid
from typing import Optional

from database import get_db
from routes.auth import User
from routes.conversations import Conversation, Message

router = APIRouter(prefix="/admin", tags=["admin"])

# JWT settings (should match auth.py)
SECRET_KEY = "juridik-ai-secret-key-2026-change-this-in-production"
ALGORITHM = "HS256"


async def get_current_admin(authorization: str = Header(None), db: AsyncSession = Depends(get_db)) -> User:
    """Verify user is authenticated and has admin role"""
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
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    # Get user and verify admin role
    result = await db.execute(
        select(User).where(User.user_id == uuid.UUID(user_id))
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return user


# ============================================
# DASHBOARD - Overview Statistics
# ============================================

@router.get("/dashboard")
async def get_dashboard_stats(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard overview statistics"""
    
    # Total users
    total_users_result = await db.execute(select(func.count(User.user_id)))
    total_users = total_users_result.scalar()
    
    # New users (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_users_result = await db.execute(
        select(func.count(User.user_id))
        .where(User.created_at >= thirty_days_ago)
    )
    new_users = new_users_result.scalar()
    
    # Total conversations
    total_conversations_result = await db.execute(select(func.count(Conversation.conversation_id)))
    total_conversations = total_conversations_result.scalar()
    
    # Total messages
    total_messages_result = await db.execute(select(func.count(Message.message_id)))
    total_messages = total_messages_result.scalar()
    
    # Active subscriptions
    active_subscriptions_result = await db.execute(
        text("SELECT COUNT(*) FROM subscriptions WHERE status = 'active'")
    )
    active_subscriptions = active_subscriptions_result.scalar()
    
    # Total revenue (from payment_history)
    revenue_result = await db.execute(
        text("SELECT COALESCE(SUM(amount), 0) FROM payment_history WHERE status = 'succeeded'")
    )
    total_revenue = float(revenue_result.scalar() or 0)
    
    # Average messages per user
    avg_messages = total_messages / total_users if total_users > 0 else 0
    
    # User growth (last 7 days)
    user_growth = []
    for i in range(6, -1, -1):
        date = datetime.utcnow() - timedelta(days=i)
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        count_result = await db.execute(
            select(func.count(User.user_id))
            .where(User.created_at >= start_of_day)
            .where(User.created_at < end_of_day)
        )
        count = count_result.scalar()
        
        user_growth.append({
            "date": start_of_day.strftime("%Y-%m-%d"),
            "count": count
        })
    
    return {
        "totalUsers": total_users,
        "newUsers": new_users,
        "totalConversations": total_conversations,
        "totalMessages": total_messages,
        "activeSubscriptions": active_subscriptions,
        "totalRevenue": total_revenue,
        "averageMessagesPerUser": round(avg_messages, 2),
        "userGrowth": user_growth
    }


# ============================================
# USERS MANAGEMENT
# ============================================

@router.get("/users")
async def get_all_users(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None
):
    """Get all users with pagination and filters"""
    
    # Build query
    query = select(User)
    
    # Apply filters
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                User.email.ilike(search_pattern),
                User.first_name.ilike(search_pattern),
                User.last_name.ilike(search_pattern)
            )
        )
    
    if status:
        query = query.where(User.account_status == status)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and ordering
    query = query.order_by(desc(User.created_at))
    query = query.offset((page - 1) * limit).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    users = result.scalars().all()
    
    # Get subscription info for each user
    users_data = []
    for user in users:
        # Get subscription
        sub_result = await db.execute(
            text("""
                SELECT plan_type, status, queries_used, query_limit, current_period_end
                FROM subscriptions 
                WHERE user_id = :user_id
                ORDER BY created_at DESC
                LIMIT 1
            """),
            {"user_id": user.user_id}
        )
        subscription = sub_result.first()
        
        # Get message count
        msg_count_result = await db.execute(
            select(func.count(Message.message_id))
            .join(Conversation, Message.conversation_id == Conversation.conversation_id)
            .where(Conversation.user_id == user.user_id)
        )
        message_count = msg_count_result.scalar()
        
        users_data.append({
            "userId": str(user.user_id),
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "phone": user.phone,
            "role": user.role,
            "accountStatus": user.account_status,
            "emailVerified": user.email_verified,
            "createdAt": user.created_at.isoformat() if user.created_at else None,
            "lastLoginAt": user.last_login_at.isoformat() if user.last_login_at else None,
            "messageCount": message_count,
            "subscription": {
                "planType": subscription[0] if subscription else None,
                "status": subscription[1] if subscription else None,
                "queriesUsed": subscription[2] if subscription else 0,
                "queryLimit": subscription[3] if subscription else 0,
                "currentPeriodEnd": subscription[4].isoformat() if subscription and subscription[4] else None
            } if subscription else None
        })
    
    return {
        "users": users_data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }


@router.get("/users/{user_id}")
async def get_user_details(
    user_id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed information about a specific user"""
    
    # Get user
    result = await db.execute(
        select(User).where(User.user_id == uuid.UUID(user_id))
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get conversations count
    conv_count_result = await db.execute(
        select(func.count(Conversation.conversation_id))
        .where(Conversation.user_id == uuid.UUID(user_id))
    )
    conversation_count = conv_count_result.scalar()
    
    # Get messages count
    msg_count_result = await db.execute(
        select(func.count(Message.message_id))
        .join(Conversation, Message.conversation_id == Conversation.conversation_id)
        .where(Conversation.user_id == uuid.UUID(user_id))
    )
    message_count = msg_count_result.scalar()
    
    # Get subscription
    sub_result = await db.execute(
        text("""
            SELECT subscription_id, stripe_customer_id, stripe_subscription_id, 
                   plan_type, status, current_period_start, current_period_end,
                   query_limit, queries_used, created_at
            FROM subscriptions 
            WHERE user_id = :user_id
            ORDER BY created_at DESC
        """),
        {"user_id": user.user_id}
    )
    subscriptions = sub_result.all()
    
    # Get payment history
    payment_result = await db.execute(
        text("""
            SELECT payment_id, amount, currency, status, payment_method, created_at
            FROM payment_history 
            WHERE user_id = :user_id
            ORDER BY created_at DESC
            LIMIT 10
        """),
        {"user_id": user.user_id}
    )
    payments = payment_result.all()
    
    return {
        "userId": str(user.user_id),
        "email": user.email,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "phone": user.phone,
        "role": user.role,
        "accountStatus": user.account_status,
        "emailVerified": user.email_verified,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
        "updatedAt": user.updated_at.isoformat() if user.updated_at else None,
        "lastLoginAt": user.last_login_at.isoformat() if user.last_login_at else None,
        "conversationCount": conversation_count,
        "messageCount": message_count,
        "subscriptions": [
            {
                "subscriptionId": str(sub[0]),
                "stripeCustomerId": sub[1],
                "stripeSubscriptionId": sub[2],
                "planType": sub[3],
                "status": sub[4],
                "currentPeriodStart": sub[5].isoformat() if sub[5] else None,
                "currentPeriodEnd": sub[6].isoformat() if sub[6] else None,
                "queryLimit": sub[7],
                "queriesUsed": sub[8],
                "createdAt": sub[9].isoformat() if sub[9] else None
            }
            for sub in subscriptions
        ],
        "recentPayments": [
            {
                "paymentId": str(payment[0]),
                "amount": float(payment[1]),
                "currency": payment[2],
                "status": payment[3],
                "paymentMethod": payment[4],
                "createdAt": payment[5].isoformat() if payment[5] else None
            }
            for payment in payments
        ]
    }


@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    status: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update user account status (active, suspended, deleted)"""
    
    if status not in ['active', 'suspended', 'deleted']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be 'active', 'suspended', or 'deleted'"
        )
    
    result = await db.execute(
        select(User).where(User.user_id == uuid.UUID(user_id))
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.account_status = status
    user.updated_at = datetime.utcnow()
    await db.commit()
    
    # Log admin action
    await db.execute(
        text("""
            INSERT INTO admin_logs (log_id, admin_id, action, target_type, target_id, details, created_at)
            VALUES (:log_id, :admin_id, :action, :target_type, :target_id, :details, :created_at)
        """),
        {
            "log_id": uuid.uuid4(),
            "admin_id": admin.user_id,
            "action": "update_user_status",
            "target_type": "user",
            "target_id": user.user_id,
            "details": f'{{"new_status": "{status}"}}',
            "created_at": datetime.utcnow()
        }
    )
    await db.commit()
    
    return {"message": f"User status updated to {status}"}


# ============================================
# CONVERSATIONS & MESSAGES
# ============================================

@router.get("/conversations")
async def get_all_conversations(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    user_id: Optional[str] = None
):
    """Get all conversations with pagination"""
    
    query = select(Conversation, User).join(User, Conversation.user_id == User.user_id)
    
    if user_id:
        query = query.where(Conversation.user_id == uuid.UUID(user_id))
    
    # Get total count
    count_query = select(func.count(Conversation.conversation_id))
    if user_id:
        count_query = count_query.where(Conversation.user_id == uuid.UUID(user_id))
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    query = query.order_by(desc(Conversation.last_message_at))
    query = query.offset((page - 1) * limit).limit(limit)
    
    result = await db.execute(query)
    conversations = result.all()
    
    conversations_data = []
    for conv, user in conversations:
        # Get message count
        msg_count_result = await db.execute(
            select(func.count(Message.message_id))
            .where(Message.conversation_id == conv.conversation_id)
        )
        message_count = msg_count_result.scalar()
        
        conversations_data.append({
            "conversationId": str(conv.conversation_id),
            "title": conv.title,
            "status": conv.status,
            "messageCount": message_count,
            "createdAt": conv.created_at.isoformat() if conv.created_at else None,
            "lastMessageAt": conv.last_message_at.isoformat() if conv.last_message_at else None,
            "user": {
                "userId": str(user.user_id),
                "email": user.email,
                "firstName": user.first_name,
                "lastName": user.last_name
            }
        })
    
    return {
        "conversations": conversations_data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }


@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all messages in a conversation"""
    
    # Verify conversation exists
    conv_result = await db.execute(
        select(Conversation).where(Conversation.conversation_id == uuid.UUID(conversation_id))
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
    
    return {
        "conversationId": str(conversation.conversation_id),
        "messages": [
            {
                "messageId": str(msg.message_id),
                "role": msg.role,
                "content": msg.content,
                "sources": msg.sources,
                "tokensUsed": msg.tokens_used,
                "responseTime": msg.response_time,
                "feedback": msg.feedback,
                "createdAt": msg.created_at.isoformat() if msg.created_at else None
            }
            for msg in messages
        ]
    }


# ============================================
# SUBSCRIPTIONS
# ============================================

@router.get("/subscriptions")
async def get_all_subscriptions(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    status_filter: Optional[str] = None
):
    """Get all subscriptions with user details"""
    
    query = text("""
        SELECT 
            s.subscription_id, s.user_id, s.stripe_customer_id, s.stripe_subscription_id,
            s.plan_type, s.status, s.current_period_start, s.current_period_end,
            s.query_limit, s.queries_used, s.created_at,
            u.email, u.first_name, u.last_name
        FROM subscriptions s
        JOIN users u ON s.user_id = u.user_id
        WHERE (:status_filter IS NULL OR s.status = :status_filter)
        ORDER BY s.created_at DESC
        LIMIT :limit OFFSET :offset
    """)
    
    count_query = text("""
        SELECT COUNT(*)
        FROM subscriptions s
        WHERE (:status_filter IS NULL OR s.status = :status_filter)
    """)
    
    # Get total count
    count_result = await db.execute(
        count_query,
        {"status_filter": status_filter}
    )
    total = count_result.scalar()
    
    # Get subscriptions
    result = await db.execute(
        query,
        {
            "status_filter": status_filter,
            "limit": limit,
            "offset": (page - 1) * limit
        }
    )
    subscriptions = result.all()
    
    return {
        "subscriptions": [
            {
                "subscriptionId": str(sub[0]),
                "userId": str(sub[1]),
                "stripeCustomerId": sub[2],
                "stripeSubscriptionId": sub[3],
                "planType": sub[4],
                "status": sub[5],
                "currentPeriodStart": sub[6].isoformat() if sub[6] else None,
                "currentPeriodEnd": sub[7].isoformat() if sub[7] else None,
                "queryLimit": sub[8],
                "queriesUsed": sub[9],
                "createdAt": sub[10].isoformat() if sub[10] else None,
                "user": {
                    "email": sub[11],
                    "firstName": sub[12],
                    "lastName": sub[13]
                }
            }
            for sub in subscriptions
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }


# ============================================
# PAYMENTS
# ============================================

@router.get("/payments")
async def get_all_payments(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """Get all payment transactions"""
    
    query = text("""
        SELECT 
            p.payment_id, p.user_id, p.stripe_payment_intent_id,
            p.amount, p.currency, p.status, p.payment_method, p.created_at,
            u.email, u.first_name, u.last_name
        FROM payment_history p
        JOIN users u ON p.user_id = u.user_id
        ORDER BY p.created_at DESC
        LIMIT :limit OFFSET :offset
    """)
    
    count_query = text("SELECT COUNT(*) FROM payment_history")
    
    # Get total count
    count_result = await db.execute(count_query)
    total = count_result.scalar()
    
    # Get payments
    result = await db.execute(
        query,
        {
            "limit": limit,
            "offset": (page - 1) * limit
        }
    )
    payments = result.all()
    
    return {
        "payments": [
            {
                "paymentId": str(payment[0]),
                "userId": str(payment[1]),
                "stripePaymentIntentId": payment[2],
                "amount": float(payment[3]),
                "currency": payment[4],
                "status": payment[5],
                "paymentMethod": payment[6],
                "createdAt": payment[7].isoformat() if payment[7] else None,
                "user": {
                    "email": payment[8],
                    "firstName": payment[9],
                    "lastName": payment[10]
                }
            }
            for payment in payments
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }


# ============================================
# ANALYTICS
# ============================================

@router.get("/analytics/usage")
async def get_usage_analytics(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
    days: int = Query(30, ge=1, le=365)
):
    """Get usage analytics for the specified period"""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Daily message counts
    daily_messages = []
    for i in range(days - 1, -1, -1):
        date = datetime.utcnow() - timedelta(days=i)
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        count_result = await db.execute(
            select(func.count(Message.message_id))
            .where(Message.created_at >= start_of_day)
            .where(Message.created_at < end_of_day)
        )
        count = count_result.scalar()
        
        daily_messages.append({
            "date": start_of_day.strftime("%Y-%m-%d"),
            "count": count
        })
    
    # Daily active users
    daily_active_users = []
    for i in range(days - 1, -1, -1):
        date = datetime.utcnow() - timedelta(days=i)
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        count_result = await db.execute(
            select(func.count(func.distinct(User.user_id)))
            .join(Conversation, User.user_id == Conversation.user_id)
            .join(Message, Conversation.conversation_id == Message.conversation_id)
            .where(Message.created_at >= start_of_day)
            .where(Message.created_at < end_of_day)
        )
        count = count_result.scalar()
        
        daily_active_users.append({
            "date": start_of_day.strftime("%Y-%m-%d"),
            "count": count
        })
    
    return {
        "dailyMessages": daily_messages,
        "dailyActiveUsers": daily_active_users
    }


# ============================================
# ADMIN LOGS
# ============================================

@router.get("/logs")
async def get_admin_logs(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """Get admin action logs"""
    
    query = text("""
        SELECT 
            l.log_id, l.admin_id, l.action, l.target_type, l.target_id, 
            l.details, l.created_at,
            u.email, u.first_name, u.last_name
        FROM admin_logs l
        JOIN users u ON l.admin_id = u.user_id
        ORDER BY l.created_at DESC
        LIMIT :limit OFFSET :offset
    """)
    
    count_query = text("SELECT COUNT(*) FROM admin_logs")
    
    # Get total count
    count_result = await db.execute(count_query)
    total = count_result.scalar()
    
    # Get logs
    result = await db.execute(
        query,
        {
            "limit": limit,
            "offset": (page - 1) * limit
        }
    )
    logs = result.all()
    
    return {
        "logs": [
            {
                "logId": str(log[0]),
                "adminId": str(log[1]),
                "action": log[2],
                "targetType": log[3],
                "targetId": str(log[4]) if log[4] else None,
                "details": log[5],
                "createdAt": log[6].isoformat() if log[6] else None,
                "admin": {
                    "email": log[7],
                    "firstName": log[8],
                    "lastName": log[9]
                }
            }
            for log in logs
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }


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

" " "  
 A d m i n   F i l e   M a n a g e m e n t   E n d p o i n t s  
 A d d   t h e s e   t o   a d m i n . p y  
 " " "  
  
  
 #   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
 #   F I L E   M A N A G E M E N T   -   U p l o a d e d   F i l e s  
 #   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
  
 @ r o u t e r . g e t ( " / f i l e s " )  
 a s y n c   d e f   g e t _ u p l o a d e d _ f i l e s (  
         p a g e :   i n t   =   Q u e r y ( 1 ,   g e = 1 ) ,  
         l i m i t :   i n t   =   Q u e r y ( 5 0 ,   g e = 1 ,   l e = 1 0 0 ) ,  
         u s e r _ i d :   O p t i o n a l [ s t r ]   =   N o n e ,  
         c o n v e r s a t i o n _ i d :   O p t i o n a l [ s t r ]   =   N o n e ,  
         a d m i n :   U s e r   =   D e p e n d s ( g e t _ c u r r e n t _ a d m i n ) ,  
         d b :   A s y n c S e s s i o n   =   D e p e n d s ( g e t _ d b )  
 ) :  
         " " " G e t   a l l   u p l o a d e d   f i l e s   w i t h   f i l t e r s " " "  
          
         #   B u i l d   q u e r y   t o   g e t   f i l e s   f r o m   m e s s a g e s . a t t a c h e d _ d o c u m e n t s  
         q u e r y   =   " " "  
                 S E L E C T    
                         m . m e s s a g e _ i d ,  
                         m . c o n v e r s a t i o n _ i d ,  
                         m . c r e a t e d _ a t   a s   u p l o a d e d _ a t ,  
                         c . u s e r _ i d ,  
                         u . e m a i l ,  
                         u . f i r s t _ n a m e ,  
                         u . l a s t _ n a m e ,  
                         c . t i t l e   a s   c o n v e r s a t i o n _ t i t l e ,  
                         m . a t t a c h e d _ d o c u m e n t s  
                 F R O M   m e s s a g e s   m  
                 J O I N   c o n v e r s a t i o n s   c   O N   m . c o n v e r s a t i o n _ i d   =   c . c o n v e r s a t i o n _ i d  
                 J O I N   u s e r s   u   O N   c . u s e r _ i d   =   u . u s e r _ i d  
                 W H E R E   m . a t t a c h e d _ d o c u m e n t s   I S   N O T   N U L L    
                 A N D   j s o n b _ a r r a y _ l e n g t h ( m . a t t a c h e d _ d o c u m e n t s )   >   0  
         " " "  
          
         p a r a m s   =   { }  
          
         i f   u s e r _ i d :  
                 q u e r y   + =   "   A N D   c . u s e r _ i d   =   : u s e r _ i d "  
                 p a r a m s [ " u s e r _ i d " ]   =   u u i d . U U I D ( u s e r _ i d )  
          
         i f   c o n v e r s a t i o n _ i d :  
                 q u e r y   + =   "   A N D   m . c o n v e r s a t i o n _ i d   =   : c o n v e r s a t i o n _ i d "  
                 p a r a m s [ " c o n v e r s a t i o n _ i d " ]   =   u u i d . U U I D ( c o n v e r s a t i o n _ i d )  
          
         q u e r y   + =   "   O R D E R   B Y   m . c r e a t e d _ a t   D E S C   L I M I T   : l i m i t   O F F S E T   : o f f s e t "  
         p a r a m s [ " l i m i t " ]   =   l i m i t  
         p a r a m s [ " o f f s e t " ]   =   ( p a g e   -   1 )   *   l i m i t  
          
         #   G e t   f i l e s  
         r e s u l t   =   a w a i t   d b . e x e c u t e ( t e x t ( q u e r y ) ,   p a r a m s )  
         r o w s   =   r e s u l t . a l l ( )  
          
         #   F o r m a t   r e s p o n s e  
         f i l e s   =   [ ]  
         f o r   r o w   i n   r o w s :  
                 a t t a c h e d _ d o c s   =   r o w [ 8 ]     #   a t t a c h e d _ d o c u m e n t s   J S O N B  
                 i f   a t t a c h e d _ d o c s :  
                         f o r   d o c   i n   a t t a c h e d _ d o c s :  
                                 f i l e s . a p p e n d ( {  
                                         " m e s s a g e I d " :   s t r ( r o w [ 0 ] ) ,  
                                         " c o n v e r s a t i o n I d " :   s t r ( r o w [ 1 ] ) ,  
                                         " u p l o a d e d A t " :   r o w [ 2 ] . i s o f o r m a t ( )   i f   r o w [ 2 ]   e l s e   N o n e ,  
                                         " u s e r I d " :   s t r ( r o w [ 3 ] ) ,  
                                         " u s e r E m a i l " :   r o w [ 4 ] ,  
                                         " u s e r N a m e " :   f " { r o w [ 5 ]   o r   ' ' }   { r o w [ 6 ]   o r   ' ' } " . s t r i p ( ) ,  
                                         " c o n v e r s a t i o n T i t l e " :   r o w [ 7 ] ,  
                                         " f i l e " :   {  
                                                 " f i l e I d " :   d o c . g e t ( " f i l e _ i d " ) ,  
                                                 " f i l e n a m e " :   d o c . g e t ( " f i l e n a m e " ) ,  
                                                 " f i l e T y p e " :   d o c . g e t ( " f i l e _ t y p e " ) ,  
                                                 " f i l e S i z e " :   d o c . g e t ( " f i l e _ s i z e " ) ,  
                                                 " w o r d C o u n t " :   d o c . g e t ( " w o r d _ c o u n t " ) ,  
                                                 " c h u n k C o u n t " :   d o c . g e t ( " c h u n k _ c o u n t " ) ,  
                                                 " r 2 O b j e c t K e y " :   d o c . g e t ( " r 2 _ o b j e c t _ k e y " ) ,  
                                                 " r 2 F i l e U r l " :   d o c . g e t ( " r 2 _ f i l e _ u r l " )  
                                         }  
                                 } )  
          
         #   G e t   t o t a l   c o u n t  
         c o u n t _ q u e r y   =   " " "  
                 S E L E C T   C O U N T ( * )  
                 F R O M   m e s s a g e s   m  
                 J O I N   c o n v e r s a t i o n s   c   O N   m . c o n v e r s a t i o n _ i d   =   c . c o n v e r s a t i o n _ i d  
                 W H E R E   m . a t t a c h e d _ d o c u m e n t s   I S   N O T   N U L L    
                 A N D   j s o n b _ a r r a y _ l e n g t h ( m . a t t a c h e d _ d o c u m e n t s )   >   0  
         " " "  
          
         c o u n t _ p a r a m s   =   { }  
         i f   u s e r _ i d :  
                 c o u n t _ q u e r y   + =   "   A N D   c . u s e r _ i d   =   : u s e r _ i d "  
                 c o u n t _ p a r a m s [ " u s e r _ i d " ]   =   u u i d . U U I D ( u s e r _ i d )  
         i f   c o n v e r s a t i o n _ i d :  
                 c o u n t _ q u e r y   + =   "   A N D   m . c o n v e r s a t i o n _ i d   =   : c o n v e r s a t i o n _ i d "  
                 c o u n t _ p a r a m s [ " c o n v e r s a t i o n _ i d " ]   =   u u i d . U U I D ( c o n v e r s a t i o n _ i d )  
          
         c o u n t _ r e s u l t   =   a w a i t   d b . e x e c u t e ( t e x t ( c o u n t _ q u e r y ) ,   c o u n t _ p a r a m s )  
         t o t a l   =   c o u n t _ r e s u l t . s c a l a r ( )  
          
         r e t u r n   {  
                 " f i l e s " :   f i l e s ,  
                 " p a g i n a t i o n " :   {  
                         " p a g e " :   p a g e ,  
                         " l i m i t " :   l i m i t ,  
                         " t o t a l " :   t o t a l ,  
                         " t o t a l P a g e s " :   ( t o t a l   +   l i m i t   -   1 )   / /   l i m i t   i f   t o t a l   e l s e   0  
                 }  
         }  
  
  
 @ r o u t e r . g e t ( " / f i l e s / s t a t s " )  
 a s y n c   d e f   g e t _ f i l e _ s t a t s (  
         a d m i n :   U s e r   =   D e p e n d s ( g e t _ c u r r e n t _ a d m i n ) ,  
         d b :   A s y n c S e s s i o n   =   D e p e n d s ( g e t _ d b )  
 ) :  
         " " " G e t   f i l e   u p l o a d   s t a t i s t i c s " " "  
          
         q u e r y   =   " " "  
                 S E L E C T    
                         C O U N T ( D I S T I N C T   m . m e s s a g e _ i d )   a s   t o t a l _ m e s s a g e s _ w i t h _ f i l e s ,  
                         S U M ( ( m . a t t a c h e d _ d o c u m e n t s - > 0 - > > ' f i l e _ s i z e ' ) : : b i g i n t )   a s   t o t a l _ s i z e ,  
                         C O U N T ( D I S T I N C T   c . u s e r _ i d )   a s   u s e r s _ w i t h _ u p l o a d s  
                 F R O M   m e s s a g e s   m  
                 J O I N   c o n v e r s a t i o n s   c   O N   m . c o n v e r s a t i o n _ i d   =   c . c o n v e r s a t i o n _ i d  
                 W H E R E   m . a t t a c h e d _ d o c u m e n t s   I S   N O T   N U L L    
                 A N D   j s o n b _ a r r a y _ l e n g t h ( m . a t t a c h e d _ d o c u m e n t s )   >   0  
         " " "  
          
         r e s u l t   =   a w a i t   d b . e x e c u t e ( t e x t ( q u e r y ) )  
         r o w   =   r e s u l t . f i r s t ( )  
          
         r e t u r n   {  
                 " t o t a l F i l e s U p l o a d e d " :   r o w [ 0 ]   o r   0 ,  
                 " t o t a l S t o r a g e U s e d " :   r o w [ 1 ]   o r   0 ,  
                 " u s e r s W i t h U p l o a d s " :   r o w [ 2 ]   o r   0  
         }  
 