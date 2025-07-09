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
import { Plus, Search, ArrowUpRight, ArrowDownRight, Edit, Trash2, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

interface Transaction {
  id: string
  type: "income" | "expense"
  description: string
  amount: number
  date: string
  category: string
  account: string
  accountId: string // Adicionado para refletir a estrutura da API
  isInstallment?: boolean
  installments?: number
  isRecurring?: boolean
  recurrenceGroupId?: string
  installmentGroupId?: string
}

interface BankAccount {
  id: string
  name: string
  bank: string
  type: string
  balance: number
  createdAt: string
}

export default function TransactionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterMonth, setFilterMonth] = useState(() => (new Date().getMonth() + 1).toString())
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const categories = {
    income: ["Salário", "Freelance", "Investimentos", "Vendas", "Outros"],
    expense: ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Entretenimento", "Compras", "Outros"],
  }

  const [formData, setFormData] = useState({
    type: "",
    category: "",
    amount: "",
    description: "",
    account: "",
    date: new Date().toISOString().split("T")[0],
    isInstallment: false,
    installments: 1,
    isRecurring: false,
  })

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    // Verificar autenticação apenas uma vez
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.replace("/login")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    const email = localStorage.getItem("userEmail") || ""
    const method = editingTransaction ? "PUT" : "POST"
    // Gera um id de grupo se for parcelado ou recorrente
    const installmentGroupId = formData.isInstallment ? uuidv4() : undefined;
    const recurrenceGroupId = formData.isRecurring ? uuidv4() : undefined;
    const body = editingTransaction
      ? {
          id: editingTransaction.id,
          type: formData.type,
          category: formData.category,
          amount: formData.isInstallment ? (Number(formData.amount) / Number(formData.installments)) : Number(formData.amount),
          description: formData.description,
          accountId: formData.account,
          date: formData.date,
          isInstallment: formData.isInstallment,
          installments: formData.installments,
          isRecurring: formData.isRecurring,
          installmentGroupId,
          recurrenceGroupId,
        }
      : {
          type: formData.type,
          category: formData.category,
          amount: formData.isInstallment ? (Number(formData.amount) / Number(formData.installments)) : Number(formData.amount),
          description: formData.description,
          accountId: formData.account,
          date: formData.date,
          isInstallment: formData.isInstallment,
          installments: formData.installments,
          isRecurring: formData.isRecurring,
          installmentGroupId,
          recurrenceGroupId,
        }
    const res = await fetch("/api/transactions", {
      method,
      headers: { "Content-Type": "application/json", "x-user-email": email },
      body: JSON.stringify(body),
    })
    let data = {}
    try {
      data = await res.json()
    } catch (e) {
      data = {}
    }
    const typedData = data as { transaction?: Transaction; transactions?: Transaction[]; error?: string }
    if (res.ok) {
      if (typedData.transactions) {
        // Parcelado: adicionar todas as transações
        setTransactions((prev) => [...typedData.transactions!, ...prev])
      } else if (typedData.transaction) {
        if (editingTransaction) {
          setTransactions((prev) => prev.map((t) => t.id === typedData.transaction!.id ? typedData.transaction! : t))
        } else {
          setTransactions((prev) => [typedData.transaction as Transaction, ...prev])
        }
      }
      setFormData({
        type: "",
        category: "",
        amount: "",
        description: "",
        account: "",
        date: new Date().toISOString().split("T")[0],
        isInstallment: false,
        installments: 1,
        isRecurring: false,
      })
      setShowAddForm(false)
      setEditingTransaction(null)
      setShowSuccessModal(true)
    } else {
      alert(typedData.error || (editingTransaction ? "Erro ao atualizar transação" : "Erro ao adicionar transação"))
    }
    setIsCreating(false)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description,
      account: transaction.accountId, // Usar o ID da conta
      date: transaction.date ? transaction.date.split('T')[0] : '', // Formato yyyy-MM-dd
      isInstallment: transaction.isInstallment || false,
      installments: transaction.installments || 1,
      isRecurring: transaction.isRecurring || false,
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    const email = localStorage.getItem("userEmail") || ""
    const res = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
      headers: { "x-user-email": email },
    })
    const data = await res.json()
    if (res.ok) {
      // Atualizar em tempo real: remover todas do grupo do estado local
      const deleted = transactions.find(t => t.id === id);
      if (deleted?.recurrenceGroupId) {
        setTransactions((prev) => prev.filter((t) => t.recurrenceGroupId !== deleted.recurrenceGroupId));
      } else if (deleted?.installmentGroupId) {
        setTransactions((prev) => prev.filter((t) => t.installmentGroupId !== deleted.installmentGroupId));
      } else {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
      alert("Transação excluída!")
    } else {
      alert(data.error || "Erro ao excluir transação")
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory
    const matchesMonth = filterMonth === "all" || (new Date(transaction.date).getMonth() + 1).toString() === filterMonth
    return matchesSearch && matchesType && matchesCategory && matchesMonth
  })

  // Soma das despesas do mês filtrado
  const totalAPagarNoMes = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Busca a transação selecionada para exclusão
  const transactionToDelete = transactions.find(t => t.id === deleteId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* Main content */}
      <div className="ml-64">
        <Header title="Lançamentos" setSidebarOpen={setSidebarOpen}>
          <Button onClick={() => setShowAddForm(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Novo Lançamento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </Header>
        {/* Main content */}
        <main className="p-4 sm:p-6">
          {/* Add transaction form */}
          {showAddForm && (
            <Card className="mb-6 bg-card text-card-foreground border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">
                  {editingTransaction ? "Editar Lançamento" : "Novo Lançamento"}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
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
                      {/* Select de categorias fixas */}
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} disabled={!formData.type}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.type && [
                            ...categories[formData.type as keyof typeof categories].map((c) => ({ key: `${formData.type}-${c}`, value: c })),
                          ].map(({ key, value }) => (
                            <SelectItem key={key} value={value}>
                              {value}
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
                      {formData.type === "expense" && formData.isInstallment && formData.installments > 1 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Cada parcela: R$ {((Number(formData.amount) || 0) / (formData.installments || 1)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      )}
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
                      {/* Select de contas reais do usuário */}
                      <Select value={formData.account} onValueChange={(value) => setFormData({ ...formData, account: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a conta" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingAccounts ? (
                            <SelectItem value="" disabled>Carregando...</SelectItem>
                          ) : accounts.length === 0 ? (
                            <SelectItem value="" disabled>Nenhuma conta encontrada</SelectItem>
                          ) : (
                            accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Campo de título (antes descrição) */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Título *</Label>
                      <Input
                        id="description"
                        placeholder="Título do lançamento..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                  {/* Parcelamento e recorrência: só aparecem se for despesa */}
                  {formData.type === "expense" && (
                    <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
                      <div className="flex gap-8 items-center">
                        <div>
                          <Label htmlFor="isInstallment">É parcelado?</Label>
                          <div className="flex items-center gap-4">
                            <Switch
                              id="isInstallment"
                              checked={formData.isInstallment}
                              onCheckedChange={(checked) => setFormData({ ...formData, isInstallment: checked, installments: checked ? 2 : 1 })}
                              disabled={formData.isRecurring}
                            />
                            <span>{formData.isInstallment ? "Sim" : "Não"}</span>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="isRecurring">É recorrente?</Label>
                          <div className="flex items-center gap-4">
                            <Switch
                              id="isRecurring"
                              checked={formData.isRecurring}
                              onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked, isInstallment: checked ? false : formData.isInstallment })}
                              disabled={formData.isInstallment}
                            />
                            <span>{formData.isRecurring ? "Sim" : "Não"}</span>
                          </div>
                        </div>
                      </div>
                      {/* Parcelas só aparece se não for recorrente */}
                      {!formData.isRecurring && (
                        <div className="mt-2">
                          <Label htmlFor="installments">Quantidade de parcelas</Label>
                          <Input
                            id="installments"
                            type="number"
                            min={2}
                            max={36}
                            value={formData.installments}
                            onChange={e => setFormData({ ...formData, installments: Number(e.target.value) })}
                            disabled={!formData.isInstallment}
                          />
                        </div>
                      )}
                    </div>
                  )}
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
                          isInstallment: false,
                          installments: 1,
                          isRecurring: false,
                        })
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                      {editingTransaction ? "Atualizar" : "Salvar"} Lançamento
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Filtros e busca */}
          <Card className="mb-6 bg-card text-card-foreground">
            <CardContent className="p-4">
              <div className="w-full grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                <div className="col-span-1 md:col-span-4">
                  <div className="relative">
                    <Input
                      placeholder="Buscar transações..."
                      className="pl-10 bg-background text-foreground border-border h-12"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  </div>
                </div>
                <div className="col-span-1 md:col-span-1">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full bg-card text-card-foreground border-border h-12">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tipo</SelectItem>
                      <SelectItem value="income">Receitas</SelectItem>
                      <SelectItem value="expense">Despesas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 md:col-span-1">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full bg-card text-card-foreground border-border h-12">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Categoria</SelectItem>
                      {categories.income.map((cat) => (
                        <SelectItem key={`income-${cat}`} value={cat}>{cat}</SelectItem>
                      ))}
                      {categories.expense.map((cat) => (
                        <SelectItem key={`expense-${cat}`} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 md:col-span-1">
                  <Select value={filterMonth} onValueChange={setFilterMonth}>
                    <SelectTrigger className="w-full bg-card text-card-foreground border-border h-12">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {[...Array(12)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions list */}
          <Card className="mb-4 border-red-200 bg-red-50 w-full max-w-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm font-medium text-red-600">Total a pagar no mês</p>
                <p className="text-2xl font-bold text-red-700">
                  R$ {totalAPagarNoMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-primary">Histórico de Transações ({filteredTransactions.length})</CardTitle>
              <CardDescription>
                {filteredTransactions.length === 0
                  ? "Nenhuma transação encontrada"
                  : `${filteredTransactions.length} transação(ões) encontrada(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">Você ainda não possui transações</p>
                  <Button onClick={() => setShowAddForm(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeira Transação
                  </Button>
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
                            onClick={() => setDeleteId(transaction.id)}
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

      {/* Modal de sucesso */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transação criada com sucesso!</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowSuccessModal(false)} className="bg-primary hover:bg-primary/90">OK</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {transactionToDelete?.recurrenceGroupId
                ? "Esta transação faz parte de um lançamento recorrente. Todas as recorrências deste grupo serão excluídas."
                : transactionToDelete?.installmentGroupId
                ? "Esta transação faz parte de um lançamento parcelado. Todas as parcelas deste grupo serão excluídas."
                : "Tem certeza que deseja excluir esta transação? Esta ação não poderá ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (deleteId) {
                  await handleDelete(deleteId)
                  setDeleteId(null)
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
