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

    switch (action) {
      case 'list': {
        // Get all suppliers
        const query = 'SELECT cfirma FROM tlieferant ORDER BY cfirma'
        const result = await executeQuery(connectionDetails, query)
        
        if (!result.success) {
          return NextResponse.json({
            success: false,
            error: result.error
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          suppliers: (result.data as Array<{ cfirma: string }>).map(row => row.cfirma)
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
          SELECT cfirma 
          FROM tlieferant 
          WHERE cfirma LIKE '%${supplier}%'
          ORDER BY cfirma
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
          suppliers: (result.data as Array<{ cfirma: string }>).map(row => row.cfirma)
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
          JOIN tliefartikel ON tliefartikel.tArtikel_kArtikel = tartikel.kArtikel
          JOIN tlieferant ON tliefartikel.tLieferant_kLieferant = tlieferant.kLieferant
          WHERE tlieferant.cfirma = '${supplier}'
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
      error: 'Failed to process supplier request'
    }, { status: 500 })
  }
}
