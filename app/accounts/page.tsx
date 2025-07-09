"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Plus, Edit, Trash2, CreditCard, Building2, Wallet, DollarSign, TrendingUp, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface BankAccount {
  id: string
  name: string
  bank: string
  type: "checking" | "savings" | "credit" | "investment"
  balance: number
  createdAt: string
}

// Adiciona interface Transaction
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

export default function AccountsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    bank: "",
    type: "",
    balance: "",
  })

  const router = useRouter()
  const { toast } = useToast()

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
  }, [router])

  const accountTypes = [
    { value: "checking", label: "Conta Corrente", icon: Building2 },
    { value: "savings", label: "Poupança", icon: Wallet },
    { value: "credit", label: "Cartão de Crédito", icon: CreditCard },
    { value: "investment", label: "Investimentos", icon: TrendingUp },
  ]

  const banks = [
    "Banco do Brasil",
    "Bradesco",
    "Caixa Econômica Federal",
    "Itaú",
    "Santander",
    "Nubank",
    "Inter",
    "C6 Bank",
    "BTG Pactual",
    "Sicoob",
    "Sicredi",
    "Outros",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    console.log('formData:', formData)
    const balance = Number(formData.balance.replace(",", "."))
    console.log('balance:', balance)
    const email = localStorage.getItem("userEmail") || ""
    const payload = {
      name: formData.name,
      bank: formData.bank,
      type: formData.type,
      balance: balance,
    }
    console.log('payload enviado para API:', payload)
    let res: Response, data: any
    if (editingAccount) {
      // Atualizar conta existente
      res = await fetch(`/api/accounts/${editingAccount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-email": email },
        body: JSON.stringify(payload),
      })
      data = await res.json()
      console.log('resposta da API (PUT):', data)
      if (res.ok) {
        setAccounts((prev) => prev.map((a) => (a.id === editingAccount.id ? data.account : a)))
        toast({
          title: "Conta atualizada!",
          description: "A conta foi atualizada com sucesso.",
        })
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao atualizar conta.",
          variant: "destructive",
        })
      }
    } else {
      // Criar nova conta
      res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-email": email },
        body: JSON.stringify(payload),
      })
      data = await res.json()
      console.log('resposta da API (POST):', data)
      if (res.ok) {
        setAccounts((prev) => [data.account, ...prev])
        toast({
          title: "Conta adicionada!",
          description: "A conta foi adicionada com sucesso.",
        })
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao adicionar conta.",
          variant: "destructive",
        })
      }
    }
    setFormData({
      name: "",
      bank: "",
      type: "",
      balance: "",
    })
    setShowAddForm(false)
    setEditingAccount(null)
    setIsLoading(false)
  }

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      bank: account.bank,
      type: account.type,
      balance: account.balance.toString(),
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    const email = localStorage.getItem("userEmail") || ""
    const res = await fetch(`/api/accounts/${id}`, {
      method: "DELETE",
      headers: { "x-user-email": email },
    })
    const data = await res.json()
    if (res.ok) {
      setAccounts((prev) => prev.filter((a) => a.id !== id))
      toast({
        title: "Conta excluída!",
        description: "A conta foi removida com sucesso.",
      })
    } else {
      toast({
        title: "Erro",
        description: data.error || "Erro ao excluir conta.",
        variant: "destructive",
      })
    }
    setShowDeleteModal(false)
    setAccountToDelete(null)
  }

  // Corrigir cálculo do saldo total: sempre soma todos os saldos
  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0)
  }

  // Saldo total das contas apenas do mês atual
  const getTotalAccountsBalanceCurrentMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    // Filtra transações do mês atual
    const monthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= startOfMonth && date <= endOfMonth;
    });
    // Soma receitas e subtrai despesas do mês
    const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    return income - expenses;
  };

  // Saldo do mês atual para uma conta específica
  const getAccountBalanceCurrentMonth = (accountName: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return t.account === accountName && date >= startOfMonth && date <= endOfMonth;
    });
    const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    return income - expenses;
  };

  // Retorna receitas, despesas e saldo do mês atual para uma conta
  const getAccountMonthSummary = (accountName: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return t.account === accountName && date >= startOfMonth && date <= endOfMonth;
    });
    const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  };

  const getAccountTypeIcon = (type: string) => {
    const accountType = accountTypes.find((t) => t.value === type)
    return accountType ? accountType.icon : Wallet
  }

  const getAccountTypeLabel = (type: string) => {
    const accountType = accountTypes.find((t) => t.value === type)
    return accountType ? accountType.label : type
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="ml-64">
        <Header title="Contas Bancárias" setSidebarOpen={setSidebarOpen}>
          <Button onClick={() => setShowAddForm(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nova Conta</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </Header>

        {/* Main content */}
        <main className="p-4 sm:p-6">
          {/* Loading spinner enquanto carrega as contas */}
          {isLoadingAccounts || isLoadingTransactions ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-card text-card-foreground border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary">Saldo Total</p>
                        <p className="text-3xl font-bold text-primary">
                          {isLoadingAccounts || isLoadingTransactions ? (
                            <span className="text-base text-muted-foreground">Carregando...</span>
                          ) : (
                            <>R$ {getTotalAccountsBalanceCurrentMonth().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</>
                          )}
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
                        <p className="text-sm font-medium">Contas Ativas</p>
                        <p className="text-3xl font-bold">{accounts.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-green-600 dark:text-green-200" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-700 text-purple-900 dark:text-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Bancos</p>
                        <p className="text-3xl font-bold">{new Set(accounts.map((a) => a.bank)).size}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-200" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Add account form */}
              {showAddForm && (
                <Card className="mb-6 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900">
                      {editingAccount ? "Editar Conta" : "Nova Conta Bancária"}
                    </CardTitle>
                    <CardDescription>
                      {editingAccount
                        ? "Edite os dados da sua conta bancária"
                        : "Adicione uma nova conta bancária para melhor controle"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome da Conta *</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Ex: Conta Corrente Principal"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bank">Banco *</Label>
                          <Select
                            value={formData.bank}
                            onValueChange={(value) => setFormData({ ...formData, bank: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o banco" />
                            </SelectTrigger>
                            <SelectContent>
                              {banks.map((bank) => (
                                <SelectItem key={bank} value={bank}>
                                  {bank}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type">Tipo de Conta *</Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {accountTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowAddForm(false)
                            setEditingAccount(null)
                            setFormData({
                              name: "",
                              bank: "",
                              type: "",
                              balance: "",
                            })
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingAccount ? "Salvar alterações" : "Adicionar conta")}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Accounts list */}
              {accounts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma conta cadastrada</h3>
                    <p className="text-gray-500 mb-6">
                      Adicione suas contas bancárias para ter um controle completo das suas finanças
                    </p>
                    <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeira Conta
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {accounts.map((account) => {
                    const IconComponent = getAccountTypeIcon(account.type)
                    return (
                      <Card key={account.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <IconComponent className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg text-blue-900">{account.name}</CardTitle>
                                <CardDescription>{account.bank}</CardDescription>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setAccountToDelete(account)
                                  setShowDeleteModal(true)
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Tipo:</span>
                            <Badge variant="secondary">{getAccountTypeLabel(account.type)}</Badge>
                          </div>
                          <div className="text-xs text-gray-500 pt-2 border-t">
                            Adicionada em {new Date(account.createdAt).toLocaleDateString("pt-BR")}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md w-full text-center">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja excluir a conta <b>{accountToDelete?.name}</b>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => accountToDelete && handleDelete(accountToDelete.id)}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
