'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TripWizard, { TripFormData } from '@/components/trip-wizard/trip-wizard'
import { tripService } from '@/lib/tripService'
import { useAuth } from '@/lib/auth'
import { subscriptionService } from '@/lib/subscriptionService'
import { subscriptionManager } from '@/lib/subscriptionManager'
import type { TripData } from '@/lib/types'
import UpgradeModal from '@/components/upgrade-modal'

export default function PlanPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('')
  const [currentPlan, setCurrentPlan] = useState<'free' | 'explorer' | 'adventurer'>('free')
  const [canCreateTrip, setCanCreateTrip] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    async function checkTripLimit() {
      if (user) {
        const sub = await subscriptionService.getUserSubscription(user.id)
        setCurrentPlan(sub?.plan || 'free')
        const usage = await subscriptionService.getUserUsage(user.id)
        const canCreate = await subscriptionManager.canPerformAction(
          user.id,
          'create_trip',
          usage.trips_created
        )
        if (!canCreate.allowed) {
          setUpgradeReason(canCreate.reason || 'You have reached your trip limit.')
          setShowUpgradeModal(true)
          setCanCreateTrip(false)
        } else {
          setCanCreateTrip(true)
        }
      }
    }
    checkTripLimit()
  }, [user])

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push('/login')
    return null
  }

  const handleTripComplete = async (formData: TripFormData) => {
    if (!user) {
      router.push('/login')
      return
    }

    setIsCreating(true)
    
    try {
      // Check if user can create a trip based on their plan
      const usage = await subscriptionService.getUserUsage(user.id)
      const canCreate = await subscriptionManager.canPerformAction(
        user.id, 
        'create_trip', 
        usage.trips_created
      )
      
      if (!canCreate.allowed) {
        alert(canCreate.reason)
        router.push('/pricing')
        return
      }

      // Create trip in Supabase
      const trip = await tripService.createTrip(formData, user.id)
      
      // Redirect to itinerary generation page
      router.push(`/itinerary/${trip.id}`)
      
    } catch (error) {
      console.error('Error creating trip:', error)
      // Handle error - show toast or error message
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Plan Your Perfect Trip
          </h1>
          <p className="text-gray-600">
            Let AI help you create an amazing travel itinerary tailored to your preferences
          </p>
        </div>
        
        {canCreateTrip && (
          <TripWizard onComplete={handleTripComplete} />
        )}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            setRedirecting(true);
            router.push('/');
          }}
          currentPlan={currentPlan}
          reason={upgradeReason}
        />
        {redirecting && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/60 backdrop-blur-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-semibold">Redirecting...</p>
            </div>
          </div>
        )}
        
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-semibold">Creating your trip...</p>
              <p className="text-gray-600">This may take a moment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 