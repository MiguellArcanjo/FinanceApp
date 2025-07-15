"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { CheckedState } from "@radix-ui/react-checkbox"
import { TrendingUp, Eye, EyeOff, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function LoginPage() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    localStorage.setItem("theme", "light");
    // Não mexa em themeBackup aqui!

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const isAuthenticated = localStorage.getItem("isAuthenticated") || sessionStorage.getItem("isAuthenticated");

    if (token && isAuthenticated === "true") {
      fetch("/api/validate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            router.replace("/dashboard");
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("isAuthenticated");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("isAuthenticated");
          }
        });
    }
  }, []);
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  // Remover o estado rememberMe
  // const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Erro",
          description: data.error || "Falha no login",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Sempre salve no localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("isAuthenticated", "true");

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-900">Organizze</span>
          </div>
        </div>

        <Card className="border-blue-100 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-blue-900">Entrar na sua conta</CardTitle>
            <CardDescription className="text-gray-600">Digite suas credenciais para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-900">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-blue-200 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-blue-900">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-blue-200 focus:border-blue-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remover o bloco do checkbox 'Lembrar de mim' */}
                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked: CheckedState) => setRememberMe(checked === true)} />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Lembrar de mim
                    </Label>
                  </div>
                  <button type="button" className="text-sm text-blue-600 hover:text-blue-700" onClick={() => setShowResetDialog(true)}>
                    Esqueceu a senha?
                  </button>
                </div> */}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <span className="text-gray-600">Não tem uma conta? </span>
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Criar conta
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir senha</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setResetLoading(true);
              try {
                const res = await fetch("/api/send-reset-link", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: resetEmail })
                });
                if (res.ok) {
                  toast({ title: "Link enviado!", description: "Enviamos um link para redefinir sua senha. Verifique seu e-mail." });
                  setShowResetDialog(false);
                  setResetEmail("");
                } else {
                  const data = await res.json();
                  toast({ title: "Erro", description: data.error || "Não foi possível enviar o link.", variant: "destructive" });
                }
              } finally {
                setResetLoading(false);
              }
            }}
            className="space-y-4"
          >
            <Label htmlFor="reset-email">E-mail</Label>
            <Input id="reset-email" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required autoFocus />
            <Button type="submit" className="w-full" disabled={resetLoading}>
              {resetLoading ? "Enviando..." : "Enviar link de redefinição"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 