"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function Success({ searchParams }: { searchParams: { signature?: string, email?: string }}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">¡Pago exitoso!</h1>
      <p className="mb-2">Transaction signature: {searchParams.signature}</p>
      <p className="text-lg">
        We sent you the extension link to {searchParams.email || "tu email"}.
      </p>
    </div>
  )
}

