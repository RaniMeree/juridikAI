"""
Simple script to generate bcrypt password hash
Use this to create password hashes for admin users
"""

from passlib.context import CryptContext
import getpass

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

print("\n" + "="*60)
print("  Password Hash Generator")
print("="*60 + "\n")

print("This script will generate a bcrypt hash for your password.")
print("You can use this hash in SQL queries to create admin users.\n")

# Get password securely
password = getpass.getpass("Enter password: ")
password_confirm = getpass.getpass("Confirm password: ")

if password != password_confirm:
    print("\n❌ Passwords don't match!")
    exit(1)

if len(password) < 6:
    print("\n❌ Password must be at least 6 characters!")
    exit(1)

# Generate hash
hashed = pwd_context.hash(password)

print("\n✅ Password hash generated successfully!\n")
print("="*60)
print("Copy this hash:")
print("="*60)
print(hashed)
print("="*60)

print("\n📝 Example SQL query to create admin user:")
print("-"*60)
print(f"""
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
    'admin@yourcompany.com',
    '{hashed}',
    'Admin',
    'User',
    'admin',
    'active',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
""")
print("-"*60)

print("\n💡 Or to update existing user:")
print("-"*60)
print(f"""
UPDATE users 
SET 
    password_hash = '{hashed}',
    role = 'admin',
    account_status = 'active',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'your-email@example.com';
""")
print("-"*60)

print("\n✅ Done! Copy the hash and use it in your SQL query.\n")
