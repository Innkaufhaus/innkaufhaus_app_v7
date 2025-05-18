import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(req: Request) {
  try {
    const { data, filename } = await req.json()

    if (!data || !Array.isArray(data) || !filename) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid data or filename' 
      }, { status: 400 })
    }

    // Convert data to CSV
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => 
      Object.values(row)
        .map(value => `"${String(value).replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv = [headers, ...rows].join('\n')

    // Save the file in the public directory
    const filePath = join(process.cwd(), 'public', filename)
    await writeFile(filePath, csv)

    return NextResponse.json({ 
      success: true, 
      filePath: `/public/${filename}`,
      message: 'CSV file saved successfully' 
    })
  } catch (error) {
    console.error('Failed to save CSV:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save CSV file'
    }, { status: 500 })
  }
}
