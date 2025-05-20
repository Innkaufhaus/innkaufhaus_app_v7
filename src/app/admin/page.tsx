"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

  return (
    <main className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
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

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Executable Settings</h3>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exec-params">Default Parameters</Label>
              <Input
                id="exec-params"
                value={settings.executable.defaultParams}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    executable: { ...settings.executable, defaultParams: e.target.value }
                  })
                }
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">Save Settings</Button>

          {message && (
            <Alert variant={message.type === "success" ? "default" : "destructive"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
