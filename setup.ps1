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

# Create project directory
$projectName = "sql-query-explorer"
Write-Host "📁 Creating project directory..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $projectName
Set-Location $projectName

# Clone the repository
Write-Host "📥 Cloning repository..." -ForegroundColor Cyan
git clone https://github.com/Innkaufhaus/sql_dummy_for_testing.git .

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
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
