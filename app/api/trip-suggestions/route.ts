import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { destination } = await request.json()
    
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    const prompt = `
      Suggest 5 alternative destinations similar to ${destination} for travelers.
      Consider climate, culture, activities, and cost.
      
      Return only a JSON array of destination names:
      ["Destination 1", "Destination 2", "Destination 3", "Destination 4", "Destination 5"]
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
      max_tokens: 200,
    })
    
    const text = completion.choices[0]?.message?.content || ''
    
    // Clean and parse the response
    const cleanResponse = text.replace(/```json\n?|```\n?/g, '').trim()
    const suggestions = JSON.parse(cleanResponse)
    
    return NextResponse.json({
      success: true,
      suggestions: Array.isArray(suggestions) ? suggestions : []
    })
    
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
} 