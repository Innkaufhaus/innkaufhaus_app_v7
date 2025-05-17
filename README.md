# SQL Query Explorer

A modern web application that allows users to connect to Microsoft SQL Server databases and execute SQL queries through a clean, user-friendly interface.

## Quick Start

### Windows Installation

```bash
# Clone the repository
git clone https://github.com/Innkaufhaus/sql_dummy_for_testing.git

# Navigate to project directory
cd sql_dummy_for_testing

# Remove package-lock (if exists)
del package-lock.json

# Install dependencies
npm install --legacy-peer-deps

# Start the application
npm run dev
```

The application will be available at http://localhost:8000

## Features

- **Database Connection Management**
  - Easy-to-use form for database credentials
  - Support for custom host and port configuration
  - Secure password handling

- **SQL Query Execution**
  - Large, monospaced text area for query input
  - Support for all types of SQL queries
  - Real-time query execution

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Close any application using port 8000, or
   - Change the port in package.json

2. **Dependency Issues**
   ```bash
   # Windows:
   rd /s /q node_modules
   del package-lock.json

   # Then:
   npm cache clean --force
   npm install --legacy-peer-deps
   ```

3. **SQL Server Connection Issues**
   - Verify SQL Server is running
   - Check firewall settings
   - Confirm credentials are correct
   - Default port is usually 1433
