import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { existsSync } from 'fs'

const execAsync = promisify(exec)

interface ImportRequest {
  ean: string
  title: string
  han: string
  bruttoPrice: number
  nettoPrice: number
  purchasePrice: number
  supplier: string
  taxRate: "7" | "19"
  connectionDetails: {
    host: string
    port: number
    user: string
    password: string
    database: string
  }
}

async function createCsvFile(data: ImportRequest) {
  try {
    // Create base directory structure
    const baseDir = process.env.NODE_ENV === 'production' ? 'C:\\NODE' : process.cwd()
    const publicDir = join(baseDir, 'public')
    const importDir = join(publicDir, 'imports')

    // Create directories if they don't exist
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true })
    }
    if (!existsSync(importDir)) {
      await mkdir(importDir, { recursive: true })
    }

    const csvContent = [
      "GTIN,HAN,Artikelname,BruttoVK,NettoVK,UVP,Steuersatz,NettoEK,Lieferant,Bestandsfuehrung",
      `${data.ean},${data.han},"${data.title}",${data.bruttoPrice.toFixed(2)},${data.nettoPrice.toFixed(2)},${data.bruttoPrice.toFixed(2)},${data.taxRate},${data.purchasePrice.toFixed(2)},"${data.supplier}",Y`
    ].join('\n')

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const csvPath = join(importDir, `import_${timestamp}.csv`)
    
    console.log('Writing CSV to:', csvPath)
    await writeFile(csvPath, csvContent, 'utf-8')
    return csvPath
  } catch (error) {
    console.error('Error creating CSV file:', error)
    throw new Error('Failed to create CSV file')
  }
}

async function executeAmeise(csvPath: string, connectionDetails: ImportRequest['connectionDetails']) {
  const ameisePath = "C:\\Program Files (x86)\\JTL-Software\\JTL-wawi-ameise.exe"
  const args = [
    `-s ${connectionDetails.host},${connectionDetails.port}`,
    `-d ${connectionDetails.database}`,
    `-u ${connectionDetails.user}`,
    `-p ${connectionDetails.password}`,
    `-t IMP784`,
    `-i "${csvPath}"`,
    `--mode production`
  ].join(' ')

  try {
    const { stdout, stderr } = await execAsync(`"${ameisePath}" ${args}`)
    console.log('Ameise stdout:', stdout)
    if (stderr) console.error('Ameise stderr:', stderr)
    return { success: true }
  } catch (error) {
    console.error('Ameise execution error:', error)
    return { success: false, error }
  }
}

export async function POST(req: Request) {
  try {
    const data: ImportRequest = await req.json()
    console.log('Received import request:', { ...data, connectionDetails: { ...data.connectionDetails, password: '********' } })

    // Save CSV file
    const csvPath = await createCsvFile(data)
    console.log('CSV file created:', csvPath)

    // Execute Ameise
    const ameiseResult = await executeAmeise(csvPath, data.connectionDetails)
    console.log('Ameise execution result:', ameiseResult)

    if (!ameiseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to execute Ameise import',
        csvPath // Return path even if Ameise fails
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'CSV saved and Ameise import executed successfully',
      csvPath
    })
  } catch (error) {
    console.error('Save import error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save import data'
    }, { status: 500 })
  }
}
