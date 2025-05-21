"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

export default function AdminPage() {
  const [settings, setSettings] = useState({
    database: {
      host: "",
      port: "",
      user: "",
      password: "",
      name: "eazybusiness"
    },
    executable: {
      path: "",
      defaultParams: ""
    }
  })

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [testing, setTesting] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState("")
  const [parameters, setParameters] = useState("")

  useEffect(() => {
    // Load saved settings
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin-settings')
        const data = await response.json()
        if (data.success && data.settings) {
          setSettings({
            database: {
              host: data.settings.database.host || "",
              port: data.settings.database.port || "",
              user: data.settings.database.user || "",
              password: data.settings.database.password || "",
              name: "eazybusiness" // Always use eazybusiness as the database
            },
            executable: {
              path: data.settings.executable.path || "",
              defaultParams: data.settings.executable.defaultParams || ""
            }
          })
          setMessage({ type: "success", text: "Settings loaded successfully" })
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
        setMessage({ type: "error", text: "Failed to load settings" })
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    try {
      const response = await fetch("/api/admin-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          database: {
            host: settings.database.host,
            port: settings.database.port,
            user: settings.database.user,
            password: settings.database.password
          },
          executable: settings.executable
        })
      })
      const data = await response.json()
      if (data.success) {
        setMessage({ type: "success", text: "Settings saved successfully" })
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save settings" })
      }
    } catch (error) {
      console.error('Save settings error:', error)
      setMessage({ type: "error", text: "Failed to save settings" })
    }
  }

  const testConnection = async () => {
    setTesting(true)
    setMessage(null)
    try {
      const connectionDetails = {
        host: settings.database.host,
        port: parseInt(settings.database.port),
        user: settings.database.user,
        password: settings.database.password,
        database: settings.database.name
      }
      
      const logDetails = {
        host: connectionDetails.host,
        port: connectionDetails.port,
        user: connectionDetails.user,
        database: connectionDetails.database,
        password: '********'
      }
      console.log('Testing connection with:', logDetails)

      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(connectionDetails)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Test connection response:', data)

      if (data.success) {
        setMessage({ type: "success", text: "Database connection successful" })
      } else {
        setMessage({ type: "error", text: data.error || "Connection test failed" })
      }
    } catch (error) {
      console.error('Test connection error:', error)
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Connection test failed" 
      })
    } finally {
      setTesting(false)
    }
  }

  const executeAmeise = async () => {
    setExecuting(true)
    setMessage(null)
    setConsoleOutput("")
    try {
      const response = await fetch("/api/execute-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: settings.executable.path,
          parameters: parameters || settings.executable.defaultParams
        })
      })

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response stream")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const text = new TextDecoder().decode(value)
        setConsoleOutput(prev => prev + text)
      }
    } catch (error) {
      console.error('Execute ameise error:', error)
      setMessage({ type: "error", text: "Failed to execute ameise.exe" })
    } finally {
      setExecuting(false)
    }
  }

  const abortExecution = async () => {
    try {
      await fetch("/api/execute-file", {
        method: "DELETE"
      })
      setMessage({ type: "success", text: "Execution aborted" })
      setExecuting(false)
    } catch (error) {
      console.error('Abort execution error:', error)
      setMessage({ type: "error", text: "Failed to abort execution" })
    }
  }

  return (
    <main className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Database Connection</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="db-host">Host</Label>
                <Input
                  id="db-host"
                  value={settings.database.host}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      database: { ...settings.database, host: e.target.value }
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-port">Port</Label>
                <Input
                  id="db-port"
                  value={settings.database.port}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      database: { ...settings.database, port: e.target.value }
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="db-user">Username</Label>
                <Input
                  id="db-user"
                  value={settings.database.user}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      database: { ...settings.database, user: e.target.value }
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-password">Password</Label>
                <Input
                  id="db-password"
                  type="password"
                  value={settings.database.password}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      database: { ...settings.database, password: e.target.value }
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="db-name">Database Name</Label>
              <Input
                id="db-name"
                value={settings.database.name}
                disabled
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500">Fixed to eazybusiness database</p>
            </div>
            <Button 
              onClick={testConnection} 
              disabled={testing}
              variant="outline"
            >
              {testing ? "Testing..." : "Test Connection"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ameise Execution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exec-path">Executable Path</Label>
              <Input
                id="exec-path"
                value={settings.executable.path}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    executable: { ...settings.executable, path: e.target.value }
                  })
                }
                placeholder="Path to ameise.exe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exec-params">Parameters</Label>
              <Input
                id="exec-params"
                value={parameters}
                onChange={(e) => setParameters(e.target.value)}
                placeholder="Enter execution parameters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-params">Default Parameters</Label>
              <Input
                id="default-params"
                value={settings.executable.defaultParams}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    executable: { ...settings.executable, defaultParams: e.target.value }
                  })
                }
                placeholder="Default parameters"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={executeAmeise} 
                disabled={executing}
                className="flex-1"
              >
                {executing ? "Executing..." : "Execute"}
              </Button>
              <Button 
                onClick={abortExecution} 
                disabled={!executing}
                variant="destructive"
              >
                Abort
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Console Output</Label>
              <Textarea
                value={consoleOutput}
                readOnly
                className="h-[200px] font-mono bg-black text-green-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">Save All Settings</Button>

      {message && (
        <Alert variant={message.type === "success" ? "default" : "destructive"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
    </main>
  )
}
