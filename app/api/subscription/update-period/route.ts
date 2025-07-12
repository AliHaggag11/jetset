import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { subscriptionManager } from '@/lib/subscriptionManager'
import type { PeriodType } from '@/lib/subscriptionManager'

export async function POST(request: NextRequest) {
  try {
    const { userId, period } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!period || !['monthly', 'annual'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be monthly or annual' },
        { status: 400 }
      )
    }

    // Create a Supabase client with the service role key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.')
    }
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    // Update the subscription period
    const subscription = await subscriptionManager.updateSubscriptionPeriod(
      userId, 
      period as PeriodType, 
      serviceSupabase
    )

    return NextResponse.json({ 
      success: true, 
      subscription,
      message: `Successfully updated to ${period} billing` 
    })

  } catch (error) {
    console.error('Error updating subscription period:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription period' },
      { status: 500 }
    )
  }
} 