import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Omnigo Password Manager",
  description: "Secure password management with end-to-end encryption",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // During build time or if keys are not configured, render without Clerk
  if (!publishableKey || publishableKey.includes('placeholder')) {
    return (
      <html lang="en">
        <body className="font-sans antialiased">
          <div className="min-h-screen bg-gradient-to-br from-brand-white to-brand-electric/10 dark:from-brand-black dark:to-brand-gray/20">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-brand-black dark:text-brand-white mb-4">
                  Omnigo Password Manager
                </h1>
                <p className="text-brand-gray dark:text-brand-white/70">
                  Please configure your Clerk authentication keys to continue.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans antialiased">
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-white to-brand-electric/10 dark:from-brand-black dark:to-brand-gray/20">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#7DF9FF',
                color: '#000000',
                fontFamily: 'Meutas, sans-serif',
                fontWeight: '500',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
