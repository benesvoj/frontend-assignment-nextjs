import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'
import RegisterPage from '@/app/register/page'
import { AuthProvider } from '@/contexts/AuthContext'

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
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}))

// Mock the logo import
jest.mock('@/assets', () => '/logo.svg')

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

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    document.cookie = ''
  })

  describe('Complete Registration Flow', () => {
    it('allows user to register and automatically logs them in', async () => {
      const mockUser = { email: 'john@example.com', name: 'John Doe' }
      api.register.mockResolvedValue({ success: true, user: mockUser })

      const user = userEvent.setup()
      render(<RegisterPage />, { wrapper: TestWrapper })

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

      // Should store user in localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({ email: 'john@example.com', name: 'John Doe' })
      )

      // Should set cookie
      expect(document.cookie).toContain('user=')
    })

    it('prevents duplicate email registration', async () => {
      api.register.mockResolvedValue({ success: false })

      const user = userEvent.setup()
      render(<RegisterPage />, { wrapper: TestWrapper })

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
      const mockUser = { email: 'john@example.com', name: 'John Doe' }
      api.login.mockResolvedValue({ success: true, user: mockUser })

      const user = userEvent.setup()
      render(<LoginPage />, { wrapper: TestWrapper })

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
    })

    it('rejects login with wrong password', async () => {
      api.login.mockResolvedValue({ success: false })

      const user = userEvent.setup()
      render(<LoginPage />, { wrapper: TestWrapper })

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
      api.login.mockResolvedValue({ success: false })

      const user = userEvent.setup()
      render(<LoginPage />, { wrapper: TestWrapper })

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
      const mockUser = { email: 'john@example.com', name: 'John Doe' }
      api.register.mockResolvedValue({ success: true, user: mockUser })

      const user = userEvent.setup()
      render(<RegisterPage />, { wrapper: TestWrapper })

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

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Passwords do not match')).not.toBeTruthy()
      })
    })
  })
})
