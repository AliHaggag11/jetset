import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClientWithToken } from '@/lib/supabase-server'

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

    const body = await request.json()
    const { theme, language, notifications } = body

    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    let updateError
    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('profiles')
        .update({
          theme: theme || 'system',
          language: language || 'en',
          notification_preferences: notifications || {
            email: true,
            product: true,
            marketing: false
          }
        })
        .eq('id', user.id)
      updateError = error
    } else {
      // Insert new profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          theme: theme || 'system',
          language: language || 'en',
          notification_preferences: notifications || {
            email: true,
            product: true,
            marketing: false
          }
        })
      updateError = error
    }

    if (updateError) {
      console.error('Error updating settings:', updateError)
      return NextResponse.json(
        { error: 'Failed to save settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in settings route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { data, error } = await supabase
      .from('profiles')
      .select('theme, language, notification_preferences')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      theme: data?.theme || 'system',
      language: data?.language || 'en',
      notifications: data?.notification_preferences || {
        email: true,
        product: true,
        marketing: false
      }
    })

  } catch (error) {
    console.error('Error in settings route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 