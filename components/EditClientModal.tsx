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
  createdAt: string
  updatedAt: string
  _count: {
    passwords: number
  }
}

interface EditClientModalProps {
  client: Client
  isOpen: boolean
  onClose: () => void
  onClientUpdated?: () => void
}

const editClientSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide (format: #RRGGBB)'),
})

type EditClientForm = z.infer<typeof editClientSchema>

// Preset colors for quick selection
const PRESET_COLORS = [
  '#7DF9FF', // Electric Blue (default)
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Purple
  '#85C1E9', // Light Blue
  '#F8C471', // Orange
  '#82E0AA', // Light Green
  '#F1948A', // Pink
  '#D7DBDD', // Gray
  '#AED6F1', // Sky Blue
]

export function EditClientModal({ client, isOpen, onClose, onClientUpdated }: EditClientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedColor, setSelectedColor] = useState(client.color)
  const [customColor, setCustomColor] = useState('')
  const [useCustomColor, setUseCustomColor] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditClientForm>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      name: client.name,
      website: client.website || '',
      color: client.color,
    },
  })

  // Update form value when color changes
  useEffect(() => {
    const colorToUse = useCustomColor ? customColor : selectedColor
    if (colorToUse && /^#[0-9A-Fa-f]{6}$/.test(colorToUse)) {
      setValue('color', colorToUse)
    }
  }, [selectedColor, customColor, useCustomColor, setValue])

  // Reset form when client changes
  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        website: client.website || '',
        color: client.color,
      })
      setSelectedColor(client.color)
      setCustomColor('')
      setUseCustomColor(false)
    }
  }, [client, reset])

  // Handle modal focus and body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => {
        const firstInput = document.getElementById('edit-client-name')
        if (firstInput) {
          firstInput.focus()
        }
      }, 100)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const onSubmit = async (data: EditClientForm) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/client/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: client.id,
          ...data,
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

      toast.success('Client mis à jour avec succès!', {
        style: {
          background: '#7DF9FF',
          color: '#000000',
          fontFamily: 'Meutas, sans-serif',
          fontWeight: '500',
        },
      })

      if (onClientUpdated) {
        onClientUpdated()
      }

      handleClose()

    } catch (error) {
      console.error('Error updating client:', error)
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
      reset()
      setSelectedColor(client.color)
      setCustomColor('')
      setUseCustomColor(false)
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
                  Modifier le client
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
                {/* Name field */}
                <div>
                  <label htmlFor="edit-client-name" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Nom du client *
                  </label>
                  <input
                    id="edit-client-name"
                    type="text"
                    {...register('name')}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Ex: Google, Facebook, etc."
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Website field */}
                <div>
                  <label htmlFor="edit-client-website" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Site web (optionnel)
                  </label>
                  <input
                    id="edit-client-website"
                    type="url"
                    {...register('website')}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="https://example.com"
                  />
                  {errors.website && (
                    <p className="mt-1 text-sm text-red-500">{errors.website.message}</p>
                  )}
                </div>

                {/* Color field */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Couleur du pellet
                  </label>
                  
                  {/* Color preview */}
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: useCustomColor ? customColor : selectedColor }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Aperçu: {useCustomColor ? customColor : selectedColor}
                    </span>
                  </div>

                  {/* Preset colors grid */}
                  <div className="grid grid-cols-8 gap-2 mb-3">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color)
                          setUseCustomColor(false)
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                          selectedColor === color && !useCustomColor
                            ? 'border-gray-900 dark:border-white scale-110'
                            : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>

                  {/* Custom color input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-use-custom-color"
                      checked={useCustomColor}
                      onChange={(e) => setUseCustomColor(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-brand-electric focus:ring-brand-electric"
                    />
                    <label htmlFor="edit-use-custom-color" className="text-sm text-gray-700 dark:text-gray-300">
                      Couleur personnalisée:
                    </label>
                    <input
                      type="text"
                      placeholder="#FF5733"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      disabled={!useCustomColor}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-brand-gray/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-electric focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  {errors.color && (
                    <p className="mt-1 text-sm text-red-500">{errors.color.message}</p>
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