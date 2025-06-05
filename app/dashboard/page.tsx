'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { PasswordCard } from '@/components/PasswordCard'
import { ClientCard } from '@/components/ClientCard'
import { AddPasswordModal } from '@/components/AddPasswordModal'
import { AddClientModal } from '@/components/AddClientModal'
import { DarkModeToggle } from '@/components/DarkModeToggle'

interface Client {
  id: string
  name: string
  website?: string
  color: string
  createdAt: string
  updatedAt: string
  _count: {
    passwords: number
  }
}

interface Password {
  id: string
  name: string
  username?: string
  url?: string
  userId: string
  clientId?: string
  createdAt: string
  updatedAt: string
  client?: Client
}

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth()
  const [activeTab, setActiveTab] = useState<'passwords' | 'clients'>('passwords')
  const [passwords, setPasswords] = useState<Password[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPasswords = async () => {
    try {
      const response = await fetch('/api/password/list')
      
      if (!response.ok) {
        throw new Error('Failed to fetch passwords')
      }

      const data = await response.json()
      setPasswords(data.passwords || [])
    } catch (err) {
      console.error('Error fetching passwords:', err)
      setError('Erreur lors du chargement des mots de passe')
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/client/list')
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }

      const data = await response.json()
      setClients(data.clients || [])
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError('Erreur lors du chargement des clients')
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      await Promise.all([fetchPasswords(), fetchClients()])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && userId) {
      fetchData()
    }
  }, [isLoaded, userId, fetchData])

  const handlePasswordAdded = () => {
    fetchPasswords()
  }

  const handleClientAdded = () => {
    fetchClients()
  }

  const handlePasswordDeleted = () => {
    fetchPasswords()
  }

  const handlePasswordUpdated = () => {
    fetchPasswords()
  }

  const handleClientDeleted = () => {
    fetchClients()
  }

  const handleClientUpdated = () => {
    fetchClients()
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-brand-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-electric"></div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-white dark:bg-brand-black flex items-center justify-center">
        <p className="text-brand-gray dark:text-brand-white">Veuillez vous connecter</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-black dark:text-brand-white mb-2">
              Gestionnaire de Mots de Passe
            </h1>
            <p className="text-brand-gray dark:text-brand-white/70">
              Gérez vos mots de passe et clients en toute sécurité
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {activeTab === 'passwords' ? (
              <AddPasswordModal onPasswordAdded={handlePasswordAdded} />
            ) : (
              <AddClientModal onClientAdded={handleClientAdded} />
            )}
            <DarkModeToggle />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-2 bg-gray-100 dark:bg-brand-gray/10 border border-brand-gray/20 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('passwords')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                activeTab === 'passwords'
                  ? 'bg-white dark:bg-brand-gray/10 text-brand-electric shadow-sm'
                  : 'text-brand-gray dark:text-brand-white/70 hover:text-brand-black dark:hover:text-brand-white'
              }`}
            >
              Mots de passe ({passwords.length})
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-white dark:bg-brand-gray/10 text-brand-electric shadow-sm'
                  : 'text-brand-gray dark:text-brand-white/70 hover:text-brand-black dark:hover:text-brand-white'
              }`}
            >
              Clients ({clients.length})
            </button>
          </nav>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Content with fade transition */}
        <div className="relative">
          {/* Passwords Tab */}
          <div className={`transition-opacity duration-300 ${activeTab === 'passwords' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
            {passwords.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-brand-gray dark:text-brand-white/50 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-brand-gray dark:text-brand-white/70 mb-2">
                  Aucun mot de passe
                </h3>
                <p className="text-brand-gray dark:text-brand-white/50 mb-4">
                  Commencez par ajouter votre premier mot de passe
                </p>
                <AddPasswordModal onPasswordAdded={handlePasswordAdded} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {passwords.map((password) => (
                  <PasswordCard 
                    key={password.id} 
                    password={password} 
                    onPasswordDeleted={handlePasswordDeleted}
                    onPasswordUpdated={handlePasswordUpdated}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Clients Tab */}
          <div className={`transition-opacity duration-300 ${activeTab === 'clients' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-brand-gray dark:text-brand-white/50 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="text-lg font-medium text-brand-gray dark:text-brand-white/70 mb-2">
                  Aucun client
                </h3>
                <p className="text-brand-gray dark:text-brand-white/50 mb-4">
                  Commencez par ajouter votre premier client
                </p>
                <AddClientModal onClientAdded={handleClientAdded} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                  <ClientCard 
                    key={client.id} 
                    client={client} 
                    onClientDeleted={handleClientDeleted}
                    onClientUpdated={handleClientUpdated}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 