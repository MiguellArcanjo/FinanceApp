"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Target, Plus } from "lucide-react"
import { useTheme } from "next-themes";

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
  const { t } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const router = useRouter()
  const { setTheme } = useTheme();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Restaurar tema salvo
    const userTheme = localStorage.getItem("themeBackup") || "light";
    setTheme(userTheme);

    // Buscar transações da API
    const fetchTransactions = async () => {
      const email = localStorage.getItem("userEmail")
      if (!email) return;
      try {
        const res = await fetch("/api/transactions", {
          headers: { "x-user-email": email }
        })
        const data = await res.json()
        setTransactions(data.transactions || [])
      } catch (err) {
        setTransactions([])
      }
    }

    fetchTransactions()

    // Buscar metas do localStorage (ou API se preferir)
    const savedGoals = localStorage.getItem("goals")
    if (savedGoals) setGoals(JSON.parse(savedGoals))
  }, [router, setTheme])

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
    return transactions.filter((t) => {
      const tDate = typeof t.date === "string" ? t.date.split("T")[0] : ""
      return tDate === dateString
    })
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
  const monthNames = t("meses", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* Main content */}
      <div className="lg:ml-64">
        <Header title={t("calendario_financeiro")} setSidebarOpen={setSidebarOpen} />
        {/* Main content */}
        <main className="p-4 sm:p-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-3">
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-primary">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}> <ChevronLeft className="w-4 h-4" /> </Button>
                      <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>{t("hoje")}</Button>
                      <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}> <ChevronRight className="w-4 h-4" /> </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {(t("dias_semana", { returnObjects: true }) as string[]).map((day: string) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">{day}</div>
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
                                ? "bg-primary/10 border-primary"
                                : hasEvents
                                  ? "bg-green-100 dark:bg-green-900/10 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/20"
                                  : "bg-card border-border hover:bg-accent"
                              : "bg-muted border-border text-muted-foreground"
                          }`}
                          onClick={() => setSelectedDate(day.date)}
                        >
                          <div className="text-sm font-medium">{day.date.getDate()}</div>
                          <div className="mt-1 space-y-1">
                            {dayTransactions.slice(0, 4).map((transaction) => (
                              <div
                                key={transaction.id}
                                className={`text-xs p-1 rounded truncate flex items-center gap-1 ${
                                  transaction.type === "income"
                                    ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-200"
                                    : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-200"
                                }`}
                                title={transaction.description}
                              >
                                <span className="truncate max-w-[70px]">{transaction.description}</span>
                                <span className="font-bold">
                                  {transaction.type === "income" ? "+" : "-"}R${" "}
                                  {Number(transaction.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            ))}
                            {dayGoals.slice(0, 1).map((goal) => (
                              <div key={goal.id} className="text-xs p-1 rounded truncate bg-primary/10 text-primary">
                                {t("meta_label")} {goal.name}
                              </div>
                            ))}
                            {dayTransactions.length + dayGoals.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                {t("mais_eventos", { count: dayTransactions.length + dayGoals.length - 3 })}
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
                <Card className="bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle className="text-primary">
                      {selectedDate.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-80 overflow-y-auto">
                    {getTransactionsForDate(selectedDate).map((transaction) => (
                      <div key={transaction.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-card">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            transaction.type === "income"
                              ? "bg-green-100 dark:bg-green-900/20"
                              : "bg-red-100 dark:bg-red-900/20"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-200" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-200" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.category}</p>
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            transaction.type === "income"
                              ? "text-green-600 dark:text-green-200"
                              : "text-red-600 dark:text-red-200"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}R${" "}
                          {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                    {getGoalsForDate(selectedDate).map((goal) => (
                      <div key={goal.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-primary/10">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/20">
                          <Target className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{t("meta_label")} {goal.name}</p>
                          <p className="text-xs text-muted-foreground">{t("calendar.goal_deadline")}</p>
                        </div>
                      </div>
                    ))}
                    {getTransactionsForDate(selectedDate).length === 0 &&
                      getGoalsForDate(selectedDate).length === 0 && (
                        <p className="text-muted-foreground text-center py-4">{t("calendar.no_events_today")}</p>
                      )}
                  </CardContent>
                </Card>
              )}
              {/* Quick Actions */}
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle className="text-primary">{t("calendar.quick_actions")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start bg-primary hover:bg-primary/90"
                    onClick={() => router.push("/transactions")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t("calendar.new_transaction")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => router.push("/goals")}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    {t("calendar.new_goal")}
                  </Button>
                </CardContent>
              </Card>
              {/* Upcoming Events */}
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle className="text-primary">{t("calendar.upcoming_events")}</CardTitle>
                  <CardDescription className="text-muted-foreground">{t("calendar.upcoming_events_description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {goals
                    .filter((goal) => new Date(goal.deadline) > new Date())
                    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                    .slice(0, 3)
                    .map((goal) => (
                      <div key={goal.id} className="flex items-center space-x-3 p-2 border-b last:border-b-0">
                        <Target className="w-4 h-4 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{goal.name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(goal.deadline).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                    ))}
                  {goals.filter((goal) => new Date(goal.deadline) > new Date()).length === 0 && (
                    <p className="text-muted-foreground text-sm">{t("calendar.no_upcoming_goals")}</p>
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
