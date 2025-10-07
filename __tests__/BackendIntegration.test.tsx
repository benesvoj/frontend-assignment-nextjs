import { api, ApiError } from '@/services/api'

// Mock fetch for testing
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Backend Integration - Todo API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Todos API', () => {
    it('should fetch todos for authenticated user', async () => {
      const mockResponse = {
        success: true,
        todos: [
          { id: 1, text: 'Test Todo', completed: false, userEmail: 'test@example.com', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await api.getTodos('test@example.com')

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith('/api/todos?userEmail=test@example.com', {
        credentials: 'include',
      })
    })

    it('should create a new todo', async () => {
      const mockResponse = {
        success: true,
        todo: { id: 1, text: 'New Todo', description: 'New Description', completed: false, userEmail: 'test@example.com', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await api.createTodo('New Todo', 'New Description', 'test@example.com')

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: 'New Todo', description: 'New Description', userEmail: 'test@example.com' }),
      })
    })

    it('should update a todo', async () => {
      const mockResponse = {
        success: true,
        todo: { id: 1, text: 'Updated Todo', completed: true, userEmail: 'test@example.com', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await api.updateTodo(1, { text: 'Updated Todo', completed: true }, 'test@example.com')

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: 'Updated Todo', completed: true, userEmail: 'test@example.com' }),
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
      expect(mockFetch).toHaveBeenCalledWith('/api/todos/1?userEmail=test@example.com', {
        method: 'DELETE',
        credentials: 'include',
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' })
      })

      await expect(api.getTodos('test@example.com')).rejects.toThrow(ApiError)
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(api.getTodos('test@example.com')).rejects.toThrow('Network error')
    })
  })
})