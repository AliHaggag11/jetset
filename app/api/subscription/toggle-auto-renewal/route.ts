import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { subscriptionManager } from '@/lib/subscriptionManager'

export async function POST(request: NextRequest) {
  try {
    const { userId, autoRenewal } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (typeof autoRenewal !== 'boolean') {
      return NextResponse.json(
        { error: 'Auto-renewal must be a boolean value' },
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

    // Toggle auto-renewal
    const subscription = await subscriptionManager.toggleAutoRenewal(
      userId, 
      autoRenewal, 
      serviceSupabase
    )

    return NextResponse.json({ 
      success: true, 
      subscription,
      message: `Auto-renewal ${autoRenewal ? 'enabled' : 'disabled'}` 
    })

  } catch (error) {
    console.error('Error toggling auto-renewal:', error)
    return NextResponse.json(
      { error: 'Failed to update auto-renewal' },
      { status: 500 }
    )
  }
} 