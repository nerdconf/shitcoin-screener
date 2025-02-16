"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { PublicKey, Transaction, Connection, type ConnectionConfig } from "@solana/web3.js"
import { createTransferCheckedInstruction, getAssociatedTokenAddress } from "@solana/spl-token"
import { useRouter } from "next/navigation"

// Mainnet USDC
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
const MERCHANT_WALLET = new PublicKey("Cbu156qhqKy2fdfj1MKfKqFFid42zUGdPZN4hwWk34x1")
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
  
  // NEW: stage and clientEmail state
  const [stage, setStage] = useState<"initial" | "email">("initial")
  const [clientEmail, setClientEmail] = useState("")

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
  
  // Modified pay function that passes clientEmail to success page
  const pay = useCallback(async () => {
    if (!publicKey || !provider) return
    setTransactionStatus("processing")
    setError(null)
    try {
      const connection = new Connection(MAINNET_URL, connectionConfig)
      // Get token accounts
      const buyerUsdcAddress = await getAssociatedTokenAddress(USDC_MINT, publicKey)
      const merchantUsdcAddress = await getAssociatedTokenAddress(USDC_MINT, MERCHANT_WALLET)

      // Check token accounts exist
      const buyerAccountInfo = await connection.getAccountInfo(buyerUsdcAddress)
      if (!buyerAccountInfo) {
        throw new Error("Buyer USDC token account not found. Please create one using your wallet.")
      }
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
      const transaction = new Transaction()
      transaction.add(transferInstruction)
      transaction.recentBlockhash = blockHashData.blockhash
      transaction.feePayer = publicKey

      const simulationResult = await connection.simulateTransaction(transaction)
      if (simulationResult.value.err) {
        console.error("Simulation error logs:", simulationResult.value.logs)
        throw new Error("Simulation failed. Revert reason may be visible in logs.")
      }
      setTransactionStatus("confirming")
      const { signature } = await provider.signAndSendTransaction(transaction)
      console.log("Transaction signature:", signature)
      const confirmationResponse = await connection.confirmTransaction({
        signature,
        blockhash: blockHashData.blockhash,
        lastValidBlockHeight: blockHashData.lastValidBlockHeight,
      })
      if (confirmationResponse.value.err) {
        throw new Error("Transaction failed")
      }
      setTransactionStatus("success")
      // Pass clientEmail along with signature
      router.push(`/success?signature=${signature}&email=${clientEmail}`)
    } catch (error: any) {
      console.error("Transaction error:", error)
      setTransactionStatus("error")
      setError(error.message || "Error en la transacción. Por favor, intenta de nuevo.")
    }
  }, [publicKey, provider, router, clientEmail])
  
  // NEW: Render based on stage
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
      {stage === "initial" ? (
        <Button
          size="lg"
          className="bg-red-400 hover:bg-red-500 text-white font-bold text-lg px-8 py-6"
          onClick={() => setStage("email")}
        >
          DESCARGAR
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <input
            type="email"
            placeholder="Ingresa tu email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2"
          />
          <Button
            size="lg"
            className="bg-red-400 hover:bg-red-500 text-white font-bold text-lg px-8 py-6"
            onClick={pay}
            disabled={transactionStatus === "processing" || transactionStatus === "confirming" || !clientEmail}
          >
            BUY: 1 USDC lifetime payment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="text-sm text-gray-500">
        Wallet conectada: {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
      </p>
    </div>
  )
}

