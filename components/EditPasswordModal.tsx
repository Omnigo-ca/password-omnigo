'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

interface Client {
  id: string
  name: string
  website?: string
  color: string
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
  createdAt: string
  updatedAt: string
  client?: Client
  service?: Service
}

interface EditPasswordModalProps {
  password: Password
  isOpen: boolean
  onClose: () => void
  onPasswordUpdated?: () => void
}

const editPasswordSchema = z.object({
  clientId: z.string().optional(),
  serviceId: z.string().optional(),
  customServiceName: z.string().optional(),
  username: z.string().optional(),
  url: z.string().url('URL invalide').optional().or(z.literal('')),
  plaintext: z.string().optional(),
})

type EditPasswordForm = z.infer<typeof editPasswordSchema>

export function EditPasswordModal({ password, isOpen, onClose, onPasswordUpdated }: EditPasswordModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [loadingServices, setLoadingServices] = useState(false)
  const [showCustomService, setShowCustomService] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<EditPasswordForm>({
    resolver: zodResolver(editPasswordSchema),
    defaultValues: {
      clientId: password.client?.id || '',
      serviceId: password.service?.id || '',
      username: password.username || '',
      url: password.url || '',
      plaintext: '',
    }
  })

  const selectedServiceId = watch('serviceId')
  const selectedService = services.find(s => s.id === selectedServiceId)

  // Show custom service field when "custom" is selected
  useEffect(() => {
    setShowCustomService(selectedServiceId === 'custom')
  }, [selectedServiceId])

  const fetchClients = async () => {
    try {
      setLoadingClients(true)
      const response = await fetch('/api/client/list')
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }

      const data = await response.json()
      setClients(data.clients || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoadingClients(false)
    }
  }

  const fetchServices = async () => {
    try {
      setLoadingServices(true)
      const response = await fetch('/api/service/list')
      
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()
      setServices(data.services || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoadingServices(false)
    }
  }

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchClients()
      fetchServices()
    }
  }, [isOpen])

  const onSubmit = async (data: EditPasswordForm) => {
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

      // Generate password name if service or client changed
      const clientName = clients.find(c => c.id === data.clientId)?.name || ''
      const generatedName = serviceName && clientName ? `${serviceName} - ${clientName}` : password.name

      const response = await fetch('/api/password/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: password.id,
          name: generatedName,
          username: data.username,
          url: data.url,
          plaintext: data.plaintext || undefined,
          clientId: data.clientId || null,
          serviceId: finalServiceId === 'custom' ? null : (finalServiceId || null),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la mise à jour', {
          style: {
            background: '#ef4444',
            color: '#ffffff',
            fontFamily: 'Meutas, sans-serif',
            fontWeight: '500',
          },
        })
        return
      }

      toast.success('Mot de passe mis à jour avec succès!', {
        style: {
          background: '#7DF9FF',
          color: '#000000',
          fontFamily: 'Meutas, sans-serif',
          fontWeight: '500',
        },
      })

      onClose()
      
      if (onPasswordUpdated) {
        onPasswordUpdated()
      }

    } catch (error) {
      console.error('Error updating password:', error)
      toast.error('Erreur lors de la mise à jour', {
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
      onClose()
      reset({
        clientId: password.client?.id || '',
        serviceId: password.service?.id || '',
        username: password.username || '',
        url: password.url || '',
        plaintext: '',
      })
    }
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, isSubmitting])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Modal panel */}
        <div className="relative inline-block align-middle bg-white dark:bg-brand-gray/10 border border-brand-gray/20 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-600 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 pt-6 pb-4 bg-white dark:bg-brand-gray/10 border border-brand-gray/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white" id="modal-title">
                  Modifier le mot de passe
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
                  <label htmlFor="edit-password-client" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Client (optionnel)
                  </label>
                  <select
                    {...register('clientId')}
                    id="edit-password-client"
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Aucun client</option>
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
                </div>

                {/* Service selection */}
                <div>
                  <label htmlFor="edit-password-service" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Service *
                  </label>
                  <select
                    {...register('serviceId')}
                    id="edit-password-service"
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Sélectionnez un service</option>
                    {loadingServices ? (
                      <option disabled>Chargement...</option>
                    ) : (
                      services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))
                    )}
                    <option value="custom">Autre service</option>
                  </select>
                </div>

                {/* Custom service name */}
                {showCustomService && (
                  <div>
                    <label htmlFor="edit-password-custom-service-name" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Nom du service personnalisé
                    </label>
                    <input
                      {...register('customServiceName')}
                      type="text"
                      id="edit-password-custom-service-name"
                      disabled={isSubmitting}
                      placeholder="Ex: Mon service personnalisé"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                {/* Username field */}
                <div>
                  <label htmlFor="edit-password-username" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Nom d&apos;utilisateur (optionnel)
                  </label>
                  <input
                    {...register('username')}
                    type="text"
                    id="edit-password-username"
                    disabled={isSubmitting}
                    placeholder="Ex: john.doe@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
                  )}
                </div>

                {/* URL field */}
                <div>
                  <label htmlFor="edit-password-url" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    URL de connexion (optionnel)
                  </label>
                  <input
                    {...register('url')}
                    type="url"
                    id="edit-password-url"
                    disabled={isSubmitting}
                    placeholder="https://example.com/login"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {errors.url && (
                    <p className="mt-1 text-sm text-red-500">{errors.url.message}</p>
                  )}
                </div>

                {/* Password field */}
                <div>
                  <label htmlFor="edit-password-plaintext" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Nouveau mot de passe (optionnel)
                  </label>
                  <input
                    {...register('plaintext')}
                    type="password"
                    id="edit-password-plaintext"
                    disabled={isSubmitting}
                    placeholder="Laissez vide pour conserver le mot de passe actuel"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Mise à jour...
                  </>
                ) : (
                  'Mettre à jour'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 