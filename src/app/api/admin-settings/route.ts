import { NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

const settingsPath = join(process.cwd(), 'public', 'admin-settings.json')

interface AdminSettings {
  database: {
    host: string
    port: string
    user: string
    password: string
  }
  executable: {
    path: string
    defaultParams: string
  }
}

// Helper function to read settings
async function readSettings(): Promise<AdminSettings | null> {
  try {
    const data = await readFile(settingsPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return null
  }
}

// Helper function to write settings
async function writeSettings(settings: AdminSettings) {
  await writeFile(settingsPath, JSON.stringify(settings, null, 2))
}

export async function GET() {
  try {
    const settings = await readSettings()
    if (!settings) {
      return NextResponse.json({
        success: false,
        error: 'No settings found'
      }, { status: 404 })
    }
    
    // Mask the password in the response
    const maskedSettings = {
      ...settings,
      database: {
        ...settings.database,
        password: settings.database.password ? '********' : ''
      }
    }
    
    return NextResponse.json({
      success: true,
      settings: maskedSettings
    })
  } catch (error) {
    console.error('Failed to read settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to read settings'
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const newSettings = await req.json()
    
    // Get existing settings to preserve password if not provided
    const existingSettings = await readSettings()
    
    const mergedSettings: AdminSettings = {
      database: {
        host: newSettings.database.host || '',
        port: newSettings.database.port || '',
        user: newSettings.database.user || '',
        // Keep existing password if new one is not provided
        password: newSettings.database.password === '********' 
          ? (existingSettings?.database.password || '')
          : (newSettings.database.password || '')
      },
      executable: {
        path: newSettings.executable.path || '',
        defaultParams: newSettings.executable.defaultParams || ''
      }
    }
    
    await writeSettings(mergedSettings)
    
    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully'
    })
  } catch (error) {
    console.error('Failed to save settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to save settings'
    }, { status: 500 })
  }
}
