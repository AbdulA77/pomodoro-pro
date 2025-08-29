'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { signInSchema, type SignInInput } from '@/lib/validators'
import { toast } from 'sonner'
import { Target, Zap, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Client-side validation
    if (!email.trim()) {
      setError('Please enter your email address.')
      toast.error('Email required')
      setIsLoading(false)
      return
    }

    if (!password.trim()) {
      setError('Please enter your password.')
      toast.error('Password required')
      setIsLoading(false)
      return
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      toast.error('Invalid email format')
      setIsLoading(false)
      return
    }

    const data: SignInInput = {
      email: email.trim(),
      password: password,
    }

    try {
      // Validate input
      const validatedData = signInSchema.parse(data)

      // Sign in
      const result = await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      })

      if (result?.error) {
        // Handle specific error messages
        if (result.error.includes('Google')) {
          setError('This account was created with Google. Please sign in with Google instead.')
          toast.error('Use Google sign-in for this account')
        } else if (result.error.includes('No account found')) {
          setError('No account found with this email. Please check your email or create a new account.')
          toast.error('Account not found')
        } else if (result.error.includes('Invalid password')) {
          setError('Invalid password. Please check your password and try again.')
          toast.error('Invalid password')
        } else if (result.error.includes('Email is required')) {
          setError('Please enter your email address.')
          toast.error('Email required')
        } else if (result.error.includes('Password is required')) {
          setError('Please enter your password.')
          toast.error('Password required')
        } else if (result.error.includes('valid email address')) {
          setError('Please enter a valid email address.')
          toast.error('Invalid email format')
        } else if (result.error.includes('Service temporarily unavailable')) {
          setError('Service temporarily unavailable. Please try again later.')
          toast.error('Service unavailable')
        } else if (result.error.includes('unexpected error')) {
          setError('An unexpected error occurred. Please try again.')
          toast.error('Unexpected error')
        } else {
          setError('Invalid email or password')
          toast.error('Sign in failed')
        }
      } else {
        toast.success('Signed in successfully')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      console.error('Sign-in error:', error)
      
      if (error instanceof Error) {
        // Handle network errors
        if (error.message.includes('fetch') || error.message.includes('network')) {
          setError('Network error. Please check your internet connection and try again.')
          toast.error('Network error')
        } else {
          setError(error.message)
        }
      } else {
        setError('Something went wrong')
      }
      toast.error('Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse" />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto flex min-h-screen items-center justify-center px-4">
        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-8 left-8"
        >
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm"
          >
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center mb-4"
              >
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                  <Target className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <CardTitle className="text-2xl font-bold text-white">Welcome back</CardTitle>
                <CardDescription className="text-gray-300 mt-2">
                  Sign in to your Flowdoro account
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Sign In */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <GoogleSignInButton className="w-full bg-white/5 hover:bg-white/10 border-white/20 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/5 backdrop-blur-sm px-2 text-gray-400">
                    Or continue with
                  </span>
                </div>
              </motion.div>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                onSubmit={handleSubmit}
                className="space-y-4"
                autoComplete="off"
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-300">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                    autoComplete="off"
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                      autoComplete="off"
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-white/10 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>Sign in</span>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            </CardContent>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="px-6 pb-6 text-center"
            >
              <div className="text-sm">
                <span className="text-gray-400">
                  Don&apos;t have an account?{' '}
                </span>
                <Link
                  href="/account/signup"
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300"
                >
                  Sign up
                </Link>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}