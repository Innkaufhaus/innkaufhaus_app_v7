import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const { host, port, user, password, database } = body

    // Validate required fields
    if (!host || !port || !user || !password) {
      console.error('Missing required connection details:', { host, port, user })
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required connection details' 
      }, { status: 400 })
    }

    // Log connection attempt (masking password)
    console.log('Testing connection with:', {
      host,
      port,
      user,
      database: database || 'eazybusiness',
      password: '********'
    })

    // Test basic connectivity first
    const basicTest = await executeQuery(
      { 
        host, 
        port: Number(port), 
        user, 
        password, 
        database: database || 'eazybusiness'
      },
      'SELECT 1 AS test'
    )

    if (!basicTest.success) {
      console.error('Basic connection test failed:', basicTest.error)
      return NextResponse.json({ 
        success: false, 
        error: basicTest.error || 'Failed to connect to database'
      }, { status: 500 })
    }

    console.log('Basic connection test successful, testing supplier table access...')

    // If basic test succeeds, try accessing the supplier table
    const supplierTest = await executeQuery(
      { 
        host, 
        port: Number(port), 
        user, 
        password, 
        database: database || 'eazybusiness'
      },
      'SELECT TOP 1 kLieferant, cFirma FROM tLieferant'
    )

    if (!supplierTest.success) {
      console.error('Supplier table test failed:', supplierTest.error)
      return NextResponse.json({ 
        success: false, 
        error: 'Connected to database but failed to access supplier table: ' + supplierTest.error
      }, { status: 500 })
    }

    console.log('Supplier table test successful:', supplierTest.data)

    // All tests passed
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection and access tests successful',
      data: supplierTest.data
    })

  } catch (error) {
    console.error('Test connection error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error 
        ? `Connection test failed: ${error.message}`
        : 'An unexpected error occurred while testing the connection'
    }, { status: 500 })
  }
}
