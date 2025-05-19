"use client"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SQL Query Explorer",
  description: "A web application to execute SQL queries and import Amazon articles",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
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
              </div>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  )
}
