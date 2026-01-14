-- ============================================
-- Anna Legal AI Chat Assistant - Database Schema
-- Database: PostgreSQL 14+
-- Extensions: pgvector for embeddings
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- TABLE: users
-- Stores user account information
-- ============================================
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================
-- TABLE: subscriptions
-- Manages user subscription plans (Stripe)
-- ============================================
CREATE TABLE subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan_type VARCHAR(20) DEFAULT 'monthly' CHECK (plan_type IN ('monthly', 'yearly', 'trial')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    query_limit INTEGER DEFAULT 100,
    queries_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for subscriptions table
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- TABLE: payment_history
-- Tracks all payment transactions
-- ============================================
CREATE TABLE payment_history (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(subscription_id) ON DELETE SET NULL,
    stripe_payment_intent_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SEK',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for payment_history table
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_payment_history_subscription_id ON payment_history(subscription_id);
CREATE INDEX idx_payment_history_created_at ON payment_history(created_at);
CREATE INDEX idx_payment_history_status ON payment_history(status);

-- ============================================
-- TABLE: conversations
-- Stores chat conversation sessions
-- ============================================
CREATE TABLE conversations (
    conversation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for conversations table
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);

-- ============================================
-- TABLE: messages
-- Stores individual chat messages
-- ============================================
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]'::jsonb,
    attached_documents JSONB DEFAULT '[]'::jsonb,
    tokens_used INTEGER DEFAULT 0,
    response_time INTEGER,
    feedback VARCHAR(20) CHECK (feedback IN ('helpful', 'not_helpful', NULL)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for messages table
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_role ON messages(role);

-- ============================================
-- TABLE: legal_documents
-- Stores legal knowledge base documents (admin uploaded)
-- ============================================
CREATE TABLE legal_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(20) CHECK (file_type IN ('pdf', 'docx', 'txt')),
    category VARCHAR(100),
    jurisdiction VARCHAR(100),
    language VARCHAR(10) DEFAULT 'sv',
    status VARCHAR(20) DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'indexed', 'failed')),
    chunk_count INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for legal_documents table
CREATE INDEX idx_legal_documents_status ON legal_documents(status);
CREATE INDEX idx_legal_documents_category ON legal_documents(category);
CREATE INDEX idx_legal_documents_jurisdiction ON legal_documents(jurisdiction);
CREATE INDEX idx_legal_documents_created_at ON legal_documents(created_at);

