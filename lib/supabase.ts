import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const createSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Database = {
  public: {
    Tables: {
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'free' | 'explorer' | 'adventurer'
          status: 'active' | 'inactive' | 'cancelled'
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: 'free' | 'explorer' | 'adventurer'
          status?: 'active' | 'inactive' | 'cancelled'
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'free' | 'explorer' | 'adventurer'
          status?: 'active' | 'inactive' | 'cancelled'
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          title: string | null
          destination: string | null
          start_date: string | null
          end_date: string | null
          budget: number | null
          persona: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          destination?: string | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          persona?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          destination?: string | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          persona?: string | null
          created_at?: string
        }
      }
      trip_preferences: {
        Row: {
          id: string
          trip_id: string
          interest_culture: boolean | null
          interest_food: boolean | null
          interest_nature: boolean | null
          interest_shopping: boolean | null
          interest_nightlife: boolean | null
        }
        Insert: {
          id?: string
          trip_id: string
          interest_culture?: boolean | null
          interest_food?: boolean | null
          interest_nature?: boolean | null
          interest_shopping?: boolean | null
          interest_nightlife?: boolean | null
        }
        Update: {
          id?: string
          trip_id?: string
          interest_culture?: boolean | null
          interest_food?: boolean | null
          interest_nature?: boolean | null
          interest_shopping?: boolean | null
          interest_nightlife?: boolean | null
        }
      }
      itineraries: {
        Row: {
          id: string
          trip_id: string
          day: number
          content: any
          cost_estimate: number | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          day: number
          content: any
          cost_estimate?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          day?: number
          content?: any
          cost_estimate?: number | null
          created_at?: string
        }
      }
      deal_alerts: {
        Row: {
          id: string
          trip_id: string
          type: string | null
          description: string | null
          link: string | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          type?: string | null
          description?: string | null
          link?: string | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          type?: string | null
          description?: string | null
          link?: string | null
          is_active?: boolean | null
          created_at?: string
        }
      }
      ai_requests: {
        Row: {
          id: string
          trip_id: string
          prompt: string | null
          response: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          prompt?: string | null
          response?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          prompt?: string | null
          response?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          profile_image_url: string | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
        }
      }
    }
  }
} 