"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Copy, Check } from "lucide-react"

export default function LogsPage() {
  const [generalLogs, setGeneralLogs] = useState<string[]>([])
  const [sqlLogs, setSqlLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedSQL, setCopiedSQL] = useState(false)
  const [copiedGeneral, setCopiedGeneral] = useState(false)

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch general logs
      const generalResponse = await fetch('/api/powershell-log?category=GENERAL')
      const generalData = await generalResponse.json()
      if (generalData.success) {
        setGeneralLogs(generalData.logs)
      }

      // Fetch SQL logs
      const sqlResponse = await fetch('/api/powershell-log?category=SQL')
      const sqlData = await sqlResponse.json()
      if (sqlData.success) {
        setSqlLogs(sqlData.logs)
      }
    } catch (error) {
      setError('Failed to fetch logs')
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadLogs = async (category: string) => {
    try {
      const response = await fetch(`/api/download-logs?category=${category}`)
      if (!response.ok) throw new Error('Failed to download logs')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${category.toLowerCase()}-logs.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      setError('Failed to download logs')
      console.error('Error downloading logs:', error)
    }
  }

  const copyToClipboard = async (text: string, type: 'SQL' | 'GENERAL') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'SQL') {
        setCopiedSQL(true)
        setTimeout(() => setCopiedSQL(false), 2000)
      } else {
        setCopiedGeneral(true)
        setTimeout(() => setCopiedGeneral(false), 2000)
      }
    } catch (error) {
      setError('Failed to copy to clipboard')
      console.error('Error copying to clipboard:', error)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  return (
    <main className="container mx-auto p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">System Logs</h1>
          <Button 
            onClick={fetchLogs} 
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh Logs"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="sql" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sql">SQL Connection Logs</TabsTrigger>
            <TabsTrigger value="general">General Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sql">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>SQL Connection Logs</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(sqlLogs.join('\n'), 'SQL')}
                    className="flex items-center gap-2"
                  >
                    {copiedSQL ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadLogs('SQL')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-black text-green-400 p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto">
                  {sqlLogs.length > 0 ? sqlLogs.join('\n') : 'No SQL logs available'}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>General Logs</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generalLogs.join('\n'), 'GENERAL')}
                    className="flex items-center gap-2"
                  >
                    {copiedGeneral ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadLogs('GENERAL')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-black text-green-400 p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto">
                  {generalLogs.length > 0 ? generalLogs.join('\n') : 'No general logs available'}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
