'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { FaShieldAlt, FaSpinner } from "react-icons/fa";

interface CopyButtonProps {
  passwordId: string
}

export function CopyButton({ passwordId }: CopyButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCopy = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/password/copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: passwordId }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la copie', {
          style: {
            background: '#ef4444',
            color: '#ffffff',
            fontFamily: 'Meutas, sans-serif',
            fontWeight: '500',
          },
        })
        return
      }

      const data = await response.json()
      
      // Copy to clipboard
      await navigator.clipboard.writeText(data.plaintext)
      
      toast.success(`Mot de passe copié!`, {
        style: {
          background: '#7DF9FF',
          color: '#000000',
          fontFamily: 'Meutas, sans-serif',
          fontWeight: '500',
        },
      })

    } catch (error) {
      console.error('Error copying password:', error)
      toast.error('Erreur lors de la copie', {
        style: {
          background: '#ef4444',
          color: '#ffffff',
          fontFamily: 'Meutas, sans-serif',
          fontWeight: '500',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleCopy}
      disabled={isLoading}
      className="inline-flex items-center px-3 py-2 bg-brand-electric text-brand-black font-medium text-sm rounded-lg hover:bg-brand-electric/80 focus:ring-2 focus:ring-brand-electric focus:ring-offset-2 dark:focus:ring-offset-brand-gray transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
          Copie...
        </>
      ) : (
        <>
          <FaShieldAlt className="w-4 h-4 mr-2" />
          Mot de passe
        </>
      )}
    </button>
  )
} 