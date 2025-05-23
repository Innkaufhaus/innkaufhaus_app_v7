import { NextResponse } from 'next/server'
import sql from 'mssql'

export async function POST(req: Request) {
  let pool: sql.ConnectionPool | null = null
  
  try {
    const { ean, connectionDetails } = await req.json()

    if (!connectionDetails?.host || !connectionDetails?.port || !connectionDetails?.user || !connectionDetails?.password) {
      return NextResponse.json({
        success: false,
        error: 'Invalid connection details'
      }, { status: 400 })
    }

    const config = {
      user: connectionDetails.user,
      password: connectionDetails.password,
      server: connectionDetails.host,
      port: connectionDetails.port,
      database: connectionDetails.database || 'JTL',
      options: {
        encrypt: true,
        trustServerCertificate: true,
        connectTimeout: 30000
      }
    }

    pool = await sql.connect(config)
    const result = await pool.request()
      .input('ean', sql.VarChar, ean)
      .query('SELECT cBarcode FROM tArtikel WHERE cBarcode = @ean')

    return NextResponse.json({
      success: true,
      exists: result.recordset.length > 0
    })
  } catch (error) {
    console.error('Check EAN error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check EAN'
    }, { status: 500 })
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}
