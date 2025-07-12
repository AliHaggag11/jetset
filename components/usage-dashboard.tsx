'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plane, RefreshCw, Calendar, Zap, Crown } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { subscriptionService, type UsageStats } from '@/lib/subscriptionService'

export default function UsageDashboard() {
  const { user } = useAuth()
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUsage()
    }
  }, [user])

  const loadUsage = async () => {
    if (!user) return
    
    try {
      const userUsage = await subscriptionService.getUserUsage(user.id)
      setUsage(userUsage)
    } catch (error) {
      console.error('Error loading usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlanIcon = () => {
    if (usage?.monthly_limit === -1) return <Crown className="w-4 h-4" />
    if (usage?.monthly_limit === 5) return <Zap className="w-4 h-4" />
    return <Plane className="w-4 h-4" />
  }

  const getPlanName = () => {
    if (usage?.monthly_limit === -1) return 'Adventurer'
    if (usage?.monthly_limit === 5) return 'Explorer'
    return 'Free'
  }

  const getPlanColor = () => {
    if (usage?.monthly_limit === -1) return 'text-purple-600'
    if (usage?.monthly_limit === 5) return 'text-blue-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!usage) {
    return null
  }

  const tripsProgress = usage.monthly_limit === -1 ? 100 : (usage.trips_created / usage.monthly_limit) * 100
  const regenerationsProgress = usage.regeneration_limit === -1 ? 100 : (usage.regenerations_used / usage.regeneration_limit) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Usage This Month</CardTitle>
          <Button variant="ghost" size="sm" onClick={loadUsage}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg bg-gray-100 ${getPlanColor()}`}>
              {getPlanIcon()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{getPlanName()} Plan</p>
              <p className="text-sm text-gray-600">
                {usage.monthly_limit === -1 ? 'Unlimited trips' : `${usage.monthly_limit} trips/month`}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/pricing">Upgrade</Link>
          </Button>
        </div>

        {/* Trips Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plane className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Trips Created</span>
            </div>
            <span className="text-sm text-gray-600">
              {usage.trips_created} / {usage.monthly_limit === -1 ? '∞' : usage.monthly_limit}
            </span>
          </div>
          <Progress value={tripsProgress} className="h-2" />
          {usage.monthly_limit !== -1 && tripsProgress >= 80 && (
            <p className="text-xs text-orange-600">
              {tripsProgress >= 100 ? 'Limit reached' : 'Almost at your limit'}
            </p>
          )}
        </div>

        {/* Regenerations Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Itinerary Regenerations</span>
            </div>
            <span className="text-sm text-gray-600">
              {usage.regenerations_used} / {usage.regeneration_limit === -1 ? '∞' : usage.regeneration_limit}
            </span>
          </div>
          <Progress value={regenerationsProgress} className="h-2" />
          {usage.regeneration_limit !== -1 && regenerationsProgress >= 80 && (
            <p className="text-xs text-orange-600">
              {regenerationsProgress >= 100 ? 'Limit reached' : 'Almost at your limit'}
            </p>
          )}
        </div>

        {/* Monthly Reset */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>Usage resets on the 1st of each month</span>
        </div>

        {/* Upgrade CTA for free users */}
        {usage.monthly_limit === 1 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Upgrade to Explorer</strong> for 5 trips per month and unlimited regenerations!
            </p>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/pricing">View Plans</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 