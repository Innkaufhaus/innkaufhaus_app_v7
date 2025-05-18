# Stop on first error
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting SQL Query Explorer Setup..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git $gitVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git from https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Project directory setup
$projectName = "sql-query-explorer"
$projectPath = Join-Path (Get-Location) $projectName

# Check if directory exists
if (Test-Path $projectPath) {
    Write-Host "📂 Existing installation detected at $projectPath" -ForegroundColor Yellow
    Set-Location $projectPath

    # Check if it's a git repository
    if (Test-Path ".git") {
        Write-Host "🔄 Updating existing repository..." -ForegroundColor Cyan
        
        # Fetch latest changes
        git fetch origin main
        
        # Check for local changes
        $status = git status --porcelain
        if ($status) {
            Write-Host "⚠️ Local changes detected. Do you want to reset to main branch? (y/n)" -ForegroundColor Yellow
            $response = Read-Host
            if ($response -eq 'y') {
                git reset --hard origin/main
                Write-Host "✅ Successfully reset to main branch" -ForegroundColor Green
            } else {
                Write-Host "❌ Setup cancelled. Please commit or stash your changes and try again" -ForegroundColor Red
                exit 1
            }
        } else {
            git reset --hard origin/main
            Write-Host "✅ Successfully updated to latest version" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Directory exists but is not a git repository. Please remove or rename the directory" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "📁 Creating new project directory..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path $projectName
    Set-Location $projectName

    # Clone the repository
    Write-Host "📥 Cloning repository..." -ForegroundColor Cyan
    git clone https://github.com/Innkaufhaus/sql_dummy_for_testing.git .
}

# Clean install dependencies
Write-Host "🧹 Cleaning npm cache..." -ForegroundColor Cyan
npm cache clean --force

Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
npm install --legacy-peer-deps

# Create public directory if it doesn't exist
Write-Host "📁 Creating public directory for CSV files..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "public"

# Start the development server
Write-Host "🌟 Setup complete! Starting development server..." -ForegroundColor Green
Write-Host "📝 The application will be available at http://localhost:8000" -ForegroundColor Yellow
npm run dev

# Keep the window open
Read-Host -Prompt "Press Enter to exit"
