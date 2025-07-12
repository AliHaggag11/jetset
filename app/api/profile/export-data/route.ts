import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClientWithToken } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
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

    // Fetch all user data
    const [profileData, tripsData, subscriptionData, aiRequestsData] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('trips').select('*').eq('user_id', user.id),
      supabase.from('user_subscriptions').select('*').eq('user_id', user.id),
      supabase.from('ai_requests').select('*').eq('user_id', user.id)
    ])

    // Compile the data
    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      },
      profile: profileData.data,
      trips: tripsData.data || [],
      subscription: subscriptionData.data || [],
      ai_requests: aiRequestsData.data || [],
      export_date: new Date().toISOString()
    }

    // Convert to JSON string
    const jsonData = JSON.stringify(exportData, null, 2)
    
    // Create response with proper headers for file download
    const response = new NextResponse(jsonData)
    response.headers.set('Content-Type', 'application/json')
    response.headers.set('Content-Disposition', `attachment; filename="jetset-data-${user.id}-${new Date().toISOString().split('T')[0]}.json"`)
    
    return response
    
  } catch (error) {
    console.error('Error in export data route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 