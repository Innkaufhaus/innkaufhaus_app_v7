import { writeFile, appendFile } from 'fs/promises'
import { join } from 'path'

export class Logger {
  private static logPath = join(process.cwd(), 'public', 'logs')
  private static logFile = join(Logger.logPath, 'powershell.log')
  private static maxLogSize = 10 * 1024 * 1024 // 10MB

  static async initialize() {
    try {
      await writeFile(Logger.logFile, '', { flag: 'a' })
    } catch (error) {
      console.error('Failed to initialize logger:', error)
    }
  }

  static async log(message: string, type: 'INFO' | 'ERROR' | 'SUCCESS' = 'INFO') {
    try {
      const timestamp = new Date().toISOString()
      const logEntry = `[${timestamp}] [${type}] ${message}\n`
      await appendFile(Logger.logFile, logEntry)
    } catch (error) {
      console.error('Failed to write to log:', error)
    }
  }

  static async getRecentLogs(lines: number = 100): Promise<string[]> {
    try {
      const { readFile } = await import('fs/promises')
      const content = await readFile(Logger.logFile, 'utf-8')
      return content.split('\n').filter(Boolean).slice(-lines)
    } catch (error) {
      console.error('Failed to read logs:', error)
      return []
    }
  }

  static async clearLogs() {
    try {
      await writeFile(Logger.logFile, '')
    } catch (error) {
      console.error('Failed to clear logs:', error)
    }
  }

  static async rotateLogIfNeeded() {
    try {
      const { stat } = await import('fs/promises')
      const stats = await stat(Logger.logFile)
      
      if (stats.size > Logger.maxLogSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const archivePath = join(Logger.logPath, `powershell-${timestamp}.log`)
        const { rename } = await import('fs/promises')
        await rename(Logger.logFile, archivePath)
        await Logger.initialize()
      }
    } catch (error) {
      console.error('Failed to rotate log:', error)
    }
  }
}
