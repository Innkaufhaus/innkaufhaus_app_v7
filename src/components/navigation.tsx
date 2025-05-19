"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const router = useRouter()

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold">SQL Query Explorer</h1>
        <div className="flex space-x-4">
          <Button variant="ghost" onClick={() => router.push("/")}>
            SQL Query
          </Button>
          <Button variant="ghost" onClick={() => router.push("/amazon-import")}>
            Amazon Import
          </Button>
          <Button variant="ghost" onClick={() => router.push("/admin")}>
            Admin Settings
          </Button>
          <Button variant="ghost" onClick={() => router.push("/logs")}>
            Console Logs
          </Button>
        </div>
      </div>
    </nav>
  )
}
