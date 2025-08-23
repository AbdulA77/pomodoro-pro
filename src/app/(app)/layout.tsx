import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppHeader } from '@/components/layout/AppHeader'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/account/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      <AppHeader />
      <div className="flex min-h-screen">
        {/* Main content with top spacing for floating navbar */}
        <main className="flex-1 pt-24">
          {children}
        </main>
      </div>
    </div>
  )
}
