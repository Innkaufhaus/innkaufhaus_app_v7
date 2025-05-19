import { NextResponse } from 'next/server'
import { Logger } from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const { message, type } = await req.json()
    await Logger.rotateLogIfNeeded()
    await Logger.log(message, type)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to log PowerShell message:', error)
    return NextResponse.json({ success: false, error: 'Failed to log message' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const logs = await Logger.getRecentLogs(200)
    return NextResponse.json({ success: true, logs })
  } catch (error) {
    console.error('Failed to get PowerShell logs:', error)
    return NextResponse.json({ success: false, error: 'Failed to get logs' }, { status: 500 })
  }
}
