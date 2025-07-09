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
import { Plus, Target, Edit, Trash2, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
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

    // Carregar metas
    const savedGoals = localStorage.getItem("goals")
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.targetAmount || !formData.deadline) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    const targetAmount = Number.parseFloat(formData.targetAmount.replace(/[^\d,]/g, "").replace(",", "."))
    const currentAmount = Number.parseFloat(formData.currentAmount.replace(/[^\d,]/g, "").replace(",", ".")) || 0

    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor meta válido",
        variant: "destructive",
      })
      return
    }

    if (currentAmount < 0) {
      toast({
        title: "Erro",
        description: "O valor atual não pode ser negativo",
        variant: "destructive",
      })
      return
    }

    const newGoal: Goal = {
      id: editingGoal?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      targetAmount: targetAmount,
      currentAmount: currentAmount,
      deadline: formData.deadline,
      createdAt: editingGoal?.createdAt || new Date().toISOString(),
    }

    let updatedGoals
    if (editingGoal) {
      updatedGoals = goals.map((g) => (g.id === editingGoal.id ? newGoal : g))
      toast({
        title: "Meta atualizada!",
        description: "A meta foi atualizada com sucesso.",
      })
    } else {
      updatedGoals = [...goals, newGoal]
      toast({
        title: "Meta criada!",
        description: "A meta foi criada com sucesso.",
      })
    }

    setGoals(updatedGoals)
    localStorage.setItem("goals", JSON.stringify(updatedGoals))

    // Reset form
    setFormData({
      name: "",
      description: "",
      targetAmount: "",
      currentAmount: "",
      deadline: "",
    })
    setShowAddForm(false)
    setEditingGoal(null)
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      description: goal.description,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
    })
    setShowAddForm(true)
  }

  const handleDelete = (id: string) => {
    const updatedGoals = goals.filter((g) => g.id !== id)
    setGoals(updatedGoals)
    localStorage.setItem("goals", JSON.stringify(updatedGoals))
    toast({
      title: "Meta excluída!",
      description: "A meta foi removida com sucesso.",
    })
  }

  const handleAddAmount = (goalId: string, amount: number) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.id === goalId) {
        const newCurrentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount)
        return { ...goal, currentAmount: newCurrentAmount }
      }
      return goal
    })

    setGoals(updatedGoals)
    localStorage.setItem("goals", JSON.stringify(updatedGoals))

    toast({
      title: "Valor adicionado!",
      description: `R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} foi adicionado à meta.`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="ml-64">
        <Header title="Metas Financeiras" setSidebarOpen={setSidebarOpen}>
          <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nova Meta</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </Header>

        {/* Main content */}
        <main className="p-4 sm:p-6">
          {/* Add goal form */}
          {showAddForm && (
            <Card className="mb-6 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">{editingGoal ? "Editar Meta" : "Nova Meta Financeira"}</CardTitle>
                <CardDescription>
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
                        setFormData({
                          name: "",
                          description: "",
                          targetAmount: "",
                          currentAmount: "",
                          deadline: "",
                        })
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingGoal ? "Atualizar" : "Criar"} Meta
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Goals list */}
          {goals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma meta definida</h3>
                <p className="text-gray-500 mb-6">
                  Comece definindo suas metas financeiras para alcançar seus objetivos
                </p>
                <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Meta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100
                const isCompleted = progress >= 100
                const daysLeft = Math.ceil(
                  (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                )

                return (
                  <Card key={goal.id} className={`${isCompleted ? "border-green-200 bg-green-50" : "border-blue-200"}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-blue-900">{goal.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(goal.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {goal.description && <CardDescription>{goal.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progresso</span>
                          <span className={`text-sm font-semibold ${isCompleted ? "text-green-600" : "text-blue-600"}`}>
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-3" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>R$ {goal.currentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          <span>R$ {goal.targetAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Prazo:</span>
                          <span
                            className={`font-medium ${daysLeft < 0 ? "text-red-600" : daysLeft < 30 ? "text-orange-600" : "text-gray-900"}`}
                          >
                            {daysLeft < 0 ? "Vencido" : `${daysLeft} dias`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Data limite:</span>
                          <span className="text-gray-900">{new Date(goal.deadline).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>

                      {!isCompleted && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Adicionar valor</Label>
                          <div className="flex space-x-2">
                            <Input type="number" placeholder="0,00" className="flex-1" id={`add-amount-${goal.id}`} />
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
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
                        <div className="text-center p-3 bg-green-100 rounded-lg">
                          <p className="text-green-700 font-semibold">🎉 Meta Concluída!</p>
                          <p className="text-green-600 text-sm">Parabéns por alcançar seu objetivo!</p>
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
    </div>
  )
}
