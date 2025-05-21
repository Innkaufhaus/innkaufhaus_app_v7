import sql from 'mssql'
import { Logger } from './logger'
import { lookup } from 'dns/promises'

interface ConnectionDetails {
  host: string
  port: number
  user: string
  password: string
  database?: string
}

async function checkHostConnectivity(host: string) {
  try {
    await Logger.log(`Resolving DNS for host: ${host}`)
    const addresses = await lookup(host)
    await Logger.log(`DNS resolved: ${JSON.stringify(addresses)}`)
    return true
  } catch (error) {
    await Logger.log(`DNS lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'ERROR')
    return false
  }
}

export async function executeQuery(connectionDetails: ConnectionDetails, query: string) {
  const config: sql.config = {
    server: connectionDetails.host,
    port: connectionDetails.port,
    user: connectionDetails.user,
    password: connectionDetails.password,
    database: connectionDetails.database || 'eazybusiness',
    options: {
      encrypt: false, // Disable encryption for local SQL Server
      trustServerCertificate: true,
      enableArithAbort: true,
      connectTimeout: 15000, // Reduced to 15 seconds
      requestTimeout: 15000, // Reduced to 15 seconds
      rowCollectionOnRequestCompletion: true,
      appName: 'JTL-Wawi-Import'
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 15000 // Reduced to 15 seconds
    }
  }

  await Logger.log(`Attempting SQL Server connection to ${config.server}:${config.port} as ${config.user}`)
  
  // Check host connectivity first
  const isHostReachable = await checkHostConnectivity(config.server)
  if (!isHostReachable) {
    return {
      success: false,
      error: `Unable to resolve host: ${config.server}. Please check if the IP address is correct and the server is accessible.`
    }
  }

  let pool: sql.ConnectionPool | null = null
  
  try {
    // Create a new connection pool
    pool = new sql.ConnectionPool(config)

    // Add error handler for pool errors
    pool.on('error', async err => {
      await Logger.log(`SQL Pool Error: ${err.message}`, 'ERROR')
    })

    // Connect to database
    await Logger.log('Establishing database connection...')
    await pool.connect()
    await Logger.log('Database connection established successfully')
    
    // Execute query
    await Logger.log(`Executing query: ${query}`)
    const result = await pool.request().query(query)
    await Logger.log(`Query executed successfully, rows: ${result.recordset?.length || result.rowsAffected}`, 'SUCCESS')
    
    return { 
      success: true, 
      data: result.recordset || result.rowsAffected 
    }
  } catch (error) {
    await Logger.log(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'ERROR')
    let errorMessage = 'An unknown error occurred'
    
    if (error instanceof Error) {
      errorMessage = error.message
      if ('code' in error) {
        const sqlError = error as any
        await Logger.log(`SQL Server error details: code=${sqlError.code}, number=${sqlError.number}`, 'ERROR')

        // Add specific handling for common SQL Server errors
        switch (sqlError.code) {
          case 'ETIMEOUT':
            errorMessage = 'Connection timed out. Please check if SQL Server is accessible and the port is correct.'
            break
          case 'ELOGIN':
            errorMessage = 'Login failed. Please check your username and password.'
            break
          case 'EALREADY':
            errorMessage = 'Connection already exists.'
            break
          case 'ESOCKET':
            errorMessage = 'Network error. Please check if SQL Server is running and accessible.'
            break
          case 'ECONNREFUSED':
            errorMessage = 'Connection refused. Please check if SQL Server is running and the port is correct.'
            break
          default:
            if (sqlError.number) {
              switch (sqlError.number) {
                case 4060:
                  errorMessage = 'Cannot open database. Please check if the database exists and the user has access.'
                  break
                case 18456:
                  errorMessage = 'Login failed. Please check your SQL Server authentication settings.'
                  break
                case 2812:
                  errorMessage = 'Could not find stored procedure. Please check if the required procedures are installed.'
                  break
                default:
                  errorMessage = `SQL Server error ${sqlError.number}: ${error.message}`
              }
            } else {
              errorMessage = `Database error: ${error.message}`
            }
        }
      }
    }
    
    return { 
      success: false, 
      error: errorMessage
    }
  } finally {
    if (pool) {
      try {
        await pool.close()
        await Logger.log('Database connection closed')
      } catch (error) {
        await Logger.log(`Error closing database connection: ${error instanceof Error ? error.message : 'Unknown error'}`, 'ERROR')
      }
    }
  }
}
