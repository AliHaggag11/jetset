'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TripWizard, { TripFormData } from '@/components/trip-wizard/trip-wizard'
import { tripService } from '@/lib/tripService'
import { useAuth } from '@/lib/auth'
import { subscriptionService } from '@/lib/subscriptionService'
import { subscriptionManager } from '@/lib/subscriptionManager'
import type { TripData } from '@/lib/types'

export default function PlanPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const { user, loading: authLoading } = useAuth()

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
        
        <TripWizard onComplete={handleTripComplete} />
        
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