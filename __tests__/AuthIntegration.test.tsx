import { render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'
import RegisterPage from '@/app/register/page'
import { AuthProvider } from '@/contexts/AuthContext'

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
    localStorageMock.getItem.mockReturnValue('[]')
    document.cookie = ''
  })

  describe('Complete Registration Flow', () => {
    it('allows user to register and automatically logs them in', async () => {
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
      
      // Should navigate to todo list
      expect(mockPush).toHaveBeenCalledWith('/todolist')
      
      // Should store user in localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'users',
        JSON.stringify([{ email: 'john@example.com', password: 'password123', name: 'John Doe' }])
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({ email: 'john@example.com', name: 'John Doe' })
      )
      
      // Should set cookie
      expect(document.cookie).toContain('user=')
    })

    it('prevents duplicate email registration', async () => {
      const user = userEvent.setup()
      
      // First registration
      const { unmount } = render(<RegisterPage />, { wrapper: TestWrapper })
      
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
      
      unmount()
      
      // Second registration with same email
      render(<RegisterPage />, { wrapper: TestWrapper })
      
      const nameInput2 = screen.getByLabelText('Name')
      const emailInput2 = screen.getByLabelText('Email')
      const passwordInput2 = screen.getByLabelText('Password')
      const confirmPasswordInput2 = screen.getByLabelText('Confirm Password')
      const submitButton2 = screen.getByRole('button', { name: 'Register' })
      
      await user.type(nameInput2, 'Jane Doe')
      await user.type(emailInput2, 'john@example.com')
      await user.type(passwordInput2, 'differentpassword')
      await user.type(confirmPasswordInput2, 'differentpassword')
      await user.click(submitButton2)
      
      // Should show error and not navigate
      expect(screen.getByText("Email already exists")).toBeTruthy();
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Complete Login Flow', () => {
    it('allows registered user to login', async () => {
      const user = userEvent.setup()
      
      // First register a user
      const { unmount: unmountRegister } = render(<RegisterPage />, { wrapper: TestWrapper })
      
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
      
      unmountRegister()
      
      // Now login with the same credentials
      render(<LoginPage />, { wrapper: TestWrapper })
      
      const loginEmailInput = screen.getByLabelText('Email')
      const loginPasswordInput = screen.getByLabelText('Password')
      const loginSubmitButton = screen.getByRole('button', { name: 'Login' })
      
      await user.type(loginEmailInput, 'john@example.com')
      await user.type(loginPasswordInput, 'password123')
      await user.click(loginSubmitButton)
      
      // Should navigate to todo list
      expect(mockPush).toHaveBeenCalledWith('/todolist')
    })

    it('rejects login with wrong password', async () => {
      const user = userEvent.setup()
      
      // First register a user
      const { unmount: unmountRegister } = render(<RegisterPage />, { wrapper: TestWrapper })
      
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
      
      unmountRegister()
      
      // Now try to login with wrong password
      render(<LoginPage />, { wrapper: TestWrapper })
      
      const loginEmailInput = screen.getByLabelText('Email')
      const loginPasswordInput = screen.getByLabelText('Password')
      const loginSubmitButton = screen.getByRole('button', { name: 'Login' })
      
      await user.type(loginEmailInput, 'john@example.com')
      await user.type(loginPasswordInput, 'wrongpassword')
      await user.click(loginSubmitButton)
      
      // Should show error and not navigate
      expect(screen.getByText('Invalid email or password')).toBeTruthy()
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('rejects login with non-existent email', async () => {
      const user = userEvent.setup()
      render(<LoginPage />, { wrapper: TestWrapper })
      
      const loginEmailInput = screen.getByLabelText('Email')
      const loginPasswordInput = screen.getByLabelText('Password')
      const loginSubmitButton = screen.getByRole('button', { name: 'Login' })
      
      await user.type(loginEmailInput, 'nonexistent@example.com')
      await user.type(loginPasswordInput, 'password123')
      await user.click(loginSubmitButton)
      
      // Should show error and not navigate
      expect(screen.getByText('Invalid email or password')).toBeTruthy()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Form Validation Integration', () => {
    it('validates all required fields in registration', async () => {
      const user = userEvent.setup()
      render(<RegisterPage />, { wrapper: TestWrapper })
      
      const submitButton = screen.getByRole('button', { name: 'Register' })
      await user.click(submitButton)
      
      expect(screen.getByText('Please fill in all fields')).toBeTruthy()
    })

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
      
      expect(screen.getByText('Passwords do not match')).toBeTruthy()
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
      
      expect(screen.getByText('Password must be at least 6 characters')).toBeTruthy()
    })

    it('validates required fields in login', async () => {
      const user = userEvent.setup()
      render(<LoginPage />, { wrapper: TestWrapper })
      
      const submitButton = screen.getByRole('button', { name: 'Login' })
      await user.click(submitButton)
      
      expect(screen.getByText('Please fill in all fields')).toBeTruthy()
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
      const user = userEvent.setup()
      render(<RegisterPage />, { wrapper: TestWrapper })
      
      // First submit with invalid data
      const submitButton = screen.getByRole('button', { name: 'Register' })
      await user.click(submitButton)
      expect(screen.getByText('Please fill in all fields')).toBeTruthy()
      
      // Then submit with valid data
      const nameInput = screen.getByLabelText('Name')
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)
      
      // Error should be cleared
      expect(screen.queryByText('Please fill in all fields')).not.toBeTruthy()
    })
  })
})
