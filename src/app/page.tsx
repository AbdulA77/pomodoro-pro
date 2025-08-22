import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { Target, Coffee, Clock, BarChart3, Keyboard, Zap, Shield, Smartphone } from 'lucide-react'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard')
  }

  const features = [
    {
      icon: Target,
      title: 'High-Precision Timer',
      description: 'Web Worker-powered timer with minimal drift, even when tab is backgrounded.',
    },
    {
      icon: Coffee,
      title: 'Smart Breaks',
      description: 'Automatic short and long breaks with configurable intervals.',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track your productivity with detailed charts and progress metrics.',
    },
    {
      icon: Keyboard,
      title: 'Keyboard-First',
      description: 'Full keyboard shortcuts and command palette for power users.',
    },
    {
      icon: Zap,
      title: 'Task Management',
      description: 'Organize tasks with projects, tags, and priority levels.',
    },
    {
      icon: Smartphone,
      title: 'PWA Ready',
      description: 'Install as a native app with offline support and notifications.',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            Built for Developers
          </Badge>
          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
            Pomodoro Pro
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            A high-precision Pomodoro timer designed for developers with task management, 
            analytics, and keyboard-first workflow.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <GoogleSignInButton size="lg" className="sm:w-auto" showSetupMessage />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild size="lg" variant="outline">
                <Link href="/account/signup">
                  Sign Up with Email
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/account/signin">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Everything you need to stay focused
            </h2>
            <p className="text-lg text-muted-foreground">
              Built with modern web technologies for the best developer experience
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-lg">
                <CardHeader>
                  <feature.icon className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


    </div>
  )
}
