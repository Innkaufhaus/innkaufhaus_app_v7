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

## Installation Options

### 1. Fresh Installation in a New Directory

```powershell
# Create a new directory for the project
mkdir my-new-project
cd my-new-project

# Download setup.ps1 from the repository
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Innkaufhaus/sql_dummy_for_testing/main/setup.ps1" -OutFile "setup.ps1"

# Allow script execution for this session
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Run the setup script
.\setup.ps1
```

### 2. Clean Installation (Remove Existing and Start Fresh)

```powershell
# Download setup.ps1 (if you don't have it)
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Innkaufhaus/sql_dummy_for_testing/main/setup.ps1" -OutFile "setup.ps1"

# Run setup with --clean parameter to remove existing installation
.\setup.ps1 --clean
```

### 3. Update Existing Installation

```powershell
# If you're already in the project directory
.\setup.ps1

# Or from another directory
cd path\to\sql-query-explorer
.\setup.ps1
```

## Offline Installation

The setup script will automatically detect if you're offline:

1. For new installations:
   - Internet connection is required for first-time setup
   - Script will notify you if connection is not available

2. For existing installations:
   - Will use existing files if no internet connection
   - Dependencies will install from npm cache
   - Updates will be skipped until connection is restored

## Manual Setup

If you prefer to set up manually:

```powershell
# Clone the repository
git clone https://github.com/Innkaufhaus/sql_dummy_for_testing.git my-project
cd my-project

# Clean install dependencies
npm cache clean --force
Remove-Item -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path package-lock.json -Force -ErrorAction SilentlyContinue
npm install --legacy-peer-deps

# Create public directory
New-Item -ItemType Directory -Force -Path public

# Start the development server
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

1. If you get permission errors:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```

2. If npm install fails:
   ```powershell
   npm cache clean --force
   Remove-Item -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue
   npm install --legacy-peer-deps --prefer-offline
   ```

3. If the port is in use:
   - Close any other running Node.js applications
   - Or change the port in package.json:
     ```json
     "dev": "cross-env PORT=8001 next dev"
     ```

4. If you have a corrupted installation:
   ```powershell
   # Use the --clean parameter to start fresh
   .\setup.ps1 --clean
   ```

5. Network Issues:
   - The setup script includes retry logic for network operations
   - If problems persist, try running npm commands with `--prefer-offline`
   - Check your proxy settings if behind a corporate network
