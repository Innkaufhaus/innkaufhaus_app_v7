# Setup script for SQL Query Explorer

# Create logs directory if it doesn't exist
$logsPath = Join-Path $PSScriptRoot "public\logs"
if (-not (Test-Path $logsPath)) {
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

# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Create default admin settings if they don't exist
$adminSettingsPath = Join-Path $PSScriptRoot "public\admin-settings.json"
if (-not (Test-Path $adminSettingsPath)) {
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
