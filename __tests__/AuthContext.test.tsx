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
const { api } = require('@/services/api');

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

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'users') return '[]'
      if (key === 'user') return null
      return null
    })
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

      let success: boolean = false
      await act(async () => {
        success = await result.current.login('test@example.com', 'wrongpassword')
      })
      expect(success).toBe(false)

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

    it('sets cookie on successful login', async () => {
      const mockUser = { email: 'test@example.com', name: 'Test User' }
      api.login.mockResolvedValue({ success: true, user: mockUser })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(document.cookie).toContain('user=')
      expect(document.cookie).toContain('path=/')
      expect(document.cookie).toContain('max-age=86400')
    })

    it('handles failed login', async () => {
      api.login.mockResolvedValue({ success: false })

      const { result } = renderHook(() => useAuth(), { wrapper })

      let success: boolean = false
      await act(async () => {
        success = await result.current.login('test@example.com', 'password123')
      })
      expect(success).toBe(false)

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('register function', () => {
    it('returns false when email already exists', async () => {
      api.register.mockResolvedValue({ success: false })

      const { result } = renderHook(() => useAuth(), { wrapper })

      let success: boolean = false
      await act(async () => {
        success = await result.current.register('existing@example.com', 'password123', 'New User')
      })
      expect(success).toBe(false)

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

    it('successfully registers a new user', async () => {
      const mockUser = { email: 'new@example.com', name: 'New User' }
      api.register.mockResolvedValue({ success: true, user: mockUser })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.register('new@example.com', 'password123', 'New User')
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('sets cookie on successful registration', async () => {
      const mockUser = { email: 'new@example.com', name: 'New User' }
      api.register.mockResolvedValue({ success: true, user: mockUser })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.register('new@example.com', 'password123', 'New User')
      })

      expect(document.cookie).toContain('user=')
      expect(document.cookie).toContain('path=/')
      expect(document.cookie).toContain('max-age=86400')
    })

    it('handles registration success', async () => {
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
    })
  })

  describe('logout function', () => {
    it('clears user state and localStorage', async () => {
      const mockUser = { email: 'test@example.com', name: 'Test User' }
      api.login.mockResolvedValue({ success: true, user: mockUser })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // First login to set user
      await act(async () => {
        await result.current.login('test@example.com', 'password123')
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

    it('clears cookie on logout', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        result.current.logout()
      })

      expect(document.cookie).toContain('user=; path=/; max-age=0')
    })
  })

  describe('integration scenarios', () => {
    it('handles complete login-logout cycle', async () => {
      const mockUser = { email: 'test@example.com', name: 'Test User' }
      api.login.mockResolvedValue({ success: true, user: mockUser })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Login
      let success: boolean = false
      await act(async () => {
        success = await result.current.login('test@example.com', 'password123')
      })
      expect(success).toBe(true)

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual({ email: 'test@example.com', name: 'Test User' })

      // Logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })

    it('handles complete register-logout cycle', async () => {
      const mockUser = { email: 'new@example.com', name: 'New User' }
      api.register.mockResolvedValue({ success: true, user: mockUser })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Register
      let success: boolean = false
      await act(async () => {
        success = await result.current.register('new@example.com', 'password123', 'New User')
      })
      expect(success).toBe(true)

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual({ email: 'new@example.com', name: 'New User' })

      // Logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })
  })
})
