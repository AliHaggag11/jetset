import { NextRequest, NextResponse } from 'next/server'
import { subscriptionManager } from '@/lib/subscriptionManager'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { plan, userId, period = 'monthly', autoRenewal = true } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!plan || !['free', 'explorer', 'adventurer'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be free, explorer or adventurer' },
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

    // Update the subscription with period and auto-renewal
    await subscriptionManager.updateSubscription(
      userId, 
      plan, 
      period, 
      autoRenewal, 
      serviceSupabase
    )

    return NextResponse.json({ 
      success: true, 
      message: `Successfully upgraded to ${plan} plan (${period})` 
    })

  } catch (error) {
    console.error('Error upgrading subscription:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    )
  }
} 