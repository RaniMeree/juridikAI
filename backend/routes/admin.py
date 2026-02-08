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


# File Management Endpoints
@router.get('/files')
async def get_uploaded_files(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    user_id: Optional[str] = None,
    conversation_id: Optional[str] = None,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all uploaded files with user and conversation info"""
    
    # Build query
    query = """
        SELECT 
            uf.file_id,
            uf.filename,
            uf.file_type,
            uf.file_size,
            uf.word_count,
            uf.chunk_count,
            uf.r2_key,
            uf.status,
            uf.created_at,
            uf.user_id,
            uf.conversation_id,
            uf.message_id,
            u.email,
            u.first_name,
            u.last_name,
            c.title as conversation_title
        FROM user_files uf
        JOIN users u ON uf.user_id = u.user_id
        JOIN conversations c ON uf.conversation_id = c.conversation_id
        WHERE 1=1
    """
    params = {}
    
    if user_id:
        query += " AND uf.user_id = :user_id"
        params['user_id'] = uuid.UUID(user_id)
    
    if conversation_id:
        query += " AND uf.conversation_id = :conversation_id"
        params['conversation_id'] = uuid.UUID(conversation_id)
    
    query += " ORDER BY uf.created_at DESC LIMIT :limit OFFSET :offset"
    params['limit'] = limit
    params['offset'] = (page - 1) * limit
    
    result = await db.execute(text(query), params)
    rows = result.all()
    
    files = []
    for row in rows:
        files.append({
            'fileId': str(row[0]),
            'filename': row[1],
            'fileType': row[2],
            'fileSize': row[3],
            'wordCount': row[4],
            'chunkCount': row[5],
            'r2Key': row[6],
            'status': row[7],
            'uploadedAt': row[8].isoformat() if row[8] else None,
            'userId': str(row[9]),
            'conversationId': str(row[10]),
            'messageId': str(row[11]) if row[11] else None,
            'userEmail': row[12],
            'userName': f"{row[13] or ''} {row[14] or ''}".strip(),
            'conversationTitle': row[15]
        })
    
    # Get total count
    count_query = """
        SELECT COUNT(*) FROM user_files uf
        WHERE 1=1
    """
    count_params = {}
    if user_id:
        count_query += " AND uf.user_id = :user_id"
        count_params['user_id'] = uuid.UUID(user_id)
    if conversation_id:
        count_query += " AND uf.conversation_id = :conversation_id"
        count_params['conversation_id'] = uuid.UUID(conversation_id)
    
    count_result = await db.execute(text(count_query), count_params)
    total = count_result.scalar() or 0
    
    return {
        'files': files,
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'totalPages': (total + limit - 1) // limit if total else 0
        }
    }


@router.get('/files/stats')
async def get_file_stats(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get file upload statistics"""
    
    query = """
        SELECT 
            COUNT(*) as total_files,
            COALESCE(SUM(file_size), 0) as total_storage,
            COUNT(DISTINCT user_id) as users_with_uploads,
            COUNT(DISTINCT conversation_id) as conversations_with_files
        FROM user_files
        WHERE status != 'deleted'
    """
    
    result = await db.execute(text(query))
    row = result.first()
    
    return {
        'totalFilesUploaded': row[0] or 0,
        'totalStorageUsed': row[1] or 0,
        'totalStorageUsedMB': round((row[1] or 0) / (1024 * 1024), 2),
        'usersWithUploads': row[2] or 0,
        'conversationsWithFiles': row[3] or 0
    }


# Note: File download/delete endpoints disabled - using Firebase Storage instead
# Uncomment and adapt if you need admin file management features

# @router.get('/files/{file_id}/download-url')
# async def get_file_download_url(
#     file_id: str,
#     admin: User = Depends(get_current_admin),
#     db: AsyncSession = Depends(get_db)
# ):
#     """Generate a pre-signed download URL for a file"""
#     pass

# @router.delete('/files/{file_id}')
# async def delete_file(
#     file_id: str,
#     admin: User = Depends(get_current_admin),
#     db: AsyncSession = Depends(get_db)
# ):
#     """Delete a file from storage"""
#     pass
