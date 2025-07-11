"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, Eye, EyeOff, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const BENEFICIOS = [
  "Acesso total ao sistema",
  "Dashboard, Metas, Análises e mais",
  "Suporte prioritário",
  "Cancelamento a qualquer momento"
];

const PLANOS = [
  {
    id: "pro",
    nome: "Anual",
    valor: 192,
    descricao: "Cobrança anual com desconto.",
    detalhes: BENEFICIOS
  },
  {
    id: "lite",
    nome: "Mensal",
    valor: 29,
    descricao: "Cobrança mensal flexível.",
    detalhes: BENEFICIOS
  }
];

export default function RegisterPage() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }, []);
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [registrationReady, setRegistrationReady] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState(PLANOS[0]);

  const passwordRequirements = [
    { text: "Pelo menos 8 caracteres", met: formData.password.length >= 8 },
    { text: "Uma letra maiúscula", met: /[A-Z]/.test(formData.password) },
    { text: "Uma letra minúscula", met: /[a-z]/.test(formData.password) },
    { text: "Um número", met: /\d/.test(formData.password) },
    { text: "Um caractere especial", met: /[!@#$%^&*]/.test(formData.password) },
  ]

  // Integração Stripe (apenas plano mensal)
  const handlePayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    const res = await fetch("/api/create-stripe-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        plano: selectedPlan.id === "pro" ? "anual" : "mensal",
        }),
      });
      const data = await res.json();
        setIsLoading(false);
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast({
        title: "Erro ao iniciar pagamento",
        description: data.error || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }

  // Remover o handleRegister e o botão de finalizar cadastro
  // O formulário só terá o botão de pagamento

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
          {/* Card de Registro */}
          <div className="flex-1">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
                <span className="text-2xl font-bold text-blue-900">Organizze</span>
          </Link>
        </div>
        <Card className="border-blue-100 shadow-xl">
              <CardHeader className="space-y-1 text-left">
            <CardTitle className="text-2xl font-bold text-blue-900">Criar sua conta</CardTitle>
                <CardDescription className="text-gray-600">Preencha seus dados para iniciar a assinatura</CardDescription>
          </CardHeader>
          <CardContent>
                <form onSubmit={handlePayment} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                      <Label htmlFor="name" className="text-blue-900 font-semibold">Nome completo</Label>
                      <Input id="name" type="text" placeholder="Seu nome completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="border-blue-200 focus:border-blue-500" required />
                </div>
                <div className="space-y-2">
                      <Label htmlFor="email" className="text-blue-900 font-semibold">Email</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="border-blue-200 focus:border-blue-500" required />
                </div>
                <div className="space-y-2">
                      <Label htmlFor="password" className="text-blue-900 font-semibold">Senha</Label>
                  <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} placeholder="Crie uma senha forte" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="border-blue-200 focus:border-blue-500 pr-10" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600">
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
                      <Label htmlFor="confirmPassword" className="text-blue-900 font-semibold">Confirmar senha</Label>
                  <div className="relative">
                        <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirme sua senha" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="border-blue-200 focus:border-blue-500 pr-10" required />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500">As senhas não coincidem</p>
                  )}
                </div>
              </div>
                  {/* O botão de submit do formulário foi removido */}
            </form>
            <div className="text-center mt-6">
              <span className="text-gray-600">Já tem uma conta? </span>
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Fazer login</Link>
            </div>
          </CardContent>
        </Card>
          </div>
          {/* Card do Plano */}
          <div className="w-full md:w-[350px] flex-shrink-0">
            <Card className="border-blue-100 shadow-xl sticky top-8">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold text-blue-900">Escolha seu plano</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 mb-4">
                  {PLANOS.map((plano) => (
                    <button
                      key={plano.id}
                      type="button"
                      className={`w-full border rounded-lg px-4 py-3 text-left transition-colors ${selectedPlan.id === plano.id ? "border-blue-600 bg-blue-50" : "border-blue-100 hover:border-blue-300"}`}
                      onClick={() => setSelectedPlan(plano)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-blue-900">{plano.nome}</span>
                        <span className="text-blue-700 font-bold">R$ {plano.valor}{plano.id === "pro" ? "/ano" : "/mês"}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{plano.descricao}</div>
                    </button>
                  ))}
                </div>
                <ul className="text-sm text-gray-700 mt-2 mb-4 list-disc list-inside text-left">
                  {selectedPlan.detalhes.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <Button
                  onClick={handlePayment}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 mb-2"
                  type="button"
                  disabled={isLoading}
                >
                  Cadastrar e Realizar Pagamento
                </Button>
                <span className="block text-xs text-gray-500 text-center">O cadastro só será concluído após a confirmação do pagamento.</span>
              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  )
} 