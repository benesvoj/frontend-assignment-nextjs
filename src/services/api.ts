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

  // Todos (all use session cookies for authentication)
  async getTodos(userEmail?: string): Promise<{ success: boolean; todos: Todo[] }> {
    const url = userEmail ? `${API_BASE_URL}/todos?userEmail=${userEmail}` : `${API_BASE_URL}/todos`
    const response = await fetch(url, {
      credentials: 'include', // Include cookies for session
    })
    return handleResponse(response)
  },

  async createTodo(text: string, description?: string, userEmail?: string): Promise<{ success: boolean; todo: Todo }> {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify({ text, description, userEmail }),
    })

    return handleResponse(response)
  },

  async updateTodo(id: number, updates: Partial<Pick<Todo, 'text' | 'description' | 'completed'>>, userEmail?: string): Promise<{ success: boolean; todo: Todo }> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify({ ...updates, userEmail }),
    })

    return handleResponse(response)
  },

  async deleteTodo(id: number, userEmail?: string): Promise<{ success: boolean; message: string }> {
    const url = userEmail ? `${API_BASE_URL}/todos/${id}?userEmail=${userEmail}` : `${API_BASE_URL}/todos/${id}`
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include', // Include cookies for session
    })

    return handleResponse(response)
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    return handleResponse(response)
  },
}

export { ApiError }
