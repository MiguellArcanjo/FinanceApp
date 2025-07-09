"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { TrendingUp, Eye, EyeOff, Shield, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const router = useRouter()
  const { toast } = useToast()

  const passwordRequirements = [
    { text: "Pelo menos 8 caracteres", met: formData.password.length >= 8 },
    { text: "Uma letra maiúscula", met: /[A-Z]/.test(formData.password) },
    { text: "Uma letra minúscula", met: /[a-z]/.test(formData.password) },
    { text: "Um número", met: /\d/.test(formData.password) },
    { text: "Um caractere especial", met: /[!@#$%^&*]/.test(formData.password) },
  ]

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simular registro
    setTimeout(() => {
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", formData.email)
      localStorage.setItem("userName", formData.name)
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao FinanceControl!",
      })
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-900">FinanceControl</span>
          </Link>
        </div>

        <Card className="border-blue-100 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-blue-900">Criar sua conta</CardTitle>
            <CardDescription className="text-gray-600">Comece a controlar suas finanças gratuitamente</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-blue-900">
                    Nome completo
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-blue-200 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-900">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      placeholder="Crie uma senha forte"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                  {formData.password && (
                    <div className="space-y-1 mt-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          <Check className={`w-3 h-3 ${req.met ? "text-green-500" : "text-gray-300"}`} />
                          <span className={req.met ? "text-green-600" : "text-gray-500"}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-blue-900">
                    Confirmar senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="border-blue-200 focus:border-blue-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500">As senhas não coincidem</p>
                  )}
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" className="mt-1" />
                  <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                    Eu concordo com os{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                      Termos de Uso
                    </Link>{" "}
                    e{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                      Política de Privacidade
                    </Link>
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                disabled={isLoading}
              >
                {isLoading ? "Criando conta..." : "Criar Conta Gratuita"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <span className="text-gray-600">Já tem uma conta? </span>
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Fazer login
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mt-6">
              <Shield className="w-4 h-4" />
              <span>Seus dados estão protegidos com criptografia bancária</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
