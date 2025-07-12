'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TripWizard, { TripFormData } from '@/components/trip-wizard/trip-wizard'
import { supabase } from '@/lib/supabase'
import { generateItinerary } from '@/lib/groq'
import type { TripData } from '@/lib/types'

export default function PlanPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleTripComplete = async (formData: TripFormData) => {
    setIsCreating(true)
    
    try {
      // Transform form data to match Gemini API expectations
      const tripData: TripData = {
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget,
        persona: formData.persona,
        interests: formData.interests
      }

      // For now, we'll just save to localStorage since we don't have auth yet
      // In production, this would save to Supabase after authentication
      const tripId = Date.now().toString()
      const tripWithId = {
        id: tripId,
        ...formData,
        created_at: new Date().toISOString()
      }

      // Save to localStorage temporarily
      const existingTrips = JSON.parse(localStorage.getItem('jetset_trips') || '[]')
      existingTrips.push(tripWithId)
      localStorage.setItem('jetset_trips', JSON.stringify(existingTrips))

      // Generate itinerary (this will be done on the itinerary page)
      // For now, redirect to a success page or itinerary page
      router.push(`/itinerary/${tripId}`)
      
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