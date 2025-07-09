"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Buscar dados reais do usuário do localStorage
    const name = localStorage.getItem("userName") || "Usuário"
    const email = localStorage.getItem("userEmail") || ""
    setUser({ name, email })
  }, [])

  const handleSendResetLink = async () => {
    setIsSendingReset(true)
    const email = user?.email || ""
    try {
      const res = await fetch("/api/send-reset-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        toast({ title: "Erro", description: "Não foi possível enviar o e-mail. Tente novamente.", variant: "destructive" })
        setIsSendingReset(false)
        return
      }
      setShowResetModal(true)
    } catch {
      toast({ title: "Erro", description: "Erro ao conectar com o servidor.", variant: "destructive" })
    } finally {
      setIsSendingReset(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="ml-64">
        <Header title="Perfil do Usuário" setSidebarOpen={setSidebarOpen} />

        <main className="p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Informações do Usuário</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Detalhes pessoais e configurações da conta.</p>
              </div>
              <div className="border-t border-gray-200">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 px-6">
                    <dt className="text-sm font-medium text-gray-500">Nome</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.name}</dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 px-6">
                    <dt className="text-sm font-medium text-gray-500">E-mail</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.email}</dd>
                  </div>
                </dl>
              </div>
            </div>
            {/* Card de segurança */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Informações de segurança</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Gerencie a segurança da sua conta.</p>
              </div>
              <div className="border-t border-gray-200">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:flex sm:items-center sm:justify-between px-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Alterar senha</dt>
                      <dd className="mt-1 text-sm text-gray-900">Mantenha sua senha segura. Clique abaixo para alterá-la.</dd>
                    </div>
                    <button className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none min-w-[120px] justify-center" onClick={handleSendResetLink} disabled={isSendingReset}>
                      {isSendingReset ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Alterar senha"
                      )}
                    </button>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>Preencha os campos abaixo para alterar sua senha.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha atual</label>
              <div className="relative">
                <Input type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Digite sua senha atual" required />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowCurrentPassword(v => !v)} tabIndex={-1}>
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
              <div className="relative">
                <Input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Digite a nova senha" required />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowNewPassword(v => !v)} tabIndex={-1}>
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
              <div className="relative">
                <Input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirme a nova senha" required />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowConfirmPassword(v => !v)} tabIndex={-1}>
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Salvar nova senha</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="max-w-md w-full text-center">
          <DialogHeader>
            <DialogTitle>Verifique seu e-mail</DialogTitle>
            <DialogDescription>
              Enviamos um link para redefinir sua senha para <b>{user?.email}</b>.<br />
              Acesse seu e-mail e siga as instruções para criar uma nova senha.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowResetModal(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
