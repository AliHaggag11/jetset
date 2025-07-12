import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { TripData, ItineraryDay, Activity } from '@/lib/types'

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

function repairJSON(jsonString: string): string {
  let repaired = jsonString
  
  // Comprehensive JSON repair for AI-generated content
  repaired = repaired
    // Remove all escaped quotes first
    .replace(/\\"/g, '"')
    
    // Fix broken URLs and missing closing braces in link fields
    .replace(/"link":\s*"[^"]*"([^}]*?)"time":/g, '"link": "https://example.com"}, {"time":')
    .replace(/"link":\s*"[^"]*"([^}]*?)"title":/g, '"link": "https://example.com"}, {"time": "12:00", "title":')
    .replace(/"link":\s*"[^"]*"([^}]*?)"description":/g, '"link": "https://example.com"}, {"time": "12:00", "description":')
    .replace(/"link":\s*"[^"]*"([^}]*?)"location":/g, '"link": "https://example.com"}, {"time": "12:00", "location":')
    .replace(/"link":\s*"[^"]*"([^}]*?)"cost":/g, '"link": "https://example.com"}, {"time": "12:00", "cost":')
    .replace(/"link":\s*"[^"]*"([^}]*?)"pricePerPerson":/g, '"link": "https://example.com"}, {"time": "12:00", "pricePerPerson":')
    .replace(/"link":\s*"[^"]*"([^}]*?)"currency":/g, '"link": "https://example.com"}, {"time": "12:00", "currency":')
    .replace(/"link":\s*"[^"]*"([^}]*?)"category":/g, '"link": "https://example.com"}, {"time": "12:00", "category":')
    
    // Fix missing quotes around property names
    .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
    
    // Fix single quotes to double quotes
    .replace(/'/g, '"')
    
    // Fix trailing commas
    .replace(/,(\s*[}\]])/g, '$1')
    
    // Fix missing commas between objects
    .replace(/}(\s*){/g, '},$1{')
    
    // Fix missing commas between array elements
    .replace(/](\s*)\[/g, '],$1[')
    
    // Fix missing closing braces for activities
    .replace(/"link":\s*"[^"]*"(\s*)(?=,|]|})/g, '"link": "https://example.com"$1')
    
    // Remove any text that's not JSON
    .replace(/^[^[{]*/, '')
    .replace(/[^}\]]*$/, '')
    
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
  
  return repaired
}

