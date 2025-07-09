"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Plus, Search, ArrowUpRight, ArrowDownRight, Edit, Trash2 } from "lucide-react"

interface Transaction {
  id: string
  type: "income" | "expense"
  description: string
  amount: number
  date: string
  category: string
  account: string
}

export default function TransactionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const [formData, setFormData] = useState({
    type: "",
    category: "",
    amount: "",
    description: "",
    account: "",
    date: new Date().toISOString().split("T")[0],
  })

  const router = useRouter()

  useEffect(() => {
    // Verificar autenticação apenas uma vez
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.replace("/login")
      return
    }

    // Carregar transações apenas uma vez
    try {
      const savedTransactions = localStorage.getItem("transactions")
      if (savedTransactions) {
        const parsed = JSON.parse(savedTransactions)
        setTransactions(parsed)
      }
    } catch (error) {
      console.error("Erro ao carregar transações:", error)
    }
  }, []) // Empty dependency array

  const categories = {
    income: ["Salário", "Freelance", "Investimentos", "Vendas", "Outros"],
    expense: ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Entretenimento", "Compras", "Outros"],
  }

  const accounts = ["Conta Corrente", "Poupança", "Cartão de Crédito", "Cartão de Débito", "Dinheiro"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validação
    if (!formData.type || !formData.category || !formData.amount || !formData.description || !formData.account) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    // Converter valor
    const amount = Number.parseFloat(formData.amount) || 0
    if (amount <= 0) {
      alert("Por favor, insira um valor válido")
      return
    }

    // Criar nova transação
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: formData.type as "income" | "expense",
      description: formData.description,
      amount: amount,
      date: formData.date,
      category: formData.category,
      account: formData.account,
    }

    // Atualizar lista
    const updatedTransactions = [...transactions, newTransaction]
    setTransactions(updatedTransactions)

    // Salvar no localStorage
    try {
      localStorage.setItem("transactions", JSON.stringify(updatedTransactions))
    } catch (error) {
      console.error("Erro ao salvar:", error)
    }

    // Limpar formulário
    setFormData({
      type: "",
      category: "",
      amount: "",
      description: "",
      account: "",
      date: new Date().toISOString().split("T")[0],
    })

    setShowAddForm(false)
    alert("Transação adicionada com sucesso!")
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description,
      account: transaction.account,
      date: transaction.date,
    })
    setShowAddForm(true)
  }

  const handleDelete = (id: string) => {
    const updatedTransactions = transactions.filter((t) => t.id !== id)
    setTransactions(updatedTransactions)
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))
    alert("Transação excluída!")
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory

    return matchesSearch && matchesType && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="ml-64">
        <Header title="Lançamentos" setSidebarOpen={setSidebarOpen}>
          <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Novo Lançamento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </Header>

        {/* Main content */}
        <main className="p-4 sm:p-6">
          {/* Add transaction form */}
          {showAddForm && (
            <Card className="mb-6 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">
                  {editingTransaction ? "Editar Lançamento" : "Novo Lançamento"}
                </CardTitle>
                <CardDescription>
                  {editingTransaction
                    ? "Edite os dados da transação"
                    : "Adicione uma nova receita, despesa ou transferência"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value, category: "" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Receita</SelectItem>
                          <SelectItem value="expense">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        disabled={!formData.type}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.type &&
                            categories[formData.type as keyof typeof categories].map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Data *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account">Conta *</Label>
                      <Select
                        value={formData.account}
                        onValueChange={(value) => setFormData({ ...formData, account: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a conta" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account} value={account}>
                              {account}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 space-y-2">
                      <Label htmlFor="description">Descrição *</Label>
                      <Textarea
                        id="description"
                        placeholder="Descrição do lançamento..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false)
                        setEditingTransaction(null)
                        setFormData({
                          type: "",
                          category: "",
                          amount: "",
                          description: "",
                          account: "",
                          date: new Date().toISOString().split("T")[0],
                        })
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingTransaction ? "Atualizar" : "Salvar"} Lançamento
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar transações..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="income">Receitas</SelectItem>
                      <SelectItem value="expense">Despesas</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {[...categories.income, ...categories.expense].map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Histórico de Transações ({transactions.length})</CardTitle>
              <CardDescription>
                {filteredTransactions.length === 0
                  ? "Nenhuma transação encontrada"
                  : `${filteredTransactions.length} transação(ões) encontrada(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    {transactions.length === 0
                      ? "Você ainda não possui transações"
                      : "Nenhuma transação corresponde aos filtros aplicados"}
                  </p>
                  {transactions.length === 0 && (
                    <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeira Transação
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="w-6 h-6 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-6 h-6 text-red-600" />
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs w-fit">
                              {transaction.category}
                            </Badge>
                            <span className="text-sm text-gray-500">{transaction.account}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              transaction.type === "income" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}R${" "}
                            {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
