import { NextResponse } from 'next/server'
import sql from 'mssql'

export async function POST(req: Request) {
  try {
    const { ean, connectionDetails } = await req.json()

    const config = {
      user: connectionDetails.user,
      password: connectionDetails.password,
      server: connectionDetails.host,
      port: connectionDetails.port,
      database: connectionDetails.database,
      options: {
        encrypt: true,
        trustServerCertificate: true
      }
    }

    const pool = await sql.connect(config)
    const result = await pool.request()
      .input('ean', sql.VarChar, ean)
      .query('SELECT cBarcode FROM tArtikel WHERE cBarcode = @ean')
    
    await pool.close()

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
  }
}
