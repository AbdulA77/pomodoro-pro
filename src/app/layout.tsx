import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import { QueryProvider } from '@/providers/query-provider'
import { AuthProvider } from '@/providers/auth-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pomodoro Pro - Focus Timer for Developers',
  description: 'A high-precision Pomodoro timer designed for developers with task management, analytics, and keyboard-first workflow.',
  keywords: ['pomodoro', 'timer', 'productivity', 'focus', 'developer', 'time management'],
  authors: [{ name: 'Pomodoro Pro' }],
  creator: 'Pomodoro Pro',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pomodoro-pro.vercel.app',
    title: 'Pomodoro Pro - Focus Timer for Developers',
    description: 'A high-precision Pomodoro timer designed for developers with task management, analytics, and keyboard-first workflow.',
    siteName: 'Pomodoro Pro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pomodoro Pro - Focus Timer for Developers',
    description: 'A high-precision Pomodoro timer designed for developers with task management, analytics, and keyboard-first workflow.',
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster
                position="top-right"
                richColors
                closeButton
                duration={4000}
              />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
