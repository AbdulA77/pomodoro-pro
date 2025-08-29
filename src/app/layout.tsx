import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import { QueryProvider } from '@/providers/query-provider'
import { AuthProvider } from '@/providers/auth-provider'
import { AccessibilityProvider } from '@/components/ui/accessibility-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flowdoro - Focus Timer for Developers',
  description: 'A high-precision Pomodoro timer designed for developers with task management, analytics, and keyboard-first workflow.',
  keywords: ['pomodoro', 'timer', 'productivity', 'focus', 'developer', 'time management'],
  authors: [{ name: 'Flowdoro' }],
  creator: 'Flowdoro',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pomodoro-pro.vercel.app',
    title: 'Flowdoro - Focus Timer for Developers',
    description: 'A high-precision Pomodoro timer designed for developers with task management, analytics, and keyboard-first workflow.',
    siteName: 'Flowdoro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flowdoro - Focus Timer for Developers',
    description: 'A high-precision Pomodoro timer designed for developers with task management, analytics, and keyboard-first workflow.',
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Note: Resource preload warnings are expected in development
  // and don't affect production functionality
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          defaultTheme="system"
        >
          <AuthProvider>
            <QueryProvider>
              <AccessibilityProvider>
                {children}
                <Toaster
                  position="top-right"
                  richColors
                  closeButton
                  duration={4000}
                />
              </AccessibilityProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
