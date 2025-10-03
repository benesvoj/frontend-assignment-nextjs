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

// Mock the API service
jest.mock('@/services/api', () => ({
  api: {
    login: jest.fn(),
    register: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, message: string) {
      super(message)
      this.name = 'ApiError'
    }
  }
}))

import { api, ApiError } from '@/services/api'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

// Cast api to jest mock for type safety
const mockApi = api as jest.Mocked<typeof api>

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
  })

  describe('Login Flow', () => {
    it('should handle successful login', async () => {
      mockApi.login.mockResolvedValueOnce({
        success: true,
        user: { name: 'Test User', email: 'test@example.com' }
      })

      render(<TestLoginComponent />, { wrapper: TestWrapper })
      
      const loginButton = screen.getByText('Login')
      await userEvent.click(loginButton)
      
      expect(mockApi.login).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    it('should handle login error', async () => {
      mockApi.login.mockRejectedValueOnce(new ApiError(401, 'Invalid credentials'))

      render(<TestLoginComponent />, { wrapper: TestWrapper })
      
      const loginButton = screen.getByText('Login')
      await userEvent.click(loginButton)
      
      await screen.findByTestId('error')
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials')
    })
  })

  describe('Registration Flow', () => {
    it('should handle successful registration', async () => {
      mockApi.register.mockResolvedValueOnce({
        success: true,
        user: { name: 'Test User', email: 'test@example.com' }
      })

      render(<TestRegisterComponent />, { wrapper: TestWrapper })
      
      const registerButton = screen.getByText('Register')
      await userEvent.click(registerButton)
      
      expect(mockApi.register).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123')
    })

    it('should handle registration error', async () => {
      mockApi.register.mockRejectedValueOnce(new ApiError(409, 'Email already exists'))

      render(<TestRegisterComponent />, { wrapper: TestWrapper })
      
      const registerButton = screen.getByText('Register')
      await userEvent.click(registerButton)
      
      await screen.findByTestId('error')
      expect(screen.getByTestId('error')).toHaveTextContent('Email already exists')
    })
  })

  describe('Loading States', () => {
    it('should show loading state during login', async () => {
      mockApi.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<TestLoginComponent />, { wrapper: TestWrapper })
      
      const loginButton = screen.getByText('Login')
      await userEvent.click(loginButton)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should show loading state during registration', async () => {
      mockApi.register.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<TestRegisterComponent />, { wrapper: TestWrapper })
      
      const registerButton = screen.getByText('Register')
      await userEvent.click(registerButton)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })
})
