import { NextResponse } from 'next/server'
import { executeQuery } from '../../../lib/db'
import { Logger } from '../../../lib/logger'

export async function POST(req: Request) {
  try {
    const { connectionDetails } = await req.json()

    if (!connectionDetails?.host || !connectionDetails?.port || !connectionDetails?.user || !connectionDetails?.password) {
      return NextResponse.json({
        success: false,
        error: 'Invalid connection details'
      }, { status: 400 })
    }

    // Query to get all suppliers
    const query = `
      SELECT 
        kLieferant as id,
        cFirma as company
      FROM tLieferant 
      ORDER BY cFirma
    `

    const result = await executeQuery(
      {
        host: connectionDetails.host,
        port: parseInt(connectionDetails.port.toString()),
        user: connectionDetails.user,
        password: connectionDetails.password,
        database: 'eazybusiness'
      },
      query
    )

    if (!result.success) {
      throw new Error(result.error)
    }

    // Log all suppliers to console
    await Logger.log(`Found ${result.data?.length || 0} suppliers`, 'INFO')
    if (Array.isArray(result.data) && result.data.length > 0) {
      await Logger.log('First 5 suppliers: ' + JSON.stringify(result.data.slice(0, 5)), 'INFO')
    }

    // Transform the data into the format expected by the Combobox component
    const suppliers = Array.isArray(result.data) ? result.data.map(supplier => ({
      value: supplier.id.toString(),
      label: supplier.company
    })) : []

    return NextResponse.json({
      success: true,
      suppliers
    })
  } catch (error) {
    await Logger.log('Supplier search error: ' + (error instanceof Error ? error.message : 'Unknown error'), 'ERROR')
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search suppliers'
    }, { status: 500 })
  }
}
