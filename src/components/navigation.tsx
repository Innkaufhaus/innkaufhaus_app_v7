"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "SQL Query" },
    { href: "/amazon-import", label: "Amazon Import" },
    { href: "/logs", label: "Logs" },
    { href: "/admin", label: "Admin" }
  ]

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center space-x-4">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === href
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
