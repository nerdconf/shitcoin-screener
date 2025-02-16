"use client"

import { ErrorBoundary } from "react-error-boundary"
import { DebugButton } from "./DebugButton"

function ErrorFallback() {
  return <div className="text-red-500">Something went wrong</div>
}

export function Navbar() {
  return (
    <nav className="border-b border-gray-200 backdrop-blur-md bg-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold">💩 Shitcoin 🔎 Scanner</span>
          </div>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <DebugButton />
          </ErrorBoundary>
        </div>
      </div>
    </nav>
  )
}
