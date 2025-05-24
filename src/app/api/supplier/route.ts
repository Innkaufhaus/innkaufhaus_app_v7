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

    // Query to search suppliers by company name
    const query = `
      SELECT 
        kLieferant as id,
        cFirma as company,
        cAnsprechpartner as contact,
        cLieferantennummer as supplierNumber
      FROM tLieferant 
      WHERE cFirma LIKE '%${search}%'
      ORDER BY cFirma
      OFFSET 0 ROWS
      FETCH NEXT 10 ROWS ONLY
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
      label: `${supplier.company} (${supplier.supplierNumber || 'No ID'})`,
      company: supplier.company,
      contact: supplier.contact,
      supplierNumber: supplier.supplierNumber
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
