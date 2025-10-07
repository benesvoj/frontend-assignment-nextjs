import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { updateTodoInStorage, deleteTodoFromStorage, updateTodoInMemory, deleteTodoFromMemory } from '@/utils/serverUtils'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const todoId = parseInt(id)
    const body = await request.json()
    const { text, description, completed, userEmail } = body

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

      const updatedTodo = await updateTodoInStorage(todoId, {
        text,
        description,
        completed
      }, user.id)

      if (!updatedTodo) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        todo: updatedTodo
      })
    } else {
      // Fallback to in-memory storage
      const updatedTodo = updateTodoInMemory(todoId, {
        text,
        description,
        completed
      }, userEmail)

      if (!updatedTodo) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        todo: updatedTodo
      })
    }
  } catch (error) {
    console.error('Error updating todo:', error)
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const todoId = parseInt(id)
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

      const success = await deleteTodoFromStorage(todoId, user.id)

      if (!success) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        message: 'Todo deleted successfully'
      })
    } else {
      // Fallback to in-memory storage
      const success = deleteTodoFromMemory(todoId, userEmail)

      if (!success) {
        return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        message: 'Todo deleted successfully'
      })
    }
  } catch (error) {
    console.error('Error deleting todo:', error)
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 })
  }
}
