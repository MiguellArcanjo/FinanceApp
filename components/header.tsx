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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700 mr-4">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {children}
          <Button variant="ghost" size="sm" onClick={() => router.push("/notifications")}>
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push("/profile")}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
          </Button>
        </div>
      </div>
    </header>
  )
}
