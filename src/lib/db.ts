import sql from 'mssql'

interface ConnectionDetails {
  host: string
  port: number
  user: string
  password: string
}

export async function executeQuery(connectionDetails: ConnectionDetails, query: string) {
  const config = {
    server: connectionDetails.host,
    port: connectionDetails.port,
    user: connectionDetails.user,
    password: connectionDetails.password,
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  }

  try {
    await sql.connect(config)
    const result = await sql.query(query)
    await sql.close()
    return { success: true, data: result.recordset || result.rowsAffected }
  } catch (error) {
    await sql.close()
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
}
