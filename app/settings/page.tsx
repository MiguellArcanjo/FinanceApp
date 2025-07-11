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
  const { t } = useTranslation();
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
      title: t("settings.logout_success"),
      description: t("settings.see_you_soon"),
    })
    router.push("/login")
  }

  const saveSettings = () => {
    localStorage.setItem("appSettings", JSON.stringify(settings))
    localStorage.setItem("theme", settings.display.theme) // Adicionado para next-themes
    setTheme(settings.display.theme)
    if (i18n) {
      i18n.changeLanguage(settings.display.language)
    }
    toast({
      title: t("settings.saved_success"),
      description: t("settings.preferences_updated"),
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
      title: t("settings.data_exported"),
      description: t("settings.backup_downloaded"),
    })
  }

  const clearAllData = () => {
    if (confirm(t("settings.confirm_clear_data"))) {
      localStorage.removeItem("transactions")
      localStorage.removeItem("goals")
      localStorage.removeItem("bankAccounts")
      localStorage.removeItem("userProfile")
      localStorage.removeItem("notifications")
      localStorage.removeItem("appSettings")

      toast({
        title: t("settings.data_cleared"),
        description: t("settings.all_data_removed"),
        variant: "destructive",
      })
    }
  }

  const sidebarItems = [
    { icon: BarChart3, label: t("dashboard"), href: "/dashboard" },
    { icon: Plus, label: t("lancamentos"), href: "/transactions" },
    { icon: CreditCard, label: t("contas_bancarias"), href: "/accounts" },
    { icon: Target, label: t("metas"), href: "/goals" },
    { icon: PieChart, label: t("analises"), href: "/analytics" },
    { icon: Calendar, label: t("calendario"), href: "/calendar" },
    { icon: SettingsIcon, label: t("configuracoes"), href: "/settings", active: true },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="ml-64">
        <Header title={t("configuracoes")} setSidebarOpen={setSidebarOpen} />
        {/* Main content */}
        <main className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">

          {/* Display */}
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Palette className="w-5 h-5 mr-2" />
                {t("settings.appearance_language")}
              </CardTitle>
              <CardDescription className="text-muted-foreground">{t("settings.customize_appearance")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">{t("settings.theme")}</Label>
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
                      <SelectItem value="light">{t("settings.theme_light")}</SelectItem>
                      <SelectItem value="dark">{t("settings.theme_dark")}</SelectItem>
                      <SelectItem value="system">{t("settings.theme_system")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">{t("settings.language")}</Label>
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
                      <SelectItem value="pt-BR">{t("settings.lang_pt")}</SelectItem>
                      <SelectItem value="en-US">{t("settings.lang_en")}</SelectItem>
                      <SelectItem value="es-ES">{t("settings.lang_es")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">{t("settings.currency")}</Label>
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
                      <SelectItem value="BRL">{t("settings.currency_brl")}</SelectItem>
                      <SelectItem value="USD">{t("settings.currency_usd")}</SelectItem>
                      <SelectItem value="EUR">{t("settings.currency_eur")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">{t("settings.date_format")}</Label>
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
                {t("settings.data_management")}
              </CardTitle>
              <CardDescription className="text-muted-foreground">{t("settings.export_or_delete")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{t("settings.export_data")}</h4>
                  <p className="text-sm text-gray-500">{t("settings.download_backup")}</p>
                </div>
                <Button onClick={exportData} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  {t("settings.export")}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-medium text-red-900">{t("settings.delete_all_data")}</h4>
                  <p className="text-sm text-red-600">{t("settings.action_irreversible")}</p>
                </div>
                <Button onClick={clearAllData} variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("settings.delete_all")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Settings */}
          <div className="flex justify-end">
            <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">
              {t("settings.save_settings")}
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
