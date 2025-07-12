'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, Zap, Plane, Check, X } from 'lucide-react'
import { subscriptionManager } from '@/lib/subscriptionManager'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { PlanType } from '@/lib/subscriptionManager'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: 'free' | 'explorer' | 'adventurer'
  reason: string
  targetPlan?: 'explorer' | 'adventurer'
  billingPeriod?: 'monthly' | 'annual'
}

export default function UpgradeModal({ isOpen, onClose, currentPlan, reason, targetPlan, billingPeriod = 'monthly' }: UpgradeModalProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [upgrading, setUpgrading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setSuccess(false)
      setErrorMsg(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const recommendations = subscriptionManager.getUpgradeRecommendations(currentPlan)

  // Use targetPlan if provided, otherwise use recommendations.nextPlan
  const planToChange = targetPlan || recommendations.nextPlan
  const planOrder = ['free', 'explorer', 'adventurer']
  const currentPlanIndex = planOrder.indexOf(currentPlan)
  const nextPlanIndex = planToChange ? planOrder.indexOf(planToChange) : -1
  const isUpgrade = nextPlanIndex > currentPlanIndex
  const isDowngrade = nextPlanIndex < currentPlanIndex && nextPlanIndex !== -1
  const actionLabel = isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Change Plan'

  // Get plan info for UI
  const planInfo = planToChange ? subscriptionManager.plans[planToChange as PlanType] : null
  const planBenefits = planInfo ? Object.entries(planInfo.features).filter(([k, v]) => v && typeof v !== 'number').map(([k]) => k.replace(/_/g, ' ')) : []
  const planPrice = planInfo ? subscriptionManager.getFormattedPrice(planToChange as PlanType, billingPeriod) : ''

  const handleUpgrade = async (plan: 'explorer' | 'adventurer') => {
    if (!user) {
      router.push('/signup')
      return
    }

    setUpgrading(true)
    setErrorMsg(null)
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          userId: user.id,
          period: billingPeriod,
          autoRenewal: true
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        const data = await response.json()
        setErrorMsg(data.error || 'Failed to upgrade subscription')
      }
    } catch (error) {
      setErrorMsg('Failed to upgrade subscription')
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
            <span>{isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Change'} Your Plan</span>
          </CardTitle>
          <p className="text-sm text-gray-600">{reason}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <div className="text-center py-8">
              <p className="text-green-700 font-semibold text-lg mb-2">Plan changed successfully!</p>
              <p className="text-gray-600">Redirecting to your dashboard...</p>
            </div>
          ) : planToChange && planInfo && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getPlanIcon(planToChange)}
                  <span className="font-semibold capitalize">{planInfo.name}</span>
                  <Badge className={getPlanColor(planToChange)}>
                    {planPrice}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">What you'll get:</p>
                <ul className="space-y-1">
                  {planBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => handleUpgrade(planToChange as 'explorer' | 'adventurer')}
                  disabled={upgrading}
                  className="flex-1"
                >
                  {upgrading
                    ? `${actionLabel}...`
                    : `${actionLabel} to ${planInfo.name}`}
                </Button>
                <Button variant="outline" onClick={onClose} disabled={upgrading}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {errorMsg && <div className="text-red-600 text-sm text-center pt-2">{errorMsg}</div>}
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