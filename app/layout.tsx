import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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
        <body className={`${inter.variable} font-sans antialiased`}>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Omnigo Password Manager
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
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
        <body className={`${inter.variable} font-sans antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
