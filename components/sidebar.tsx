"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TrendingUp, X, BarChart3, Plus, Target, PieChart, Calendar, Settings, LogOut, CreditCard } from "lucide-react"
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    router.push("/login")
  }

  const sidebarItems = [
    { icon: BarChart3, label: t('menu_dashboard'), href: "/dashboard" },
    { icon: Plus, label: t('menu_lancamentos'), href: "/transactions" },
    { icon: CreditCard, label: t('menu_contas_bancarias'), href: "/accounts" },
    { icon: Target, label: t('menu_metas'), href: "/goals" },
    { icon: PieChart, label: t('menu_analises'), href: "/analytics" },
    { icon: Calendar, label: t('menu_calendario'), href: "/calendar" },
    { icon: Settings, label: t('menu_configuracoes'), href: "/settings" },
  ]

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-200 lg:bg-sidebar-background lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:block`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">Organizze</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground hover:text-primary">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:text-primary"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            {t('menu_sair')}
          </Button>
        </div>
      </div>
    </>
  )
}
