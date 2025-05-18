# Stop on first error
$ErrorActionPreference = "Stop"

Write-Host "Starting SQL Query Explorer Setup..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "Git $gitVersion detected" -ForegroundColor Green
} catch {
    Write-Host "Git is not installed. Please install Git from https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Function to test internet connection
function Test-InternetConnection {
    try {
        $response = Invoke-WebRequest -Uri "https://github.com" -UseBasicParsing -TimeoutSec 5
        return $true
    } catch {
        return $false
    }
}

# Project directory setup
$projectName = "sql-query-explorer"
$projectPath = Join-Path (Get-Location) $projectName

# Check internet connection
if (-not (Test-InternetConnection)) {
    Write-Host "No internet connection detected." -ForegroundColor Yellow
    Write-Host "Proceeding with offline setup..." -ForegroundColor Yellow
}

# Check if directory exists
if (Test-Path $projectPath) {
    Write-Host "Existing installation detected at $projectPath" -ForegroundColor Yellow
    Set-Location $projectPath

    # Check if it's a git repository
    if (Test-Path ".git") {
        if (Test-InternetConnection) {
            Write-Host "Updating existing repository..." -ForegroundColor Cyan
            
            # Fetch latest changes with retry
            $retryCount = 0
            $maxRetries = 3
            while ($retryCount -lt $maxRetries) {
                try {
                    git fetch origin main
                    break
                } catch {
                    $retryCount++
                    if ($retryCount -eq $maxRetries) {
                        Write-Host "Failed to fetch updates after $maxRetries attempts. Proceeding with local files." -ForegroundColor Yellow
                    } else {
                        Write-Host "Retry $retryCount of $maxRetries..." -ForegroundColor Yellow
                        Start-Sleep -Seconds 2
                    }
                }
            }
            
            # Check for local changes
            $status = git status --porcelain
            if ($status) {
                Write-Host "Local changes detected. Do you want to reset to main branch? (y/n)" -ForegroundColor Yellow
                $response = Read-Host
                if ($response -eq 'y') {
                    git reset --hard origin/main
                    Write-Host "Successfully reset to main branch" -ForegroundColor Green
                } else {
                    Write-Host "Setup cancelled. Please commit or stash your changes and try again" -ForegroundColor Red
                    exit 1
                }
            } else {
                git reset --hard origin/main
                Write-Host "Successfully updated to latest version" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "Directory exists but is not a git repository. Please remove or rename the directory" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Creating new project directory..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path $projectName
    Set-Location $projectName

    if (Test-InternetConnection) {
        # Clone the repository with retry
        Write-Host "Cloning repository..." -ForegroundColor Cyan
        $retryCount = 0
        $maxRetries = 3
        while ($retryCount -lt $maxRetries) {
            try {
                git clone https://github.com/Innkaufhaus/sql_dummy_for_testing.git .
                break
            } catch {
                $retryCount++
                if ($retryCount -eq $maxRetries) {
                    Write-Host "Failed to clone repository after $maxRetries attempts." -ForegroundColor Red
                    exit 1
                } else {
                    Write-Host "Retry $retryCount of $maxRetries..." -ForegroundColor Yellow
                    Start-Sleep -Seconds 2
                }
            }
        }
    } else {
        Write-Host "Cannot clone repository without internet connection" -ForegroundColor Red
        exit 1
    }
}

# Clean install dependencies
Write-Host "Cleaning npm cache..." -ForegroundColor Cyan
npm cache clean --force

Write-Host "Installing dependencies..." -ForegroundColor Cyan
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

# Install dependencies with retry
$retryCount = 0
$maxRetries = 3
while ($retryCount -lt $maxRetries) {
    try {
        npm install --legacy-peer-deps --prefer-offline
        break
    } catch {
        $retryCount++
        if ($retryCount -eq $maxRetries) {
            Write-Host "Failed to install dependencies after $maxRetries attempts." -ForegroundColor Red
            exit 1
        } else {
            Write-Host "Retry $retryCount of $maxRetries..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    }
}

# Create public directory if it doesn't exist
Write-Host "Creating public directory for CSV files..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "public"

# Pre-download Next.js dependencies
Write-Host "Pre-downloading Next.js dependencies..." -ForegroundColor Cyan
$env:NEXT_TELEMETRY_DISABLED = "1"
npx --yes @next/swc-win32-x64-msvc@14.1.4

# Start the development server
Write-Host "Setup complete! Starting development server..." -ForegroundColor Green
Write-Host "The application will be available at http://localhost:8000" -ForegroundColor Yellow

# Start the server with retry
$retryCount = 0
$maxRetries = 3
while ($retryCount -lt $maxRetries) {
    try {
        npm run dev
        break
    } catch {
        $retryCount++
        if ($retryCount -eq $maxRetries) {
            Write-Host "Failed to start development server after $maxRetries attempts." -ForegroundColor Red
            Write-Host "Please try running 'npm run dev' manually." -ForegroundColor Yellow
            exit 1
        } else {
            Write-Host "Retry $retryCount of $maxRetries..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    }
}

Read-Host "Press Enter to exit"
