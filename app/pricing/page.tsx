'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, Star, Zap, Crown, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import UpgradeModal from '@/components/upgrade-modal'
import { subscriptionManager } from '@/lib/subscriptionManager'

const plans = [
  {
    name: 'Free',
    description: 'Perfect for trying out AI travel planning',
    icon: Sparkles,
    features: [
      '1 AI-generated trip plan',
      '1 itinerary regeneration',
      'Basic trip management',
      'Email support',
      'Standard response time'
    ],
    limitations: [
      'No custom preferences',
      'Limited to 3-day trips max',
      'No export features',
      'No priority support'
    ],
    cta: 'Get Started Free',
    popular: false,
    color: 'border-gray-200'
  },
  {
    name: 'Explorer',
    description: 'Great for occasional travelers',
    icon: Zap,
    features: [
      '5 AI-generated trip plans per month',
      'Unlimited itinerary regenerations',
      'Advanced trip preferences',
      'PDF export',
      'Email & chat support',
      'Priority response time',
      'Trip sharing',
      'Budget optimization'
    ],
    limitations: [
      'No team collaboration',
      'No advanced analytics'
    ],
    cta: 'Start Explorer Plan',
    popular: true,
    color: 'border-blue-500'
  },
  {
    name: 'Adventurer',
    description: 'Perfect for frequent travelers',
    icon: Crown,
    features: [
      'Unlimited AI-generated trip plans',
      'Unlimited itinerary regenerations',
      'All Explorer features',
      'Advanced analytics & insights',
      'Multi-city trip planning',
      'Team collaboration (up to 3 users)',
      'Priority phone support',
      'Custom travel preferences',
      'Trip templates',
      'Advanced budget tracking'
    ],
    limitations: [
      'No enterprise features'
    ],
    cta: 'Start Adventurer Plan',
    popular: false,
    color: 'border-purple-500'
  }
]

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
  const { user } = useAuth()
  const router = useRouter()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradePlan, setUpgradePlan] = useState<'explorer' | 'adventurer' | null>(null)
  const [upgradeReason, setUpgradeReason] = useState('')
  const [currentPlan, setCurrentPlan] = useState<'free' | 'explorer' | 'adventurer'>('free')

  const getPlanPrice = (planName: string) => {
    if (planName === 'Free') return 'Free'
    const planKey = planName.toLowerCase() as 'explorer' | 'adventurer'
    return subscriptionManager.getFormattedPrice(planKey, billingPeriod)
  }

  const handleUpgradeClick = (plan: 'explorer' | 'adventurer') => {
    setUpgradePlan(plan)
    setUpgradeReason(`Upgrade to the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan for more features!`)
    setShowUpgradeModal(true)
  }

  // Helper to determine plan order
  const planOrder = ['free', 'explorer', 'adventurer']
  const currentPlanIndex = planOrder.indexOf(currentPlan)
  const getActionLabel = (plan: 'explorer' | 'adventurer') => {
    const nextPlanIndex = planOrder.indexOf(plan)
    if (nextPlanIndex > currentPlanIndex) return 'Upgrade'
    if (nextPlanIndex < currentPlanIndex) return 'Downgrade'
    return 'Change Plan'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
            <Sparkles className="w-4 h-4 mr-2" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Adventure
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with our free plan and upgrade as your travel needs grow. 
            All plans include our AI-powered trip planning technology.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 text-xs">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon
            const isPopular = plan.popular
            
            return (
              <Card 
                key={plan.name} 
                className={`relative ${plan.color} ${isPopular ? 'ring-2 ring-blue-500 shadow-xl' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-lg ${isPopular ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <IconComponent className={`w-6 h-6 ${isPopular ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {billingPeriod === 'annual' && plan.name !== 'Free' 
                        ? getPlanPrice(plan.name) 
                        : plan.name === 'Free' ? 'Free' : getPlanPrice(plan.name)}
                    </span>
                    <span className="text-gray-600 ml-1">
                      {plan.name === 'Free' ? '' : billingPeriod === 'annual' ? '/year' : '/month'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">What's included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitationIndex) => (
                          <li key={limitationIndex} className="flex items-start space-x-2">
                            <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="pt-4">
                    {plan.name === 'Free' ? (
                      <Button 
                        className={`w-full ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                        asChild
                      >
                        <Link href={user ? '/plan' : '/signup'}>
                          {plan.cta}
                        </Link>
                      </Button>
                    ) : (
                      <Button 
                        className={`w-full ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                        onClick={() => handleUpgradeClick(plan.name.toLowerCase() as 'explorer' | 'adventurer')}
                      >
                        {getActionLabel(plan.name.toLowerCase() as 'explorer' | 'adventurer')} to {plan.name}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-600 text-sm">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What happens to my trips if I downgrade?</h3>
                <p className="text-gray-600 text-sm">Your existing trips are always saved. You'll still be able to view them, but you may lose access to premium features.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
                <p className="text-gray-600 text-sm">We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade or downgrade my plan?</h3>
                <p className="text-gray-600 text-sm">Yes, you can change your plan at any time. Upgrades take effect immediately, downgrades at the next billing cycle.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
                <p className="text-gray-600 text-sm">Absolutely. We use enterprise-grade security and your data is encrypted both in transit and at rest.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600 text-sm">We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely through Stripe.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Planning?</h2>
              <p className="text-blue-100 mb-6">
                Join thousands of travelers who are already using AI to plan their perfect trips.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                  <Link href={user ? '/plan' : '/signup'}>
                    Start Planning Now
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link href="/dashboard">
                    View My Trips
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
        reason={upgradeReason}
        targetPlan={upgradePlan || undefined}
        billingPeriod={billingPeriod}
      />
    </div>
  )
} 