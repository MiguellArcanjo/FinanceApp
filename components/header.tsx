"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, Bell } from "lucide-react"

interface HeaderProps {
  title: string
  setSidebarOpen: (open: boolean) => void
  children?: React.ReactNode
}

export function Header({ title, setSidebarOpen, children }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="bg-card shadow-sm border-b border-border w-full">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-primary mr-4">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-card-foreground">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {children}
          <Button variant="ghost" size="sm" onClick={() => router.push("/notifications")}>
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push("/profile")}>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">U</span>
            </div>
          </Button>
        </div>
      </div>
    </header>
  )
}
