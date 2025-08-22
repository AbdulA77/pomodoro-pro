'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Chrome } from 'lucide-react'

interface GoogleSignInButtonProps {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  children?: React.ReactNode
}

export function GoogleSignInButton({ 
  variant = 'outline', 
  size = 'default',
  className,
  children
}: GoogleSignInButtonProps) {
  const handleGoogleSignIn = () => {
    console.log('Starting Google sign in...')
    signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGoogleSignIn}
      className={className}
    >
      <Chrome className="mr-2 h-4 w-4" />
      {children || 'Continue with Google'}
    </Button>
  )
}
