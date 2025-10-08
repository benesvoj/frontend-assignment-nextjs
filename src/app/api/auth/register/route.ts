import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { findUserByEmail, addUser } from '@/utils/serverUtils'
import { getUserDisplayName } from '@/utils/userUtils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if Supabase is configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url') {
      const supabase = await createServerClient()

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name, // Store name in user metadata
          },
        },
      })

      if (error) {
        console.error('Supabase auth error:', error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      if (!data.user) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        user: {
          email: data.user.email,
          name: getUserDisplayName(data.user.user_metadata, data.user.email!),
          createdAt: data.user.created_at,
        }
      }, { status: 201 })
    } else {
      // Fallback to in-memory storage when Supabase is not configured
      const existingUser = findUserByEmail(email)
      if (existingUser) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
      }

      const newUser = addUser(name, email, password)

      // Return user without password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = newUser

      return NextResponse.json({ 
        success: true, 
        user: userWithoutPassword 
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error during registration:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
