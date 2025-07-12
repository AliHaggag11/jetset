import { supabase } from './supabase'

export interface UserSubscription {
  id: string
  user_id: string
  plan: 'free' | 'explorer' | 'adventurer'
  status: 'active' | 'inactive' | 'cancelled'
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export interface UsageStats {
  trips_created: number
  itineraries_generated: number
  regenerations_used: number
  monthly_limit: number
  regeneration_limit: number
}

export const subscriptionService = {
  // Get user's current subscription
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No active subscription
      }
      throw new Error(`Failed to fetch subscription: ${error.message}`)
    }

    return data
  },

  // Get user's usage statistics
  async getUserUsage(userId: string): Promise<UsageStats> {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const monthStart = currentMonth.toISOString();

    // Count trips created this month
    const { count: tripCount, error: tripsError } = await supabase
      .from('trips')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStart);

    // Count regenerations this month
    const { count: regenCount, error: regenError } = await supabase
      .from('ai_requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStart);

    // Get user's plan limits
    const subscription = await this.getUserSubscription(userId);
    const plan = subscription?.plan || 'free';
    const limits = {
      free: { trips: 1, regenerations: 1 },
      explorer: { trips: 5, regenerations: -1 },
      adventurer: { trips: -1, regenerations: -1 }
    };

    return {
      trips_created: tripCount ?? 0,
      itineraries_generated: 0, // update if you want to count itineraries
      regenerations_used: regenCount ?? 0,
      monthly_limit: limits[plan].trips,
      regeneration_limit: limits[plan].regenerations
    };
  },

  // Check if user can create a new trip
  async canCreateTrip(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const usage = await this.getUserUsage(userId)
    
    if (usage.monthly_limit === -1) {
      return { allowed: true } // Unlimited plan
    }

    if (usage.trips_created >= usage.monthly_limit) {
      return { 
        allowed: false, 
        reason: `You've reached your monthly limit of ${usage.monthly_limit} trips. Upgrade your plan for more.` 
      }
    }

    return { allowed: true }
  },

  // Check if user can regenerate itinerary
  async canRegenerateItinerary(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const usage = await this.getUserUsage(userId)
    
    if (usage.regeneration_limit === -1) {
      return { allowed: true } // Unlimited plan
    }

    if (usage.regenerations_used >= usage.regeneration_limit) {
      return { 
        allowed: false, 
        reason: `You've reached your monthly regeneration limit of ${usage.regeneration_limit}. Upgrade your plan for unlimited regenerations.` 
      }
    }

    return { allowed: true }
  },

  // Record a trip creation
  async recordTripCreation(userId: string, tripId: string): Promise<void> {
    // Trip creation is already recorded in the trips table
    // This method can be used for additional tracking if needed
  },

  // Record an itinerary generation
  async recordItineraryGeneration(userId: string, tripId: string): Promise<void> {
    // Itinerary generation is already recorded in the itineraries table
    // This method can be used for additional tracking if needed
  },

  // Record a regeneration
  async recordRegeneration(userId: string, tripId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_requests')
      .insert({
        user_id: userId,
        trip_id: tripId,
        prompt: 'Itinerary regeneration',
        response: 'Regenerated itinerary'
      })

    if (error) {
      throw new Error(`Failed to record regeneration: ${error.message}`)
    }
  },

  // Helper to check if user can regenerate
  async canRegenerate(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const usage = await this.getUserUsage(userId)
    if (usage.regeneration_limit === -1) return { allowed: true }
    if (usage.regenerations_used >= usage.regeneration_limit) {
      return {
        allowed: false,
        reason: `You've reached your monthly regeneration limit. Upgrade for more!`
      }
    }
    return { allowed: true }
  },

  // Get plan features
  getPlanFeatures(plan: 'free' | 'explorer' | 'adventurer') {
    const features = {
      free: {
        trips_per_month: 1,
        regenerations_per_month: 1,
        max_trip_duration: 3,
        export: false,
        priority_support: false,
        team_collaboration: false,
        advanced_analytics: false
      },
      explorer: {
        trips_per_month: 5,
        regenerations_per_month: -1, // unlimited
        max_trip_duration: 30,
        export: true,
        priority_support: true,
        team_collaboration: false,
        advanced_analytics: false
      },
      adventurer: {
        trips_per_month: -1, // unlimited
        regenerations_per_month: -1, // unlimited
        max_trip_duration: -1, // unlimited
        export: true,
        priority_support: true,
        team_collaboration: true,
        advanced_analytics: true
      }
    }

    return features[plan]
  },

  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) return null
    return data
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: { first_name?: string; last_name?: string; profile_image_url?: string }) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  // Delete user profile
  async deleteUserProfile(userId: string) {
    // Delete from profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
    
    if (profileError) {
      console.error('Error deleting profile:', profileError)
    }

    // Delete from user_subscriptions table
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('user_id', userId)
    
    if (subError) {
      console.error('Error deleting subscription:', subError)
    }

    // Delete from trips table
    const { error: tripsError } = await supabase
      .from('trips')
      .delete()
      .eq('user_id', userId)
    
    if (tripsError) {
      console.error('Error deleting trips:', tripsError)
    }

    // Delete from ai_requests table
    const { error: aiError } = await supabase
      .from('ai_requests')
      .delete()
      .eq('user_id', userId)
    
    if (aiError) {
      console.error('Error deleting AI requests:', aiError)
    }
  }
} 