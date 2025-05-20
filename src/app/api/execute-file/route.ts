import { NextResponse } from 'next/server'
import { spawn, ChildProcessWithoutNullStreams } from 'child_process'

let currentProcess: ChildProcessWithoutNullStreams | null = null

export async function POST(req: Request) {
  try {
    if (currentProcess) {
      return NextResponse.json({ success: false, error: 'Process already running' }, { status: 409 })
    }

    const { path, parameters } = await req.json()
    if (!path) {
      return NextResponse.json({ success: false, error: 'Executable path is required' }, { status: 400 })
    }

    const args = parameters ? parameters.split(' ') : []

    currentProcess = spawn(path, args)

    return new Response(
      new ReadableStream({
        start(controller) {
          currentProcess!.stdout.on('data', (data) => {
            controller.enqueue(new TextEncoder().encode(data.toString()))
          })

          currentProcess!.stderr.on('data', (data) => {
            controller.enqueue(new TextEncoder().encode(data.toString()))
          })

          currentProcess!.on('close', (code) => {
            controller.close()
            currentProcess = null
          })

          currentProcess!.on('error', (err) => {
            controller.error(err)
            currentProcess = null
          })
        }
      }),
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      }
    )
  } catch (error) {
    currentProcess = null
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to execute file' }, { status: 500 })
  }
}

export async function DELETE() {
  if (currentProcess) {
    currentProcess.kill()
    currentProcess = null
    return NextResponse.json({ success: true, message: 'Process aborted' })
  } else {
    return NextResponse.json({ success: false, error: 'No process running' }, { status: 400 })
  }
}
