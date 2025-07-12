import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClientWithToken } from '@/lib/supabase-server'
import { subscriptionService } from '@/lib/subscriptionService'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    // Extract the token from the header
    const token = authHeader.replace('Bearer ', '')
    
    // Create Supabase client with token
    const supabase = createSupabaseServerClientWithToken(token)
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Delete user profile first
    await subscriptionService.deleteUserProfile(user.id)
    
    // Delete the user account using admin functions
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error in delete account route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 