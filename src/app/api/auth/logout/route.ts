import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST() {
  try {
    const supabase = await createServerClient()
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
