'use client'

import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Chrome } from 'lucide-react'
import { toast } from 'sonner'

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
  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign in...')
      const result = await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: false 
      })
      
      if (result?.error) {
        console.error('Google sign-in error:', result.error)
        // Handle specific Google OAuth errors
        if (result.error.includes('OAuthAccountNotLinked')) {
          toast.error('This email is already associated with a different account')
        } else if (result.error.includes('AccessDenied')) {
          toast.error('Google sign-in was cancelled')
        } else if (result.error.includes('Configuration')) {
          toast.error('Google sign-in is not configured properly')
        } else {
          toast.error('Google sign-in failed. Please try again.')
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      toast.error('Google sign-in failed. Please try again.')
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant={variant}
        size={size}
        onClick={handleGoogleSignIn}
        className={`${className} transition-all duration-300 group`}
      >
        <motion.div
          whileHover={{ rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Chrome className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
        </motion.div>
        {children || 'Continue with Google'}
      </Button>
    </motion.div>
  )
}