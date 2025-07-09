"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  Menu,
  X,
  BarChart3,
  Plus,
  Target,
  PieChart,
  Calendar,
  SettingsIcon,
  LogOut,
  Bell,
  Shield,
  Palette,
  Download,
  Trash2,
  CreditCard,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/sidebar"
import { useTheme } from "next-themes"
import { Header } from "@/components/header"
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

interface AppSettings {
  notifications: {
    email: boolean
    push: boolean
    transactions: boolean
    goals: boolean
  }
  display: {
    theme: "light" | "dark" | "system"
    language: string
    currency: string
    dateFormat: string
  }
  privacy: {
    dataCollection: boolean
    analytics: boolean
  }
}

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      email: true,
      push: true,
      transactions: true,
      goals: true,
    },
    display: {
      theme: "light",
      language: "pt-BR",
      currency: "BRL",
      dateFormat: "DD/MM/YYYY",
    },
    privacy: {
      dataCollection: false,
      analytics: false,
    },
  })
  const { setTheme } = useTheme();

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Carregar configurações salvas
    const savedSettings = localStorage.getItem("appSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    toast({
      title: "Logout realizado com sucesso!",
      description: "Até logo!",
    })
    router.push("/login")
  }

  const saveSettings = () => {
    localStorage.setItem("appSettings", JSON.stringify(settings))
    setTheme(settings.display.theme)
    if (i18n) {
      i18n.changeLanguage(settings.display.language)
    }
    toast({
      title: "Configurações salvas com sucesso!",
      description: "Suas preferências foram atualizadas.",
      variant: "default",
      duration: 2000
    })
  }

  const exportData = () => {
    const data = {
      transactions: JSON.parse(localStorage.getItem("transactions") || "[]"),
      goals: JSON.parse(localStorage.getItem("goals") || "[]"),
      accounts: JSON.parse(localStorage.getItem("bankAccounts") || "[]"),
      profile: JSON.parse(localStorage.getItem("userProfile") || "{}"),
      settings: settings,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `financecontrol-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Dados exportados!",
      description: "Seu backup foi baixado com sucesso.",
    })
  }

  const clearAllData = () => {
    if (confirm("Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.")) {
      localStorage.removeItem("transactions")
      localStorage.removeItem("goals")
      localStorage.removeItem("bankAccounts")
      localStorage.removeItem("userProfile")
      localStorage.removeItem("notifications")
      localStorage.removeItem("appSettings")

      toast({
        title: "Dados apagados!",
        description: "Todos os seus dados foram removidos.",
        variant: "destructive",
      })
    }
  }

  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
    { icon: Plus, label: "Lançamentos", href: "/transactions" },
    { icon: CreditCard, label: "Contas Bancárias", href: "/accounts" },
    { icon: Target, label: "Metas", href: "/goals" },
    { icon: PieChart, label: "Análises", href: "/analytics" },
    { icon: Calendar, label: "Calendário", href: "/calendar" },
    { icon: SettingsIcon, label: "Configurações", href: "/settings", active: true },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="ml-64">
        <Header title="Configurações" setSidebarOpen={setSidebarOpen} />
        {/* Main content */}
        <main className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">

          {/* Display */}
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Palette className="w-5 h-5 mr-2" />
                Aparência e Idioma
              </CardTitle>
              <CardDescription className="text-muted-foreground">Personalize a aparência do aplicativo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select
                    value={settings.display.theme}
                    onValueChange={(value: "light" | "dark" | "system") => {
                      setSettings({
                        ...settings,
                        display: { ...settings.display, theme: value },
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={settings.display.language}
                    onValueChange={(value: string) => {
                      setSettings({
                        ...settings,
                        display: { ...settings.display, language: value },
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda</Label>
                  <Select
                    value={settings.display.currency}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        display: { ...settings.display, currency: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                      <SelectItem value="USD">Dólar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Formato de Data</Label>
                  <Select
                    value={settings.display.dateFormat}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        display: { ...settings.display, dateFormat: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Download className="w-5 h-5 mr-2" />
                Gerenciamento de Dados
              </CardTitle>
              <CardDescription className="text-muted-foreground">Exporte ou apague seus dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Exportar Dados</h4>
                  <p className="text-sm text-gray-500">Baixe um backup completo dos seus dados</p>
                </div>
                <Button onClick={exportData} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-medium text-red-900">Apagar Todos os Dados</h4>
                  <p className="text-sm text-red-600">Esta ação não pode ser desfeita</p>
                </div>
                <Button onClick={clearAllData} variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Apagar Tudo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Settings */}
          <div className="flex justify-end">
            <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">
              Salvar Configurações
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
