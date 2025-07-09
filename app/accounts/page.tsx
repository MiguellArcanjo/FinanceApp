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
import { Plus, Edit, Trash2, CreditCard, Building2, Wallet, DollarSign, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BankAccount {
  id: string
  name: string
  bank: string
  type: "checking" | "savings" | "credit" | "investment"
  balance: number
  accountNumber: string
  createdAt: string
}

export default function AccountsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    bank: "",
    type: "",
    balance: "",
    accountNumber: "",
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

    // Carregar contas
    const savedAccounts = localStorage.getItem("bankAccounts")
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts))
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.bank || !formData.type || !formData.accountNumber) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    const balance = Number.parseFloat(formData.balance.replace(/[^\d,]/g, "").replace(",", ".")) || 0

    const newAccount: BankAccount = {
      id: editingAccount?.id || Date.now().toString(),
      name: formData.name,
      bank: formData.bank,
      type: formData.type as BankAccount["type"],
      balance: balance,
      accountNumber: formData.accountNumber,
      createdAt: editingAccount?.createdAt || new Date().toISOString(),
    }

    let updatedAccounts
    if (editingAccount) {
      updatedAccounts = accounts.map((a) => (a.id === editingAccount.id ? newAccount : a))
      toast({
        title: "Conta atualizada!",
        description: "A conta foi atualizada com sucesso.",
      })
    } else {
      updatedAccounts = [...accounts, newAccount]
      toast({
        title: "Conta adicionada!",
        description: "A conta foi adicionada com sucesso.",
      })
    }

    setAccounts(updatedAccounts)
    localStorage.setItem("bankAccounts", JSON.stringify(updatedAccounts))

    // Reset form
    setFormData({
      name: "",
      bank: "",
      type: "",
      balance: "",
      accountNumber: "",
    })
    setShowAddForm(false)
    setEditingAccount(null)
  }

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      bank: account.bank,
      type: account.type,
      balance: account.balance.toString(),
      accountNumber: account.accountNumber,
    })
    setShowAddForm(true)
  }

  const handleDelete = (id: string) => {
    const updatedAccounts = accounts.filter((a) => a.id !== id)
    setAccounts(updatedAccounts)
    localStorage.setItem("bankAccounts", JSON.stringify(updatedAccounts))
    toast({
      title: "Conta excluída!",
      description: "A conta foi removida com sucesso.",
    })
  }

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => {
      if (account.type === "credit") {
        return total - account.balance // Cartão de crédito é dívida
      }
      return total + account.balance
    }, 0)
  }

  const getAccountTypeIcon = (type: string) => {
    const accountType = accountTypes.find((t) => t.value === type)
    return accountType ? accountType.icon : Wallet
  }

  const getAccountTypeLabel = (type: string) => {
    const accountType = accountTypes.find((t) => t.value === type)
    return accountType ? accountType.label : type
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="ml-64">
        <Header title="Contas Bancárias" setSidebarOpen={setSidebarOpen}>
          <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nova Conta</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </Header>

        {/* Main content */}
        <main className="p-4 sm:p-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Saldo Total</p>
                    <p className="text-3xl font-bold text-blue-700">
                      R$ {getTotalBalance().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Contas Ativas</p>
                    <p className="text-3xl font-bold text-green-700">{accounts.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Bancos</p>
                    <p className="text-3xl font-bold text-purple-700">{new Set(accounts.map((a) => a.bank)).size}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-600" />
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

                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Número da Conta *</Label>
                      <Input
                        id="accountNumber"
                        type="text"
                        placeholder="Ex: 12345-6"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="balance">Saldo Atual</Label>
                      <Input
                        id="balance"
                        type="text"
                        placeholder="0,00"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                      />
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
                          accountNumber: "",
                        })
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingAccount ? "Atualizar" : "Adicionar"} Conta
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
                            onClick={() => handleDelete(account.id)}
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

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Conta:</span>
                        <span className="text-sm font-mono">{account.accountNumber}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Saldo:</span>
                        <span
                          className={`text-lg font-bold ${
                            account.type === "credit"
                              ? account.balance > 0
                                ? "text-red-600"
                                : "text-green-600"
                              : account.balance >= 0
                                ? "text-green-600"
                                : "text-red-600"
                          }`}
                        >
                          {account.type === "credit" && account.balance > 0 ? "-" : ""}R${" "}
                          {Math.abs(account.balance).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
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
        </main>
      </div>
    </div>
  )
}
