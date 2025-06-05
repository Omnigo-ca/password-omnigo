'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { PasswordCard } from '@/components/PasswordCard'
import { ClientCard } from '@/components/ClientCard'
import { AddPasswordModal } from '@/components/AddPasswordModal'
import { AddClientModal } from '@/components/AddClientModal'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { ServiceSettingsModal } from '@/components/ServiceSettingsModal'

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

interface Service {
  id: string
  name: string
  color?: string
  isCustom: boolean
}

interface Password {
  id: string
  name: string
  username?: string
  url?: string
  userId: string
  clientId?: string
  serviceId?: string
  createdAt: string
  updatedAt: string
  client?: Client
  service?: Service
}

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth()
  const [activeTab, setActiveTab] = useState<'passwords' | 'clients'>('passwords')
  const [passwords, setPasswords] = useState<Password[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showServiceFilters, setShowServiceFilters] = useState(false)

  // Filter passwords based on selected clients and services
  const filteredPasswords = passwords.filter(password => {
    const clientMatch = selectedClientIds.length === 0 || 
      (password.clientId && selectedClientIds.includes(password.clientId))
    const serviceMatch = selectedServiceIds.length === 0 || 
      (password.serviceId && selectedServiceIds.includes(password.serviceId))
    return clientMatch && serviceMatch
  })

  // Function to determine if text should be white based on background color
  const getTextColor = (hexColor?: string) => {
    // Handle undefined, null, or empty color values
    if (!hexColor || typeof hexColor !== 'string') {
      return '#000000' // Default to black text
    }
    
    // Remove # if present
    const color = hexColor.replace('#', '')
    
    // Validate hex color format (should be 6 characters)
    if (color.length !== 6) {
      return '#000000' // Default to black text for invalid colors
    }
    
    // Convert to RGB
    const r = parseInt(color.substr(0, 2), 16)
    const g = parseInt(color.substr(2, 2), 16)
    const b = parseInt(color.substr(4, 2), 16)
    
    // Check for invalid RGB values
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return '#000000' // Default to black text for invalid RGB
    }
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Return white for dark colors, black for light colors
    return luminance < 0.5 ? '#ffffff' : '#000000'
  }

  const toggleClientFilter = (clientId: string) => {
    setSelectedClientIds(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    )
  }

  const toggleServiceFilter = (serviceId: string) => {
    setSelectedServiceIds(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const clearFilters = () => {
    setSelectedClientIds([])
    setSelectedServiceIds([])
  }

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

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/service/list')
      
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()
      setServices(data.services || [])
    } catch (err) {
      console.error('Error fetching services:', err)
      setError('Erreur lors du chargement des services')
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      await Promise.all([fetchPasswords(), fetchClients(), fetchServices()])
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
              Gérez vos mots de passe et compagnies en toute sécurité
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
          <div className="flex items-center justify-between">
            <nav className="flex space-x-2 bg-gray-100 dark:bg-brand-gray/10 border border-brand-gray/20 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('passwords')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                  activeTab === 'passwords'
                    ? 'bg-white dark:bg-brand-gray/10 text-brand-electric shadow-sm'
                    : 'text-brand-gray dark:text-brand-white/70 hover:text-brand-black dark:hover:text-brand-white'
                }`}
              >
                Mots de passe ({filteredPasswords.length})
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                  activeTab === 'clients'
                    ? 'bg-white dark:bg-brand-gray/10 text-brand-electric shadow-sm'
                    : 'text-brand-gray dark:text-brand-white/70 hover:text-brand-black dark:hover:text-brand-white'
                }`}
              >
                Compagnies ({clients.length})
              </button>
            </nav>
            <ServiceSettingsModal />
          </div>
        </div>

        {/* Client Filters - Only show on passwords tab */}
        {activeTab === 'passwords' && clients.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer ${
                  showFilters || selectedClientIds.length > 0
                    ? 'bg-brand-electric text-brand-black border-brand-electric'
                    : 'bg-white dark:bg-brand-gray/10 text-brand-gray dark:text-brand-white border-brand-gray/20 dark:border-brand-white/20 hover:border-brand-electric'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                Filtrer par compagnie
              </button>

              {/* Sliding Filter Pills */}
              <div className={`flex items-center space-x-2 transition-all duration-300 overflow-hidden ${
                showFilters ? 'max-w-full opacity-100' : 'max-w-0 opacity-0'
              }`}>
                {/* Client Filter Pills */}
                {clients.map((client, index) => {
                  const isSelected = selectedClientIds.includes(client.id)
                  return (
                    <button
                      key={client.id}
                      onClick={() => toggleClientFilter(client.id)}
                      className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-all duration-300 whitespace-nowrap ${
                        isSelected
                          ? 'shadow-sm'
                          : 'opacity-50 hover:opacity-75'
                      }`}
                      style={{
                        backgroundColor: client.color,
                        color: getTextColor(client.color),
                        transform: showFilters ? 'translateX(0)' : 'translateX(-100px)',
                        opacity: showFilters ? (isSelected ? 1 : 0.5) : 0,
                        transitionDelay: showFilters ? `${index * 100}ms` : '0ms'
                      }}
                      title={`Filtrer par ${client.name}`}
                    >
                      {client.name}
                      {isSelected && (
                        <svg className="w-3 h-3 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Clear Filters Button - Outside sliding container */}
              {(selectedClientIds.length > 0 || selectedServiceIds.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-brand-gray dark:text-brand-white/70 bg-gray-100 dark:bg-brand-gray/20 hover:bg-gray-200 dark:hover:bg-brand-gray/30 rounded-full transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Effacer
                </button>
              )}
            </div>
          </div>
        )}

        {/* Service Filters - Only show on passwords tab */}
        {activeTab === 'passwords' && services.length > 0 && (
          <div className="mb-6 -mt-3">
            <div className="flex items-center space-x-4">
              {/* Service Filter Toggle Button */}
              <button
                onClick={() => setShowServiceFilters(!showServiceFilters)}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer ${
                  showServiceFilters || selectedServiceIds.length > 0
                    ? 'bg-brand-electric text-brand-black border-brand-electric'
                    : 'bg-white dark:bg-brand-gray/10 text-brand-gray dark:text-brand-white border-brand-gray/20 dark:border-brand-white/20 hover:border-brand-electric'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                Filtrer par service
              </button>

              {/* Sliding Service Filter Pills */}
              <div className={`flex items-center space-x-2 transition-all duration-300 overflow-hidden ${
                showServiceFilters ? 'max-w-full opacity-100' : 'max-w-0 opacity-0'
              }`}>
                {/* Service Filter Pills */}
                {services.map((service, index) => {
                  const isSelected = selectedServiceIds.includes(service.id)
                  return (
                    <button
                      key={service.id}
                      onClick={() => toggleServiceFilter(service.id)}
                      className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-all duration-300 whitespace-nowrap ${
                        isSelected
                          ? 'shadow-sm'
                          : 'opacity-50 hover:opacity-75'
                      }`}
                      style={{
                        backgroundColor: service.color || '#4ECDC4',
                        color: getTextColor(service.color || '#4ECDC4'),
                        transform: showServiceFilters ? 'translateX(0)' : 'translateX(-100px)',
                        opacity: showServiceFilters ? (isSelected ? 1 : 0.5) : 0,
                        transitionDelay: showServiceFilters ? `${index * 100}ms` : '0ms'
                      }}
                      title={`Filtrer par ${service.name}`}
                    >
                      {service.name}
                      {isSelected && (
                        <svg className="w-3 h-3 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

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
            {filteredPasswords.length === 0 ? (
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
                {selectedClientIds.length > 0 ? (
                  <>
                    <h3 className="text-lg font-medium text-brand-gray dark:text-brand-white/70 mb-2">
                      Aucun mot de passe trouvé
                    </h3>
                    <p className="text-brand-gray dark:text-brand-white/50 mb-4">
                      Aucun mot de passe ne correspond aux filtres sélectionnés
                    </p>
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 bg-brand-electric text-brand-black font-medium text-sm rounded-lg hover:bg-brand-electric/80 transition-all duration-200 cursor-pointer"
                    >
                      Effacer les filtres
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-brand-gray dark:text-brand-white/70 mb-2">
                      Aucun mot de passe
                    </h3>
                    <p className="text-brand-gray dark:text-brand-white/50 mb-4">
                      Commencez par ajouter votre premier mot de passe
                    </p>
                    <AddPasswordModal onPasswordAdded={handlePasswordAdded} />
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPasswords.map((password) => (
                  <PasswordCard 
                    key={password.id} 
                    password={password} 
                    allPasswords={filteredPasswords}
                    onPasswordDeleted={handlePasswordDeleted}
                    onPasswordUpdated={handlePasswordUpdated}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Compagnies Tab */}
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
                  Aucune compagnie
                </h3>
                <p className="text-brand-gray dark:text-brand-white/50 mb-4">
                  Commencez par ajouter votre première compagnie
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