-- ============================================
-- TABLE: legal_document_chunks
-- Stores chunked and vectorized legal documents for RAG
-- ============================================
CREATE TABLE legal_document_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES legal_documents(document_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    chunk_index INTEGER NOT NULL,
    page_number INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for legal_document_chunks table
CREATE INDEX idx_legal_chunks_document_id ON legal_document_chunks(document_id);
CREATE INDEX idx_legal_chunks_chunk_index ON legal_document_chunks(chunk_index);

-- Vector similarity search index (HNSW - Hierarchical Navigable Small World)
CREATE INDEX idx_legal_chunks_embedding ON legal_document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- ============================================
-- TABLE: user_documents
-- Stores user-uploaded documents for personal queries
-- ============================================
CREATE TABLE user_documents (
    user_document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(conversation_id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(20) CHECK (file_type IN ('pdf', 'docx', 'doc')),
    upload_status VARCHAR(20) DEFAULT 'uploading' CHECK (upload_status IN ('uploading', 'processing', 'ready', 'failed')),
    processing_error TEXT,
    extracted_text TEXT,
    page_count INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for user_documents table
CREATE INDEX idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX idx_user_documents_conversation_id ON user_documents(conversation_id);
CREATE INDEX idx_user_documents_upload_status ON user_documents(upload_status);
CREATE INDEX idx_user_documents_uploaded_at ON user_documents(uploaded_at);

-- ============================================
-- TABLE: user_document_chunks
-- Stores chunked and vectorized user documents for RAG
-- ============================================
CREATE TABLE user_document_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_document_id UUID NOT NULL REFERENCES user_documents(user_document_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    chunk_index INTEGER NOT NULL,
    page_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for user_document_chunks table
CREATE INDEX idx_user_chunks_user_document_id ON user_document_chunks(user_document_id);
CREATE INDEX idx_user_chunks_user_id ON user_document_chunks(user_id);
CREATE INDEX idx_user_chunks_chunk_index ON user_document_chunks(chunk_index);

-- Vector similarity search index
CREATE INDEX idx_user_chunks_embedding ON user_document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- ============================================
-- TABLE: query_analytics
-- Tracks RAG query performance and results
-- ============================================
CREATE TABLE query_analytics (
    query_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(conversation_id) ON DELETE SET NULL,
    message_id UUID REFERENCES messages(message_id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    retrieved_documents JSONB DEFAULT '[]'::jsonb,
    relevance_scores JSONB DEFAULT '[]'::jsonb,
    response_generated BOOLEAN DEFAULT FALSE,
    error_occurred BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    processing_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for query_analytics table
CREATE INDEX idx_query_analytics_user_id ON query_analytics(user_id);
CREATE INDEX idx_query_analytics_created_at ON query_analytics(created_at);
CREATE INDEX idx_query_analytics_error_occurred ON query_analytics(error_occurred);

-- ============================================
-- TABLE: user_feedback
-- Stores user feedback on AI responses
-- ============================================
CREATE TABLE user_feedback (
    feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES messages(message_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    feedback_type VARCHAR(20) CHECK (feedback_type IN ('helpful', 'not_helpful', 'incorrect', 'offensive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for user_feedback table
CREATE INDEX idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX idx_user_feedback_message_id ON user_feedback(message_id);
CREATE INDEX idx_user_feedback_created_at ON user_feedback(created_at);

-- ============================================
-- TABLE: admin_logs
-- Tracks admin actions for audit trail
-- ============================================
CREATE TABLE admin_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for admin_logs table
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);

-- ============================================
-- TRIGGERS: Auto-update timestamps
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_documents_updated_at BEFORE UPDATE ON legal_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS: Useful queries
-- ============================================

-- Active users with their subscription status
CREATE VIEW active_users_with_subscriptions AS
SELECT 
    u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.created_at as user_since,
    s.plan_type,
    s.status as subscription_status,
    s.queries_used,
    s.query_limit,
    s.current_period_end
FROM users u
LEFT JOIN subscriptions s ON u.user_id = s.user_id
WHERE u.account_status = 'active';

-- Conversation summary with message counts
CREATE VIEW conversation_summary AS
SELECT 
    c.conversation_id,
    c.user_id,
    c.title,
    c.created_at,
    c.last_message_at,
    COUNT(m.message_id) as total_messages,
    SUM(CASE WHEN m.role = 'user' THEN 1 ELSE 0 END) as user_messages,
    SUM(CASE WHEN m.role = 'assistant' THEN 1 ELSE 0 END) as assistant_messages
FROM conversations c
LEFT JOIN messages m ON c.conversation_id = m.conversation_id
GROUP BY c.conversation_id, c.user_id, c.title, c.created_at, c.last_message_at;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Stores user account information and authentication data';
COMMENT ON TABLE subscriptions IS 'Manages Stripe subscription plans and usage limits';
COMMENT ON TABLE conversations IS 'Stores chat conversation sessions between users and AI';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON TABLE legal_documents IS 'Admin-uploaded legal knowledge base documents';
COMMENT ON TABLE legal_document_chunks IS 'Vectorized chunks of legal documents for RAG retrieval';
COMMENT ON TABLE user_documents IS 'User-uploaded documents for personalized queries';
COMMENT ON TABLE user_document_chunks IS 'Vectorized chunks of user documents for RAG retrieval';
COMMENT ON TABLE query_analytics IS 'Performance tracking and analytics for RAG queries';
COMMENT ON TABLE user_feedback IS 'User feedback on AI responses for improvement';
COMMENT ON TABLE admin_logs IS 'Audit trail of admin actions';

-- ============================================
-- END OF SCHEMA
-- ============================================
