import { NextRequest, NextResponse } from 'next/server'
import { updateTodoInStorage, deleteTodoFromStorage } from '@/utils/serverUtils'

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

    const updatedTodo = updateTodoInStorage(todoId, {
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

    const success = deleteTodoFromStorage(todoId, userEmail)

    if (!success) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Todo deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting todo:', error)
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 })
  }
}
