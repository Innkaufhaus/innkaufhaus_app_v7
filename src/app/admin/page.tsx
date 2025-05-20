"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

export default function AdminPage() {
  const [settings, setSettings] = useState({
    database: {
      host: "192.168.178.200",
      port: "50815",
      user: "sa",
      password: "sa04jT14",
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

  const handleSave = async () => {
    try {
      const response = await fetch("/api/admin-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      })
      const data = await response.json()
      if (data.success) {
        setMessage({ type: "success", text: "Settings saved successfully" })
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save settings" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings" })
    }
  }

  const testConnection = async () => {
    setTesting(true)
    setMessage(null)
    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: settings.database.host,
          port: parseInt(settings.database.port),
          user: settings.database.user,
          password: settings.database.password,
          database: settings.database.name
        })
      })
      const data = await response.json()
      if (data.success) {
        setMessage({ type: "success", text: "Database connection successful" })
      } else {
        setMessage({ type: "error", text: data.error || "Connection test failed" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Connection test failed" })
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
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    database: { ...settings.database, name: e.target.value }
                  })
                }
              />
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
