import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { findUserByCredentials } from '@/utils/serverUtils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Check if Supabase is configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createServerClient()

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Supabase auth error:', error)
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      if (!data.user) {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        user: {
          email: data.user.email,
          name: data.user.user_metadata.name,
          createdAt: data.user.created_at,
        }
      })
    } else {
      // Fallback to in-memory storage when Supabase is not configured
      const user = findUserByCredentials(email, password)
      
      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      // Return user without password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user

      return NextResponse.json({ 
        success: true, 
        user: userWithoutPassword 
      })
    }
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
