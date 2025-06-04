'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface CopyUsernameButtonProps {
  passwordId: string
  hasUsername: boolean
}

export function CopyUsernameButton({ passwordId, hasUsername }: CopyUsernameButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCopy = async () => {
    if (!hasUsername) {
      toast.error('Aucun nom d\'utilisateur disponible', {
        style: {
          background: '#ef4444',
          color: '#ffffff',
          fontFamily: 'Meutas, sans-serif',
          fontWeight: '500',
        },
      })
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/password/copy-username', {
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
      await navigator.clipboard.writeText(data.username)
      
      toast.success('Nom d\'utilisateur copié!', {
        style: {
          background: '#7DF9FF',
          color: '#000000',
          fontFamily: 'Meutas, sans-serif',
          fontWeight: '500',
        },
      })

    } catch (error) {
      console.error('Error copying username:', error)
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
      disabled={isLoading || !hasUsername}
      className="inline-flex items-center px-3 py-2 bg-blue-500 text-white font-medium text-sm rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-brand-gray transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title={hasUsername ? 'Copier le nom d\'utilisateur' : 'Aucun nom d\'utilisateur'}
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Utilisateur
        </>
      )}
    </button>
  )
} 