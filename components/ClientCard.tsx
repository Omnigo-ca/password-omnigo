'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { EditClientModal } from './EditClientModal'
import { FaExternalLinkAlt } from 'react-icons/fa'

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

interface ClientCardProps {
  client: Client
  onClientDeleted?: () => void
  onClientUpdated?: () => void
}

export function ClientCard({ client, onClientDeleted, onClientUpdated }: ClientCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/client/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: client.id }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la suppression', {
          style: {
            background: '#ef4444',
            color: '#ffffff',
            fontFamily: 'Meutas, sans-serif',
            fontWeight: '500',
          },
        })
        return
      }

      toast.success('Compagnie supprimée avec succès!', {
        style: {
          background: '#7DF9FF',
          color: '#000000',
          fontFamily: 'Meutas, sans-serif',
          fontWeight: '500',
        },
      })

      if (onClientDeleted) {
        onClientDeleted()
      }

    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('Erreur lors de la suppression', {
        style: {
          background: '#ef4444',
          color: '#ffffff',
          fontFamily: 'Meutas, sans-serif',
          fontWeight: '500',
        },
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Function to determine if text should be white based on background color
  const getTextColor = (hexColor: string) => {
    // Remove # if present
    const color = hexColor.replace('#', '')
    
    // Convert to RGB
    const r = parseInt(color.substr(0, 2), 16)
    const g = parseInt(color.substr(2, 2), 16)
    const b = parseInt(color.substr(4, 2), 16)
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Return white for dark colors, black for light colors
    return luminance < 0.5 ? '#ffffff' : '#000000'
  }

  return (
    <>
      <div className="bg-white dark:bg-brand-gray/10 border border-brand-gray/20 dark:border-brand-white/20 rounded-xl p-6 hover:shadow-lg dark:hover:shadow-brand-electric/10 transition-all duration-200">
        {/* Header with name and color */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-3 justify-between">
              <h3 className="text-lg font-semibold text-brand-black dark:text-brand-white">
                {client.name}
              </h3>
              <span 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: client.color,
                  color: getTextColor(client.color)
                }}
              >
                {client.color}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-brand-gray dark:text-brand-white/70 mb-2">
                <span>
                {client._count.passwords} mot{client._count.passwords !== 1 ? 's' : ''} de passe
                </span>
                <span>
                {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                </span>
            </div>
            <div className="text-sm text-brand-gray dark:text-brand-white/50">
                Modifié le {new Date(client.updatedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                })}
            </div>
          
          </div>
          
        </div>
        

        {/* Actions */}
        <div className="flex items-left justify-between flex-col gap-4">
          {/* Website Button */}
          {client.website && (
            <button
              onClick={() => window.open(client.website, '_blank')}
              className="w-full bg-brand-electric hover:bg-brand-electric/80 text-brand-black font-medium text-sm rounded-lg py-2.5 px-4 flex items-center justify-center transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-brand-electric focus:ring-offset-2 dark:focus:ring-offset-brand-gray cursor-pointer"
              title="Ouvrir le site web"
            >
              <FaExternalLinkAlt className="w-4 h-4 mr-2" />
              <span>Visiter le site web</span>
            </button>
          )}
          
          
          
          <div className="flex items-center justify-left gap-4 p-2">
            <button 
              onClick={() => setShowEditModal(true)}
              className="text-brand-gray dark:text-brand-white/70 hover:text-brand-black dark:hover:text-brand-white hover:bg-brand-gray/10 dark:hover:bg-brand-white/10 rounded-lg transition-colors duration-200 cursor-pointer"
              title="Modifier"
            >
              <svg className="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting || client._count.passwords > 0}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title={client._count.passwords > 0 ? "Impossible de supprimer une compagnie avec des mots de passe" : "Supprimer"}
            >
              <svg className="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
              onClick={() => !isDeleting && setShowDeleteConfirm(false)}
              aria-hidden="true"
            />

            {/* Modal panel */}
            <div className="relative inline-block align-middle bg-white dark:bg-brand-gray/10 border border-brand-gray/20 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-600 backdrop-blur-sm">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
                    <svg
                      className="h-6 w-6 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-brand-black dark:text-brand-white mb-4">
                    Supprimer la compagnie
                  </h3>
                  <p className="text-brand-gray dark:text-brand-white/70 mb-6">
                    Êtes-vous sûr de vouloir supprimer la compagnie &quot;{client.name}&quot; ? Cette action est irréversible.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-brand-gray/10 flex items-center justify-end space-x-3 border-t border-gray-200 dark:border-gray-600">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium text-sm rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isDeleting ? (
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
                      Suppression...
                    </>
                  ) : (
                    'Supprimer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      <EditClientModal
        client={client}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onClientUpdated={onClientUpdated}
      />
    </>
  )
} 