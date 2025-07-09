"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function VerifyCodePage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Recupera o email do localStorage
    const email = localStorage.getItem("userEmail") || "";

    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Erro",
          description: data.error || "Falha na verificação",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Verificação concluída!",
        description: "Seu código foi validado com sucesso.",
      });

      router.push("/login");
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

  const handleSendCode = async () => {
    const email = localStorage.getItem("userEmail") || "";
    setIsLoading(true);
    try {
      const res = await fetch("/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Erro ao enviar código",
          description: data.error || "Tente novamente mais tarde.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Código enviado!",
          description: "Verifique seu e-mail.",
        });
      }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verificação de Código</CardTitle>
          <CardDescription className="text-center">Digite o código que você recebeu para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                type="text"
                placeholder="Digite o código"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                maxLength={6}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
              {isLoading ? "Verificando..." : "Verificar"}
            </Button>
            <Button type="button" variant="outline" className="w-full mt-2" onClick={handleSendCode} disabled={isLoading}>
              Reenviar código
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 