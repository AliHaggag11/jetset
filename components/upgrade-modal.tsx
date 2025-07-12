'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, Zap, Plane, Check, X } from 'lucide-react'
import { subscriptionManager } from '@/lib/subscriptionManager'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: 'free' | 'explorer' | 'adventurer'
  reason: string
}

export default function UpgradeModal({ isOpen, onClose, currentPlan, reason }: UpgradeModalProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [upgrading, setUpgrading] = useState(false)

  if (!isOpen) return null

  const recommendations = subscriptionManager.getUpgradeRecommendations(currentPlan)

  const handleUpgrade = async (plan: 'explorer' | 'adventurer') => {
    if (!user) {
      router.push('/signup')
      return
    }

    setUpgrading(true)
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          userId: user.id
        }),
      })

      if (response.ok) {
        alert(`Successfully upgraded to ${plan} plan!`)
        onClose()
        router.push('/dashboard')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to upgrade')
      }
    } catch (error) {
      alert('Failed to upgrade subscription')
    } finally {
      setUpgrading(false)
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'adventurer':
        return <Crown className="w-5 h-5" />
      case 'explorer':
        return <Zap className="w-5 h-5" />
      default:
        return <Plane className="w-5 h-5" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'adventurer':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'explorer':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-white/40 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <span>Upgrade Your Plan</span>
          </CardTitle>
          <p className="text-sm text-gray-600">{reason}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.nextPlan && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getPlanIcon(recommendations.nextPlan)}
                  <span className="font-semibold capitalize">{recommendations.nextPlan}</span>
                  <Badge className={getPlanColor(recommendations.nextPlan)}>
                    {recommendations.price}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">What you'll get:</p>
                <ul className="space-y-1">
                  {recommendations.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => handleUpgrade(recommendations.nextPlan as 'explorer' | 'adventurer')}
                  disabled={upgrading}
                  className="flex-1"
                >
                  {upgrading ? 'Upgrading...' : `Upgrade to ${recommendations.nextPlan}`}
                </Button>
                <Button variant="outline" onClick={onClose} disabled={upgrading}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {!recommendations.nextPlan && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">You're already on the highest plan!</p>
              <Button onClick={onClose}>Close</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 