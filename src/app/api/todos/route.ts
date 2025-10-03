import { NextRequest, NextResponse } from 'next/server'
import { getTodosByEmail, addTodo } from '@/utils/serverUtils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    // Get todos for the user
    const userTodos = getTodosByEmail(userEmail)
    
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

    const newTodo = addTodo(text, description, userEmail)

    return NextResponse.json({ 
      success: true, 
      todo: newTodo 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating todo:', error)
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 })
  }
}
