import { Todo, AuthUser } from '@/types'

// Shared in-memory storage for demo purposes
// In a real app, this would be a database
const todos: Todo[] = []
const users: AuthUser[] = []

export const getTodosByEmail = (userEmail: string): Todo[] => {
  return todos.filter(todo => todo.userEmail === userEmail)
}

export const addTodo = (text: string, description: string | undefined, userEmail: string): Todo => {
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
  return newTodo
}

export const updateTodoInStorage = (id: number, updates: Partial<Todo>, userEmail: string): Todo | null => {
  const todoIndex = todos.findIndex(todo => todo.id === id && todo.userEmail === userEmail)
  
  if (todoIndex === -1) {
    return null
  }

  const updatedTodo: Todo = {
    ...todos[todoIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  todos[todoIndex] = updatedTodo
  return updatedTodo
}

export const deleteTodoFromStorage = (id: number, userEmail: string): boolean => {
  const todoIndex = todos.findIndex(todo => todo.id === id && todo.userEmail === userEmail)
  
  if (todoIndex === -1) {
    return false
  }

  todos.splice(todoIndex, 1)
  return true
}

export const findUserByEmail = (email: string): AuthUser | null => {
  return users.find(user => user.email === email) || null
}

export const findUserByCredentials = (email: string, password: string): AuthUser | null => {
  return users.find(user => user.email === email && user.password === password) || null
}

export const addUser = (name: string, email: string, password: string): AuthUser => {
  const newUser: AuthUser = {
    name,
    email,
    password,
    createdAt: new Date().toISOString()
  }
  users.push(newUser)
  return newUser
}
