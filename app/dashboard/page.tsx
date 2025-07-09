"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart3,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  targetAmount: number
  currentAmount: number
  deadline: string
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [userName, setUserName] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Carregar dados do localStorage
    const savedTransactions = localStorage.getItem("transactions")
    const savedGoals = localStorage.getItem("goals")
    const savedUserName = localStorage.getItem("userName") || "Usuário"

    setUserName(savedUserName)

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }
  }, [router])

  const calculateTotals = () => {
    const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    return { income, expenses, balance: income - expenses }
  }

  const { income, expenses, balance } = calculateTotals()

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="ml-64">
        <Header title="Dashboard" setSidebarOpen={setSidebarOpen} />

        {/* Dashboard content */}
        <main className="p-4 sm:p-6 space-y-6">
          {/* Welcome section */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta, {userName}!</h2>
            <p className="text-gray-600">Aqui está um resumo das suas finanças.</p>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Saldo Total</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-700">
                      R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Receitas</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-700">
                      R$ {income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Despesas</p>
                    <p className="text-2xl sm:text-3xl font-bold text-red-700">
                      R$ {expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Metas</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-700">{goals.length}</p>
                    <p className="text-xs text-purple-600">Ativas</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent transactions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-blue-900">Transações Recentes</CardTitle>
                <CardDescription>
                  {transactions.length === 0
                    ? "Nenhuma transação encontrada"
                    : "Suas últimas movimentações financeiras"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Você ainda não possui transações</p>
                    <Button onClick={() => router.push("/transactions")} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeira Transação
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions
                      .slice(-5)
                      .reverse()
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                              }`}
                            >
                              {transaction.type === "income" ? (
                                <ArrowUpRight className="w-5 h-5 text-green-600" />
                              ) : (
                                <ArrowDownRight className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{transaction.description}</p>
                              <p className="text-sm text-gray-500">
                                {transaction.category} • {new Date(transaction.date).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`font-semibold ${
                              transaction.type === "income" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}R${" "}
                            {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      ))}
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => router.push("/transactions")}
                      >
                        Ver todas as transações
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goals progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">Metas Financeiras</CardTitle>
                <CardDescription>
                  {goals.length === 0 ? "Nenhuma meta definida" : "Progresso das suas metas"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {goals.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Você ainda não possui metas</p>
                    <Button onClick={() => router.push("/goals")} className="bg-blue-600 hover:bg-blue-700">
                      <Target className="w-4 h-4 mr-2" />
                      Criar Primeira Meta
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {goals.slice(0, 3).map((goal) => {
                      const progress = (goal.currentAmount / goal.targetAmount) * 100
                      return (
                        <div key={goal.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">{goal.name}</span>
                            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>R$ {goal.currentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            <span>R$ {goal.targetAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      )
                    })}
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/goals")}>
                      <Target className="w-4 h-4 mr-2" />
                      Gerenciar Metas
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Ações Rápidas</CardTitle>
              <CardDescription>Acesse rapidamente as funcionalidades mais usadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col space-y-2 bg-transparent"
                  onClick={() => router.push("/transactions?type=income")}
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  <span className="text-xs sm:text-sm">Nova Receita</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col space-y-2 bg-transparent"
                  onClick={() => router.push("/transactions?type=expense")}
                >
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  <span className="text-xs sm:text-sm">Nova Despesa</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col space-y-2 bg-transparent"
                  onClick={() => router.push("/goals")}
                >
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  <span className="text-xs sm:text-sm">Nova Meta</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col space-y-2 bg-transparent"
                  onClick={() => router.push("/analytics")}
                >
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  <span className="text-xs sm:text-sm">Relatórios</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
