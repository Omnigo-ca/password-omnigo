'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const addPasswordSchema = z.object({
  username: z.string().optional(),
  url: z.string().url('URL invalide').optional().or(z.literal('')),
  plaintext: z.string().min(1, 'Le mot de passe est requis'),
  clientId: z.string().min(1, 'La compagnie est requise'),
  serviceId: z.string().min(1, 'Le service est requis'),
  customServiceName: z.string().optional(),
})

type AddPasswordForm = z.infer<typeof addPasswordSchema>

interface Client {
  id: string
  name: string
  website?: string
}

interface Service {
  id: string
  name: string
  color?: string
  isCustom: boolean
}

interface AddPasswordModalProps {
  onPasswordAdded?: () => void
}

export function AddPasswordModal({ onPasswordAdded }: AddPasswordModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [loadingServices, setLoadingServices] = useState(false)
  const [showCustomService, setShowCustomService] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AddPasswordForm>({
    resolver: zodResolver(addPasswordSchema),
  })

  const selectedServiceId = watch('serviceId')
  const selectedClientId = watch('clientId')

  // Get selected client and service names for display
  const selectedClient = clients.find(c => c.id === selectedClientId)
  const selectedService = services.find(s => s.id === selectedServiceId)

  // Fetch clients when modal opens
  const fetchClients = async () => {
    try {
      setLoadingClients(true)
      const response = await fetch('/api/client/list')
      
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoadingClients(false)
    }
  }

  // Fetch services when modal opens
  const fetchServices = async () => {
    try {
      setLoadingServices(true)
      const response = await fetch('/api/service/list')
      
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoadingServices(false)
    }
  }

  // Watch for service selection changes
  useEffect(() => {
    setShowCustomService(selectedServiceId === 'custom')
  }, [selectedServiceId])

  // Handle modal focus and body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      fetchClients()
      fetchServices()
      // Focus the first input when modal opens
      setTimeout(() => {
        const firstInput = document.getElementById('clientId')
        if (firstInput) {
          firstInput.focus()
        }
      }, 100)
    } else {
      document.body.style.overflow = 'unset'
      setShowCustomService(false)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const onSubmit = async (data: AddPasswordForm) => {
    setIsSubmitting(true)
    
    try {
      let finalServiceId = data.serviceId
      let serviceName = selectedService?.name || ''

      // If custom service is selected, create it first
      if (data.serviceId === 'custom' && data.customServiceName) {
        const serviceResponse = await fetch('/api/service/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.customServiceName,
            color: '#4ECDC4', // Default teal color for custom services
          }),
        })

        if (serviceResponse.ok) {
          const serviceData = await serviceResponse.json()
          finalServiceId = serviceData.service.id
          serviceName = data.customServiceName
        } else {
          const serviceError = await serviceResponse.json()
          toast.error(serviceError.error || 'Erreur lors de la création du service', {
            style: {
              background: '#ef4444',
              color: '#ffffff',
              fontFamily: 'Meutas, sans-serif',
              fontWeight: '500',
            },
          })
          return
        }
      }

      // Generate password name: "Service - Compagnie"
      const clientName = selectedClient?.name || ''
      const generatedName = `${serviceName} - ${clientName}`

      // Create the password with the generated name
      const passwordData = {
        name: generatedName,
        username: data.username,
        url: data.url,
        plaintext: data.plaintext,
        clientId: data.clientId,
        serviceId: finalServiceId === 'custom' ? undefined : finalServiceId,
      }

      const response = await fetch('/api/password/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création', {
          style: {
            background: '#ef4444',
            color: '#ffffff',
            fontFamily: 'Meutas, sans-serif',
            fontWeight: '500',
          },
        })
        return
      }

      toast.success('Mot de passe créé avec succès!', {
        style: {
          background: '#7DF9FF',
          color: '#000000',
          fontFamily: 'Meutas, sans-serif',
          fontWeight: '500',
        },
      })

      reset()
      setIsOpen(false)
      
      // Call the callback to refresh the password list
      if (onPasswordAdded) {
        onPasswordAdded()
      }

    } catch (error) {
      console.error('Error creating password:', error)
      toast.error('Erreur lors de la création', {
        style: {
          background: '#ef4444',
          color: '#ffffff',
          fontFamily: 'Meutas, sans-serif',
          fontWeight: '500',
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false)
      reset()
    }
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        if (!isSubmitting) {
          setIsOpen(false)
          reset()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, isSubmitting, reset])

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-brand-electric text-brand-black font-medium text-sm rounded-lg hover:bg-brand-electric/80 focus:ring-2 focus:ring-brand-electric focus:ring-offset-2 dark:focus:ring-offset-brand-black transition-all duration-200 cursor-pointer"
      >
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Ajouter un mot de passe
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* Modal panel */}
            <div className="relative inline-block align-middle bg-white dark:bg-brand-gray/10 border border-brand-gray/20 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full border border-brand-gray/20 dark:border-brand-white/20 backdrop-blur-sm">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="px-6 pt-6 pb-4 bg-white dark:bg-brand-gray/10 border border-brand-gray/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white" id="modal-title">
                      Ajouter un nouveau mot de passe
                    </h3>
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      aria-label="Fermer"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Client selection */}
                    <div>
                      <label htmlFor="clientId" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Compagnie
                      </label>
                      <select
                        {...register('clientId')}
                        id="clientId"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-colors duration-200"
                      >
                        <option value="">Aucune compagnie</option>
                        {loadingClients ? (
                          <option disabled>Chargement...</option>
                        ) : (
                          clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))
                        )}
                      </select>
                      {errors.clientId && (
                        <p className="mt-1 text-sm text-red-500">{errors.clientId.message}</p>
                      )}
                    </div>

                    {/* Service selection */}
                    <div>
                      <label htmlFor="serviceId" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Service
                      </label>
                      <select
                        {...register('serviceId')}
                        id="serviceId"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-colors duration-200"
                      >
                        <option value="">Aucun service</option>
                        {loadingServices ? (
                          <option disabled>Chargement...</option>
                        ) : (
                          <>
                            {services.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.name}
                              </option>
                            ))}
                            <option value="custom">+ Ajouter un service personnalisé</option>
                          </>
                        )}
                      </select>
                      {errors.serviceId && (
                        <p className="mt-1 text-sm text-red-500">{errors.serviceId.message}</p>
                      )}
                    </div>

                    {/* Custom service name field */}
                    {showCustomService && (
                      <div>
                        <label htmlFor="customServiceName" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Nom du service personnalisé
                        </label>
                        <input
                          {...register('customServiceName')}
                          type="text"
                          id="customServiceName"
                          placeholder="Ex: Mon Service Privé"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-colors duration-200"
                        />
                        {errors.customServiceName && (
                          <p className="mt-1 text-sm text-red-500">{errors.customServiceName.message}</p>
                        )}
                      </div>
                    )}

                    {/* Username field */}
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Nom d&apos;utilisateur (optionnel)
                      </label>
                      <input
                        {...register('username')}
                        type="text"
                        id="username"
                        placeholder="Ex: john.doe@example.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-colors duration-200"
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
                      )}
                    </div>

                    {/* URL field */}
                    <div>
                      <label htmlFor="url" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        URL de connexion (optionnel)
                      </label>
                      <input
                        {...register('url')}
                        type="url"
                        id="url"
                        placeholder="https://example.com/login"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-colors duration-200"
                      />
                      {errors.url && (
                        <p className="mt-1 text-sm text-red-500">{errors.url.message}</p>
                      )}
                    </div>

                    {/* Password field */}
                    <div>
                      <label htmlFor="plaintext" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Mot de passe
                      </label>
                      <input
                        {...register('plaintext')}
                        type="password"
                        id="plaintext"
                        placeholder="Entrez votre mot de passe"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-colors duration-200"
                      />
                      {errors.plaintext && (
                        <p className="mt-1 text-sm text-red-500">{errors.plaintext.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-brand-gray/10 flex items-center justify-end space-x-3 border-t border-gray-200 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 bg-brand-electric text-brand-black font-medium text-sm rounded-lg hover:bg-brand-electric/80 focus:ring-2 focus:ring-brand-electric focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
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
                        Création...
                      </>
                    ) : (
                      'Créer le mot de passe'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 