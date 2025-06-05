'use client'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-brand-gray/10 border-t border-brand-gray/20 dark:border-brand-white/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-brand-gray dark:text-brand-white/70">
            © {currentYear} Omnigo. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a 
              href="#" 
              className="text-xs text-brand-gray dark:text-brand-white/70 hover:text-brand-black dark:hover:text-brand-white transition-colors duration-200"
            >
              Politique de confidentialité
            </a>
            <a 
              href="#" 
              className="text-xs text-brand-gray dark:text-brand-white/70 hover:text-brand-black dark:hover:text-brand-white transition-colors duration-200"
            >
              Conditions d&apos;utilisation
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
} 