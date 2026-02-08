-- Add uploaded_files table for tracking all user file uploads

CREATE TABLE IF NOT EXISTS uploaded_files (
    file_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(message_id) ON DELETE SET NULL,
    
    -- File metadata
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100),
    
    -- R2 storage info
    r2_object_key TEXT NOT NULL,
    r2_file_url TEXT,
    
    -- Processing info
    word_count INTEGER DEFAULT 0,
    chunk_count INTEGER DEFAULT 0,
    
    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deleted'))
);

-- Indexes for performance
CREATE INDEX idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX idx_uploaded_files_conversation_id ON uploaded_files(conversation_id);
CREATE INDEX idx_uploaded_files_uploaded_at ON uploaded_files(uploaded_at);
CREATE INDEX idx_uploaded_files_status ON uploaded_files(status);

-- Comments
COMMENT ON TABLE uploaded_files IS 'Tracks all files uploaded by users in chat conversations';
COMMENT ON COLUMN uploaded_files.r2_object_key IS 'S3-compatible object key in Cloudflare R2';
COMMENT ON COLUMN uploaded_files.r2_file_url IS 'Public or presigned URL for file access';
