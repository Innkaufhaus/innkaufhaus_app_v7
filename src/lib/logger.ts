import { writeFile, appendFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export class Logger {
  private static logPath = join(process.cwd(), 'public', 'logs')
  private static logFile = join(Logger.logPath, 'powershell.log')
  private static sqlLogFile = join(Logger.logPath, 'sql-connection.log')
  private static maxLogSize = 10 * 1024 * 1024 // 10MB

  static async initialize() {
    try {
      // Create logs directory if it doesn't exist
      if (!existsSync(Logger.logPath)) {
        await mkdir(Logger.logPath, { recursive: true })
        console.log('Created logs directory:', Logger.logPath)
      }

      // Create or ensure log files exist
      await writeFile(Logger.logFile, '', { flag: 'a' })
      await writeFile(Logger.sqlLogFile, '', { flag: 'a' })
      
      // Add initial log entries
      await Logger.log('Logger initialized', 'INFO', 'GENERAL')
      await Logger.log('SQL Logger initialized', 'INFO', 'SQL')
      
      console.log('Logger initialized successfully')
    } catch (error) {
      console.error('Failed to initialize logger:', error)
    }
  }

  static async log(message: string, type: 'INFO' | 'ERROR' | 'SUCCESS' = 'INFO', category: 'GENERAL' | 'SQL' = 'GENERAL') {
    try {
      const timestamp = new Date().toISOString()
      const logEntry = `[${timestamp}] [${type}] ${message}\n`
      
      // Ensure directory exists before writing
      if (!existsSync(Logger.logPath)) {
        await mkdir(Logger.logPath, { recursive: true })
      }
      
      if (category === 'SQL') {
        await appendFile(Logger.sqlLogFile, logEntry)
      } else {
        await appendFile(Logger.logFile, logEntry)
      }
    } catch (error) {
      console.error('Failed to write to log:', error)
    }
  }

  static async logSQL(message: string, type: 'INFO' | 'ERROR' | 'SUCCESS' = 'INFO') {
    await Logger.log(message, type, 'SQL')
  }

  static async getRecentLogs(lines: number = 100, category: 'GENERAL' | 'SQL' = 'GENERAL'): Promise<string[]> {
    try {
      const { readFile } = await import('fs/promises')
      const filePath = category === 'SQL' ? Logger.sqlLogFile : Logger.logFile
      
      // Return empty array if file doesn't exist
      if (!existsSync(filePath)) {
        return []
      }
      
      const content = await readFile(filePath, 'utf-8')
      return content.split('\n').filter(Boolean).slice(-lines)
    } catch (error) {
      console.error('Failed to read logs:', error)
      return []
    }
  }

  static async clearLogs(category: 'GENERAL' | 'SQL' = 'GENERAL') {
    try {
      const filePath = category === 'SQL' ? Logger.sqlLogFile : Logger.logFile
      await writeFile(filePath, '')
      await Logger.log(`Logs cleared for ${category}`, 'INFO', category)
    } catch (error) {
      console.error('Failed to clear logs:', error)
    }
  }

  static async rotateLogIfNeeded(category: 'GENERAL' | 'SQL' = 'GENERAL') {
    try {
      const { stat } = await import('fs/promises')
      const filePath = category === 'SQL' ? Logger.sqlLogFile : Logger.logFile
      
      if (!existsSync(filePath)) {
        return
      }
      
      const stats = await stat(filePath)
      
      if (stats.size > Logger.maxLogSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const archivePath = join(Logger.logPath, `${category.toLowerCase()}-${timestamp}.log`)
        const { rename } = await import('fs/promises')
        await rename(filePath, archivePath)
        await Logger.initialize()
      }
    } catch (error) {
      console.error('Failed to rotate log:', error)
    }
  }
}
