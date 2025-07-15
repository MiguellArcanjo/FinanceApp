"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function Notifications() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="lg:ml-64">
        <Header title="Notificações" setSidebarOpen={setSidebarOpen} />

        <main className="p-4">
          <h1 className="text-2xl font-semibold mb-4">Notificações</h1>
          <div className="bg-white shadow rounded-md p-4">
            <p>Aqui estão suas notificações.</p>
          </div>
        </main>
      </div>
    </div>
  )
}
