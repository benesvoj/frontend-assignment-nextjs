import { Todo, AuthUser } from '@/types'
import { createServerClient } from '@/lib/supabase-server'

// In-memory storage for fallback when Supabase is not configured
const todos: Todo[] = []
const users: AuthUser[] = []

let nextTodoId = 1
let nextUserId = 1

// Get todos for authenticated user
export const getTodosByUserId = async (userId: string): Promise<Todo[]> => {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching todos:', error)
    throw new Error('Failed to fetch todos')
  }

  return data || []
}

// Add a new todo
export const addTodo = async (text: string, description: string | undefined, userId: string): Promise<Todo> => {
  const supabase = await createServerClient()

  const newTodo = {
    text,
    description: description || null,
    completed: false,
    user_id: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('todos')
    .insert([newTodo])
    .select()
    .single()

  if (error) {
    console.error('Error creating todo:', error)
    throw new Error('Failed to create todo')
  }

  return data
}

// Update a todo
export const updateTodoInStorage = async (id: number, updates: Partial<Todo>, userId: string): Promise<Todo | null> => {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('todos')
    .update({
      ...updates,
      updatedAt: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating todo:', error)
    return null
  }

  return data
}

// Delete a todo
export const deleteTodoFromStorage = async (id: number, userId: string): Promise<boolean> => {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting todo:', error)
    return false
  }

  return true
}

// In-memory storage functions for fallback when Supabase is not configured
export const getTodosByEmail = (userEmail: string): Todo[] => {
  return todos.filter(todo => todo.userEmail === userEmail)
}

export const addTodoInMemory = (text: string, description: string | undefined, userEmail: string): Todo => {
  const newTodo: Todo = {
    id: nextTodoId++,
    text,
    completed: false,
    description,
    userEmail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  todos.push(newTodo)
  return newTodo
}

export const updateTodoInMemory = (id: number, updates: Partial<Todo>, userEmail: string): Todo | undefined => {
  const todoIndex = todos.findIndex(todo => todo.id === id && todo.userEmail === userEmail)
  if (todoIndex === -1) {
    return undefined
  }
  const updatedTodo: Todo = {
    ...todos[todoIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  todos[todoIndex] = updatedTodo
  return updatedTodo
}

export const deleteTodoFromMemory = (id: number, userEmail: string): boolean => {
  const initialLength = todos.length
  const todoIndex = todos.findIndex(todo => todo.id === id && todo.userEmail === userEmail)
  if (todoIndex === -1) {
    return false
  }
  todos.splice(todoIndex, 1)
  return todos.length < initialLength
}

export const findUserByCredentials = (email: string, password: string): AuthUser | undefined => {
  return users.find(user => user.email === email && user.password === password)
}

export const findUserByEmail = (email: string): AuthUser | undefined => {
  return users.find(user => user.email === email)
}

export const addUser = (name: string, email: string, password: string): AuthUser => {
  const newUser: AuthUser = {
    id: nextUserId++,
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  return newUser
}
