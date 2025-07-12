import { supabase } from './supabase'

export type PlanType = 'free' | 'explorer' | 'adventurer'

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  features: {
    trips_per_month: number
    regenerations_per_month: number
    max_trip_duration: number
    export: boolean
    priority_support: boolean
    team_collaboration: boolean
    advanced_analytics: boolean
    multi_city: boolean
    custom_preferences: boolean
  }
}

export const subscriptionManager = {
  // Available plans
  plans: {
    free: {
      id: 'free',
      name: 'Free',
      price: 0,
      features: {
        trips_per_month: 1,
        regenerations_per_month: 1,
        max_trip_duration: 3,
        export: false,
        priority_support: false,
        team_collaboration: false,
        advanced_analytics: false,
        multi_city: false,
        custom_preferences: false
      }
    },
    explorer: {
      id: 'explorer',
      name: 'Explorer',
      price: 9.99,
      features: {
        trips_per_month: 5,
        regenerations_per_month: -1, // unlimited
        max_trip_duration: 30,
        export: true,
        priority_support: true,
        team_collaboration: false,
        advanced_analytics: false,
        multi_city: false,
        custom_preferences: true
      }
    },
    adventurer: {
      id: 'adventurer',
      name: 'Adventurer',
      price: 19.99,
      features: {
        trips_per_month: -1, // unlimited
        regenerations_per_month: -1, // unlimited
        max_trip_duration: -1, // unlimited
        export: true,
        priority_support: true,
        team_collaboration: true,
        advanced_analytics: true,
        multi_city: true,
        custom_preferences: true
      }
    }
  } as const,

  // Get user's current subscription
  async getCurrentSubscription(userId: string) {
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

  // Create or update subscription
  async updateSubscription(userId: string, plan: PlanType, supabaseClient = supabase) {
    const now = new Date()
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const { data, error } = await supabaseClient
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: now.toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`)
    }

    return data
  },

  // Check if user has access to a specific feature
  async hasFeatureAccess(userId: string, feature: keyof SubscriptionPlan['features']): Promise<boolean> {
    const subscription = await this.getCurrentSubscription(userId)
    const plan: PlanType = (subscription?.plan as PlanType) || 'free'
    const planFeatures = this.plans[plan].features

    const value = planFeatures[feature]
    
    // Handle numeric features (trips_per_month, regenerations_per_month, max_trip_duration)
    if (typeof value === 'number') {
      return value === -1 || value > 0
    }
    
    // Handle boolean features (export, priority_support, etc.)
    return value === true
  },

  // Get feature limit for user (only for numeric features)
  async getFeatureLimit(userId: string, feature: 'trips_per_month' | 'regenerations_per_month' | 'max_trip_duration'): Promise<number> {
    const subscription = await this.getCurrentSubscription(userId)
    const plan: PlanType = (subscription?.plan as PlanType) || 'free'
    const planFeatures = this.plans[plan].features

    return planFeatures[feature]
  },

  // Check if user can perform an action
  async canPerformAction(userId: string, action: string, currentUsage: number = 0): Promise<{ allowed: boolean; reason?: string; limit?: number }> {
    const subscription = await this.getCurrentSubscription(userId)
    const plan: PlanType = (subscription?.plan as PlanType) || 'free'
    const planFeatures = this.plans[plan].features

    switch (action) {
      case 'create_trip':
        const tripLimit = planFeatures.trips_per_month
        if (tripLimit === -1) return { allowed: true }
        if (currentUsage >= tripLimit) {
          return { 
            allowed: false, 
            reason: `You've reached your monthly limit of ${tripLimit} trips. Upgrade to ${plan === 'free' ? 'Explorer' : 'Adventurer'} for more.`,
            limit: tripLimit
          }
        }
        return { allowed: true, limit: tripLimit }

      case 'regenerate_itinerary':
        const regenLimit = planFeatures.regenerations_per_month
        if (regenLimit === -1) return { allowed: true }
        if (currentUsage >= regenLimit) {
          return { 
            allowed: false, 
            reason: `You've reached your monthly regeneration limit of ${regenLimit}. Upgrade to Explorer for unlimited regenerations.`,
            limit: regenLimit
          }
        }
        return { allowed: true, limit: regenLimit }

      case 'export_itinerary':
        if (!planFeatures.export) {
          return { 
            allowed: false, 
            reason: 'PDF export is only available on Explorer and Adventurer plans.' 
          }
        }
        return { allowed: true }

      case 'multi_city_planning':
        if (!planFeatures.multi_city) {
          return { 
            allowed: false, 
            reason: 'Multi-city planning is only available on the Adventurer plan.' 
          }
        }
        return { allowed: true }

      case 'team_collaboration':
        if (!planFeatures.team_collaboration) {
          return { 
            allowed: false, 
            reason: 'Team collaboration is only available on the Adventurer plan.' 
          }
        }
        return { allowed: true }

      case 'advanced_analytics':
        if (!planFeatures.advanced_analytics) {
          return { 
            allowed: false, 
            reason: 'Advanced analytics are only available on the Adventurer plan.' 
          }
        }
        return { allowed: true }

      default:
        return { allowed: false, reason: 'Unknown action' }
    }
  },

  // Get upgrade recommendations
  getUpgradeRecommendations(currentPlan: PlanType) {
    const recommendations = {
      free: {
        nextPlan: 'explorer',
        benefits: [
          '5 trips per month (instead of 1)',
          'Unlimited itinerary regenerations',
          'PDF export functionality',
          'Priority support',
          'Advanced trip preferences'
        ],
        price: '$9.99/month'
      },
      explorer: {
        nextPlan: 'adventurer',
        benefits: [
          'Unlimited trips per month',
          'Multi-city trip planning',
          'Team collaboration (up to 3 users)',
          'Advanced analytics & insights',
          'Priority phone support',
          'Trip templates'
        ],
        price: '$19.99/month'
      },
      adventurer: {
        nextPlan: null,
        benefits: [],
        price: null
      }
    }

    return recommendations[currentPlan]
  },

  // Validate trip duration based on plan
  async validateTripDuration(userId: string, startDate: string, endDate: string): Promise<{ valid: boolean; reason?: string }> {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    const subscription = await this.getCurrentSubscription(userId)
    const plan: PlanType = (subscription?.plan as PlanType) || 'free'
    const maxDuration = this.plans[plan].features.max_trip_duration

    if (maxDuration === -1) return { valid: true }

    if (duration > maxDuration) {
      return { 
        valid: false, 
        reason: `Your ${plan} plan allows trips up to ${maxDuration} days. This trip is ${duration} days. Upgrade your plan for longer trips.` 
      }
    }

    return { valid: true }
  }
} 