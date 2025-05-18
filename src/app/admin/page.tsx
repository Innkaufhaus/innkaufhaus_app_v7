"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface AdminSettings {
  database: {
    host: string
    port: string
    user: string
    password: string
  }
  executable: {
    path: string
    defaultParams: string
  }
}

export default function AdminPage() {
  const [settings, setSettings] = useState<AdminSettings>({
    database: {
      host: '',
      port: '',
      user: '',
      password: ''
    },
    executable: {
      path: '',
      defaultParams: ''
    }
  })
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin-settings')
      const data = await response.json()
      if (data.success) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/admin-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })
      const data = await response.json()
      setStatus({
        success: data.success,
        message: data.success ? 'Settings saved successfully' : data.error
      })
    } catch (error) {
      setStatus({
        success: false,
        message: 'Failed to save settings'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveSettings} className="space-y-6">
            {/* Database Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Database Connection</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    value={settings.database.host}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        database: { ...settings.database, host: e.target.value }
                      })
                    }
                    placeholder="localhost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    value={settings.database.port}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        database: { ...settings.database, port: e.target.value }
                      })
                    }
                    placeholder="1433"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user">Username</Label>
                  <Input
                    id="user"
                    value={settings.database.user}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        database: { ...settings.database, user: e.target.value }
                      })
                    }
                    placeholder="sa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={settings.database.password}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        database: { ...settings.database, password: e.target.value }
                      })
                    }
                    placeholder="********"
                  />
                </div>
              </div>
            </div>

            {/* Executable Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Executable Configuration</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="execPath">Executable Path</Label>
                  <Input
                    id="execPath"
                    value={settings.executable.path}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        executable: { ...settings.executable, path: e.target.value }
                      })
                    }
                    placeholder="C:\path\to\executable.exe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultParams">Default Parameters</Label>
                  <Input
                    id="defaultParams"
                    value={settings.executable.defaultParams}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        executable: { ...settings.executable, defaultParams: e.target.value }
                      })
                    }
                    placeholder="--input {csv} --output results.txt"
                  />
                </div>
              </div>
            </div>

            {status && (
              <div
                className={`p-4 rounded-md ${
                  status.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {status.message}
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
