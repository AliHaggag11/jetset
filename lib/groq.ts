import Groq from 'groq-sdk'
import type { TripData, ItineraryDay } from './types'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function generateGroqResponse(prompt: string): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama3-70b-8192', // Fast and capable model
      temperature: 0.3,
      max_tokens: 8192,
      top_p: 0.8,
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Groq API error:', error)
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