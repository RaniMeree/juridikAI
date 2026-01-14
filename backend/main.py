"""
Example FastAPI app showing how to connect to the database
"""

from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database import get_db, test_connection, close_db

app = FastAPI(title="Juridik AI API", version="1.0.0")


@app.on_event("startup")
async def startup():
    """Run on application startup"""
    print("🚀 Starting Juridik AI API...")
    await test_connection()


@app.on_event("shutdown")
async def shutdown():
    """Run on application shutdown"""
    print("👋 Shutting down Juridik AI API...")
    await close_db()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "app": "Juridik AI",
        "version": "1.0.0"
    }


@app.get("/db-test")
async def test_db(db: AsyncSession = Depends(get_db)):
    """Test database connection"""
    result = await db.execute(text("SELECT current_database(), current_user, version()"))
    row = result.first()
    
    return {
        "database": row[0],
        "user": row[1],
        "version": row[2]
    }


@app.get("/users/count")
async def count_users(db: AsyncSession = Depends(get_db)):
    """Count total users"""
    result = await db.execute(text("SELECT COUNT(*) FROM users"))
    count = result.scalar()
    
    return {"total_users": count}


# Run with: uvicorn main:app --reload
