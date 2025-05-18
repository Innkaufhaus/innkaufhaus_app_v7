# SQL Query Explorer

A modern web interface for executing SQL queries, saving results as CSV, and running local executables with the saved data.

## Features

- Connect to SQL Server databases
- Execute SQL queries with real-time results
- Save query results as CSV files
- Execute local programs with saved CSV files as parameters
- Cancel long-running queries
- Modern, responsive UI with dark mode support

## Requirements

- Node.js 18 or later
- Git
- Windows PowerShell 5.1 or later

## Quick Start (Important: TLS Setup)

Before starting, enable TLS 1.2 in PowerShell to allow secure downloads:

```powershell
# Open PowerShell and run:
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
```

Then choose one of these installation methods:

### 1. Fresh Installation

```powershell
# Create and navigate to a new directory
mkdir my-new-project
cd my-new-project

# Download setup script
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Innkaufhaus/sql_dummy_for_testing/main/setup.ps1" -OutFile "setup.ps1"

# Allow script execution and run setup
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup.ps1
```

### 2. Clean Installation (Remove Existing)

```powershell
# Download and run with --clean parameter
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Innkaufhaus/sql_dummy_for_testing/main/setup.ps1" -OutFile "setup.ps1"
.\setup.ps1 --clean
```

### 3. Update Existing Installation

```powershell
# If you're in the project directory:
.\setup.ps1

# Or from another location:
cd path\to\sql-query-explorer
.\setup.ps1
```

## Manual Setup

If you prefer to set up manually:

```powershell
# Clone the repository
git clone https://github.com/Innkaufhaus/sql_dummy_for_testing.git my-project
cd my-project

# Install dependencies
npm cache clean --force
npm install --legacy-peer-deps

# Create public directory
New-Item -ItemType Directory -Force -Path public

# Start the server
npm run dev
```

## Usage

1. Database Connection:
   - Enter your SQL Server connection details
   - Click "Test Connection"
   - Select a database from the dropdown

2. Execute Queries:
   - Enter your SQL query
   - Click "Execute Query"
   - Use "Cancel Query" if needed

3. Save Results:
   - After a successful query, enter a filename
   - Click "Save CSV"
   - The file will be saved in the public directory

4. Execute Local Programs:
   - Enter the path to your executable
   - Add parameters (use {csv} to reference the saved CSV)
   - Click "Execute"

## Troubleshooting

1. SSL/TLS Download Issues:
   ```powershell
   # Must run this first in PowerShell
   [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
   ```

2. Permission Errors:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```

3. Installation Issues:
   ```powershell
   # Clean install
   .\setup.ps1 --clean
   
   # Or manual cleanup:
   npm cache clean --force
   Remove-Item -Path node_modules -Recurse -Force
   npm install --legacy-peer-deps --prefer-offline
   ```

4. Port in Use:
   ```json
   // In package.json, change port:
   "dev": "cross-env PORT=8001 next dev"
   ```

5. Network/Proxy Issues:
   - Script includes retry logic for network operations
   - Use `--prefer-offline` with npm commands
   - Check corporate proxy settings
   - Ensure TLS 1.2 is enabled
