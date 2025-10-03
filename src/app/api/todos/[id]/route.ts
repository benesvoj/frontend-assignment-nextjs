import { NextRequest, NextResponse } from 'next/server'
import { Todo } from '@/types'

// In-memory storage for demo purposes
// In a real app, this would be a database
const todos: Todo[] = []

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

    const todoIndex = todos.findIndex(todo => todo.id === todoId && todo.userEmail === userEmail)
    
    if (todoIndex === -1) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    const updatedTodo: Todo = {
      ...todos[todoIndex],
      text: text || todos[todoIndex].text,
      description: description !== undefined ? description : todos[todoIndex].description,
      completed: completed !== undefined ? completed : todos[todoIndex].completed,
      updatedAt: new Date().toISOString()
    }

    todos[todoIndex] = updatedTodo

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

    const todoIndex = todos.findIndex(todo => todo.id === todoId && todo.userEmail === userEmail)
    
    if (todoIndex === -1) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    todos.splice(todoIndex, 1)

    return NextResponse.json({ 
      success: true, 
      message: 'Todo deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting todo:', error)
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 })
  }
}
