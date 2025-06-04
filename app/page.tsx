'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { SignInButton, SignUpButton } from '@clerk/nextjs'

export default function HomePage() {
  const { isLoaded, userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && userId) {
      router.push('/dashboard')
    }
  }, [isLoaded, userId, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-brand-white dark:bg-brand-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-electric border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-gray dark:text-brand-white/70">Chargement...</p>
        </div>
      </div>
    )
  }

  if (userId) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-brand-white dark:bg-brand-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-brand-white dark:bg-brand-black sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-bold text-brand-black dark:text-brand-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Gestionnaire de</span>{' '}
                  <span className="block text-brand-electric xl:inline">mots de passe</span>
                </h1>
                <p className="mt-3 text-base text-brand-gray dark:text-brand-white/70 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Sécurisez vos mots de passe avec un chiffrement de bout en bout. 
                  Omnigo Password Manager protège vos données sensibles avec une technologie de pointe.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <SignUpButton mode="modal">
                      <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-brand-black bg-brand-electric hover:bg-brand-electric/80 md:py-4 md:text-lg md:px-10 transition-all duration-200">
                        Commencer gratuitement
                      </button>
                    </SignUpButton>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <SignInButton mode="modal">
                      <button className="w-full flex items-center justify-center px-8 py-3 border border-brand-gray/30 dark:border-brand-white/30 text-base font-medium rounded-lg text-brand-black dark:text-brand-white bg-transparent hover:bg-brand-gray/10 dark:hover:bg-brand-white/10 md:py-4 md:text-lg md:px-10 transition-all duration-200">
                        Se connecter
                      </button>
                    </SignInButton>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-br from-brand-electric/20 to-brand-electric/5 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="w-64 h-64 rounded-full bg-brand-electric/10 flex items-center justify-center">
              <svg
                className="w-32 h-32 text-brand-electric"
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
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-brand-gray/5 dark:bg-brand-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-brand-electric font-semibold tracking-wide uppercase">Sécurité</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-brand-black dark:text-brand-white sm:text-4xl">
              Protection maximale de vos données
            </p>
            <p className="mt-4 max-w-2xl text-xl text-brand-gray dark:text-brand-white/70 lg:mx-auto">
              Chiffrement AES-256-GCM, clés individuelles par utilisateur, et architecture zero-knowledge.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-brand-electric text-brand-black">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-brand-black dark:text-brand-white">Chiffrement de bout en bout</p>
                <p className="mt-2 ml-16 text-base text-brand-gray dark:text-brand-white/70">
                  Vos mots de passe sont chiffrés avec AES-256-GCM avant d&apos;être stockés.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-brand-electric text-brand-black">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-brand-black dark:text-brand-white">Clés individuelles</p>
                <p className="mt-2 ml-16 text-base text-brand-gray dark:text-brand-white/70">
                  Chaque utilisateur possède sa propre clé de chiffrement unique.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-brand-electric text-brand-black">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-brand-black dark:text-brand-white">Zero-knowledge</p>
                <p className="mt-2 ml-16 text-base text-brand-gray dark:text-brand-white/70">
                  Nous ne pouvons pas voir vos mots de passe, même si nous le voulions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