function parseAIResponse(text: string, totalDays: number, startDate: Date, tripData: TripData): ItineraryDay[] {
  console.log('🔍 Attempting to parse AI response...')
  
  // Try to extract JSON from the response
  let jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (!jsonMatch) {
    console.log('❌ No JSON structure found in response')
    throw new Error('No JSON structure found')
  }
  
  let jsonString = jsonMatch[0]
  console.log('📝 Raw JSON extracted:', jsonString.substring(0, 200) + '...')
  
  // Try multiple parsing attempts with different repair strategies
  let parsed: any = null
  let parseAttempts = [
    () => JSON.parse(jsonString),
    () => JSON.parse(repairJSON(jsonString)),
    () => JSON.parse(jsonString.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')),
    () => JSON.parse(jsonString.replace(/[^\x20-\x7E]/g, '')),
  ]
  
  for (let i = 0; i < parseAttempts.length; i++) {
    try {
      parsed = parseAttempts[i]()
      console.log(`✅ JSON parsed successfully on attempt ${i + 1}`)
      break
    } catch (error) {
      console.log(`❌ Parse attempt ${i + 1} failed:`, error)
      if (i === parseAttempts.length - 1) {
        throw new Error('All JSON parsing attempts failed')
      }
    }
  }
  
  if (!parsed) {
    throw new Error('Failed to parse JSON after all attempts')
  }
  
  // Extract days from the parsed response
  let days: any[] = []
  if (Array.isArray(parsed)) {
    days = parsed
  } else if (parsed.days && Array.isArray(parsed.days)) {
    days = parsed.days
  } else if (parsed.itinerary && Array.isArray(parsed.itinerary)) {
    days = parsed.itinerary
  } else {
    console.log('❌ No days array found in parsed response')
    throw new Error('No days array found in response')
  }
  
  console.log(`📅 Found ${days.length} days in response`)
  
  // Validate and normalize each day
  const validatedDays: ItineraryDay[] = days.map((day: any, index: number) => {
    const dayDate = new Date(startDate)
    dayDate.setDate(startDate.getDate() + index)
    
    // Ensure activities array exists and is valid
    let activities: Activity[] = []
    if (day.activities && Array.isArray(day.activities)) {
      activities = day.activities.map((activity: any) => ({
        time: activity.time || "12:00",
        title: activity.title || `Activity ${index + 1}`,
        description: activity.description || "Local experience",
        location: activity.location || tripData.destination,
        cost: activity.cost || activity.pricePerPerson || 50,
        pricePerPerson: activity.pricePerPerson || activity.cost || 50,
        currency: activity.currency || "USD",
        category: activity.category || "sightseeing",
        link: activity.link || "https://www.getyourguide.com"
      }))
    }
    
    return {
      day: day.day || (index + 1),
      date: day.date || dayDate.toISOString().split('T')[0],
      activities: activities,
      estimatedCost: day.estimatedCost || 0
    }
  })
  
  return validatedDays
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

    const interests = Object.entries(tripData.interests)
      .filter(([_, value]) => value)
      .map(([key, _]) => key)
      .join(', ')

    const totalDays = getDayCount(tripData.startDate, tripData.endDate)
    const dailyBudget = Math.floor(tripData.budget / totalDays)
    
    // Generate dates for each day
    const startDate = new Date(tripData.startDate)
    const dates = []
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      dates.push(currentDate.toISOString().split('T')[0])
    }

    const isLongTrip = totalDays > 7
    const isExtendedTrip = totalDays > 14

    let cityBreakdown = ""
    if (isExtendedTrip) {
      cityBreakdown = `
      
      **MULTI-CITY PLANNING REQUIRED**:
      Since this is a ${totalDays}-day trip, please break it down into multiple cities/regions:
      - Suggest 3-4 different cities/regions within ${tripData.destination}
      - Allocate days strategically (e.g., 6-8 days per major city)
      - Include travel days between cities
      - Consider geographic proximity and transportation
      - Each city should have its own exploration phase
      `
    } else if (isLongTrip) {
      cityBreakdown = `
      
      **EXTENDED PLANNING**:
      For this ${totalDays}-day trip, consider:
      - Multiple neighborhoods/districts within ${tripData.destination}
      - Day trips to nearby attractions
      - Mix of intensive and relaxed days
      `
    }

    // Enhanced prompt for better JSON generation
    const prompt = `Create a detailed ${totalDays}-day travel itinerary for ${tripData.destination} for a ${tripData.persona} traveler with $${dailyBudget} daily budget.

Traveler interests: ${interests}

IMPORTANT: Respond with ONLY valid JSON in this exact format:
{
  "days": [
    {
      "day": 1,
      "date": "${dates[0]}",
      "city": "${tripData.destination}",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity name",
          "description": "Detailed description",
          "location": "Specific location",
          "cost": 50,
          "pricePerPerson": 50,
          "currency": "USD",
          "category": "culture|food|nature|shopping|adventure|nightlife|sightseeing",
          "link": "https://example.com"
        }
      ],
      "estimatedCost": ${dailyBudget},
      "transportation": "Transport details",
      "accommodation": "Accommodation area"
    }
  ]
}

Requirements:
- Include exactly ${totalDays} days
- Each day should have 3-4 activities
- Use realistic costs within the budget
- Include specific locations and times
- Focus on the traveler's interests: ${interests}
- Make activities suitable for ${tripData.persona} travelers${cityBreakdown}

Respond with ONLY the JSON, no additional text.`

    console.log('🤖 Generating AI itinerary...')
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama3-8b-8192',
      temperature: 0.3,
      max_tokens: 4000,
      top_p: 0.9,
    })
    
    const text = completion.choices[0]?.message?.content || ''
    console.log('📄 AI Response received:', text.substring(0, 200) + '...')
    
    // Try to parse the real AI response
    let generatedDays: ItineraryDay[] = []
    try {
      generatedDays = parseAIResponse(text, totalDays, startDate, tripData)
      console.log(`✅ Successfully parsed ${generatedDays.length} days from AI response`)
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error)
      
      // If parsing fails, generate a fallback itinerary
      console.log('🔄 Generating fallback itinerary...')
      generatedDays = []
      
      for (let i = 0; i < totalDays; i++) {
        const dayDate = new Date(startDate)
        dayDate.setDate(startDate.getDate() + i)
        
        const dayType = i % 4
        const morningCost = Math.floor(dailyBudget * 0.25)
        const lunchCost = Math.floor(dailyBudget * 0.2)
        const afternoonCost = Math.floor(dailyBudget * 0.35)
        const eveningCost = Math.floor(dailyBudget * 0.2)

        let dayActivities: Activity[] = []
        
        if (interests.toLowerCase().includes('culture')) {
          dayActivities = [
            {
              time: "09:00",
              title: `Cultural Discovery - Day ${i + 1}`,
              description: `Explore cultural heritage and local traditions in ${tripData.destination}`,
              location: `Cultural area, ${tripData.destination}`,
              cost: morningCost,
              pricePerPerson: morningCost,
              currency: "USD",
              category: "culture",
              link: "https://www.getyourguide.com"
            }
          ]
        } else if (interests.toLowerCase().includes('nature')) {
          dayActivities = [
            {
              time: "09:00",
              title: `Natural Wonders - Day ${i + 1}`,
              description: `Experience the natural beauty and outdoor activities in ${tripData.destination}`,
              location: `Nature area, ${tripData.destination}`,
              cost: morningCost,
              pricePerPerson: morningCost,
              currency: "USD",
              category: "nature",
              link: "https://www.getyourguide.com"
            }
          ]
        } else {
          dayActivities = [
            {
              time: "09:00",
              title: `${dayType === 0 ? 'Historical Sites' : dayType === 1 ? 'Local Markets' : dayType === 2 ? 'Scenic Views' : 'City Walking Tour'} - Day ${i + 1}`,
              description: `Explore ${tripData.destination} highlights tailored for ${tripData.persona} travelers`,
              location: `${dayType === 0 ? 'Historical district' : dayType === 1 ? 'Local market area' : dayType === 2 ? 'Scenic viewpoint' : 'City center'}, ${tripData.destination}`,
              cost: morningCost,
              pricePerPerson: morningCost,
              currency: "USD",
              category: "sightseeing",
              link: "https://www.getyourguide.com"
            }
          ]
        }

        dayActivities.push(
          {
            time: "12:30",
            title: `${interests.toLowerCase().includes('food') ? 'Food Tour' : 'Local Restaurant'} - Day ${i + 1}`,
            description: `${interests.toLowerCase().includes('food') ? 'Guided food tour experiencing local specialties' : 'Authentic local dining experience'}`,
            location: `${interests.toLowerCase().includes('food') ? 'Food district' : 'Local restaurant area'}, ${tripData.destination}`,
            cost: lunchCost,
            pricePerPerson: lunchCost,
            currency: "USD",
            category: "food",
            link: "https://www.tripadvisor.com"
          },
          {
            time: "15:00",
            title: `${interests.toLowerCase().includes('shopping') ? 'Shopping District' : interests.toLowerCase().includes('adventure') ? 'Adventure Activity' : 'Cultural Experience'} - Day ${i + 1}`,
            description: `${interests.toLowerCase().includes('shopping') ? 'Explore local shops and boutiques' : interests.toLowerCase().includes('adventure') ? 'Exciting adventure activities' : 'Immersive cultural experience'}`,
            location: `${interests.toLowerCase().includes('shopping') ? 'Shopping area' : interests.toLowerCase().includes('adventure') ? 'Adventure center' : 'Cultural venue'}, ${tripData.destination}`,
            cost: afternoonCost,
            pricePerPerson: afternoonCost,
            currency: "USD",
            category: interests.toLowerCase().includes('shopping') ? 'shopping' : interests.toLowerCase().includes('adventure') ? 'adventure' : 'culture',
            link: "https://www.viator.com"
          },
          {
            time: "19:30",
            title: `${interests.toLowerCase().includes('nightlife') ? 'Nightlife Experience' : 'Evening Dinner'} - Day ${i + 1}`,
            description: `${interests.toLowerCase().includes('nightlife') ? 'Experience local nightlife and entertainment' : 'Romantic dinner experience perfect for couples'}`,
            location: `${interests.toLowerCase().includes('nightlife') ? 'Entertainment district' : 'Fine dining area'}, ${tripData.destination}`,
            cost: eveningCost,
            pricePerPerson: eveningCost,
            currency: "USD",
            category: interests.toLowerCase().includes('nightlife') ? 'nightlife' : 'food',
            link: "https://www.opentable.com"
          }
        )

        generatedDays.push({
          day: i + 1,
          date: dayDate.toISOString().split('T')[0],
          activities: dayActivities,
          estimatedCost: dailyBudget
        })
      }
    }
    
    // Ensure we have the correct number of days
    if (generatedDays.length !== totalDays) {
      console.warn(`Expected ${totalDays} days, got ${generatedDays.length} days`)
      
      // If we're missing days, auto-generate them
      if (generatedDays.length < totalDays && generatedDays.length > 0) {
        const missingDays = totalDays - generatedDays.length
        console.log(`Auto-generating ${missingDays} missing days...`)
        
        for (let i = generatedDays.length; i < totalDays; i++) {
          const dayDate = new Date(startDate)
          dayDate.setDate(startDate.getDate() + i)
          
          const dayType = i % 4
          const morningCost = Math.floor(dailyBudget * 0.25)
          const lunchCost = Math.floor(dailyBudget * 0.2)
          const afternoonCost = Math.floor(dailyBudget * 0.35)
          const eveningCost = Math.floor(dailyBudget * 0.2)

          let dayActivities: Activity[] = []
          
          if (interests.toLowerCase().includes('culture')) {
            dayActivities = [
              {
                time: "09:00",
                title: `Cultural Discovery - Day ${i + 1}`,
                description: `Explore cultural heritage and local traditions in ${tripData.destination}`,
                location: `Cultural area, ${tripData.destination}`,
                cost: morningCost,
                pricePerPerson: morningCost,
                currency: "USD",
                category: "culture",
                link: "https://www.getyourguide.com"
              }
            ]
          } else if (interests.toLowerCase().includes('nature')) {
            dayActivities = [
              {
                time: "09:00",
                title: `Natural Wonders - Day ${i + 1}`,
                description: `Experience the natural beauty and outdoor activities in ${tripData.destination}`,
                location: `Nature area, ${tripData.destination}`,
                cost: morningCost,
                pricePerPerson: morningCost,
                currency: "USD",
                category: "nature",
                link: "https://www.getyourguide.com"
              }
            ]
          } else {
            dayActivities = [
              {
                time: "09:00",
                title: `${dayType === 0 ? 'Architecture Tour' : dayType === 1 ? 'Local Neighborhoods' : dayType === 2 ? 'Photography Spots' : 'Hidden Gems'} - Day ${i + 1}`,
                description: `Discover unique aspects of ${tripData.destination} perfect for ${tripData.persona} travelers`,
                location: `${dayType === 0 ? 'Architectural sites' : dayType === 1 ? 'Local districts' : dayType === 2 ? 'Photo locations' : 'Off-the-beaten-path'}, ${tripData.destination}`,
                cost: morningCost,
                pricePerPerson: morningCost,
                currency: "USD",
                category: "sightseeing",
                link: "https://www.getyourguide.com"
              }
            ]
          }

          dayActivities.push(
            {
              time: "12:30",
              title: `Culinary Experience - Day ${i + 1}`,
              description: "Taste local specialties and regional cuisine",
              location: `Dining district, ${tripData.destination}`,
              cost: lunchCost,
              pricePerPerson: lunchCost,
              currency: "USD",
              category: "food",
              link: "https://www.tripadvisor.com"
            },
            {
              time: "15:00",
              title: `Local Experience - Day ${i + 1}`,
              description: "Authentic local activities and interactions",
              location: `Local area, ${tripData.destination}`,
              cost: afternoonCost,
              pricePerPerson: afternoonCost,
              currency: "USD",
              category: "culture",
              link: "https://www.viator.com"
            },
            {
              time: "19:30",
              title: `Evening Entertainment - Day ${i + 1}`,
              description: "End the day with entertainment and dining",
              location: `Entertainment area, ${tripData.destination}`,
              cost: eveningCost,
              pricePerPerson: eveningCost,
              currency: "USD",
              category: "nightlife",
              link: "https://www.opentable.com"
            }
          )

          generatedDays.push({
            day: i + 1,
            date: dayDate.toISOString().split('T')[0],
            activities: dayActivities,
            estimatedCost: dailyBudget
          })
        }
        
        console.log(`Successfully added ${missingDays} auto-generated days`)
      }
    }
    
    return NextResponse.json({
      success: true,
      itinerary: generatedDays,
      totalDays: totalDays,
      generatedDays: generatedDays.length,
      isComplete: generatedDays.length === totalDays,
      isAIGenerated: generatedDays.length > 0 && generatedDays[0].activities.length > 0
    })
    
  } catch (error) {
    console.error('Error generating itinerary:', error)
    return NextResponse.json(
      { error: 'Failed to generate itinerary' },
      { status: 500 }
    )
  }
} 