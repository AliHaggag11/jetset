import { supabase } from './supabase'
import type { TripData, ItineraryDay } from './types'

export interface Trip {
  id: string
  user_id: string
  title: string
  destination: string
  start_date: string
  end_date: string
  budget: number
  persona: string
  created_at: string
  itinerary?: ItineraryDay[]
  itineraries?: Array<{
    id: string
    trip_id: string
    day: number
    content: ItineraryDay
    cost_estimate: number
    created_at: string
  }>
  trip_preferences?: Array<{
    id: string
    trip_id: string
    interest_culture: boolean
    interest_food: boolean
    interest_nature: boolean
    interest_shopping: boolean
    interest_nightlife: boolean
  }>
  share_id?: string
}

export interface CreateTripData {
  title: string
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

export const tripService = {
  // Create a new trip
  async createTrip(tripData: CreateTripData, userId: string): Promise<Trip> {
    const { data, error } = await supabase
      .from('trips')
      .insert({
        user_id: userId,
        title: tripData.title,
        destination: tripData.destination,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        budget: tripData.budget,
        persona: tripData.persona,
        share_id: crypto.randomUUID ? crypto.randomUUID() : undefined,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create trip: ${error.message}`)
    }

    // Save trip preferences
    await supabase
      .from('trip_preferences')
      .insert({
        trip_id: data.id,
        interest_culture: tripData.interests.culture,
        interest_food: tripData.interests.food,
        interest_nature: tripData.interests.nature,
        interest_shopping: tripData.interests.shopping,
        interest_nightlife: tripData.interests.nightlife,
      })

    return data
  },

  // Get all trips for a user
  async getUserTrips(userId: string): Promise<Trip[]> {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        trip_preferences (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch trips: ${error.message}`)
    }

    return data || []
  },

  // Get a single trip by ID
  async getTrip(tripId: string, userId: string): Promise<Trip | null> {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        trip_preferences (*),
        itineraries (*)
      `)
      .eq('id', tripId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Trip not found
      }
      throw new Error(`Failed to fetch trip: ${error.message}`)
    }

    return data
  },

  // Get a trip by share_id (public view)
  async getTripByShareId(shareId: string): Promise<Trip | null> {
    const { data, error } = await supabase
      .from('trips')
      .select(`*, trip_preferences (*), itineraries (*)`)
      .eq('share_id', shareId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Trip not found
      }
      throw new Error(`Failed to fetch trip by share_id: ${error.message}`)
    }

    return data
  },

  // Save itinerary for a trip
  async saveItinerary(tripId: string, itinerary: ItineraryDay[]): Promise<void> {
    // First, delete existing itineraries for this trip
    await supabase
      .from('itineraries')
      .delete()
      .eq('trip_id', tripId)

    // Then insert the new itinerary
    const itineraryData = itinerary.map((day, index) => ({
      trip_id: tripId,
      day: day.day,
      content: day,
      cost_estimate: day.estimatedCost,
    }))

    const { error } = await supabase
      .from('itineraries')
      .insert(itineraryData)

    if (error) {
      throw new Error(`Failed to save itinerary: ${error.message}`)
    }
  },

  // Delete a trip
  async deleteTrip(tripId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete trip: ${error.message}`)
    }
  },
}