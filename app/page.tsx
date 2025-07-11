"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, TrendingUp, Shield, BarChart3, Target, PieChart, TrendingDown, Menu } from "lucide-react"
import { useState } from "react"

export default function HomePage() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
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
          {/* Menu Mobile */}
            {mobileMenuOpen && (
              <>
                {/* Drawer lateral */}
                <div className="fixed inset-y-0 right-0 z-[100] flex">
                  <div className="w-[80vw] max-w-[200px] h-[300px] max-h-screen bg-white shadow-2xl rounded-l-2xl flex flex-col relative px-4 overflow-y-auto">
                    {/* Botão de fechar */}
                    <button
                      className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-blue-600 z-10"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      &times;
                    </button>

                    {/* Conteúdo do menu */}
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

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-400/5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl lg:text-6xl font-bold text-blue-900 leading-tight">
                Uma solução de <span className="text-blue-600">controle financeiro</span> na palma da sua mão.
              </h1>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-lg text-gray-700">Controle total das suas finanças em tempo real</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-lg text-gray-700">Análises inteligentes e comparativo de gastos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-lg text-gray-700">Planejamento de metas financeiras</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/planos">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                    Começar Agora
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg bg-transparent"
                  >
                    Ver Demonstração
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-blue-900">Dashboard Financeiro</h3>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    <Card className="border border-blue-200 rounded-xl">
                      <CardContent className="p-6 flex justify-between items-center h-full">
                        <div>
                          <div className="text-sm text-blue-600 font-medium mb-1">Saldo do mês</div>
                          <div className="text-2xl font-bold text-blue-700">R$ 110,00</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-center">
                          <span className="text-blue-400 text-xl font-bold">$</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-green-200 rounded-xl">
                      <CardContent className="p-6 flex justify-between items-center h-full">
                        <div>
                          <div className="text-sm text-green-600 font-medium mb-1">Receitas</div>
                          <div className="text-2xl font-bold text-green-700">R$ 200,00</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-red-200 rounded-xl">
                      <CardContent className="p-6 flex justify-between items-center h-full">
                        <div>
                          <div className="text-sm text-red-600 font-medium mb-1">Despesas</div>
                          <div className="text-2xl font-bold text-red-700">R$ 90,00</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 flex items-center justify-center">
                          <TrendingDown className="w-6 h-6 text-red-400" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-purple-200 rounded-xl">
                      <CardContent className="p-6 flex justify-between items-center h-full">
                        <div>
                          <div className="text-sm text-purple-600 font-medium mb-1">Metas</div>
                          <div className="text-2xl font-bold text-purple-700">4</div>
                          <div className="text-xs text-purple-400">Ativas</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 flex items-center justify-center">
                          <Target className="w-6 h-6 text-purple-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-4">
              Organizze, o controle financeiro da nova geração
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Veja como nossa plataforma pode revolucionar a gestão das suas finanças pessoais
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-blue-100 hover:border-blue-300 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Dashboard Inteligente</h3>
                <p className="text-gray-600">Visualize todas suas finanças em tempo real com gráficos interativos</p>
              </CardContent>
            </Card>

            <Card className="border-blue-100 hover:border-blue-300 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Metas e Objetivos</h3>
                <p className="text-gray-600">Defina metas financeiras e acompanhe seu progresso automaticamente</p>
              </CardContent>
            </Card>

            <Card className="border-blue-100 hover:border-blue-300 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <PieChart className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Análises Avançadas</h3>
                <p className="text-gray-600">Relatórios detalhados com insights</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Pronto para transformar suas finanças?</h2>
          <Link href="/planos">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-bold">
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4 flex justify-center flex-col">
          <div className="text-center text-blue-200">
            <p>&copy; 2025 Organizze. Todos os direitos reservados.</p>
          </div>
      </div>
      </footer>
    </div>
  )
}
