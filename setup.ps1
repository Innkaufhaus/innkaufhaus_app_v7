# Setup script for SQL Query Explorer

# Start transcript to capture all console output
$logFile = Join-Path $PSScriptRoot "setup_log.txt"
Start-Transcript -Path $logFile -Force

Write-Host "Starting setup process..."
Write-Host "Timestamp: $(Get-Date)"

# Create logs directory if it doesn't exist
$logsPath = Join-Path $PSScriptRoot "public\logs"
if (-not (Test-Path $logsPath)) {
    Write-Host "Creating logs directory..."
    New-Item -ItemType Directory -Path $logsPath -Force
}

# Clone the repository
Write-Host "Setting up repository..."
if (-not (Test-Path (Join-Path $PSScriptRoot ".git"))) {
    Write-Host "Initializing git repository..."
    git init
    git remote add origin https://github.com/Innkaufhaus/innkaufhaus_app_v7.git
    git fetch origin main
    git reset --hard origin/main
} else {
    Write-Host "Updating existing repository..."
    git fetch origin main
    git reset --hard origin/main
}

# Clean build artifacts and caches
Write-Host "Cleaning build artifacts and caches..."

Write-Host "1. Removing node_modules directory..."
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}

Write-Host "2. Removing Next.js build artifacts..."
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}

Write-Host "3. Removing package-lock.json..."
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

Write-Host "4. Cleaning npm cache..."
npm cache clean --force

Write-Host "5. Clearing npm cache directory..."
$npmCachePath = "$env:APPDATA\npm-cache"
if (Test-Path $npmCachePath) {
    Remove-Item -Recurse -Force $npmCachePath
}

Write-Host "6. Clearing Next.js cache..."
if (Test-Path ".next\cache") {
    Remove-Item -Recurse -Force ".next\cache"
}

Write-Host "7. Clearing webpack cache..."
$webpackCachePath = Join-Path $PSScriptRoot ".next\cache\webpack"
if (Test-Path $webpackCachePath) {
    Remove-Item -Recurse -Force $webpackCachePath
}

# Verify package.json exists after git reset
if (Test-Path "package.json") {
    Write-Host "Installing dependencies..."
    npm install

    Write-Host "Building the application..."
    npm run build
} else {
    Write-Host "Error: package.json not found after repository setup."
    exit 1
}

# Create default admin settings if they don't exist
$adminSettingsPath = Join-Path $PSScriptRoot "public\admin-settings.json"
if (-not (Test-Path $adminSettingsPath)) {
    Write-Host "Creating default admin settings..."
    $defaultSettings = @{
        database = @{
            host = "localhost"
            port = 1433
            user = "sa"
            password = ""
            name = "eazybusiness"
        }
    }
    $defaultSettings | ConvertTo-Json | Set-Content $adminSettingsPath
}

Write-Host "Setup complete! Run 'npm run dev' to start the application."
Write-Host "Setup log has been saved to: $logFile"

# Stop transcript
Stop-Transcript
