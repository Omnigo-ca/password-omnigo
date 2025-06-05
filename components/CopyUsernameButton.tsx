'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { FaSpinner, FaUserAlt } from 'react-icons/fa'

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
      className="inline-flex items-center px-3 py-2 bg-brand-electric text-brand-black font-medium text-sm rounded-lg hover:bg-brand-electric/80 focus:ring-2 focus:ring-brand-electric focus:ring-offset-2 dark:focus:ring-offset-brand-gray transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full"
      title={hasUsername ? 'Copier le nom d\'utilisateur' : 'Aucun nom d\'utilisateur'}
    >
      {isLoading ? (
        <>
          <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
          Copie...
        </>
      ) : (
        <>
          <FaUserAlt className="w-4 h-4 mr-2" />
          Utilisateur
        </>
      )}
    </button>
  )
} 