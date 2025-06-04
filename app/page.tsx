import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Omnigo Password Manager
        </h1>
        <div>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <SignedOut>
          <div className="text-center max-w-2xl">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Secure Password Management
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Keep your passwords safe with end-to-end encryption. Access them anywhere, anytime.
            </p>
            <SignInButton>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
                Get Started
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="text-center max-w-2xl">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to Omnigo
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Your secure password vault is ready. Start adding your passwords to keep them safe.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Add Password
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Securely store your login credentials
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  View Passwords
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Access your saved passwords anytime
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Generate Strong
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Create secure passwords automatically
                </p>
              </div>
            </div>
          </div>
        </SignedIn>
      </main>
    </div>
  );
}
