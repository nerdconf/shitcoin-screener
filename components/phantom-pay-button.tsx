"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { PublicKey, Transaction, Connection, type ConnectionConfig } from "@solana/web3.js"
import { createTransferCheckedInstruction, getAssociatedTokenAddress } from "@solana/spl-token"
import { useRouter } from "next/navigation"

// Mainnet USDC
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
const MERCHANT_WALLET = new PublicKey("CWFyMUreJAmKqaxCCFFaWN11NYAGQru1L17S9UKRPKM3")
// Update Mainnet URL to use your QuickNode endpoint:
const MAINNET_URL = "https://yolo-indulgent-asphalt.solana-mainnet.quiknode.pro/3389e77f16c04f5ba1313d5e1e431679b86ac4d0"

const connectionConfig: ConnectionConfig = {
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 60000,
  disableRetryOnRateLimit: false,
}

type PhantomProvider = {
  connect: () => Promise<{ publicKey: PublicKey }>
  disconnect: () => Promise<void>
  signAndSendTransaction: (transaction: Transaction) => Promise<{ signature: string }>
  isConnected: boolean
  publicKey: PublicKey
}

type TransactionStatus = "idle" | "processing" | "confirming" | "success" | "error"

export function PhantomPayButton() {
  const router = useRouter()
  const [provider, setProvider] = useState<PhantomProvider | null>(null)
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null)
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const getProvider = useCallback(() => {
    if (typeof window !== "undefined" && "phantom" in window) {
      const provider = (window as any).phantom?.solana
      if (provider?.isPhantom) {
        return provider as PhantomProvider
      }
    }
    return null
  }, [])

  useEffect(() => {
    const provider = getProvider()
    if (provider) setProvider(provider)
  }, [getProvider])

  const connect = useCallback(async () => {
    try {
      if (!provider) return

      const { publicKey } = await provider.connect()
      setPublicKey(publicKey)
      setConnected(true)
      setError(null)
    } catch (error) {
      console.error(error)
      setError("Error al conectar wallet")
    }
  }, [provider])

  const pay = useCallback(async () => {
    if (!publicKey || !provider) return

    setTransactionStatus("processing")
    setError(null)

    try {
      const connection = new Connection(MAINNET_URL, connectionConfig)

      // Get the buyer's and merchant's USDC associated token accounts
      const buyerUsdcAddress = await getAssociatedTokenAddress(USDC_MINT, publicKey)
      const merchantUsdcAddress = await getAssociatedTokenAddress(USDC_MINT, MERCHANT_WALLET)

      // Check if buyer's USDC account exists
      const buyerAccountInfo = await connection.getAccountInfo(buyerUsdcAddress)
      if (!buyerAccountInfo) {
        throw new Error("Buyer USDC token account not found. Please create one using your wallet.")
      }

      // Check if merchant's USDC account exists
      const merchantAccountInfo = await connection.getAccountInfo(merchantUsdcAddress)
      if (!merchantAccountInfo) {
        throw new Error("Merchant USDC token account not found. Ensure the merchant has an associated USDC account.")
      }

      // Create transfer instruction for 1 USDC (6 decimals)
      const transferInstruction = createTransferCheckedInstruction(
        buyerUsdcAddress,
        USDC_MINT,
        merchantUsdcAddress,
        publicKey,
        1_000_000,
        6,
      )

      const blockHashData = await connection.getLatestBlockhash()

      // Create transaction
      const transaction = new Transaction()
      transaction.add(transferInstruction)
      transaction.recentBlockhash = blockHashData.blockhash
      transaction.feePayer = publicKey

      // Simulate transaction to capture logs and errors
      const simulationResult = await connection.simulateTransaction(transaction)
      if (simulationResult.value.err) {
        console.error("Simulation error logs:", simulationResult.value.logs)
        throw new Error("Simulation failed. Revert reason may be visible in logs.")
      }

      setTransactionStatus("confirming")

      // Sign and send transaction using Phantom
      const { signature } = await provider.signAndSendTransaction(transaction)
      console.log("Transaction signature:", signature)

      // Wait for confirmation
      const confirmationResponse = await connection.confirmTransaction({
        signature,
        blockhash: blockHashData.blockhash,
        lastValidBlockHeight: blockHashData.lastValidBlockHeight,
      })

      if (confirmationResponse.value.err) {
        throw new Error("Transaction failed")
      }

      setTransactionStatus("success")
      router.push(`/success?signature=${signature}`)
    } catch (error: any) {
      console.error("Transaction error:", error)
      setTransactionStatus("error")
      setError(error.message || "Error en la transacción. Por favor, intenta de nuevo.")
    }
  }, [publicKey, provider, router])

  const buttonText = {
    idle: "ADQUIRIR - 1 USDC",
    processing: "Iniciando transacción...",
    confirming: "Confirmando transacción...",
    success: "¡Pago exitoso!",
    error: "Error - Intenta de nuevo",
  }

  if (!provider) {
    return (
      <Button
        size="lg"
        className="bg-red-400 hover:bg-red-500 text-white font-bold text-lg px-8 py-6"
        onClick={() => window.open("https://phantom.app/", "_blank")}
      >
        Instalar Phantom Wallet
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    )
  }

  if (!connected) {
    return (
      <Button
        size="lg"
        className="bg-red-400 hover:bg-red-500 text-white font-bold text-lg px-8 py-6"
        onClick={connect}
      >
        Conectar Wallet
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        size="lg"
        className="bg-red-400 hover:bg-red-500 text-white font-bold text-lg px-8 py-6"
        onClick={pay}
        disabled={transactionStatus === "processing" || transactionStatus === "confirming"}
      >
        {buttonText[transactionStatus]}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="text-sm text-gray-500">
        Wallet conectada: {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
      </p>
    </div>
  )
}

