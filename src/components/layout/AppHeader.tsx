'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Target, BarChart3, CheckSquare, Settings, LogOut, User, Moon, Sun, Menu, X } from 'lucide-react'
import { useTheme } from '@/providers/theme-provider'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Focus', href: '/focus' },
  { name: 'Tasks', href: '/tasks' },
  { name: 'Analytics', href: '/stats' },
  { name: 'Settings', href: '/settings' },
]

export function AppHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Sign out error:', error)
      // Fallback redirect
      window.location.href = '/'
    }
  }

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/5"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link 
              href="/" 
              className="flex items-center space-x-3 transition-all duration-300 hover:opacity-80"
            >
              <motion.div 
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Target className="h-5 w-5 text-white" />
              </motion.div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Flowdoro
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "relative h-9 px-4 text-sm font-medium transition-all duration-300 ease-out",
                      "hover:bg-white/10 hover:text-white hover:scale-105",
                      "text-gray-300",
                      isActive && "text-white"
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      {item.name}
                      <div className={cn(
                        "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out",
                        isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                      )} />
                    </Link>
                  </Button>
                </motion.div>
              )
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </motion.div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost" 
                    className="relative h-9 w-9 rounded-full hover:bg-white/10 transition-all duration-300"
                  >
                    <Avatar className="h-8 w-8 border-2 border-white/20 shadow-lg">
                      <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium">
                        {session?.user?.name ? getInitials(session.user.name) : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white/10 backdrop-blur-xl border-white/20" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-gray-300">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-white/10 focus:text-white focus:bg-white/10">
                  <Link href="/settings" className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 focus:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Navigation Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 p-0 md:hidden hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </motion.div>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 sm:w-96 bg-white/10 backdrop-blur-xl border-white/20">
                <SheetHeader className="pb-6">
                  <SheetTitle className="flex items-center space-x-3">
                    <motion.div 
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Target className="h-5 w-5 text-white" />
                    </motion.div>
                    <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Flowdoro
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="space-y-2">
                  {navigation.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start h-11 px-4 text-base font-medium transition-all duration-300",
                            "hover:bg-white/10 hover:text-white",
                            "text-gray-300",
                            isActive && "bg-white/10 text-white"
                          )}
                          asChild
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link href={item.href}>
                            {item.name}
                            {isActive && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-r-full" />
                            )}
                          </Link>
                        </Button>
                      </motion.div>
                    )
                  })}
                </nav>
                <div className="mt-8 pt-6 border-t border-white/20">
                  <div className="flex items-center space-x-3 px-4 py-3">
                    <Avatar className="h-10 w-10 border-2 border-white/20 shadow-lg">
                      <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium">
                        {session?.user?.name ? getInitials(session.user.name) : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-white">
                        {session?.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-300 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
