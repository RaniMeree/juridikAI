-- ============================================
-- Admin Panel - Useful SQL Queries
-- ============================================
-- These queries can help you manage and monitor your Anna Legal AI system
-- Run these queries directly in PostgreSQL (psql, pgAdmin, etc.)

-- ============================================
-- USER MANAGEMENT
-- ============================================

-- 1. Create an admin user (replace values)
INSERT INTO users (
    user_id, 
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    account_status, 
    email_verified, 
    created_at, 
    updated_at
)
VALUES (
    uuid_generate_v4(),
    'admin@juridikai.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/1wE6V6T8rHmFV.Kte', -- Example hash (password: "admin123")
    'Admin',
    'User',
    'admin',
    'active',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 2. Update an existing user to admin
UPDATE users 
SET role = 'admin', account_status = 'active'
WHERE email = 'your-email@example.com';

-- 3. List all admin users
SELECT 
    user_id,
    email,
    first_name || ' ' || last_name as full_name,
    role,
    account_status,
    created_at,
    last_login_at
FROM users
WHERE role = 'admin'
ORDER BY created_at DESC;

-- 4. Count users by status
SELECT 
    account_status,
    COUNT(*) as user_count
FROM users
GROUP BY account_status;

-- 5. Find users registered in the last 7 days
SELECT 
    user_id,
    email,
    first_name || ' ' || last_name as full_name,
    created_at
FROM users
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 6. Find inactive users (no login in 30 days)
SELECT 
    user_id,
    email,
    first_name || ' ' || last_name as full_name,
    last_login_at,
    created_at
FROM users
WHERE 
    (last_login_at IS NULL AND created_at < CURRENT_TIMESTAMP - INTERVAL '30 days')
    OR last_login_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY COALESCE(last_login_at, created_at) DESC;

-- ============================================
-- CONVERSATIONS & MESSAGES
-- ============================================

-- 7. Top 10 most active users by messages
SELECT 
    u.user_id,
    u.email,
    u.first_name || ' ' || u.last_name as full_name,
    COUNT(m.message_id) as total_messages,
    COUNT(DISTINCT c.conversation_id) as total_conversations
FROM users u
LEFT JOIN conversations c ON u.user_id = c.user_id
LEFT JOIN messages m ON c.conversation_id = m.conversation_id
GROUP BY u.user_id, u.email, u.first_name, u.last_name
ORDER BY total_messages DESC
LIMIT 10;

-- 8. Recent conversations (last 24 hours)
SELECT 
    c.conversation_id,
    u.email as user_email,
    c.title,
    c.message_count,
    c.created_at,
    c.last_message_at
FROM conversations c
JOIN users u ON c.user_id = u.user_id
WHERE c.created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
ORDER BY c.created_at DESC;

-- 9. Messages sent today
SELECT 
    DATE(created_at) as date,
    COUNT(*) as message_count,
    COUNT(DISTINCT conversation_id) as conversation_count
FROM messages
WHERE created_at >= CURRENT_DATE
GROUP BY DATE(created_at);

-- 10. Average response time for assistant messages
SELECT 
    AVG(response_time) as avg_response_ms,
    AVG(response_time) / 1000.0 as avg_response_seconds,
    MIN(response_time) as min_response_ms,
    MAX(response_time) as max_response_ms
FROM messages
WHERE role = 'assistant' AND response_time IS NOT NULL;

-- 11. User feedback statistics
SELECT 
    feedback_type,
    COUNT(*) as feedback_count,
    AVG(rating) as avg_rating
FROM user_feedback
GROUP BY feedback_type
ORDER BY feedback_count DESC;

-- ============================================
-- SUBSCRIPTIONS & PAYMENTS
-- ============================================

-- 12. Active subscriptions summary
SELECT 
    plan_type,
    COUNT(*) as subscription_count,
    AVG(queries_used) as avg_queries_used,
    AVG(query_limit) as avg_query_limit,
    SUM(queries_used) as total_queries_used
FROM subscriptions
WHERE status = 'active'
GROUP BY plan_type;

-- 13. Subscriptions expiring in next 7 days
SELECT 
    s.subscription_id,
    u.email,
    u.first_name || ' ' || u.last_name as full_name,
    s.plan_type,
    s.current_period_end,
    s.queries_used,
    s.query_limit
FROM subscriptions s
JOIN users u ON s.user_id = u.user_id
WHERE 
    s.status = 'active'
    AND s.current_period_end <= CURRENT_TIMESTAMP + INTERVAL '7 days'
    AND s.current_period_end >= CURRENT_TIMESTAMP
ORDER BY s.current_period_end ASC;

-- 14. Users exceeding query limits
SELECT 
    u.email,
    u.first_name || ' ' || u.last_name as full_name,
    s.plan_type,
    s.queries_used,
    s.query_limit,
    s.queries_used - s.query_limit as over_limit_by
FROM subscriptions s
JOIN users u ON s.user_id = u.user_id
WHERE s.queries_used > s.query_limit
ORDER BY over_limit_by DESC;

-- 15. Revenue summary
SELECT 
    DATE_TRUNC('month', created_at) as month,
    currency,
    COUNT(*) as transaction_count,
    SUM(amount) as total_revenue,
    AVG(amount) as avg_transaction
FROM payment_history
WHERE status = 'succeeded'
GROUP BY DATE_TRUNC('month', created_at), currency
ORDER BY month DESC;

-- 16. Payment success rate
SELECT 
    status,
    COUNT(*) as payment_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM payment_history
GROUP BY status
ORDER BY payment_count DESC;

-- ============================================
-- ANALYTICS & MONITORING
-- ============================================

-- 17. Daily active users (last 30 days)
SELECT 
    DATE(m.created_at) as date,
    COUNT(DISTINCT c.user_id) as active_users,
    COUNT(m.message_id) as total_messages
FROM messages m
JOIN conversations c ON m.conversation_id = c.conversation_id
WHERE m.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY DATE(m.created_at)
ORDER BY date DESC;

-- 18. User retention (users who returned after first day)
SELECT 
    COUNT(DISTINCT u.user_id) as total_users,
    COUNT(DISTINCT CASE 
        WHEN EXISTS (
            SELECT 1 FROM conversations c2
            WHERE c2.user_id = u.user_id
            AND DATE(c2.created_at) > DATE(u.created_at)
        ) THEN u.user_id 
    END) as returning_users,
    ROUND(
        COUNT(DISTINCT CASE 
            WHEN EXISTS (
                SELECT 1 FROM conversations c2
                WHERE c2.user_id = u.user_id
                AND DATE(c2.created_at) > DATE(u.created_at)
            ) THEN u.user_id 
        END) * 100.0 / COUNT(DISTINCT u.user_id), 
        2
    ) as retention_percentage
FROM users u;

-- 19. Top error messages in query analytics
SELECT 
    error_message,
    COUNT(*) as error_count,
    MAX(created_at) as last_occurred
FROM query_analytics
WHERE error_occurred = true
GROUP BY error_message
ORDER BY error_count DESC
LIMIT 10;

-- 20. Database size and growth
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- ============================================
-- ADMIN OPERATIONS
-- ============================================

-- 21. View recent admin actions
SELECT 
    l.log_id,
    u.email as admin_email,
    l.action,
    l.target_type,
    l.target_id,
    l.details,
    l.created_at
FROM admin_logs l
JOIN users u ON l.admin_id = u.user_id
ORDER BY l.created_at DESC
LIMIT 20;

-- 22. Suspend a user account
UPDATE users 
SET account_status = 'suspended', updated_at = CURRENT_TIMESTAMP
WHERE email = 'user-to-suspend@example.com';

-- 23. Reactivate a suspended user
UPDATE users 
SET account_status = 'active', updated_at = CURRENT_TIMESTAMP
WHERE email = 'user-to-reactivate@example.com';

-- 24. Delete user data (CAUTION: This will cascade delete all related data)
DELETE FROM users WHERE email = 'user-to-delete@example.com';

-- 25. Reset user password (generate new hash using Python/bcrypt)
UPDATE users 
SET 
    password_hash = '$2b$12$your_new_bcrypt_hash_here',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'user@example.com';

-- ============================================
-- MAINTENANCE & CLEANUP
-- ============================================

-- 26. Archive old conversations (older than 1 year)
UPDATE conversations
SET status = 'archived', updated_at = CURRENT_TIMESTAMP
WHERE 
    created_at < CURRENT_TIMESTAMP - INTERVAL '1 year'
    AND status = 'active';

-- 27. Clean up expired sessions/tokens (if implemented)
-- DELETE FROM user_sessions 
-- WHERE expires_at < CURRENT_TIMESTAMP;

-- 28. Find orphaned records (messages without conversations)
SELECT m.message_id, m.conversation_id, m.created_at
FROM messages m
LEFT JOIN conversations c ON m.conversation_id = c.conversation_id
WHERE c.conversation_id IS NULL;

-- 29. Database vacuum and analyze (maintenance)
VACUUM ANALYZE;

-- 30. Check table statistics
SELECT 
    schemaname,
    tablename,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- ============================================
-- USEFUL VIEWS FOR ADMIN PANEL
-- ============================================

-- 31. Create a comprehensive user view
CREATE OR REPLACE VIEW admin_user_overview AS
SELECT 
    u.user_id,
    u.email,
    u.first_name || ' ' || u.last_name as full_name,
    u.role,
    u.account_status,
    u.email_verified,
    u.created_at,
    u.last_login_at,
    COUNT(DISTINCT c.conversation_id) as conversation_count,
    COUNT(m.message_id) as message_count,
    s.plan_type,
    s.status as subscription_status,
    s.queries_used,
    s.query_limit
FROM users u
LEFT JOIN conversations c ON u.user_id = c.user_id
LEFT JOIN messages m ON c.conversation_id = m.conversation_id
LEFT JOIN subscriptions s ON u.user_id = s.user_id AND s.status = 'active'
GROUP BY 
    u.user_id, u.email, u.first_name, u.last_name, u.role, 
    u.account_status, u.email_verified, u.created_at, u.last_login_at,
    s.plan_type, s.status, s.queries_used, s.query_limit;

-- Use the view:
-- SELECT * FROM admin_user_overview WHERE account_status = 'active';

-- ============================================
-- END OF ADMIN QUERIES
-- ============================================
