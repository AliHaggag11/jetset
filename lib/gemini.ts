import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface TripData {
  destination: string
  startDate: string
  endDate: string
  budget: number
  persona: string
  interests: {
    culture: boolean
    food: boolean
    nature: boolean
    shopping: boolean
    nightlife: boolean
  }
}

export interface ItineraryDay {
  day: number
  date: string
  activities: Activity[]
  estimatedCost: number
}

export interface Activity {
  time: string
  title: string
  description: string
  location: string
  cost: number
  category: string
  link?: string
  pricePerPerson: number
  currency: string
}

export async function generateGeminiResponse(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to generate AI response')
  }
}

export async function generateItinerary(tripData: TripData): Promise<ItineraryDay[]> {
  try {
    const response = await fetch('/api/generate-itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tripData),
    })

    if (!response.ok) {
      throw new Error('Failed to generate itinerary')
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate itinerary')
    }

    return data.itinerary || []
  } catch (error) {
    console.error('Error generating itinerary:', error)
    throw new Error('Failed to generate itinerary')
  }
}

export async function estimateTripCost(tripData: TripData): Promise<number> {
  try {
    const response = await fetch('/api/estimate-cost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tripData),
    })

    if (!response.ok) {
      throw new Error('Failed to estimate cost')
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to estimate cost')
    }

    return data.cost || tripData.budget
  } catch (error) {
    console.error('Error estimating cost:', error)
    return tripData.budget
  }
}

export async function generateTripSuggestions(destination: string): Promise<string[]> {
  try {
    const response = await fetch('/api/trip-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ destination }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate suggestions')
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate suggestions')
    }

    return data.suggestions || []
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return []
  }
}

function getDayCount(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays || 1
}

export const PERSONA_OPTIONS = [
  { value: 'budget-backpacker', label: 'Budget Backpacker', description: 'Minimal spending, hostels, local transport' },
  { value: 'luxury-traveler', label: 'Luxury Traveler', description: 'High-end hotels, fine dining, premium experiences' },
  { value: 'family-friendly', label: 'Family Traveler', description: 'Kid-friendly activities, family restaurants, safe areas' },
  { value: 'adventure-seeker', label: 'Adventure Seeker', description: 'Outdoor activities, sports, unique experiences' },
  { value: 'culture-enthusiast', label: 'Culture Enthusiast', description: 'Museums, historical sites, local traditions' },
  { value: 'foodie', label: 'Foodie', description: 'Local cuisine, cooking classes, food tours' },
  { value: 'business-traveler', label: 'Business Traveler', description: 'Convenient locations, quick access, professional venues' },
  { value: 'romantic-couple', label: 'Romantic Couple', description: 'Romantic dining, scenic views, couple activities' }
] 