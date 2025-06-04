'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

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
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Copie...
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copier
        </>
      )}
    </button>
  )
} 