import { NextResponse } from 'next/server'
import { cache } from '../amazon-search/route'

export async function POST() {
  try {
    cache.clear()
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully'
    })
  } catch (error) {
    console.error('Failed to clear cache:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to clear cache'
    }, { status: 500 })
  }
}
