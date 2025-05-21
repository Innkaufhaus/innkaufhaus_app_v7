import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

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
  // Create imports directory if it doesn't exist
  const importDir = join(process.cwd(), 'public', 'imports')
  await writeFile(importDir, '', { flag: 'a' }) // Creates dir if doesn't exist

  const csvContent = [
    "GTIN,HAN,Artikelname,BruttoVK,NettoVK,UVP,NettoEK,Steuersatz,Lieferant,Bestandsfuehrung",
    `${data.ean},${data.han},"${data.title}",${data.bruttoPrice.toFixed(2)},${data.nettoPrice.toFixed(2)},${data.bruttoPrice.toFixed(2)},${data.purchasePrice.toFixed(2)},${data.taxRate},"${data.supplier}",Y`
  ].join('\n')

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const csvPath = join(importDir, `import_${timestamp}.csv`)
  await writeFile(csvPath, csvContent, 'utf-8')
  return csvPath
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
    await execAsync(`"${ameisePath}" ${args}`)
    return { success: true }
  } catch (error) {
    console.error('Ameise execution error:', error)
    return { success: false, error }
  }
}

export async function POST(req: Request) {
  try {
    const data: ImportRequest = await req.json()

    // Save CSV file
    const csvPath = await createCsvFile(data)

    // Execute Ameise
    const ameiseResult = await executeAmeise(csvPath, data.connectionDetails)

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
      error: 'Failed to save import data'
    }, { status: 500 })
  }
}
