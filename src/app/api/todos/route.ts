import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getTodosByUserId, addTodo, getTodosByEmail, addTodoInMemory } from '@/utils/serverUtils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    // Check if Supabase is configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createServerClient()

      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Get todos for the authenticated user
      const userTodos = await getTodosByUserId(user.id)

      return NextResponse.json({
        success: true,
        todos: userTodos
      })
    } else {
      // Fallback to in-memory storage
      const userTodos = getTodosByEmail(userEmail)
      return NextResponse.json({ 
        success: true, 
        todos: userTodos 
      })
    }
  } catch (error) {
    console.error('Error fetching todos:', error)
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, description, userEmail } = body

    if (!text || !userEmail) {
      return NextResponse.json({ error: 'Text and userEmail are required' }, { status: 400 })
    }

    // Check if Supabase is configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createServerClient()

      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const newTodo = await addTodo(text, description, user.id)

      return NextResponse.json({
        success: true,
        todo: newTodo
      }, { status: 201 })
    } else {
      // Fallback to in-memory storage
      const newTodo = addTodoInMemory(text, description, userEmail)

      return NextResponse.json({ 
        success: true, 
        todo: newTodo 
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating todo:', error)
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 })
  }
}
