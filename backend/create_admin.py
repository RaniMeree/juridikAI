"""
Script to create an admin user for the Anna Legal AI system
Run this script to create a new admin user or update an existing user to admin
"""

import asyncio
import sys
from getpass import getpass
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from dotenv import load_dotenv
import os
import uuid

# Load environment variables
load_dotenv()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Import User model
from routes.auth import User

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment variables!")
    print("Please make sure .env file exists and contains DATABASE_URL")
    sys.exit(1)

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def create_admin_user():
    """Create a new admin user"""
    print("\n" + "="*60)
    print("  Anna Legal AI - Create Admin User")
    print("="*60 + "\n")
    
    print("This script will help you create an admin user.\n")
    
    # Get user input
    email = input("Enter admin email: ").strip()
    if not email:
        print("❌ Email is required!")
        return
    
    first_name = input("Enter first name: ").strip() or "Admin"
    last_name = input("Enter last name: ").strip() or "User"
    
    # Get password securely
    while True:
        password = getpass("Enter password: ")
        password_confirm = getpass("Confirm password: ")
        
        if password != password_confirm:
            print("❌ Passwords don't match! Try again.\n")
            continue
        
        if len(password) < 6:
            print("❌ Password must be at least 6 characters! Try again.\n")
            continue
        
        break
    
    # Hash password
    password_hash = pwd_context.hash(password)
    
    print("\n🔄 Creating admin user...\n")
    
    async with AsyncSessionLocal() as session:
        try:
            # Check if user already exists
            result = await session.execute(
                select(User).where(User.email == email)
            )
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                print(f"⚠️  User with email '{email}' already exists!")
                update = input("Do you want to update this user to admin role? (y/n): ").strip().lower()
                
                if update == 'y':
                    existing_user.role = 'admin'
                    existing_user.password_hash = password_hash
                    existing_user.account_status = 'active'
                    await session.commit()
                    
                    print("\n✅ User updated successfully!")
                    print(f"   Email: {existing_user.email}")
                    print(f"   Name: {existing_user.first_name} {existing_user.last_name}")
                    print(f"   Role: {existing_user.role}")
                    print(f"   Status: {existing_user.account_status}")
                else:
                    print("\n❌ Operation cancelled.")
                
                return
            
            # Create new admin user
            from datetime import datetime
            
            new_user = User(
                user_id=uuid.uuid4(),
                email=email,
                password_hash=password_hash,
                first_name=first_name,
                last_name=last_name,
                role='admin',
                account_status='active',
                email_verified=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            session.add(new_user)
            await session.commit()
            await session.refresh(new_user)
            
            print("\n✅ Admin user created successfully!")
            print(f"   User ID: {new_user.user_id}")
            print(f"   Email: {new_user.email}")
            print(f"   Name: {new_user.first_name} {new_user.last_name}")
            print(f"   Role: {new_user.role}")
            print(f"   Status: {new_user.account_status}")
            print("\n📝 You can now login to the admin panel with these credentials.")
            
        except Exception as e:
            print(f"\n❌ Error creating admin user: {str(e)}")
            await session.rollback()


async def list_admin_users():
    """List all admin users"""
    print("\n" + "="*60)
    print("  Existing Admin Users")
    print("="*60 + "\n")
    
    async with AsyncSessionLocal() as session:
        try:
            result = await session.execute(
                select(User).where(User.role == 'admin')
            )
            admin_users = result.scalars().all()
            
            if not admin_users:
                print("No admin users found.\n")
                return
            
            for user in admin_users:
                print(f"📧 {user.email}")
                print(f"   Name: {user.first_name} {user.last_name}")
                print(f"   Status: {user.account_status}")
                print(f"   Created: {user.created_at}")
                print()
            
        except Exception as e:
            print(f"❌ Error listing admin users: {str(e)}")


async def main():
    """Main function"""
    print("\nWhat would you like to do?")
    print("1. Create new admin user")
    print("2. List existing admin users")
    print("3. Exit")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == '1':
        await create_admin_user()
    elif choice == '2':
        await list_admin_users()
    elif choice == '3':
        print("\n👋 Goodbye!")
        return
    else:
        print("\n❌ Invalid choice!")
        return
    
    print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n❌ Operation cancelled by user.")
    except Exception as e:
        print(f"\n❌ An error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
