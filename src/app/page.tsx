import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { HeroSection } from '@/components/ui/hero-section'
import { FeaturesSection } from '@/components/ui/features-section'
import { CTASection } from '@/components/ui/cta-section'
import { Footer } from '@/components/ui/footer'
import { AnimatedGradient } from '@/components/ui/animated-gradient'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // Don't redirect authenticated users - let them see the landing page
  // if (session) {
  //   redirect('/dashboard')
  // }

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Animated background */}
      <AnimatedGradient />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* CTA Section */}
      <CTASection />
      
      {/* Footer */}
      <Footer />
    </main>
  )
}