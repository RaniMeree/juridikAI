# Anna Legal AI - Database Setup

## PostgreSQL with pgvector Extension

This database is designed for a legal AI chatbot using RAG (Retrieval Augmented Generation).

---

## 📋 Prerequisites

- PostgreSQL 14+ (with pgvector extension)
- Admin access to PostgreSQL

---

## 🚀 Quick Setup

### Option 1: Render.com (Recommended)

1. **Create PostgreSQL Database on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "PostgreSQL"
   - Name: `anna-legal-db`
   - Plan: Starter ($7/month) or higher
   - Click "Create Database"

2. **Install pgvector Extension**
   ```sql
   -- Connect via Render's web shell or psql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. **Run Database Scripts**
   ```bash
   # Get connection string from Render dashboard
   export DATABASE_URL="postgres://user:pass@host/dbname"
   
   # Run initialization
   psql $DATABASE_URL < database/init.sql
   
   # Run schema
   psql $DATABASE_URL < database/schema.sql
   
   # Run seed data (optional - for testing)
   psql $DATABASE_URL < database/seed.sql
   ```

### Option 2: Local PostgreSQL

1. **Install PostgreSQL**
   ```bash
   # Windows (via Chocolatey)
   choco install postgresql
   
   # Or download from: https://www.postgresql.org/download/
   ```

2. **Install pgvector**
   ```bash
   # Clone pgvector
   git clone https://github.com/pgvector/pgvector.git
   cd pgvector
   
   # Build and install
   make
   make install
   ```

3. **Create Database**
   ```bash
   # Start PostgreSQL service
   # Then create database
   createdb anna_legal_ai
   ```

4. **Run Scripts**
   ```bash
   psql anna_legal_ai < database/init.sql
   psql anna_legal_ai < database/schema.sql
   psql anna_legal_ai < database/seed.sql
   ```

---

## 📊 Database Schema Overview

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts and authentication |
| `subscriptions` | Stripe subscription management |
| `payment_history` | Payment transaction records |
| `conversations` | Chat sessions |
| `messages` | Individual chat messages |

### Document Tables (RAG)

| Table | Purpose |
|-------|---------|
| `legal_documents` | Admin-uploaded legal knowledge base |
| `legal_document_chunks` | Vectorized legal document chunks |
| `user_documents` | User-uploaded files (contracts, etc.) |
| `user_document_chunks` | Vectorized user document chunks |

### Analytics & Logs

| Table | Purpose |
|-------|---------|
| `query_analytics` | RAG query performance tracking |
| `user_feedback` | User ratings and feedback |
| `admin_logs` | Admin action audit trail |

---

## 🔍 Vector Search Explanation

### What is pgvector?

pgvector allows PostgreSQL to store and search **vector embeddings** - numerical representations of text that capture semantic meaning.

### How RAG Works:

1. **Document Processing**
   - Upload PDF/DOCX → Extract text
   - Split into chunks (500-1000 tokens each)
   - Generate embeddings using OpenAI API
   - Store in `legal_document_chunks` or `user_document_chunks`

2. **User Query**
   - User asks: "What does my contract say about termination?"
   - Convert question to embedding
   - Search for similar chunks using vector similarity
   - Retrieve top 5 most relevant chunks
   - Send to AI (GPT-4) with context
   - AI generates answer based on retrieved documents

3. **Vector Similarity Search**
   ```sql
   -- Find most relevant legal document chunks
   SELECT content, metadata
   FROM legal_document_chunks
   ORDER BY embedding <-> '[user_query_embedding]'::vector
   LIMIT 5;
   ```

---

## 🛠️ Useful Commands

### Check Database Size
```sql
SELECT pg_size_pretty(pg_database_size('anna_legal_ai'));
```

### Count Records
```sql
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM conversations) as total_conversations,
    (SELECT COUNT(*) FROM messages) as total_messages,
    (SELECT COUNT(*) FROM legal_document_chunks) as legal_chunks;
```

### View Active Subscriptions
```sql
SELECT * FROM active_users_with_subscriptions;
```

### Check Vector Index Performance
```sql
EXPLAIN ANALYZE
SELECT * FROM legal_document_chunks
ORDER BY embedding <-> '[0.1, 0.2, ...]'::vector
LIMIT 5;
```

### Backup Database
```bash
pg_dump anna_legal_ai > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
psql anna_legal_ai < backup_20260113.sql
```

---

## 🔐 Security Notes

1. **Change Default Passwords**
   - Seed data includes test passwords (`password123`)
   - **NEVER** use these in production!

2. **Environment Variables**
   ```bash
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   ```

3. **Connection Pooling**
   - Use PgBouncer or SQLAlchemy pool for production
   - Recommended: 10-20 connections for starter plan

4. **Row-Level Security (Optional)**
   ```sql
   -- Ensure users can only see their own data
   ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY user_documents_policy ON user_documents
   FOR ALL USING (user_id = current_setting('app.user_id')::uuid);
   ```

---

## 📈 Indexes Explained

| Index Type | Purpose |
|------------|---------|
| B-tree | Fast lookups (user_id, email) |
| HNSW | Fast vector similarity search |
| GIN | JSON field search (metadata) |

---

## 🧪 Testing the Database

Run seed data, then test queries:

```sql
-- Test user authentication
SELECT * FROM users WHERE email = 'test@example.se';

-- Test conversation retrieval
SELECT * FROM conversation_summary WHERE user_id = '...';

-- Test vector search (dummy embedding)
SELECT content FROM legal_document_chunks
ORDER BY embedding <-> '[0.1, 0.2, ...]'::vector
LIMIT 3;
```

---

## 📞 Need Help?

- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **pgvector Docs**: https://github.com/pgvector/pgvector
- **Render Docs**: https://render.com/docs/databases

---

## 🗂️ Migration Strategy

For future schema changes, use migration tools:

```bash
# Install Alembic (Python migration tool)
pip install alembic

# Initialize migrations
alembic init migrations

# Create migration
alembic revision -m "add_new_column"

# Apply migration
alembic upgrade head
```

---

**Database Version**: 1.0.0  
**Last Updated**: January 2026
