import { NextRequest, NextResponse } from 'next/server'
import { subscriptionManager } from '@/lib/subscriptionManager'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { plan, userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!plan || !['explorer', 'adventurer'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be explorer or adventurer' },
        { status: 400 }
      )
    }

    // Update the user's subscription
    const subscription = await subscriptionManager.updateSubscription(userId, plan)

    return NextResponse.json({
      success: true,
      subscription,
      message: `Successfully upgraded to ${plan} plan`
    })

  } catch (error) {
    console.error('Error upgrading subscription:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    )
  }
} 