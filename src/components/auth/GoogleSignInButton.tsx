'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Chrome } from 'lucide-react'

interface GoogleSignInButtonProps {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  children?: React.ReactNode
  showSetupMessage?: boolean
}

export function GoogleSignInButton({ 
  variant = 'outline', 
  size = 'default',
  className,
  children,
  showSetupMessage = false
}: GoogleSignInButtonProps) {
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  const handleSetupClick = () => {
    alert('To enable Google sign-in:\n\n1. Go to Google Cloud Console\n2. Create OAuth 2.0 credentials\n3. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file\n4. Set redirect URI to: http://localhost:3000/api/auth/callback/google')
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={showSetupMessage ? handleSetupClick : handleGoogleSignIn}
      className={className}
    >
      <Chrome className="mr-2 h-4 w-4" />
      {children || (showSetupMessage ? 'Setup Google Sign-In' : 'Continue with Google')}
    </Button>
  )
}
