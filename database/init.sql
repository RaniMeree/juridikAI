-- ============================================
-- Anna Legal AI - Database Initialization Script
-- Run this FIRST before schema.sql
-- ============================================

-- Create database (if running locally)
-- For Render.com, database is auto-created
-- Uncomment if running on local PostgreSQL:
-- CREATE DATABASE anna_legal_ai;
-- \c anna_legal_ai;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extensions are installed
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'vector');

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Database initialized successfully!';
    RAISE NOTICE 'Extensions installed: uuid-ossp, pgvector';
    RAISE NOTICE 'Next step: Run schema.sql to create tables';
END $$;
