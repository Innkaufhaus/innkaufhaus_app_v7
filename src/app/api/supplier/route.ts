import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

interface SupplierRequest {
  action: 'search' | 'getPurchaseFactor' | 'list'
  supplier?: string
  connectionDetails: {
    host: string
    port: number
    user: string
    password: string
    database: string
  }
}

export async function POST(req: Request) {
  try {
    const { action, supplier, connectionDetails }: SupplierRequest = await req.json()
    
    // Enforce the correct password for local SQL connections
    connectionDetails.password = 'sa04jT14'
    
    console.log('Supplier API request:', { action, supplier, ...connectionDetails, password: '********' })

    // Ensure database is set explicitly
    if (!connectionDetails.database) {
      connectionDetails.database = 'eazybusiness'
    }

    switch (action) {
      case 'list': {
        // Get all suppliers
        const query = 'SELECT DISTINCT cFirma FROM tLieferant WHERE cFirma IS NOT NULL AND cFirma != \'\' ORDER BY cFirma'
        console.log('Executing supplier list query:', query)
        
        const result = await executeQuery(connectionDetails, query)
        console.log('Supplier list result:', result)
        
        if (!result.success) {
          console.error('Failed to fetch suppliers:', result.error)
          return NextResponse.json({
            success: false,
            error: result.error
          }, { status: 500 })
        }

        const suppliers = (result.data as Array<{ cFirma: string }>).map(row => row.cFirma)
        console.log('Found suppliers:', suppliers)

        return NextResponse.json({
          success: true,
          suppliers
        })
      }

      case 'search': {
        if (!supplier) {
          return NextResponse.json({
            success: false,
            error: 'Supplier search term is required'
          }, { status: 400 })
        }

        // Search for suppliers matching the input
        const query = `
          SELECT DISTINCT cFirma 
          FROM tLieferant 
          WHERE cFirma LIKE '%${supplier}%'
            AND cFirma IS NOT NULL 
            AND cFirma != ''
          ORDER BY cFirma
        `
        const result = await executeQuery(connectionDetails, query)
        
        if (!result.success) {
          return NextResponse.json({
            success: false,
            error: result.error
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          suppliers: (result.data as Array<{ cFirma: string }>).map(row => row.cFirma)
        })
      }

      case 'getPurchaseFactor': {
        if (!supplier) {
          return NextResponse.json({
            success: false,
            error: 'Supplier name is required'
          }, { status: 400 })
        }

        // Calculate purchase price factor for the supplier
        const query = `
          SELECT SUM(tArtikel.fVKNetto)/NULLIF(SUM(tArtikel.fEKNetto), 0) as factor
          FROM tArtikel 
          JOIN tLiefArtikel ON tLiefArtikel.tArtikel_kArtikel = tArtikel.kArtikel
          JOIN tLieferant ON tLiefArtikel.tLieferant_kLieferant = tLieferant.kLieferant
          WHERE tLieferant.cFirma = '${supplier}'
            AND tArtikel.fVKNetto > 0 
            AND tArtikel.fEKNetto > 0
        `
        const result = await executeQuery(connectionDetails, query)
        
        if (!result.success) {
          return NextResponse.json({
            success: false,
            error: result.error
          }, { status: 500 })
        }

        const factor = (result.data as Array<{ factor: number }>)[0]?.factor || 2.0

        return NextResponse.json({
          success: true,
          factor: parseFloat(factor.toString())
        })
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Supplier API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process supplier request'
    }, { status: 500 })
  }
}
