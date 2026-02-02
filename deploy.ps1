# Admin Panel Deployment Script
# Run this in PowerShell to deploy the admin panel

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Anna Legal AI - Admin Panel Deployment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
$projectDir = "c:\Users\rani-\Desktop\Anna\APP-Anna"
Set-Location $projectDir

Write-Host "📁 Project directory: $projectDir" -ForegroundColor Green
Write-Host ""

# Step 1: Check Git
Write-Host "Step 1: Checking Git repository..." -ForegroundColor Yellow
$gitExists = Test-Path ".git"

if (-not $gitExists) {
    Write-Host "⚠️  Git repository not initialized" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Would you like to initialize Git? (Y/N)" -ForegroundColor Cyan
    $response = Read-Host
    
    if ($response -eq 'Y' -or $response -eq 'y') {
        git init
        Write-Host "✅ Git initialized" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "Enter your GitHub repository URL (or press Enter to skip):" -ForegroundColor Cyan
        $repoUrl = Read-Host
        
        if ($repoUrl) {
            git remote add origin $repoUrl
            Write-Host "✅ Remote added" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Skipping Git initialization. You'll need to set this up manually." -ForegroundColor Red
        Write-Host "Press any key to continue..."
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    }
} else {
    Write-Host "✅ Git repository found" -ForegroundColor Green
}

Write-Host ""

# Step 2: Check for uncommitted admin files
Write-Host "Step 2: Checking admin panel files..." -ForegroundColor Yellow

$adminFiles = @(
    "backend/routes/admin.py",
    "backend/main.py",
    "backend/create_admin.py",
    "backend/generate_password_hash.py",
    "frontend/admin/index.html",
    "render.yaml"
)

$missingFiles = @()
foreach ($file in $adminFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "⚠️  Missing files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please ensure all files are created before deploying." -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ All admin files found" -ForegroundColor Green
}

Write-Host ""

# Step 3: Generate password hash
Write-Host "Step 3: Admin User Setup" -ForegroundColor Yellow
Write-Host "Do you want to generate a password hash for admin user? (Y/N)" -ForegroundColor Cyan
$generateHash = Read-Host

if ($generateHash -eq 'Y' -or $generateHash -eq 'y') {
    Write-Host ""
    Write-Host "Running password hash generator..." -ForegroundColor Cyan
    Set-Location backend
    python generate_password_hash.py
    Set-Location ..
    Write-Host ""
    Write-Host "Copy the hash above and use it in your SQL query." -ForegroundColor Green
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
}

Write-Host ""

# Step 4: Git commit
Write-Host "Step 4: Committing changes..." -ForegroundColor Yellow
Write-Host "Do you want to commit the admin panel files? (Y/N)" -ForegroundColor Cyan
$commitChanges = Read-Host

if ($commitChanges -eq 'Y' -or $commitChanges -eq 'y') {
    Write-Host ""
    Write-Host "Adding files to git..." -ForegroundColor Cyan
    
    git add backend/routes/admin.py
    git add backend/main.py
    git add backend/create_admin.py
    git add backend/generate_password_hash.py
    git add frontend/admin/index.html
    git add render.yaml
    git add *.md
    git add database/admin_queries.sql
    
    Write-Host "Creating commit..." -ForegroundColor Cyan
    git commit -m "Add comprehensive admin panel with all features

- Add admin API routes for user, conversation, subscription, payment management
- Add admin panel UI with dashboard, statistics, and management features
- Add authentication and authorization for admin-only access
- Add admin user creation script
- Add password hash generator
- Update backend to serve admin panel
- Add comprehensive documentation and deployment guides"
    
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Skipping commit. Remember to commit manually before pushing!" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Push to remote
Write-Host "Step 5: Pushing to remote repository..." -ForegroundColor Yellow
Write-Host "Do you want to push to remote? (Y/N)" -ForegroundColor Cyan
$pushChanges = Read-Host

if ($pushChanges -eq 'Y' -or $pushChanges -eq 'y') {
    Write-Host ""
    Write-Host "Pushing to remote..." -ForegroundColor Cyan
    
    # Check if main branch exists
    $currentBranch = git branch --show-current
    
    if (-not $currentBranch) {
        git branch -M main
    }
    
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully pushed to remote" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Push failed. You may need to set up remote or authenticate." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Skipping push. Remember to push manually to trigger Render deployment!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Deployment Script Complete!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Green
Write-Host "1. If you haven't created admin user in production database, do that now" -ForegroundColor White
Write-Host "   - Use the SQL query from Step 3" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Wait for Render to deploy (5-10 minutes)" -ForegroundColor White
Write-Host "   - Check: https://dashboard.render.com" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Access your admin panel:" -ForegroundColor White
Write-Host "   - URL: https://juridikai.onrender.com/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Login with your admin credentials" -ForegroundColor White
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Green
Write-Host "   - COMPLETE_DEPLOYMENT_STEPS.md - Full guide" -ForegroundColor Gray
Write-Host "   - ADMIN_404_FIX.md - Quick fix guide" -ForegroundColor Gray
Write-Host "   - ADMIN_PANEL_README.md - Complete documentation" -ForegroundColor Gray
Write-Host ""

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
