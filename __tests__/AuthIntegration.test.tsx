import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import LoginPage from '@/app/login/page'
import RegisterPage from '@/app/register/page'
import { AuthProvider } from '@/contexts/AuthContext'

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

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt="logo" />
  },
}))

// Mock the logo import
jest.mock('@/assets', () => '/logo.svg')


const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default Supabase mocks
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    })
    
    // Reset all mocks to default state
    mockSignInWithPassword.mockClear()
    mockSignUp.mockClear()
    mockSignOut.mockClear()
  })

  describe('Complete Registration Flow', () => {
    it('allows user to register and automatically logs them in', async () => {
      const mockUser = { 
        email: 'john@example.com', 
        user_metadata: { name: 'John Doe' },
        id: 'user-123'
      }
      
      mockSignUp.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })

      const user = userEvent.setup()
      render(<RegisterPage />, { wrapper: TestWrapper })

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument()
      })

      // Fill registration form
      const nameInput = screen.getByLabelText('Name')
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Register' })

      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      // Wait for async operations to complete
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/todolist')
      })

      // Should call Supabase signUp
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'John Doe',
          },
        },
      })
    })

    it('prevents duplicate email registration', async () => {
      mockSignUp.mockResolvedValue({ 
        data: { user: null }, 
        error: { message: 'User already registered' } 
      })

      const user = userEvent.setup()
      render(<RegisterPage />, { wrapper: TestWrapper })

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText('Name')
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Register' })

      await user.type(nameInput, 'Jane Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'differentpassword')
      await user.type(confirmPasswordInput, 'differentpassword')
      await user.click(submitButton)

      // Should show error and not navigate
      await waitFor(() => {
        expect(screen.getByText("Email already exists")).toBeInTheDocument()
      })
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Complete Login Flow', () => {
    it('allows registered user to login', async () => {
      const mockUser = { 
        email: 'john@example.com', 
        user_metadata: { name: 'John Doe' },
        id: 'user-123'
      }
      
      mockSignInWithPassword.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })

      const user = userEvent.setup()
      render(<LoginPage />, { wrapper: TestWrapper })

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
      })

      const loginEmailInput = screen.getByLabelText('Email')
      const loginPasswordInput = screen.getByLabelText('Password')
      const loginSubmitButton = screen.getByRole('button', { name: 'Login' })

      await user.type(loginEmailInput, 'john@example.com')
      await user.type(loginPasswordInput, 'password123')
      await user.click(loginSubmitButton)

      // Should navigate to todo list
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/todolist')
      })

      // Should call Supabase signInWithPassword
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
      })
    })

    it('rejects login with wrong password', async () => {
      mockSignInWithPassword.mockResolvedValue({ 
        data: { user: null }, 
        error: { message: 'Invalid email or password' } 
      })

      const user = userEvent.setup()
      render(<LoginPage />, { wrapper: TestWrapper })

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
      })

      const loginEmailInput = screen.getByLabelText('Email')
      const loginPasswordInput = screen.getByLabelText('Password')
      const loginSubmitButton = screen.getByRole('button', { name: 'Login' })

      await user.type(loginEmailInput, 'john@example.com')
      await user.type(loginPasswordInput, 'wrongpassword')
      await user.click(loginSubmitButton)

      // Should show error and not navigate
      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
      })
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('rejects login with non-existent email', async () => {
      mockSignInWithPassword.mockResolvedValue({ 
        data: { user: null }, 
        error: { message: 'Invalid email or password' } 
      })

      const user = userEvent.setup()
      render(<LoginPage />, { wrapper: TestWrapper })

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
      })

      const loginEmailInput = screen.getByLabelText('Email')
      const loginPasswordInput = screen.getByLabelText('Password')
      const loginSubmitButton = screen.getByRole('button', { name: 'Login' })

      await user.type(loginEmailInput, 'nonexistent@example.com')
      await user.type(loginPasswordInput, 'password123')
      await user.click(loginSubmitButton)

      // Should show error and not navigate
      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
      })
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Form Validation Integration', () => {
    it('validates password confirmation in registration', async () => {
      const user = userEvent.setup()
      render(<RegisterPage />, { wrapper: TestWrapper })

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText('Name')
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Register' })

      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'differentpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
    })

    it('validates password length in registration', async () => {
      const user = userEvent.setup()
      render(<RegisterPage />, { wrapper: TestWrapper })

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText('Name')
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Register' })

      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, '12345')
      await user.type(confirmPasswordInput, '12345')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Integration', () => {
    it('navigates between login and register pages', () => {
      render(<LoginPage />, { wrapper: TestWrapper })
      
      const registerLink = screen.getByRole('link', { name: 'Register' })
      expect(registerLink.getAttribute('href')).toBe('/register')
      
      render(<RegisterPage />, { wrapper: TestWrapper })
      
      const loginLink = screen.getByRole('link', { name: 'Login' })
      expect(loginLink.getAttribute('href')).toBe('/login')
    })
  })

  describe('Error Handling Integration', () => {
    it('clears errors when form is resubmitted with valid data', async () => {
      const mockUser = { 
        email: 'john@example.com', 
        user_metadata: { name: 'John Doe' },
        id: 'user-123'
      }
      
      mockSignUp.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })

      const user = userEvent.setup()
      render(<RegisterPage />, { wrapper: TestWrapper })

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText('Name')
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Register' })

      // First submit with mismatched passwords to show an error
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'differentpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeTruthy()
      })

      // Fix password and submit again
      await user.clear(confirmPasswordInput)
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      // Error should be cleared and navigation should occur
      await waitFor(() => {
        expect(screen.queryByText('Passwords do not match')).not.toBeTruthy()
        expect(mockPush).toHaveBeenCalledWith('/todolist')
      })
    })
  })
})
