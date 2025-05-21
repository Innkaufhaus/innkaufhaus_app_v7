# SQL Query Explorer

This project is a SQL Query Explorer with enhanced logging and diagnostics for SQL Server connections.

## Features

- Connect to SQL Server databases with detailed connection logging.
- View SQL connection logs and general logs in the web UI under "Console Logs".
- Logs are stored in `public/logs/` directory:
  - `powershell.log` for general logs
  - `sql-connection.log` for SQL connection logs
- Automatic log rotation when logs exceed 10MB.
- Improved error handling and diagnostics for connection issues.

## Viewing Logs

Navigate to the **Console Logs** page in the application to view logs. Logs are split into two tabs:

- **SQL Connection Logs**: Shows detailed logs related to SQL Server connection attempts.
- **General Logs**: Shows general application logs.

## Setup

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Run the development server with `npm run dev`.
4. Configure your SQL Server connection in the Admin Settings page.
5. Use the Test Connection button to verify connectivity.
6. View logs in the Console Logs page for diagnostics.

## Notes

- Logs are stored in the `public/logs/` directory. Ensure this directory is writable.
- The logger automatically creates and rotates log files.
- For connection issues, check the SQL Connection Logs for detailed error messages.

## License

MIT License
