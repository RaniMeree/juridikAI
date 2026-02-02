# Admin Panel Testing Guide

This guide will help you test all features of the admin panel to ensure everything is working correctly.

## Pre-Testing Setup

### 1. Ensure Backend is Running

```bash
cd APP-Anna/backend
uvicorn main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

### 2. Verify Database Connection

```bash
curl http://localhost:8000/db-test
```

Expected response:
```json
{
  "database": "juridik_ai",
  "user": "postgres",
  "version": "PostgreSQL 14.x..."
}
```

### 3. Create Test Admin User

```bash
cd APP-Anna/backend
python create_admin.py
```

Use these credentials for testing:
- Email: `admin@test.com`
- Password: `Test123!`

### 4. Create Test Data (Optional)

Run these SQL commands to create test data:

```sql
-- Create a test user
INSERT INTO users (user_id, email, password_hash, first_name, last_name, role, account_status, email_verified, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'testuser@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/1wE6V6T8rHmFV.Kte',
    'Test',
    'User',
    'user',
    'active',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Create a test conversation
INSERT INTO conversations (conversation_id, user_id, title, status, message_count, created_at, updated_at, last_message_at)
VALUES (
    uuid_generate_v4(),
    (SELECT user_id FROM users WHERE email = 'testuser@example.com'),
    'Test Conversation',
    'active',
    2,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Create test messages
INSERT INTO messages (message_id, conversation_id, role, content, tokens_used, created_at)
VALUES 
(
    uuid_generate_v4(),
    (SELECT conversation_id FROM conversations WHERE title = 'Test Conversation'),
    'user',
    'What are my rights as a tenant in Sweden?',
    0,
    CURRENT_TIMESTAMP
),
(
    uuid_generate_v4(),
    (SELECT conversation_id FROM conversations WHERE title = 'Test Conversation'),
    'assistant',
    'As a tenant in Sweden, you have several important rights...',
    150,
    CURRENT_TIMESTAMP
);

-- Create a test subscription
INSERT INTO subscriptions (subscription_id, user_id, plan_type, status, query_limit, queries_used, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    (SELECT user_id FROM users WHERE email = 'testuser@example.com'),
    'monthly',
    'active',
    100,
    25,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Create a test payment
INSERT INTO payment_history (payment_id, user_id, amount, currency, status, payment_method, created_at)
VALUES (
    uuid_generate_v4(),
    (SELECT user_id FROM users WHERE email = 'testuser@example.com'),
    99.00,
    'SEK',
    'succeeded',
    'card',
    CURRENT_TIMESTAMP
);
```

## Testing Checklist

### 🔐 Authentication Tests

#### Test 1: Login with Admin Credentials
- [ ] Open admin panel: http://localhost:3000
- [ ] Enter admin email: `admin@test.com`
- [ ] Enter password: `Test123!`
- [ ] Click "Login"
- [ ] **Expected**: Redirected to dashboard
- [ ] **Verify**: Sidebar shows your email at bottom

#### Test 2: Login with Non-Admin User
- [ ] Logout if logged in
- [ ] Try logging in with a regular user account
- [ ] **Expected**: Error message "Admin access required"
- [ ] **Verify**: Remains on login page

#### Test 3: Login with Invalid Credentials
- [ ] Enter wrong email or password
- [ ] **Expected**: Error message "Invalid email or password"
- [ ] **Verify**: Remains on login page

#### Test 4: Token Persistence
- [ ] Login successfully
- [ ] Close browser tab
- [ ] Reopen admin panel
- [ ] **Expected**: Automatically logged in
- [ ] **Verify**: Dashboard loads without login prompt

### 📊 Dashboard Tests

#### Test 5: Dashboard Statistics Load
- [ ] Navigate to Dashboard
- [ ] **Verify**: All statistics cards display:
  - [ ] Total Users (number)
  - [ ] New Users (with +N this month)
  - [ ] Total Conversations (number)
  - [ ] Total Messages (number)
  - [ ] Active Subscriptions (number)
  - [ ] Total Revenue (SEK amount)
  - [ ] Average Messages Per User (decimal)

#### Test 6: User Growth Chart
- [ ] Scroll to "User Growth (Last 7 Days)" section
- [ ] **Verify**: Table shows last 7 days
- [ ] **Verify**: Dates are in correct order
- [ ] **Verify**: User counts are displayed

#### Test 7: Dashboard Refresh
- [ ] Note current statistics
- [ ] Refresh page (F5)
- [ ] **Expected**: Statistics reload successfully
- [ ] **Verify**: Numbers remain consistent

### 👥 Users Management Tests

#### Test 8: View Users List
- [ ] Click "Users" in sidebar
- [ ] **Verify**: Users table loads
- [ ] **Verify**: Shows columns: Email, Name, Status, Messages, Joined, Actions
- [ ] **Verify**: Pagination controls appear at bottom

#### Test 9: Search Users
- [ ] Enter email in search box: `testuser@example.com`
- [ ] Click "Search"
- [ ] **Expected**: Shows only matching users
- [ ] **Verify**: Results update in table

#### Test 10: Filter Users by Status
- [ ] Select "Active" from status dropdown
- [ ] **Expected**: Shows only active users
- [ ] Select "Suspended"
- [ ] **Expected**: Shows only suspended users (or empty)
- [ ] Select "All Statuses"
- [ ] **Expected**: Shows all users again

#### Test 11: View User Details
- [ ] Click "View" on any user
- [ ] **Verify**: Modal opens with user details:
  - [ ] Basic Information section
  - [ ] Usage Statistics section
  - [ ] Subscription section (if exists)
  - [ ] Recent Payments section (if exists)
  - [ ] Actions buttons

#### Test 12: Update User Status - Suspend
- [ ] Open user details for test user
- [ ] Click "Suspend" button
- [ ] **Expected**: Success alert appears
- [ ] **Verify**: Status badge changes to yellow "suspended"
- [ ] Close modal and reopen
- [ ] **Verify**: Status persists

#### Test 13: Update User Status - Activate
- [ ] Open suspended user details
- [ ] Click "Activate" button
- [ ] **Expected**: Success alert appears
- [ ] **Verify**: Status badge changes to green "active"

#### Test 14: Update User Status - Delete
- [ ] Open user details for test user
- [ ] Click "Delete" button
- [ ] **Expected**: Success alert appears
- [ ] **Verify**: Status badge changes to red "deleted"
- [ ] **Warning**: This doesn't actually delete data, just marks as deleted

#### Test 15: Pagination
- [ ] Scroll to bottom of users table
- [ ] Note pagination info (e.g., "Page 1 of 2")
- [ ] Click "Next" button
- [ ] **Expected**: Shows next page of users
- [ ] Click "Previous" button
- [ ] **Expected**: Returns to previous page
- [ ] **Verify**: Buttons disable appropriately at first/last page

### 💬 Conversations Tests

#### Test 16: View Conversations List
- [ ] Click "Conversations" in sidebar
- [ ] **Verify**: Conversations table loads
- [ ] **Verify**: Shows columns: Title, User, Messages, Last Message, Actions
- [ ] **Verify**: User email appears correctly

#### Test 17: View Conversation Messages
- [ ] Click "View Messages" on a conversation
- [ ] **Expected**: Modal opens with messages
- [ ] **Verify**: Messages show in chronological order
- [ ] **Verify**: User messages have blue background
- [ ] **Verify**: Assistant messages have gray background
- [ ] **Verify**: Timestamps display correctly
- [ ] **Verify**: Token usage shown for assistant messages

#### Test 18: Messages Display Formatting
- [ ] View messages with long text
- [ ] **Verify**: Text wraps properly
- [ ] **Verify**: No overflow issues
- [ ] **Verify**: Timestamps stay aligned

#### Test 19: Conversations Pagination
- [ ] Navigate through conversation pages
- [ ] **Verify**: Pagination works correctly
- [ ] **Verify**: Correct conversation count shown

### 💳 Subscriptions Tests

#### Test 20: View Subscriptions List
- [ ] Click "Subscriptions" in sidebar
- [ ] **Verify**: Subscriptions table loads
- [ ] **Verify**: Shows: User, Plan, Status, Usage, Period End

#### Test 21: Filter Subscriptions by Status
- [ ] Select "Active" from filter
- [ ] **Expected**: Shows only active subscriptions
- [ ] Try other statuses: Cancelled, Expired, Past Due
- [ ] **Verify**: Filtering works correctly

#### Test 22: View Usage Progress Bar
- [ ] Find subscription with usage data
- [ ] **Verify**: Progress bar shows correct percentage
- [ ] **Verify**: Text shows "X / Y" queries
- [ ] **Example**: 25/100 should show ~25% blue bar

#### Test 23: View Subscription Details
- [ ] Check plan types display correctly
- [ ] **Verify**: Status badges have correct colors:
  - Active = Green
  - Cancelled = Red
  - Other = Yellow
- [ ] **Verify**: Period end dates format correctly

### 💰 Payments Tests

#### Test 24: View Payments List
- [ ] Click "Payments" in sidebar
- [ ] **Verify**: Payments table loads
- [ ] **Verify**: Shows: User, Amount, Status, Method, Date

#### Test 25: View Payment Amounts
- [ ] Check payment amounts
- [ ] **Verify**: Shows 2 decimal places
- [ ] **Verify**: Currency code displays (SEK, USD, etc.)

#### Test 26: View Payment Status
- [ ] Find payments with different statuses
- [ ] **Verify**: Status badges colored correctly:
  - Succeeded = Green
  - Failed = Red
  - Pending = Yellow

#### Test 27: Payments Pagination
- [ ] Navigate through payment pages
- [ ] **Verify**: Pagination works
- [ ] **Verify**: Dates in correct order (newest first)

### 🚪 Logout Tests

#### Test 28: Logout Functionality
- [ ] Click "Logout" button in sidebar
- [ ] **Expected**: Redirected to login page
- [ ] **Verify**: Token cleared from localStorage
- [ ] Try accessing dashboard directly
- [ ] **Expected**: Redirected back to login

#### Test 29: Session Expiry
- [ ] Login to admin panel
- [ ] Wait 30 minutes (or modify token expiry for testing)
- [ ] Try to perform any action
- [ ] **Expected**: Automatically logged out
- [ ] **Verify**: Redirected to login page

### 🔄 API Integration Tests

#### Test 30: API Error Handling
- [ ] Stop the backend server
- [ ] Try to navigate to Dashboard
- [ ] **Expected**: Loading state, then error
- [ ] Start backend server
- [ ] Refresh page
- [ ] **Expected**: Data loads successfully

#### Test 31: Network Timeout
- [ ] Add artificial delay in API calls (if possible)
- [ ] **Verify**: Loading indicators show
- [ ] **Verify**: No UI freezing

### 📱 Responsive Design Tests

#### Test 32: Desktop View (1920x1080)
- [ ] Open admin panel in desktop browser
- [ ] **Verify**: Layout looks correct
- [ ] **Verify**: Sidebar fixed on left
- [ ] **Verify**: Content area uses full width

#### Test 33: Tablet View (768x1024)
- [ ] Resize browser to tablet size
- [ ] **Verify**: Layout adjusts appropriately
- [ ] **Verify**: Tables scroll horizontally if needed
- [ ] **Verify**: Buttons remain clickable

#### Test 34: Mobile View (375x667)
- [ ] Resize browser to mobile size
- [ ] **Verify**: Sidebar still accessible
- [ ] **Verify**: Tables scroll horizontally
- [ ] **Verify**: Modals fill screen appropriately

## Performance Tests

### Test 35: Large Dataset Handling
- [ ] Create 100+ users (use SQL script)
- [ ] Navigate to Users page
- [ ] **Verify**: Loads in reasonable time (<3 seconds)
- [ ] **Verify**: Pagination limits records shown
- [ ] **Verify**: Search works with large dataset

### Test 36: Concurrent Users
- [ ] Open admin panel in 2 different browsers
- [ ] Login with different admin accounts
- [ ] Perform actions simultaneously
- [ ] **Verify**: Both sessions work independently
- [ ] **Verify**: No data corruption

## Security Tests

### Test 37: Direct API Access
```bash
# Without authentication
curl http://localhost:8000/api/admin/dashboard

# Expected: 401 Unauthorized
```

### Test 38: Non-Admin API Access
```bash
# Get token for regular user
TOKEN="regular_user_token_here"

# Try accessing admin endpoint
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8000/api/admin/dashboard

# Expected: 403 Forbidden
```

### Test 39: SQL Injection Prevention
- [ ] Try SQL injection in search box: `' OR '1'='1`
- [ ] **Expected**: Treated as literal search string
- [ ] **Verify**: No database errors
- [ ] **Verify**: Returns proper results or empty

### Test 40: XSS Prevention
- [ ] Try creating user with name: `<script>alert('XSS')</script>`
- [ ] View user in admin panel
- [ ] **Expected**: Script tags displayed as text
- [ ] **Verify**: No JavaScript execution

## Browser Compatibility Tests

### Test 41: Chrome
- [ ] Test all features in Chrome
- [ ] **Verify**: Everything works

### Test 42: Firefox
- [ ] Test all features in Firefox
- [ ] **Verify**: Everything works

### Test 43: Safari
- [ ] Test all features in Safari
- [ ] **Verify**: Everything works

### Test 44: Edge
- [ ] Test all features in Edge
- [ ] **Verify**: Everything works

## Database Tests

### Test 45: Admin Logs Recorded
```sql
-- After updating a user status
SELECT * FROM admin_logs 
ORDER BY created_at DESC 
LIMIT 5;
```
- [ ] **Verify**: Action logged correctly
- [ ] **Verify**: Admin ID matches your user
- [ ] **Verify**: Target ID matches affected user
- [ ] **Verify**: Details JSON contains correct information

## Bug Reporting Template

If you find any issues, document them using this template:

```markdown
### Bug Report

**Test Number**: Test 12
**Description**: User status doesn't update
**Steps to Reproduce**:
1. Login as admin
2. View user details
3. Click "Suspend" button

**Expected Result**: User status changes to suspended
**Actual Result**: Error message appears
**Browser**: Chrome 120.0
**Console Errors**: 
```
[paste error from browser console]
```

**API Response**:
```
[paste API response if available]
```

**Screenshots**: [attach if relevant]
```

## Test Summary

After completing all tests, fill out this summary:

```
Date: _______________
Tester: _______________
Environment: Local / Staging / Production

✅ Passed: _____ / 45
❌ Failed: _____ / 45
⚠️  Warnings: _____ / 45

Critical Issues: __________
Medium Issues: __________
Minor Issues: __________

Ready for Production: Yes / No

Notes:
_________________________________
_________________________________
```

## Cleanup After Testing

```sql
-- Remove test data
DELETE FROM users WHERE email = 'testuser@example.com';
-- Cascading deletes will remove related conversations, messages, etc.

-- Keep admin user for future use
-- Or delete if needed:
-- DELETE FROM users WHERE email = 'admin@test.com';
```

---

**Testing Complete!** ✅

Once all tests pass, your admin panel is ready for production use!
