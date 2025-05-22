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

# Clone the repository if not already cloned
$repoPath = $PSScriptRoot
if (-not (Test-Path (Join-Path $repoPath ".git"))) {
    Write-Host "Cloning repository..."
    git clone https://github.com/Innkaufhaus/innkaufhaus_app_v7.git .
} else {
    Write-Host "Repository already exists, pulling latest changes..."
    git pull origin main
}

# Clean npm cache and node_modules
Write-Host "Cleaning npm environment..."
Write-Host "1. Removing node_modules directory..."
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}

Write-Host "2. Removing package-lock.json..."
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

Write-Host "3. Cleaning npm cache..."
npm cache clean --force

Write-Host "4. Clearing npm cache directory..."
$npmCachePath = "$env:APPDATA\npm-cache"
if (Test-Path $npmCachePath) {
    Remove-Item -Recurse -Force $npmCachePath
}

# Install dependencies
Write-Host "Installing dependencies..."
npm install

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
