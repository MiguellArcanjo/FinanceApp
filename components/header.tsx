"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, Bell } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useEffect, useState } from "react"

interface HeaderProps {
  title: string
  setSidebarOpen: (open: boolean) => void
  children?: React.ReactNode
}

export function Header({ title, setSidebarOpen, children }: HeaderProps) {
  const router = useRouter()
  // Notificações de metas e parcelas
  const [notifications, setNotifications] = useState<{ id: string, message: string }[]>([])

  useEffect(() => {
    function updateNotifications() {
      const goals = JSON.parse(localStorage.getItem("goals") || "[]");
      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
      const notifs: { id: string, message: string }[] = [];
      const now = new Date();
  
      // Notificações de metas
      goals.forEach((goal: any) => {
        const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) : 0;
  
        if (daysLeft <= 7 && daysLeft >= 0 && goal.currentAmount < goal.targetAmount) {
          notifs.push({ id: `goal-${goal.id}-prazo`, message: `Meta "${goal.name}" está a ${daysLeft} dia${daysLeft === 1 ? '' : 's'} do prazo!` });
        }
  
        if (progress >= 0.9 && progress < 1) {
          notifs.push({ id: `goal-${goal.id}-progresso`, message: `Meta "${goal.name}" está próxima de ser atingida! (${Math.round(progress * 100)}%)` });
        }
      });
  
      // Verificação de parcelas
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();
      const grupos: Record<string, { base: string, total: number, parcelas: any[] }> = {};
      transactions.forEach((t: any) => {
        const match = t.description && t.description.match(/(.+)\s*\((\d+)\/(\d+)\)/);
        if (match) {
          const base = match[1].trim().toLowerCase();
          const total = parseInt(match[3], 10);
          const numero = parseInt(match[2], 10);
          const dataParcela = new Date(t.date);
          const mesParcela = dataParcela.getMonth();
          const anoParcela = dataParcela.getFullYear();
          const groupKey = base + '-' + total + '-' + (t.account || '') + '-' + t.amount;
          if (!grupos[groupKey]) {
            grupos[groupKey] = { base, total, parcelas: [] };
          }
          grupos[groupKey].parcelas.push({ ...t, numero, mesParcela, anoParcela });
        }
      });

      Object.values(grupos).forEach((p: any) => {
        // Procura a parcela do mês atual
        const doMes = p.parcelas.find((parc: any) => parc.mesParcela === mesAtual && parc.anoParcela === anoAtual);
        if (doMes) {
          const restantes = p.total - doMes.numero;
          if (doMes.numero === p.total) {
            notifs.push({
              id: `installment-${p.base}-finalizada`,
              message: `Última parcela de "${p.base}"!`
            });
          } else {
            notifs.push({
              id: `installment-${p.base}-situacao`,
              message: `Parcela ${doMes.numero}/${p.total} de "${p.base}". Faltam ${restantes} de ${p.total} parcelas para acabar.`
            });
          }
        }
      });
  
      setNotifications(notifs);
    }
  
    updateNotifications();
    window.addEventListener("storage", updateNotifications);
    return () => window.removeEventListener("storage", updateNotifications);
  }, []);
  
  
  // Pega a primeira letra do nome do usuário para o avatar
  const [userInitial, setUserInitial] = useState('U');
  useEffect(() => {
    const userName = localStorage.getItem('userName') || '';
    setUserInitial(userName.trim().charAt(0).toUpperCase() || 'U');
  }, []);

  const [open, setOpen] = useState(false)

  return (
    <header className="bg-card shadow-sm border-b border-border w-full">
      <div className="flex flex-wrap items-center justify-between h-auto min-h-[56px] px-2 sm:px-4 py-2 gap-2">
        <div className="flex items-center min-w-0 flex-1">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-primary mr-2 sm:mr-4">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-base sm:text-xl font-bold text-card-foreground truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {children}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">{notifications.length}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-h-80 overflow-y-auto w-80 p-0">
              <div className="p-4 border-b font-bold">Notificações</div>
              {notifications.length === 0 ? (
                <div className="p-4 text-muted-foreground">Nenhuma notificação.</div>
              ) : (
                <ul className="divide-y">
                  {notifications.map((notif) => (
                    <li key={notif.id} className="p-4 hover:bg-muted/50 text-sm">{notif.message}</li>
                  ))}
                </ul>
              )}
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="sm" onClick={() => router.push("/profile")}> 
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">{userInitial}</span>
            </div>
          </Button>
        </div>
      </div>
    </header>
  )
}
