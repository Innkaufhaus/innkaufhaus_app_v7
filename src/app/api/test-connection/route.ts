import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { host, port, user, password } = await req.json()

    // Test connection by running a simple query
    const result = await executeQuery(
      { host, port: Number(port), user, password },
      'SELECT 1 AS test'
    )

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Connection successful!' })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to database'
    }, { status: 500 })
  }
}
