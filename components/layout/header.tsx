'use client'

import { Button } from '@/components/ui/button'
import { Plane, Menu, X, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import SubscriptionStatus from '@/components/subscription-status'
import { subscriptionService } from '@/lib/subscriptionService'
import { ThemeToggle } from '@/components/theme-toggle'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const [displayName, setDisplayName] = useState<string>('')
  const [profileImage, setProfileImage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchName() {
      if (user) {
        const profile = await subscriptionService.getUserProfile(user.id)
        if (profile?.first_name || profile?.last_name) {
          setDisplayName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email || '')
        } else {
          setDisplayName(user.email || '')
        }
        setProfileImage(profile?.profile_image_url || null)
      }
    }
    fetchName()
  }, [user])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Plane className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">JetSet</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/plan" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Plan Trip
            </Link>
            <Link 
              href="/dashboard" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              My Trips
            </Link>
            <Link 
              href="/pricing" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* Desktop Navigation & Auth - replaced by Avatar Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <PopoverPrimitive.Root>
                <PopoverPrimitive.Trigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="w-9 h-9">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="object-cover w-full h-full rounded-full" />
                      ) : (
                        <AvatarFallback>{displayName ? displayName[0] : 'U'}</AvatarFallback>
                      )}
                    </Avatar>
                  </button>
                </PopoverPrimitive.Trigger>
                <PopoverPrimitive.Portal>
                  <PopoverPrimitive.Content align="end" className="z-50 mt-2 w-56 rounded-md border bg-background p-2 shadow-lg flex flex-col gap-1">
                    <div className="px-3 py-2 border-b flex flex-col gap-1">
                      <span className="font-medium text-sm">{displayName}</span>
                      <SubscriptionStatus />
                    </div>
                    <Link href="/plan" className="px-3 py-2 rounded hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors">Plan Trip</Link>
                    <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors">My Trips</Link>
                    <Link href="/pricing" className="px-3 py-2 rounded hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                    <Link href="/profile" className="px-3 py-2 rounded hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"><User className="w-4 h-4" /> Profile</Link>
                    <div className="px-3 py-2"><ThemeToggle /></div>
                    <button onClick={signOut} className="px-3 py-2 rounded hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign out</button>
                  </PopoverPrimitive.Content>
                </PopoverPrimitive.Portal>
              </PopoverPrimitive.Root>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Get started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/plan"
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Plan Trip
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                My Trips
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="pt-4 border-t border-border space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-2 py-2">
                      <Avatar className="w-10 h-10">
                        {profileImage ? (
                          <img src={profileImage} alt="Profile" className="object-cover w-full h-full rounded-full" />
                        ) : (
                          <AvatarFallback>{displayName ? displayName[0] : 'U'}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{displayName}</span>
                        <SubscriptionStatus />
                      </div>
                    </div>
                    <Link href="/profile" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground py-2 px-2" onClick={() => setIsMenuOpen(false)}>
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <div className="px-2 py-2"><ThemeToggle /></div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setIsMenuOpen(false); signOut(); }}
                      className="w-full justify-start"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>Sign in</Link>
                    </Button>
                    <Button size="sm" className="w-full" asChild>
                      <Link href="/signup" onClick={() => setIsMenuOpen(false)}>Get started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 