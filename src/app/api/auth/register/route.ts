import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, addUser } from '@/utils/serverUtils'

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

    // Check if user already exists
    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    const newUser = addUser(name, email, password)

    // Return user without password
    const { password: _unused, ...userWithoutPassword } = newUser

    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword 
    }, { status: 201 })
  } catch (error) {
    console.error('Error during registration:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
