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
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from 'react-i18next';

interface Transaction {
  id: string
  type: "income" | "expense"
  description: string
  amount: number
  date: string
  category: string
  account: string
  createdAt: string
}

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
}

interface BankAccount {
  id: string
  name: string
  bank: string
  type: string
  balance: number
  createdAt: string
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [userName, setUserName] = useState("")
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation();

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Buscar contas do backend
    const fetchAccounts = async () => {
      setIsLoadingAccounts(true)
      const email = localStorage.getItem("userEmail") || ""
      const res = await fetch("/api/accounts", {
        headers: { "x-user-email": email },
      })
      const data = await res.json()
      if (res.ok) setAccounts(data.accounts)
      setIsLoadingAccounts(false)
    }
    fetchAccounts()

    // Buscar transações do backend
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

    // Buscar metas do backend (API)
    const fetchGoals = async () => {
      const email = localStorage.getItem("userEmail") || ""
      const res = await fetch("/api/goals", {
        headers: { "x-user-email": email },
      })
      const data = await res.json()
      if (res.ok) setGoals(data.goals)
    }
    fetchGoals()

    // Carregar nome do usuário
    const savedUserName = localStorage.getItem("userName") || "Usuário"
    setUserName(savedUserName)
  }, [router])

  // Cálculo bruto do mês atual (corrigido para pegar apenas o mês corrente)
  const getCurrentMonthTotals = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= startOfMonth && date <= endOfMonth;
    });
    const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  };

  const { income, expenses, balance } = getCurrentMonthTotals();

  // Função utilitária para pegar transações do mês atual
  const getCurrentMonthTransactions = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= startOfMonth && date <= endOfMonth;
    });
  };

  const currentMonthTransactions = getCurrentMonthTransactions();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="ml-64">
        <Header title={t('dashboard.title')} setSidebarOpen={setSidebarOpen} />

        {/* Dashboard content */}
        <main className="p-4 sm:p-6 space-y-6">
          {/* Welcome section */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">{t('dashboard.welcome', { userName })}</h2>
            <p className="text-muted-foreground">{t('dashboard.summary')}</p>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="border-primary/20 bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">{t('dashboard.balance_month')}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">
                      {isLoadingAccounts ? (
                        <span className="text-base text-muted-foreground">{t('dashboard.loading')}</span>
                      ) : (
                        <>R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</>
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">{t('dashboard.income')}</p>
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

            <Card className="border-red-200 bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">{t('dashboard.expense')}</p>
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

            <Card className="border-purple-200 bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">{t('dashboard.goals')}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-700">{goals.filter(g => g.currentAmount < g.targetAmount).length}</p>
                    <p className="text-xs text-purple-600">{t('dashboard.active')}</p>
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
            <Card className="lg:col-span-2 bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="text-primary">{t('dashboard.transactions')}</CardTitle>
                <CardDescription>
                  {currentMonthTransactions.length === 0
                    ? t('dashboard.no_data')
                    : t('dashboard.last_movements')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTransactions ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : currentMonthTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">{t('dashboard.no_data')}</p>
                    <Button onClick={() => router.push("/transactions")} className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('dashboard.add_first_transaction')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentMonthTransactions
                      .slice()
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 4)
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
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
                              <p className="font-medium text-card-foreground">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
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
                        className="w-full bg-transparent border-border text-primary"
                        onClick={() => router.push("/transactions")}
                      >
                        {t('dashboard.view_all_transactions')}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goals progress */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="text-primary">{t('dashboard.financial_goals')}</CardTitle>
                <CardDescription>
                  {goals.length === 0 ? t('dashboard.no_data') : t('dashboard.goal_progress')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {goals.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">{t('dashboard.no_data')}</p>
                    <Button onClick={() => router.push("/goals")} className="bg-primary hover:bg-primary/90">
                      <Target className="w-4 h-4 mr-2" />
                      {t('dashboard.create_first_goal')}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6 max-h-64 overflow-y-auto">
                      {goals.map((goal) => {
                        const progress = (goal.currentAmount / goal.targetAmount) * 100
                        return (
                          <div key={goal.id}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-card-foreground">{goal.name}</span>
                              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>R$ {goal.currentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                              <span>R$ {goal.targetAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="pt-4 mt-8">
                      <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => router.push("/goals")}> 
                        <Target className="w-4 h-4 mr-2" />
                        {t('dashboard.manage_goals')}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-primary">{t('dashboard.quick_actions')}</CardTitle>
              <CardDescription className="text-muted-foreground">{t('dashboard.quick_access_features')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col space-y-2 bg-transparent border-border text-green-600"
                  onClick={() => router.push("/transactions?type=income")}
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  <span className="text-xs sm:text-sm">{t('dashboard.new_income')}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col space-y-2 bg-transparent border-border text-red-600"
                  onClick={() => router.push("/transactions?type=expense")}
                >
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  <span className="text-xs sm:text-sm">{t('dashboard.new_expense')}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col space-y-2 bg-transparent border-border text-primary"
                  onClick={() => router.push("/goals")}
                >
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  <span className="text-xs sm:text-sm">{t('dashboard.new_goal')}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col space-y-2 bg-transparent border-border text-purple-600"
                  onClick={() => router.push("/analytics")}
                >
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  <span className="text-xs sm:text-sm">{t('dashboard.reports')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
