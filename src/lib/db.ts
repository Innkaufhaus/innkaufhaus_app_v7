import mysql from 'mysql2/promise';

interface ConnectionDetails {
  host: string;
  port: number;
  user: string;
  password: string;
}

export async function executeQuery(connectionDetails: ConnectionDetails, query: string) {
  const connection = await mysql.createConnection({
    host: connectionDetails.host,
    port: connectionDetails.port,
    user: connectionDetails.user,
    password: connectionDetails.password,
  });

  try {
    const [results] = await connection.execute(query);
    await connection.end();
    return { success: true, data: results };
  } catch (error) {
    await connection.end();
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}
