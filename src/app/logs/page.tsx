"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Log {
  timestamp: string
  type: string
  message: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/powershell-log')
      const data = await response.json()
      if (data.success) {
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  useEffect(() => {
    fetchLogs()
    
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000) // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [autoRefresh])

  const getLogColor = (log: string) => {
    if (log.includes('[ERROR]')) return 'text-red-500'
    if (log.includes('[SUCCESS]')) return 'text-green-500'
    return 'text-gray-700'
  }

  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>PowerShell Console Logs</CardTitle>
          <div className="flex space-x-4">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? "Auto-Refresh On" : "Auto-Refresh Off"}
            </Button>
            <Button variant="outline" onClick={fetchLogs}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] rounded-md border p-4">
            <div className="space-y-1 font-mono text-sm">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`whitespace-pre-wrap ${getLogColor(log)}`}
                >
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center text-gray-500">
                  No logs available
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </main>
  )
}
