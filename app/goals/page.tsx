"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Plus, Target, Edit, Trash2, DollarSign, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTranslation } from 'react-i18next';

interface Goal {
  id: string
  name: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string
  createdAt: string
}

export default function GoalsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([])
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null)
  const [isLoadingGoals, setIsLoadingGoals] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  })

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
    // Buscar metas do backend
    const fetchGoals = async () => {
      setIsLoadingGoals(true)
      const email = localStorage.getItem("userEmail") || ""
      const res = await fetch("/api/goals", {
        headers: { "x-user-email": email },
      })
      const data = await res.json()
      if (res.ok) setGoals(data.goals)
      setIsLoadingGoals(false)
    }
    fetchGoals()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.targetAmount || !formData.deadline) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    const email = localStorage.getItem("userEmail") || ""
    const targetAmount = Number(formData.targetAmount.replace(',', '.')) || 0
    let res, data
    if (editingGoal) {
      res = await fetch(`/api/goals/${editingGoal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-email": email },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description ?? "",
          targetAmount,
          deadline: formData.deadline, // já no formato YYYY-MM-DD
        }),
      })
    } else {
      res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-email": email },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description ?? "",
          targetAmount,
          deadline: formData.deadline,
        }),
      })
    }
    try {
      data = await res.json()
    } catch (e) {
      data = {}
    }
    if (res.ok && (data as any).goal) {
      if (editingGoal) {
        setGoals((prev) => prev.map((g) => g.id === editingGoal.id ? (data as any).goal : g))
        toast({ title: "Meta atualizada!", description: "A meta foi atualizada com sucesso." })
      } else {
        setGoals((prev) => [...prev, (data as any).goal])
        toast({ title: "Meta criada!", description: "A meta foi criada com sucesso." })
      }
      setShowAddForm(false)
      setFormData({ name: "", description: "", targetAmount: "", currentAmount: "", deadline: "" })
      setEditingGoal(null)
    } else {
      toast({ title: "Erro", description: (data as any).error || "Erro ao salvar meta", variant: "destructive" })
    }
    setIsCreating(false)
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name || "",
      description: goal.description || "",
      targetAmount: goal.targetAmount !== undefined && goal.targetAmount !== null ? String(goal.targetAmount) : "",
      currentAmount: goal.currentAmount !== undefined && goal.currentAmount !== null ? String(goal.currentAmount) : "",
      deadline: goal.deadline ? new Date(goal.deadline).toLocaleDateString('en-CA') : "",
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    const email = localStorage.getItem("userEmail") || ""
    const res = await fetch(`/api/goals/${id}`, {
      method: "DELETE",
      headers: { "x-user-email": email },
    })
    let data = {}
    try {
      data = await res.json()
    } catch (e) {
      data = {}
    }
    if (res.ok && (data as any).success) {
      setGoals((prev) => prev.filter((g) => g.id !== id))
      toast({ title: "Meta excluída!", description: "A meta foi removida com sucesso." })
    } else {
      toast({ title: "Erro", description: (data as any).error || "Erro ao excluir meta", variant: "destructive" })
    }
    setShowDeleteModal(false)
    setGoalToDelete(null)
  }

  const handleAddAmount = async (goalId: string, amount: number) => {
    const email = localStorage.getItem("userEmail") || ""
    const res = await fetch("/api/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user-email": email },
      body: JSON.stringify({ id: goalId, amount }),
    })
    let data = {}
    try {
      data = await res.json()
    } catch (e) {
      data = {}
    }
    if (res.ok && (data as any).goal) {
      setGoals((prev) => prev.map((g) => g.id === goalId ? (data as any).goal : g))
      toast({
        title: "Valor adicionado!",
        description: `R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} foi adicionado à meta.`,
      })
    } else {
      toast({
        title: "Erro",
        description: (data as any).error || "Erro ao adicionar valor à meta",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* Main content */}
      <div className="ml-64">
        <Header title="Metas Financeiras" setSidebarOpen={setSidebarOpen}>
          <Button onClick={() => setShowAddForm(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nova Meta</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </Header>
        {/* Main content */}
        <main className="p-4 sm:p-6">
          {/* Add goal form */}
          {showAddForm && (
            <Card className="mb-6 bg-card text-card-foreground border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">{editingGoal ? "Editar Meta" : "Nova Meta Financeira"}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {editingGoal
                    ? "Edite os dados da sua meta"
                    : "Defina uma nova meta financeira para alcançar seus objetivos"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Meta *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Ex: Reserva de Emergência"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetAmount">Valor Meta *</Label>
                      <Input
                        id="targetAmount"
                        type="text"
                        placeholder="0,00"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentAmount">Valor Atual</Label>
                      <Input
                        id="currentAmount"
                        type="text"
                        placeholder="0,00"
                        value={formData.currentAmount}
                        onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline">Prazo *</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        placeholder="Descreva sua meta e como pretende alcançá-la..."
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
                        setEditingGoal(null)
                        setFormData({ name: "", description: "", targetAmount: "", currentAmount: "", deadline: "" })
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isCreating}>
                      {isCreating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingGoal ? "Salvar alterações" : "Criar meta")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          {/* Goals list */}
          {isLoadingGoals ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : goals.length === 0 ? (
            <Card className="bg-card text-card-foreground">
              <CardContent className="text-center py-12">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Nenhuma meta definida</h3>
                <p className="text-muted-foreground mb-6">
                  Comece definindo suas metas financeiras para alcançar seus objetivos
                </p>
                <Button onClick={() => setShowAddForm(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Meta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => {
                const progress = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0
                const isCompleted = progress >= 100
                const daysLeft = Math.ceil(
                  (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                )
                return (
                  <Card key={goal.id} className={`${isCompleted ? "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-700 text-green-900 dark:text-green-200" : "border-primary/20 bg-card text-card-foreground"}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-primary">{goal.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => { setGoalToDelete(goal); setShowDeleteModal(true); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {goal.description && <CardDescription className="text-muted-foreground">{goal.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Progresso</span>
                          <span className="font-bold text-primary">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-3 transition-all duration-700" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>R$ {goal.currentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          <span>R$ {goal.targetAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Prazo:</span>
                          <span
                            className={`font-medium ${daysLeft < 0 ? "text-red-600" : daysLeft < 30 ? "text-orange-600" : "text-card-foreground"}`}
                          >
                            {daysLeft < 0 ? "Vencido" : `${daysLeft} dias`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Data limite:</span>
                          <span className="text-card-foreground">{new Date(goal.deadline).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                      {!isCompleted && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Adicionar valor</Label>
                          <div className="flex space-x-2">
                            <Input type="number" placeholder="0,00" className="flex-1" id={`add-amount-${goal.id}`} />
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                              onClick={() => {
                                const input = document.getElementById(`add-amount-${goal.id}`) as HTMLInputElement
                                const amount = Number.parseFloat(input.value)
                                if (amount > 0) {
                                  handleAddAmount(goal.id, amount)
                                  input.value = ""
                                }
                              }}
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="text-center p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                          <p className="text-green-700 dark:text-green-200 font-semibold">🎉 Meta Concluída!</p>
                          <p className="text-green-600 dark:text-green-200 text-sm">Parabéns por alcançar seu objetivo!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </main>
      </div>
      {/* Modal de confirmação de exclusão */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja excluir esta meta?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => goalToDelete && handleDelete(goalToDelete.id)}>Excluir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
