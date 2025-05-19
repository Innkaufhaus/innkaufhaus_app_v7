import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { executeQuery } from '@/lib/db'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface ImportRequest {
  ean: string
  title: string
  han: string
  bruttoPrice: number
  nettoPrice: number
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
  const csvContent = [
    "GTIN,HAN,Artikelname,BruttoVK,NettoVK,UVP,NettoEK,Steuersatz,Lieferant,Bestandsfuehrung",
    `${data.ean},${data.han},"${data.title}",${data.bruttoPrice},${data.nettoPrice},${data.bruttoPrice},${data.nettoPrice},${data.taxRate},${data.supplier},Y`
  ].join('\n')

  const csvPath = join(process.cwd(), 'public', 'imports', `import_${Date.now()}.csv`)
  await writeFile(csvPath, csvContent, 'utf-8')
  return csvPath
}

async function importWithAmeise(csvPath: string, connectionDetails: ImportRequest['connectionDetails']) {
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
    return true
  } catch (error) {
    console.error('Ameise import error:', error)
    return false
  }
}

async function saveUsedEan(ean: string, supplier: string) {
  const timestamp = new Date().toISOString()
  const logPath = join(process.cwd(), 'public', 'imports', 'ean_benutzt.txt')
  const logEntry = `${ean},${supplier},${timestamp}\n`
  await writeFile(logPath, logEntry, { flag: 'a' })
}

export async function POST(req: Request) {
  try {
    const data: ImportRequest = await req.json()

    // Create CSV file
    const csvPath = await createCsvFile(data)

    // Import using Ameise
    const importSuccess = await importWithAmeise(csvPath, data.connectionDetails)
    
    if (!importSuccess) {
      return NextResponse.json({
        success: false,
        error: 'Failed to import article with Ameise'
      }, { status: 500 })
    }

    // Log the used EAN
    await saveUsedEan(data.ean, data.supplier)

    return NextResponse.json({
      success: true,
      message: 'Article imported successfully'
    })
  } catch (error) {
    console.error('Article import error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to import article'
    }, { status: 500 })
  }
}
