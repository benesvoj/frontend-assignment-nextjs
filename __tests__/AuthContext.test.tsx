import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ReactNode } from 'react'

// Mock Supabase client
const mockSignInWithPassword = jest.fn()
const mockSignUp = jest.fn()
const mockSignOut = jest.fn()
const mockGetSession = jest.fn()
const mockOnAuthStateChange = jest.fn()

jest.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default Supabase mocks
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    })
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

    it('returns initial state when no user is stored', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      // Wait for the session check to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(typeof result.current.login).toBe('function')
      expect(typeof result.current.register).toBe('function')
      expect(typeof result.current.logout).toBe('function')
    })

    it('loads user from Supabase session on mount', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      }

      // Mock Supabase session with user data
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
              user_metadata: { name: 'Test User' },
            }
          }
        },
        error: null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Wait for the session check to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('login function', () => {
    it('returns false for invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' }
      })

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
      const mockUser = { 
        email: 'test@example.com', 
        user_metadata: { name: 'Test User' },
        id: 'user-123'
      }
      
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      let success: boolean = false
      await act(async () => {
        success = await result.current.login('test@example.com', 'password123')
      })
      expect(success).toBe(true)

      expect(result.current.user).toEqual({ email: 'test@example.com', id: 'user-123', name: 'Test User' })
      expect(result.current.isAuthenticated).toBe(true)
    })


    it('handles failed login', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Login failed' }
      })

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
      mockSignUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' }
      })

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
      const mockUser = { 
        email: 'new@example.com', 
        user_metadata: { name: 'New User' },
        id: 'user-456'
      }
      
      mockSignUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      let success: boolean = false
      await act(async () => {
        success = await result.current.register('new@example.com', 'password123', 'New User')
      })
      expect(success).toBe(true)

      // After registration, user should not be automatically logged in
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('successfully registers a new user', async () => {
      const mockUser = { 
        email: 'new@example.com', 
        user_metadata: { name: 'New User' },
        id: 'user-456'
      }
      
      mockSignUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.register('new@example.com', 'password123', 'New User')
      })

      // After registration, user should not be automatically logged in
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('logout function', () => {
    it('clears user state', async () => {
      const mockUser = { 
        email: 'test@example.com', 
        user_metadata: { name: 'Test User' },
        id: 'user-123'
      }
      
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // First login to set user
      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(result.current.isAuthenticated).toBe(true)

      // Then logout
      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  describe('integration scenarios', () => {
    it('handles complete login-logout cycle', async () => {
      const mockUser = { 
        email: 'test@example.com', 
        user_metadata: { name: 'Test User' },
        id: 'user-123'
      }
      
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Login
      let success: boolean = false
      await act(async () => {
        success = await result.current.login('test@example.com', 'password123')
      })
      expect(success).toBe(true)

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual({ email: 'test@example.com', id: 'user-123', name: 'Test User' })

      // Logout
      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })

    it('handles complete register-logout cycle', async () => {
      const mockUser = { 
        email: 'new@example.com', 
        user_metadata: { name: 'New User' },
        id: 'user-456'
      }
      
      mockSignUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Register
      let success: boolean = false
      await act(async () => {
        success = await result.current.register('new@example.com', 'password123', 'New User')
      })
      expect(success).toBe(true)

      // After registration, user should not be automatically logged in
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()

      // Logout
      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })
  })
})
