import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ReactNode } from 'react'

// Mock the API service
jest.mock('@/services/api', () => ({
  api: {
    login: jest.fn(),
    register: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
})

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

// Get the mocked API
const { api } = require('@/services/api');

describe('AuthContext - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    document.cookie = ''
  })

  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')
      
      consoleSpy.mockRestore()
    })

    it('returns initial state when no user is stored', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(typeof result.current.login).toBe('function')
      expect(typeof result.current.register).toBe('function')
      expect(typeof result.current.logout).toBe('function')
    })

    it('loads user from localStorage on mount', () => {
      const mockUser = { email: 'test@example.com', name: 'Test User' }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser))
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('login function', () => {
    it('returns false for invalid credentials', async () => {
      api.login.mockResolvedValue({ success: false })

      const { result } = renderHook(() => useAuth(), { wrapper })

      let success: boolean = true
      await act(async () => {
        success = await result.current.login('test@example.com', 'wrongpassword')
      })

      expect(success).toBe(false)
      // User should remain null after failed login
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('returns true and sets user for valid credentials', async () => {
      const mockUser = { email: 'test@example.com', name: 'Test User' }
      api.login.mockResolvedValue({ success: true, user: mockUser })

      const { result } = renderHook(() => useAuth(), { wrapper })

      let success: boolean = false
      await act(async () => {
        success = await result.current.login('test@example.com', 'password123')
      })

      expect(success).toBe(true)
      expect(result.current.user).toEqual({ email: 'test@example.com', name: 'Test User' })
      expect(result.current.isAuthenticated).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({ email: 'test@example.com', name: 'Test User' })
      )
    })
  })

  describe('register function', () => {
    it('returns false when email already exists', async () => {
      api.register.mockResolvedValue({ success: false })

      const { result } = renderHook(() => useAuth(), { wrapper })

      let success: boolean = true
      await act(async () => {
        success = await result.current.register('existing@example.com', 'password123', 'New User')
      })

      expect(success).toBe(false)
      // User should remain null after failed registration
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('returns true and creates new user when email does not exist', async () => {
      const mockUser = { email: 'new@example.com', name: 'New User' }
      api.register.mockResolvedValue({ success: true, user: mockUser })

      const { result } = renderHook(() => useAuth(), { wrapper })

      let success: boolean = false
      await act(async () => {
        success = await result.current.register('new@example.com', 'password123', 'New User')
      })

      expect(success).toBe(true)
      expect(result.current.user).toEqual({ email: 'new@example.com', name: 'New User' })
      expect(result.current.isAuthenticated).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({ email: 'new@example.com', name: 'New User' })
      )
    })
  })

  describe('logout function', () => {
    it('clears user state and localStorage', async () => {
      const mockUser = { email: 'test@example.com', name: 'Test User' }
      api.register.mockResolvedValue({ success: true, user: mockUser })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // First set a user
      await act(async () => {
        await result.current.register('test@example.com', 'password123', 'Test User')
      })

      expect(result.current.isAuthenticated).toBe(true)

      // Then logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })
  })
})
