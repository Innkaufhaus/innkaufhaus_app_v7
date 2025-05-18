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

## Quick Start (Windows)

1. Download `setup.ps1` from this repository
2. Open PowerShell as Administrator
3. Navigate to where you downloaded `setup.ps1`
4. Run:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\setup.ps1
   ```

## Manual Setup

If you prefer to set up manually:

1. Clone the repository:
   ```powershell
   git clone https://github.com/Innkaufhaus/sql_dummy_for_testing.git
   cd sql_dummy_for_testing
   ```

2. Install dependencies:
   ```powershell
   npm install --legacy-peer-deps
   ```

3. Start the development server:
   ```powershell
   npm run dev
   ```

4. Open http://localhost:8000 in your browser

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

1. If you get permission errors running setup.ps1:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```

2. If npm install fails:
   ```powershell
   npm cache clean --force
   npm install --legacy-peer-deps
   ```

3. If the port is in use:
   - Close any other running Node.js applications
   - Or change the port in package.json:
     ```json
     "dev": "cross-env PORT=8001 next dev"
