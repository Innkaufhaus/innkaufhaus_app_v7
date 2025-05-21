import { NextResponse } from 'next/server'
import { Logger } from '@/lib/logger'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || 'GENERAL'
    
    // Initialize logger if needed
    await Logger.initialize()
    
    // Get recent logs for the specified category
    const logs = await Logger.getRecentLogs(100, category as 'GENERAL' | 'SQL')
    
    // Log the response for debugging
    console.log(`Returning ${logs.length} logs for category ${category}`)
    
    return NextResponse.json({
      success: true,
      logs
    })
  } catch (error) {
    console.error('Error reading logs:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to read logs'
    }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || 'GENERAL'
    
    // Clear logs for the specified category
    await Logger.clearLogs(category as 'GENERAL' | 'SQL')
    
    return NextResponse.json({
      success: true,
      message: `${category} logs cleared successfully`
    })
  } catch (error) {
    console.error('Error clearing logs:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to clear logs'
    }, { status: 500 })
  }
}
