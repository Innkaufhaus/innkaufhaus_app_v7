import { NextResponse } from 'next/server'
import { executeQuery } from '../../../lib/db'
import { Logger } from '../../../lib/logger'

export async function POST(req: Request) {
  try {
    const { ean, connectionDetails } = await req.json()

    // Debug log
    await Logger.log(`Checking EAN ${ean} with connection to ${connectionDetails.host}`, 'INFO')

    if (!connectionDetails?.host || !connectionDetails?.port || !connectionDetails?.user || !connectionDetails?.password) {
      return NextResponse.json({
        success: false,
        error: 'Invalid connection details'
      }, { status: 400 })
    }

    const result = await executeQuery(
      {
        host: connectionDetails.host,
        port: parseInt(connectionDetails.port.toString()),
        user: connectionDetails.user,
        password: connectionDetails.password,
        database: 'eazybusiness' // Use eazybusiness instead of JTL
      },
      `SELECT cBarcode FROM tArtikel WHERE cBarcode = '${ean}'`
    )

    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json({
      success: true,
      exists: Array.isArray(result.data) && result.data.length > 0
    })
  } catch (error) {
    await Logger.log('Check EAN error: ' + (error instanceof Error ? error.message : 'Unknown error'), 'ERROR')
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check EAN'
    }, { status: 500 })
  }
}
