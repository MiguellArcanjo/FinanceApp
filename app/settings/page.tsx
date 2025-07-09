"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useState } from "react"

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="ml-64">
        <Header title="Configurações" setSidebarOpen={setSidebarOpen} />

        {/* Page content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            {/* Your content */}
          </div>
        </main>
      </div>
    </div>
  )
}
