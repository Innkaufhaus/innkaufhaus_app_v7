import { NextResponse } from 'next/server'
import { executeQuery } from '../../../lib/db'
import { Logger } from '../../../lib/logger'

export async function POST(req: Request) {
  try {
    const { search, connectionDetails } = await req.json()

    if (!connectionDetails?.host || !connectionDetails?.port || !connectionDetails?.user || !connectionDetails?.password) {
      return NextResponse.json({
        success: false,
        error: 'Invalid connection details'
      }, { status: 400 })
    }

    // Query to search suppliers by company name, limited to top 5 matches
    const query = `
      SELECT TOP 5
        kLieferant as id,
        cFirma as company
      FROM tLieferant 
      WHERE tLieferant.cFirma LIKE '%${search}%'
      ORDER BY 
        CASE 
          WHEN cFirma LIKE '${search}%' THEN 1  -- Exact start match
          WHEN cFirma LIKE '% ${search}%' THEN 2  -- Word start match
          ELSE 3  -- Contains match
        END,
        cFirma
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
