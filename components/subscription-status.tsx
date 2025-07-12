'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Crown, Zap, Plane } from 'lucide-react'
import { subscriptionManager } from '@/lib/subscriptionManager'
import { useAuth } from '@/lib/auth'

export default function SubscriptionStatus() {
  const { user } = useAuth()
  const [plan, setPlan] = useState<'free' | 'explorer' | 'adventurer' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSubscription()
    }
  }, [user])

  const loadSubscription = async () => {
    if (!user) return
    
    try {
      const subscription = await subscriptionManager.getCurrentSubscription(user.id)
      setPlan(subscription?.plan || 'free')
    } catch (error) {
      console.error('Error loading subscription:', error)
      setPlan('free')
    } finally {
      setLoading(false)
    }
  }

  if (loading || !plan) {
    return null
  }

  const getPlanIcon = () => {
    switch (plan) {
      case 'adventurer':
        return <Crown className="w-3 h-3" />
      case 'explorer':
        return <Zap className="w-3 h-3" />
      default:
        return <Plane className="w-3 h-3" />
    }
  }

  const getPlanColor = () => {
    switch (plan) {
      case 'adventurer':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'explorer':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPlanName = () => {
    switch (plan) {
      case 'adventurer':
        return 'Adventurer'
      case 'explorer':
        return 'Explorer'
      default:
        return 'Free'
    }
  }

  return (
    <Badge variant="outline" className={`text-xs ${getPlanColor()}`}>
      {getPlanIcon()}
      <span className="ml-1">{getPlanName()}</span>
    </Badge>
  )
} 