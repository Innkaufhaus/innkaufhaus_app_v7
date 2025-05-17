import sql from 'mssql'

interface ConnectionDetails {
  host: string
  port: number
  user: string
  password: string
  database?: string
}

export async function executeQuery(connectionDetails: ConnectionDetails, query: string) {
  const config = {
    server: connectionDetails.host,
    port: connectionDetails.port,
    user: connectionDetails.user,
    password: connectionDetails.password,
    database: connectionDetails.database,
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  }

  let pool: sql.ConnectionPool | null = null
  
  try {
    pool = await new sql.ConnectionPool(config).connect()
    const result = await pool.request().query(query)
    return { success: true, data: result.recordset || result.rowsAffected }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}
