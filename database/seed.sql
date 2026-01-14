-- ============================================
-- Anna Legal AI - Seed Data Script
-- Creates initial test data for development
-- ============================================

-- Create admin user
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified)
VALUES 
    ('admin@annalegal.se', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU2u3ZG', 'Admin', 'User', 'admin', TRUE),
    ('test@example.se', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU2u3ZG', 'Test', 'User', 'user', TRUE);

-- Note: Password is 'password123' (hashed with bcrypt)
-- CHANGE THIS IN PRODUCTION!

-- Create test subscription for test user
INSERT INTO subscriptions (user_id, plan_type, status, query_limit, queries_used, current_period_start, current_period_end)
SELECT 
    user_id,
    'monthly',
    'active',
    100,
    5,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days'
FROM users WHERE email = 'test@example.se';

-- Create sample conversation
INSERT INTO conversations (user_id, title, message_count, last_message_at)
SELECT 
    user_id,
    'How does Swedish labor law work?',
    2,
    CURRENT_TIMESTAMP
FROM users WHERE email = 'test@example.se';

-- Create sample messages
INSERT INTO messages (conversation_id, role, content, tokens_used)
SELECT 
    conversation_id,
    'user',
    'What are the basic rights of employees in Sweden?',
    15
FROM conversations WHERE title = 'How does Swedish labor law work?';

INSERT INTO messages (conversation_id, role, content, tokens_used, sources)
SELECT 
    conversation_id,
    'assistant',
    'In Sweden, employees have several fundamental rights including: 1) Right to paid vacation (minimum 25 days), 2) Protection against unfair dismissal, 3) Right to parental leave...',
    120,
    '[{"doc_id": "sample-123", "title": "Swedish Labor Law Overview", "relevance": 0.92}]'::jsonb
FROM conversations WHERE title = 'How does Swedish labor law work?';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✓ Seed data inserted successfully!';
    RAISE NOTICE '✓ Admin user: admin@annalegal.se (password: password123)';
    RAISE NOTICE '✓ Test user: test@example.se (password: password123)';
    RAISE NOTICE '⚠ IMPORTANT: Change passwords before production!';
END $$;
