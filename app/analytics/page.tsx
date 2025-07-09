"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useState } from "react"

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="ml-64">
        <Header title="Análises Financeiras" setSidebarOpen={setSidebarOpen} />

        {/* Manter todo o resto do conteúdo main existente */}
        <main className="p-4">
          <h1 className="text-2xl font-semibold">Visão Geral das Análises</h1>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white shadow-md rounded-md p-4">
              <h2 className="text-lg font-semibold">Receita Total</h2>
              <p className="text-gray-600">R$ 1.250.000,00</p>
            </div>
            <div className="bg-white shadow-md rounded-md p-4">
              <h2 className="text-lg font-semibold">Despesas Totais</h2>
              <p className="text-gray-600">R$ 800.000,00</p>
            </div>
            <div className="bg-white shadow-md rounded-md p-4">
              <h2 className="text-lg font-semibold">Lucro Líquido</h2>
              <p className="text-gray-600">R$ 450.000,00</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">Gráfico de Receitas e Despesas</h2>
            {/* Adicionar gráfico aqui */}
            <p className="text-gray-500">Gráfico mostrando a evolução das receitas e despesas ao longo do tempo.</p>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">Relatório Detalhado</h2>
            <p className="text-gray-500">
              Informações detalhadas sobre as receitas, despesas e outras métricas financeiras.
            </p>
            {/* Adicionar tabela ou relatório detalhado aqui */}
          </div>
        </main>
      </div>
    </div>
  )
}
