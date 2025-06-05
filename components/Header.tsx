'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { DarkModeToggle } from './DarkModeToggle'

export function Header() {
  const { user } = useUser()

  return (
    <header className="bg-white dark:bg-brand-gray/10 border-b border-brand-gray/20 dark:border-brand-white/20 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et titre */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-brand-electric rounded-lg flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-brand-black" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-black dark:text-brand-white">
                Omnigo
              </h1>
              <p className="text-sm text-brand-gray dark:text-brand-white/70 leading-none">
                Password Manager
              </p>
            </div>
          </div>


          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-brand-black dark:text-brand-white">
                    {user.fullName || user.firstName || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-brand-gray dark:text-brand-white/70">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
            )}
            
            <DarkModeToggle />
            
            <div className="flex items-center">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                    userButtonPopoverCard: "bg-white dark:bg-brand-gray border border-brand-gray/20 dark:border-brand-white/20",
                    userButtonPopoverActionButton: "text-brand-gray dark:text-brand-white hover:bg-brand-electric/10",
                  },
                }}
                afterSignOutUrl="/"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 