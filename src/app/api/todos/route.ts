import { NextRequest, NextResponse } from 'next/server'
import { Todo } from '@/types'

// In-memory storage for demo purposes
// In a real app, this would be a database
const todos: Todo[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    // Filter todos by user email
    const userTodos = todos.filter(todo => todo.userEmail === userEmail)
    
    return NextResponse.json({ 
      success: true, 
      todos: userTodos 
    })
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

    const newTodo: Todo = {
      id: Date.now(), // Simple ID generation
      text,
      description: description || undefined,
      completed: false,
      userEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    todos.push(newTodo)

    return NextResponse.json({ 
      success: true, 
      todo: newTodo 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating todo:', error)
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 })
  }
}
