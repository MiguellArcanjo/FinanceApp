"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Menu,
  X,
  BarChart3,
  Wallet,
  Target,
  PieChart,
  Calendar,
  Settings,
  LogOut,
  Plus,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Loader2,
} from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useTranslation } from 'react-i18next';
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

interface CategoryAnalysis {
  category: string
  amount: number
  count: number
  percentage: number
}

export default function AnalyticsPage() {
  const { setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [period, setPeriod] = useState("all")
  const [analysisType, setAnalysisType] = useState("overview")
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const router = useRouter()
  const { t } = useTranslation();

  useEffect(() => {
    // Restaurar tema salvo
    const userTheme = localStorage.getItem("themeBackup") || "light";
    setTheme(userTheme);
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.replace("/login")
      return
    }
    // Buscar transações da API
    const fetchTransactions = async () => {
      setIsLoadingTransactions(true)
      const email = localStorage.getItem("userEmail") || ""
      const res = await fetch("/api/transactions", {
        headers: { "x-user-email": email },
      })
      const data = await res.json()
      if (res.ok) setTransactions(data.transactions)
      setIsLoadingTransactions(false)
    }
    fetchTransactions()
  }, [router, setTheme])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    router.replace("/login")
  }

  // Filtrar transações por período
  const getFilteredTransactions = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      switch (period) {
        case "month":
          return transactionDate >= startOfMonth
        case "year":
          return transactionDate >= startOfYear
        case "30days":
          return transactionDate >= last30Days
        default:
          return true
      }
    })
  }

  const filteredTransactions = getFilteredTransactions()

  // Calcular totais
  const calculateTotals = () => {
    const income = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    return { income, expenses, balance: income - expenses }
  }

  // Análise por categoria
  const getCategoryAnalysis = (type: "income" | "expense"): CategoryAnalysis[] => {
    const categoryTotals = filteredTransactions
      .filter((t) => t.type === type)
      .reduce(
        (acc, transaction) => {
          if (!acc[transaction.category]) {
            acc[transaction.category] = { amount: 0, count: 0 }
          }
          acc[transaction.category].amount += transaction.amount
          acc[transaction.category].count += 1
          return acc
        },
        {} as Record<string, { amount: number; count: number }>,
      )

    const total = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)

    return Object.entries(categoryTotals)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  // Análise mensal
  const getMonthlyAnalysis = () => {
    const monthlyData = filteredTransactions.reduce(
      (acc, transaction) => {
        const month = new Date(transaction.date).toLocaleDateString("pt-BR", {
          year: "numeric",
          month: "short",
        })
        if (!acc[month]) {
          acc[month] = { income: 0, expenses: 0 }
        }
        if (transaction.type === "income") {
          acc[month].income += transaction.amount
        } else {
          acc[month].expenses += transaction.amount
        }
        return acc
      },
      {} as Record<string, { income: number; expenses: number }>,
    )

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  }

  const { income, expenses, balance } = calculateTotals()
  const incomeCategories = getCategoryAnalysis("income")
  const expenseCategories = getCategoryAnalysis("expense")
  const monthlyData = getMonthlyAnalysis()

  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
    { icon: Plus, label: "Lançamentos", href: "/transactions" },
    { icon: Wallet, label: "Contas", href: "/accounts" },
    { icon: Target, label: "Metas", href: "/goals" },
    { icon: PieChart, label: "Relatórios", href: "/analytics", active: true },
    { icon: Calendar, label: "Calendário", href: "/dashboard" },
    { icon: Settings, label: "Configurações", href: "/dashboard" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="lg:ml-64">
        <Header title={t('relatorios_analises')} setSidebarOpen={setSidebarOpen} />
        {/* Main content */}
        <main className="p-4 sm:p-6 space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full sm:w-48 bg-card text-card-foreground border-border">
                <SelectValue placeholder={t('periodo')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('todos_periodos')}</SelectItem>
                <SelectItem value="30days">{t('ultimos_30_dias')}</SelectItem>
                <SelectItem value="month">{t('este_mes')}</SelectItem>
                <SelectItem value="year">{t('este_ano')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger className="w-full sm:w-48 bg-card text-card-foreground border-border">
                <SelectValue placeholder={t('tipo_analise')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">{t('visao_geral')}</SelectItem>
                <SelectItem value="categories">{t('por_categoria')}</SelectItem>
                <SelectItem value="monthly">{t('analise_mensal')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isLoadingTransactions ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card text-card-foreground border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary">{t('saldo')}</p>
                        <p className="text-2xl font-bold text-primary">
                          R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-700 text-green-900 dark:text-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t('receitas')}</p>
                        <p className="text-2xl font-bold">R$ {income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <ArrowUpRight className="w-6 h-6 text-green-600 dark:text-green-200" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-700 text-red-900 dark:text-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t('despesas')}</p>
                        <p className="text-2xl font-bold">R$ {expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                        <ArrowDownRight className="w-6 h-6 text-red-600 dark:text-red-200" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-700 text-purple-900 dark:text-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t('transacoes')}</p>
                        <p className="text-2xl font-bold">{filteredTransactions.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-200" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Analysis Content */}
              {analysisType === "overview" && (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Income vs Expenses */}
                  <Card className="bg-card text-card-foreground">
                    <CardHeader>
                      <CardTitle className="text-primary">{t('receitas_vs_despesas')}</CardTitle>
                      <CardDescription className="text-muted-foreground">{t('comparacao_receitas_despesas_periodo')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-green-600 dark:text-green-200">{t('receitas')}</span>
                            <span className="text-sm font-semibold text-green-600 dark:text-green-200">R$ {income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <Progress value={income > 0 ? 100 : 0} className="h-3 bg-green-100 dark:bg-green-900/20" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-red-600 dark:text-red-200">{t('despesas')}</span>
                            <span className="text-sm font-semibold text-red-600 dark:text-red-200">R$ {expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <Progress value={income > 0 ? (expenses / income) * 100 : 0} className="h-3 bg-red-100 dark:bg-red-900/20" />
                        </div>
                        <div className="pt-4 border-t border-border">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{t('resultado')}:</span>
                            <span className={`font-bold ${balance >= 0 ? "text-green-600 dark:text-green-200" : "text-red-600 dark:text-red-200"}`}>
                              R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Top Categories */}
                  <Card className="bg-card text-card-foreground">
                    <CardHeader>
                      <CardTitle className="text-primary">{t('principais_categorias_despesa')}</CardTitle>
                      <CardDescription className="text-muted-foreground">{t('categorias_mais_consumem_orcamento')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {expenseCategories.slice(0, 5).map((category) => (
                          <div key={category.category} className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{category.category}</span>
                                <span className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</span>
                              </div>
                              <Progress value={category.percentage} className="h-2" />
                            </div>
                            <div className="ml-4 text-right">
                              <p className="text-sm font-semibold text-red-600 dark:text-red-200">R$ {category.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                              <p className="text-xs text-muted-foreground">{category.count} {t('transacoes')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {analysisType === "categories" && (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Income Categories */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-700">{t('receitas_por_categoria')}</CardTitle>
                      <CardDescription>{t('analise_detalhada_fontes_receita')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {incomeCategories.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">{t('nenhuma_receita_encontrada_periodo')}</p>
                        ) : (
                          incomeCategories.map((category) => (
                            <div key={category.category} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">{category.category}</h4>
                                <Badge variant="secondary">{category.percentage.toFixed(1)}%</Badge>
                              </div>
                              <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>R$ {category.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                <span>{category.count} {t('transacoes')}</span>
                              </div>
                              <Progress value={category.percentage} className="h-2 mt-2" />
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Expense Categories */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-700">{t('despesas_por_categoria')}</CardTitle>
                      <CardDescription>{t('analise_detalhada_gastos')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {expenseCategories.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">{t('nenhuma_despesa_encontrada_periodo')}</p>
                        ) : (
                          expenseCategories.map((category) => (
                            <div key={category.category} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">{category.category}</h4>
                                <Badge variant="secondary">{category.percentage.toFixed(1)}%</Badge>
                              </div>
                              <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>R$ {category.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                <span>{category.count} {t('transacoes')}</span>
                              </div>
                              <Progress value={category.percentage} className="h-2 mt-2" />
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {analysisType === "monthly" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-900">{t('analise_mensal')}</CardTitle>
                    <CardDescription>{t('evolucao_financas_tempo')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {monthlyData.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">{t('nenhum_dado_mensal_disponivel')}</p>
                    ) : (
                      <div className="space-y-6">
                        {monthlyData.map((month) => (
                          <div key={month.month} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-semibold text-lg">{month.month}</h4>
                              <Badge
                                variant={month.balance >= 0 ? "default" : "destructive"}
                                className={month.balance >= 0 ? "bg-green-100 text-green-800" : ""}
                              >
                                {month.balance >= 0 ? t('positivo') : t('negativo')}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-600 font-medium">{t('receitas')}</p>
                                <p className="text-lg font-bold text-green-700">
                                  R$ {month.income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-red-50 rounded-lg">
                                <p className="text-sm text-red-600 font-medium">{t('despesas')}</p>
                                <p className="text-lg font-bold text-red-700">
                                  R$ {month.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-600 font-medium">{t('saldo')}</p>
                                <p
                                  className={`text-lg font-bold ${month.balance >= 0 ? "text-green-700" : "text-red-700"}`}
                                >
                                  R$ {month.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* No data message */}
              {filteredTransactions.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('nenhuma_transacao_encontrada')}</h3>
                    <p className="text-gray-500 mb-6">
                      {t('nao_ha_transacoes')}
                    </p>
                    <Button onClick={() => router.replace("/transactions")} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('adicionar_transacoes')}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
