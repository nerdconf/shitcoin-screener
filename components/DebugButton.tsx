"use client"

import { useState } from "react"

export function DebugButton() {
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    try {
      console.log("Debug button clicked")
      setIsClicked(true)
    } catch (error) {
      console.error("Error in debug button:", error)
    }
  }

  return (
    <button 
      onClick={handleClick} 
      className={`text-red-400 hover:text-red-500 ${isClicked ? 'opacity-50' : ''}`}
      type="button"
    >
      Debug
    </button>
  )
}
