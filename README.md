# SQL Query Explorer

A modern web application that allows users to connect to MySQL databases and execute SQL queries through a clean, user-friendly interface.

## Features

- **Database Connection Management**
  - Easy-to-use form for database credentials
  - Support for custom host and port configuration
  - Secure password handling

- **SQL Query Execution**
  - Large, monospaced text area for query input
  - Support for all types of SQL queries (SELECT, INSERT, UPDATE, DELETE, etc.)
  - Real-time query execution

- **Results Display**
  - Clean, responsive table layout for query results
  - Proper handling of different result types
  - Clear success/error messages
  - Display of affected rows for non-SELECT queries

- **Modern UI/UX**
  - Clean, minimalist design
  - Loading indicators during query execution
  - Responsive layout that works on all devices
  - Built with Next.js and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL server (accessible from the application)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Innkaufhaus/sql_dummy_for_testing.git
   cd sql_dummy_for_testing
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:8000`

## Usage

1. **Connect to Database**
   - Enter your database host (default: localhost)
   - Specify the port (default: 3306)
   - Provide username and password

2. **Execute Queries**
   - Type your SQL query in the query text area
   - Click "Execute Query" to run
   - View results in the table below

3. **View Results**
   - SELECT queries display results in a table format
   - Other queries show success message and affected rows
   - Errors are clearly displayed with helpful messages

## Technology Stack

- **Frontend:**
  - Next.js 15.3
  - React
  - Tailwind CSS
  - shadcn/ui components

- **Backend:**
  - Node.js
  - mysql2 for database connections

## Security Considerations

- Database credentials are only stored in memory during the session
- Passwords are never logged or stored
- All database connections are properly closed after query execution

## Development

The project structure follows Next.js conventions:

```
src/
├── app/
│   ├── api/
│   │   └── execute-sql/    # API endpoint
│   ├── page.tsx           # Main UI component
│   └── layout.tsx         # Root layout
├── lib/
│   └── db.ts             # Database utilities
└── components/
    └── ui/               # UI components
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.
