"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const signature = searchParams.get("signature")

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center space-y-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-900">¡Pago Exitoso!</h1>
        <p className="text-gray-600">Tu transacción se ha completado correctamente.</p>
        {signature && (
          <div className="bg-gray-50 p-4 rounded-md break-all">
            <p className="text-sm text-gray-500 mb-2">ID de Transacción:</p>
            <a
              href={`https://solscan.io/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              {signature}
            </a>
          </div>
        )}
        <Button asChild className="bg-red-400 hover:bg-red-500">
          <Link href="/">Volver al Inicio</Link>
        </Button>
      </div>
    </div>
  )
}

