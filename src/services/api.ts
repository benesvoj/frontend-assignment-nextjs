import { Todo, User } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new ApiError(response.status, errorData.error || 'Request failed')
  }
  
  return response.json()
}

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<{ success: boolean; user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    
    return handleResponse(response)
  },

  async register(name: string, email: string, password: string): Promise<{ success: boolean; user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })
    
    return handleResponse(response)
  },

  // Todos
  async getTodos(userEmail: string): Promise<{ success: boolean; todos: Todo[] }> {
    const response = await fetch(`${API_BASE_URL}/todos?userEmail=${encodeURIComponent(userEmail)}`)
    return handleResponse(response)
  },

  async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; todo: Todo }> {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    })
    
    return handleResponse(response)
  },

  async updateTodo(id: number, todo: Partial<Todo>, userEmail: string): Promise<{ success: boolean; todo: Todo }> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...todo, userEmail }),
    })
    
    return handleResponse(response)
  },

  async deleteTodo(id: number, userEmail: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}?userEmail=${encodeURIComponent(userEmail)}`, {
      method: 'DELETE',
    })
    
    return handleResponse(response)
  },
}

export { ApiError }
