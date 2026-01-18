"""
FastAPI Backend for Juridik AI
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from dotenv import load_dotenv
from database import get_db, test_connection, close_db
from routes.auth import router as auth_router

# Load environment variables
load_dotenv()

app = FastAPI(title="Juridik AI API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081", 
        "http://localhost:8082",
        "https://juridikai.onrender.com",  # Production frontend
        "http://localhost:19006",  # Expo web
        "*"  # Allow all for now - restrict later
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")


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
