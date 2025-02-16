import { Clock, Search, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PhantomPayButton } from "@/components/phantom-pay-button"
import { Navbar } from "@/components/Navbar" // Updated import

// Removed "use client" so that this remains a Server Component
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            💩 Shitcoin{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-400">🔎 Scanner</span>
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-gray-600 max-w-3xl mx-auto">
            When you see a Solana CA, you can see details in real time without leaving X.
            <span className="text-red-400"> Time is money boy.</span>
          </p>
          <PhantomPayButton />
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/50 border-gray-200 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <Search className="h-12 w-12 mb-4 text-red-400" />
              <h3 className="text-xl font-bold mb-2">Detección Automática</h3>
              <p className="text-gray-600">
                Escanea y detecta automáticamente direcciones de Solana en X.com, resaltándolas para fácil identificación.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 border-gray-200 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <Zap className="h-12 w-12 mb-4 text-red-400" />
              <h3 className="text-xl font-bold mb-2">Datos en Tiempo Real</h3>
              <p className="text-gray-600">
                Obtén información instantánea de precios y gráficos sin salir de la plataforma.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 border-gray-200 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <Clock className="h-12 w-12 mb-4 text-red-400" />
              <h3 className="text-xl font-bold mb-2">Historial de 4 Horas</h3>
              <p className="text-gray-600">
                Visualiza gráficos de precios con velas de 15 minutos para las últimas 4 horas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

