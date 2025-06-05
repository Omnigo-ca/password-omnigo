'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'

interface Service {
  id: string
  name: string
  isCustom: boolean
  createdAt: string
  updatedAt: string
}

const serviceSchema = z.object({
  name: z.string().min(1, 'Le nom du service est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface ServiceSettingsModalProps {
  onServicesUpdated?: () => void
}

export function ServiceSettingsModal({ onServicesUpdated }: ServiceSettingsModalProps) {
  const { userId } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema)
  })

  const fetchServices = async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      const response = await fetch('/api/service/list')
      
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()
      setServices(data.services || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Erreur lors du chargement des services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && userId) {
      fetchServices()
    }
  }, [isOpen, userId])

  const onSubmit = async (data: ServiceFormData) => {
    try {
      const url = editingService ? '/api/service/update' : '/api/service/create'
      const method = editingService ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(editingService && { id: editingService.id }),
          name: data.name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save service')
      }

      toast.success(editingService ? 'Service modifié avec succès' : 'Service ajouté avec succès')
      reset()
      setEditingService(null)
      fetchServices()
      onServicesUpdated?.()
    } catch (error) {
      console.error('Error saving service:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    reset({ name: service.name })
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      return
    }

    try {
      const response = await fetch('/api/service/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: serviceId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete service')
      }

      toast.success('Service supprimé avec succès')
      fetchServices()
      onServicesUpdated?.()
    } catch (error) {
      console.error('Error deleting service:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    }
  }

  const handleCancel = () => {
    setEditingService(null)
    reset()
  }

  const handleClose = () => {
    setIsOpen(false)
    setEditingService(null)
    reset()
  }

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-brand-gray dark:text-brand-white/70 hover:text-brand-electric dark:hover:text-brand-electric transition-colors duration-200 cursor-pointer"
        title="Paramètres des services"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-brand-gray rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-brand-gray/20 dark:border-brand-white/20">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-gray/20 dark:border-brand-white/10">
              <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white">
                Paramètres des Services
              </h2>
              <button
                onClick={handleClose}
                className="text-brand-gray dark:text-brand-white/70 hover:text-brand-black dark:hover:text-brand-white cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-white dark:bg-brand-gray">
              {/* Add/Edit Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label htmlFor="name" className="block text-sm font-medium text-brand-black dark:text-brand-white mb-2">
                      {editingService ? 'Modifier le service' : 'Nouveau service'}
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      id="name"
                      placeholder="Nom du service"
                      className="w-full px-3 py-2 border border-brand-gray/20 dark:border-brand-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-electric focus:border-brand-electric bg-white dark:bg-brand-gray text-brand-black dark:text-brand-white placeholder-brand-gray/50 dark:placeholder-brand-white/50"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-brand-electric text-brand-black font-medium text-sm rounded-md hover:bg-brand-electric/80 focus:outline-none focus:ring-2 focus:ring-brand-electric focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? 'Sauvegarde...' : editingService ? 'Modifier' : 'Ajouter'}
                    </button>
                    {editingService && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 bg-brand-gray/20 dark:bg-brand-white/20 text-brand-gray dark:text-brand-white font-medium text-sm rounded-md hover:bg-brand-gray/30 dark:hover:bg-brand-white/30 cursor-pointer"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Services List */}
              <div>
                <h3 className="text-lg font-medium text-brand-black dark:text-brand-white mb-4">
                  Services existants
                </h3>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-electric"></div>
                  </div>
                ) : services.length === 0 ? (
                  <p className="text-brand-gray dark:text-brand-white/70 text-center py-8">
                    Aucun service configuré
                  </p>
                ) : (
                  <div className="space-y-2">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3 bg-brand-gray/5 dark:bg-brand-white/5 rounded-lg border border-brand-gray/10 dark:border-brand-white/10"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-brand-black dark:text-brand-white font-medium">
                            {service.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(service)}
                            className="p-1 text-brand-gray dark:text-brand-white/70 hover:text-brand-electric cursor-pointer"
                            title="Modifier"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="p-1 text-brand-gray dark:text-brand-white/70 hover:text-red-500 cursor-pointer"
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 