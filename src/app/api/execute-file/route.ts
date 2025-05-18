import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'

const execAsync = promisify(exec)

export async function POST(req: Request) {
  try {
    const { filePath, parameters } = await req.json()

    if (!filePath) {
      return NextResponse.json({ 
        success: false, 
        error: 'File path is required' 
      }, { status: 400 })
    }

    // Construct the command with parameters
    const command = `"${filePath}" ${parameters ? parameters.join(' ') : ''}`

    // Execute the command
    const { stdout, stderr } = await execAsync(command)

    if (stderr) {
      return NextResponse.json({ 
        success: false, 
        error: stderr 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      output: stdout,
      message: 'File executed successfully' 
    })
  } catch (error) {
    console.error('Failed to execute file:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to execute file'
    }, { status: 500 })
  }
}
