"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, TrendingUp, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

const funcionalidades = [
  "Dashboard financeiro completo",
  "Gestão de transações",
  "Gestão de contas",
  "Definição de metas",
  "Análises e relatórios",
  "Configurações personalizadas",
  "Login seguro",
  "Cadastro rápido",
  "Perfil do usuário"
]

export default function PlanosPage() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }, []);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="bg-white/95 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-900">Organizze</span>
            </div>
            {/* Menu Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className={`${pathname === "/" ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600 transition-colors"}`}>Início</Link>
              <Link href="/planos" className={`${pathname === "/planos" ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600 transition-colors"}`}>Planos</Link>
              <Link href="/register" className="bg-blue-600 text-white font-semibold rounded-xl px-6 py-2 hover:bg-blue-700 transition-colors">Entrar</Link>
            </nav>
            {/* Menu Mobile */}
            <button className="md:hidden p-2 rounded-lg hover:bg-blue-50" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="w-6 h-6 text-blue-600" />
            </button>
          </div>
          {/* Drawer Mobile */}
          {mobileMenuOpen && (
            <>
              <div className="fixed inset-y-0 right-0 z-[100] flex">
                <div className="w-[80vw] max-w-[200px] h-[300px] max-h-screen bg-white shadow-2xl rounded-l-2xl flex flex-col relative px-4 overflow-y-auto">
                  <button
                    className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-blue-600 z-10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    &times;
                  </button>
                  <div className="flex-1 flex flex-col justify-start items-center mt-20">
                    <nav className="flex flex-col w-full gap-6">
                      <Link
                        href="/"
                        className={`text-xl font-medium w-full text-center py-2 rounded ${
                          pathname === "/" ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Início
                      </Link>
                      <Link
                        href="/planos"
                        className={`text-xl font-medium w-full text-center py-2 rounded ${
                          pathname === "/planos" ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Planos
                      </Link>
                      <Link
                        href="/register"
                        className="text-xl font-semibold w-full text-center bg-blue-600 text-white rounded-xl px-6 py-3 hover:bg-blue-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Entrar
                      </Link>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </header>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-blue-900 mb-4">Escolha o plano ideal para você</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Todos os recursos do sistema disponíveis em qualquer plano. Escolha a melhor forma de pagamento para você.</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            {/* Plano Mensal */}
            <Card className="w-full max-w-md border-blue-100 hover:border-blue-300 transition-colors shadow-md">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Plano Mensal</h2>
                <div className="text-4xl font-extrabold text-blue-600 mb-2">R$ 29<span className="text-lg font-normal">/mês</span></div>
                <div className="text-gray-500 mb-6">Acesso total a todas as funcionalidades</div>
                <ul className="space-y-3 mb-8 text-left">
                  {funcionalidades.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700"><CheckCircle className="w-5 h-5 text-green-500" /> {f}</li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Assinar Mensal</Button>
                </Link>
              </CardContent>
            </Card>
            {/* Plano Anual */}
            <Card className="w-full max-w-md border-blue-600 border-2 shadow-lg">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Plano Anual</h2>
                <div className="text-4xl font-extrabold text-blue-600 mb-2">R$ 15<span className="text-lg font-normal">/mês</span></div>
                <div className="text-blue-600 font-semibold mb-6">Melhor opção</div>
                <ul className="space-y-3 mb-8 text-left">
                  {funcionalidades.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700"><CheckCircle className="w-5 h-5 text-green-500" /> {f}</li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Assinar Anual</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
} 