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
import { useThemeContext } from "@/components/theme-client-provider";
import { useTheme } from "next-themes"
import { Header } from "@/components/header"
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Função para trocar o tema (apenas atualiza o estado local)
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setSettings((prev) => ({
      ...prev,
      display: { ...prev.display, theme: newTheme },
    }));
    localStorage.setItem("theme", newTheme);
    // Não chama setTheme aqui!
  };
  // Função para salvar configurações
  const saveSettings = () => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
    localStorage.setItem("theme", settings.display.theme);
    localStorage.setItem("themeBackup", settings.display.theme);
    setTheme(settings.display.theme);
    i18n.changeLanguage(settings.display.language); // Adiciona troca de idioma
    toast({ title: t("settings.saved_success") });
  };

  const clearAllData = async () => {
    setShowPasswordModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const email = localStorage.getItem("userEmail") || "";
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      // Apaga dados do backend
      await fetch("/api/delete-user-data", {
        method: "DELETE",
        headers: { "x-user-email": email }
      });
      // Apaga apenas os dados do usuário, não o usuário
      localStorage.removeItem("transactions");
      localStorage.removeItem("goals");
      localStorage.removeItem("bankAccounts");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("notifications");
      localStorage.removeItem("appSettings");
      setShowPasswordModal(false);
      setPassword("");
      toast({
        title: t("settings.data_cleared"),
        description: t("settings.all_data_removed"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("erro"),
        description: t("Senha incorreta. Tente novamente."),
        variant: "destructive",
      });
    }
    setIsDeleting(false);
  };

  // Função para salvar configurações
  const handleSaveSettings = async () => {
    await fetch("/api/user/theme", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": localStorage.getItem("userId") || ""
      },
      body: JSON.stringify({ theme: settings.display.theme })
    });
    setTheme(settings.display.theme);
    toast({ title: "Configurações salvas com sucesso!" });
  };

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
      <div className="lg:ml-64">
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
                      handleThemeChange(value);
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
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Confirme sua senha para apagar os dados")}</DialogTitle>
          </DialogHeader>
          <Input
            type="password"
            placeholder={t("Digite sua senha")}
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isDeleting}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPasswordModal(false)} disabled={isDeleting}>{t("cancelar")}</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting || !password}>{isDeleting ? t("carregando") : t("Confirmar e Apagar")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
