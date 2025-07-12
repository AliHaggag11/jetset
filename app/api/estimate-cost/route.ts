import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { TripData } from '@/lib/types'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

function getDayCount(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays || 1
}

export async function POST(request: NextRequest) {
  try {
    const tripData: TripData = await request.json()
    
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    const prompt = `
      Estimate the total cost for a trip to ${tripData.destination} for ${getDayCount(tripData.startDate, tripData.endDate)} days.
      
      Trip Details:
      - Destination: ${tripData.destination}
      - Duration: ${getDayCount(tripData.startDate, tripData.endDate)} days
      - Traveler Type: ${tripData.persona}
      - Budget Range: $${tripData.budget}
      
      Please provide a realistic cost estimate in USD considering:
      - Accommodation (mid-range for ${tripData.persona})
      - Local transportation
      - Food and dining
      - Activities and attractions
      - Miscellaneous expenses
      
      Return only the number (no currency symbol or additional text).
    `

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama3-8b-8192',
      temperature: 0.3,
      max_tokens: 100,
    })
    
    const text = completion.choices[0]?.message?.content || ''
    
    const cost = parseInt(text.trim())
    
    return NextResponse.json({
      success: true,
      cost: isNaN(cost) ? tripData.budget : cost
    })
    
  } catch (error) {
    console.error('Error estimating cost:', error)
    return NextResponse.json(
      { error: 'Failed to estimate cost' },
      { status: 500 }
    )
  }
} 