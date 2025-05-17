import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { host, port, user, password } = await req.json()

    // Query to get all databases
    const result = await executeQuery(
      { host, port: Number(port), user, password },
      'SELECT name FROM master.sys.databases WHERE database_id > 4 AND state = 0'  // Excludes system databases and only includes online databases
    )

    if (result.success && Array.isArray(result.data)) {
      const databases = result.data.map(db => db.name)
      return NextResponse.json({ success: true, databases })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to fetch databases' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Failed to fetch databases:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch databases'
    }, { status: 500 })
  }
}
