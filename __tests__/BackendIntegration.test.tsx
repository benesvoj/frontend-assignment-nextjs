import { api, ApiError } from '@/services/api'
import { Todo } from '@/types'

// Mock fetch for testing
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Backend Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication API', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        success: true,
        user: { name: 'John Doe', email: 'john@example.com' }
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await api.login('john@example.com', 'password123')
      
      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'john@example.com', password: 'password123' }),
      })
    })

    it('should handle login error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Invalid credentials' })
      })

      await expect(api.login('john@example.com', 'wrongpassword')).rejects.toThrow(ApiError)
    })

    it('should handle successful registration', async () => {
      const mockResponse = {
        success: true,
        user: { name: 'Jane Doe', email: 'jane@example.com' }
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await api.register('Jane Doe', 'jane@example.com', 'password123')
      
      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' }),
      })
    })
  })

  describe('Todos API', () => {
    it('should fetch todos for a user', async () => {
      const mockResponse = {
        success: true,
        todos: [
          { id: 1, text: 'Test Todo', completed: false, userEmail: 'test@example.com' }
        ]
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await api.getTodos('test@example.com')
      
      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith('/api/todos?userEmail=test%40example.com')
    })

    it('should create a new todo', async () => {
      const todoData = {
        text: 'New Todo',
        description: 'New Description',
        userEmail: 'test@example.com'
      }
      
      const mockResponse = {
        success: true,
        todo: { id: 1, ...todoData, completed: false, createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' }
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await api.createTodo(todoData as Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>)
      
      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      })
    })

    it('should update a todo', async () => {
      const updateData = { text: 'Updated Todo', completed: true }
      const userEmail = 'test@example.com'
      
      const mockResponse = {
        success: true,
        todo: { id: 1, ...updateData, userEmail, createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' }
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await api.updateTodo(1, updateData, userEmail)
      
      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...updateData, userEmail }),
      })
    })

    it('should delete a todo', async () => {
      const mockResponse = {
        success: true,
        message: 'Todo deleted successfully'
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await api.deleteTodo(1, 'test@example.com')
      
      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith('/api/todos/1?userEmail=test%40example.com', {
        method: 'DELETE',
      })
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' })
      })

      await expect(api.getTodos('test@example.com')).rejects.toThrow(ApiError)
    })
  })

  describe('Error Handling', () => {
    it('should create ApiError with correct properties', () => {
      const error = new ApiError(404, 'Not found')
      
      expect(error.status).toBe(404)
      expect(error.message).toBe('Not found')
      expect(error.name).toBe('ApiError')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(api.getTodos('test@example.com')).rejects.toThrow('Network error')
    })
  })
})
