import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { FeaturesBentoGrid } from '@/components/BentoGrid'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 text-center">
        <div className="mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-3">
            Built for Developers
          </Badge>
          <div className="relative mb-2">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Flowdoro
            </h1>
          </div>
          <p className="mb-6 text-lg text-muted-foreground">
            A high-precision Pomodoro timer designed for developers with task management, 
            analytics, and keyboard-first workflow.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/account/signup">
                Sign Up
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/account/signin">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-2xl font-bold tracking-tight">
              Everything you need to stay focused
            </h2>
            <p className="text-base text-muted-foreground">
              Built with modern web technologies for the best developer experience
            </p>
          </div>
          
          <FeaturesBentoGrid />
        </div>
      </section>


    </div>
  )
}
