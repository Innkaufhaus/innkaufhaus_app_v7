# Installation script for SQL Query Explorer

# Enable TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Write-Host "Creating application directory..."
New-Item -ItemType Directory -Force -Path "innkiapp"
Set-Location "innkiapp"

Write-Host "Downloading setup script..."
$setupUrl = "https://raw.githubusercontent.com/Innkaufhaus/innkaufhaus_app_v7/main/setup.ps1"
Invoke-WebRequest -Uri $setupUrl -OutFile "setup.ps1"

Write-Host "Waiting for file download to complete..."
Start-Sleep -Seconds 2

if (Test-Path "setup.ps1") {
    Write-Host "Running setup script..."
    & .\setup.ps1
} else {
    Write-Host "Error: setup.ps1 was not downloaded successfully."
    exit 1
}
