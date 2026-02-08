-- User Files Table Migration
-- Run this SQL in your PostgreSQL database to add file tracking

-- ============================================
-- TABLE: user_files
-- Tracks files uploaded by users to R2 storage
-- ============================================
CREATE TABLE IF NOT EXISTS user_files (
    file_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(message_id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    r2_key TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    chunk_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'processed', 'failed', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for user_files table
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_conversation_id ON user_files(conversation_id);
CREATE INDEX IF NOT EXISTS idx_user_files_message_id ON user_files(message_id);
CREATE INDEX IF NOT EXISTS idx_user_files_created_at ON user_files(created_at);
CREATE INDEX IF NOT EXISTS idx_user_files_status ON user_files(status);

-- Comment on table
COMMENT ON TABLE user_files IS 'Tracks files uploaded by users, stored in Cloudflare R2';
COMMENT ON COLUMN user_files.r2_key IS 'Full path/key in R2 storage bucket';
