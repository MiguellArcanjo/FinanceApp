"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Target, Plus } from "lucide-react"

interface Transaction {
  id: string
  type: "income" | "expense"
  description: string
  amount: number
  date: string
  category: string
  account: string
}

interface Goal {
  id: string
  name: string
  deadline: string
}

export default function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Carregar transações e metas
    const savedTransactions = localStorage.getItem("transactions")
    const savedGoals = localStorage.getItem("goals")

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }
  }, [router])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Adicionar dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Adicionar dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day)
      days.push({ date: currentDate, isCurrentMonth: true })
    }

    // Adicionar dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({ date: nextDate, isCurrentMonth: false })
    }

    return days
  }

  const getTransactionsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return transactions.filter((t) => t.date === dateString)
  }

  const getGoalsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return goals.filter((g) => g.deadline === dateString)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="ml-64">
        <Header title="Calendário Financeiro" setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="p-4 sm:p-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-900">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                        Hoje
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                      const dayTransactions = getTransactionsForDate(day.date)
                      const dayGoals = getGoalsForDate(day.date)
                      const hasEvents = dayTransactions.length > 0 || dayGoals.length > 0

                      return (
                        <div
                          key={index}
                          className={`min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors ${
                            day.isCurrentMonth
                              ? isToday(day.date)
                                ? "bg-blue-100 border-blue-300"
                                : hasEvents
                                  ? "bg-green-50 border-green-200 hover:bg-green-100"
                                  : "bg-white border-gray-200 hover:bg-gray-50"
                              : "bg-gray-50 border-gray-100 text-gray-400"
                          }`}
                          onClick={() => setSelectedDate(day.date)}
                        >
                          <div className="text-sm font-medium">{day.date.getDate()}</div>
                          <div className="mt-1 space-y-1">
                            {dayTransactions.slice(0, 2).map((transaction) => (
                              <div
                                key={transaction.id}
                                className={`text-xs p-1 rounded truncate ${
                                  transaction.type === "income"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {transaction.description}
                              </div>
                            ))}
                            {dayGoals.slice(0, 1).map((goal) => (
                              <div key={goal.id} className="text-xs p-1 rounded truncate bg-blue-100 text-blue-700">
                                Meta: {goal.name}
                              </div>
                            ))}
                            {dayTransactions.length + dayGoals.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{dayTransactions.length + dayGoals.length - 3} mais
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with details */}
            <div className="space-y-6">
              {/* Selected Date Details */}
              {selectedDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-900">
                      {selectedDate.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {getTransactionsForDate(selectedDate).map((transaction) => (
                      <div key={transaction.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-gray-500">{transaction.category}</p>
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}R${" "}
                          {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}

                    {getGoalsForDate(selectedDate).map((goal) => (
                      <div key={goal.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-blue-50">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100">
                          <Target className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Meta: {goal.name}</p>
                          <p className="text-xs text-gray-500">Prazo final</p>
                        </div>
                      </div>
                    ))}

                    {getTransactionsForDate(selectedDate).length === 0 &&
                      getGoalsForDate(selectedDate).length === 0 && (
                        <p className="text-gray-500 text-center py-4">Nenhum evento nesta data</p>
                      )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-900">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push("/transactions")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Transação
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => router.push("/goals")}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Nova Meta
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-900">Próximos Eventos</CardTitle>
                  <CardDescription>Metas com prazo próximo</CardDescription>
                </CardHeader>
                <CardContent>
                  {goals
                    .filter((goal) => new Date(goal.deadline) > new Date())
                    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                    .slice(0, 3)
                    .map((goal) => (
                      <div key={goal.id} className="flex items-center space-x-3 p-2 border-b last:border-b-0">
                        <Target className="w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{goal.name}</p>
                          <p className="text-xs text-gray-500">{new Date(goal.deadline).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                    ))}
                  {goals.filter((goal) => new Date(goal.deadline) > new Date()).length === 0 && (
                    <p className="text-gray-500 text-sm">Nenhuma meta próxima</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
