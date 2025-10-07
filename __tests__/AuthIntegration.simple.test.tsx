import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

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

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

// Simple test component that uses AuthContext
function TestLoginComponent() {
  const { login, loading, error } = useAuth()
  
  const handleLogin = async () => {
    await login('test@example.com', 'password123')
  }

  return (
    <div>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </button>
      {error && <div data-testid="error">{error}</div>}
    </div>
  )
}

// Simple test component for registration
function TestRegisterComponent() {
  const { register, loading, error } = useAuth()
  
  const handleRegister = async () => {
    await register('test@example.com', 'password123', 'Test User')
  }

  return (
    <div>
      <button onClick={handleRegister} disabled={loading}>
        {loading ? 'Loading...' : 'Register'}
      </button>
      {error && <div data-testid="error">{error}</div>}
    </div>
  )
}

describe('Authentication Integration Tests - Simplified', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default Supabase mocks
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    })
  })

  describe('Login Flow', () => {
    it('should handle successful login', async () => {
      const mockUser = { 
        email: 'test@example.com', 
        user_metadata: { name: 'Test User' },
        id: 'user-123'
      }
      
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      render(<TestLoginComponent />, { wrapper: TestWrapper })
      
      // Wait for loading to complete
      await screen.findByText('Login')
      
      const loginButton = screen.getByText('Login')
      await userEvent.click(loginButton)
      
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should handle login error', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid credentials' }
      })

      render(<TestLoginComponent />, { wrapper: TestWrapper })
      
      // Wait for loading to complete
      await screen.findByText('Login')
      
      const loginButton = screen.getByText('Login')
      await userEvent.click(loginButton)
      
      await screen.findByTestId('error')
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials')
    })
  })

  describe('Registration Flow', () => {
    it('should handle successful registration', async () => {
      const mockUser = { 
        email: 'test@example.com', 
        user_metadata: { name: 'Test User' },
        id: 'user-123'
      }
      
      mockSignUp.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      render(<TestRegisterComponent />, { wrapper: TestWrapper })
      
      // Wait for loading to complete
      await screen.findByText('Register')
      
      const registerButton = screen.getByText('Register')
      await userEvent.click(registerButton)
      
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'Test User',
          },
        },
      })
    })

    it('should handle registration error', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Email already exists' }
      })

      render(<TestRegisterComponent />, { wrapper: TestWrapper })
      
      // Wait for loading to complete
      await screen.findByText('Register')
      
      const registerButton = screen.getByText('Register')
      await userEvent.click(registerButton)
      
      await screen.findByTestId('error')
      expect(screen.getByTestId('error')).toHaveTextContent('Email already exists')
    })
  })

  describe('Loading States', () => {
    it('should show loading state during login', async () => {
      mockSignInWithPassword.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
        data: { user: null },
        error: null
      }), 100)))

      render(<TestLoginComponent />, { wrapper: TestWrapper })
      
      // Wait for loading to complete
      await screen.findByText('Login')
      
      const loginButton = screen.getByText('Login')
      await userEvent.click(loginButton)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should show loading state during registration', async () => {
      mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
        data: { user: null },
        error: null
      }), 100)))

      render(<TestRegisterComponent />, { wrapper: TestWrapper })
      
      // Wait for loading to complete
      await screen.findByText('Register')
      
      const registerButton = screen.getByText('Register')
      await userEvent.click(registerButton)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })
})
