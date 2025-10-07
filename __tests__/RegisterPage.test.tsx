import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterPage from '@/app/register/page'

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
    return <img {...props} />
  },
}))

// Mock the logo import
jest.mock('@/assets', () => '/logo.svg')

// Mock the AuthContext
const mockRegister = jest.fn()
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    register: mockRegister,
    isAuthenticated: false,
    loading: false,
  }),
}))

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

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRegister.mockResolvedValue(false)
  })

  it('renders registration form with all required elements', () => {
    render(<RegisterPage />)

    expect(screen.getByRole('heading', { name: 'Register' })).toBeTruthy()
    expect(screen.getByText('Create a new account')).toBeTruthy()
    expect(screen.getByLabelText('Name')).toBeTruthy()
    expect(screen.getByLabelText('Email')).toBeTruthy()
    expect(screen.getByLabelText('Password')).toBeTruthy()
    expect(screen.getByLabelText('Confirm Password')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Register' })).toBeTruthy()
    expect(screen.getByText('Already have an account?')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Login' })).toBeTruthy()
  })

  it('does not submit form when fields are empty due to HTML5 validation', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    const submitButton = screen.getByRole('button', { name: 'Register' })
    await user.click(submitButton)

    // Form should not submit due to HTML5 required validation
    expect(mockRegister).not.toHaveBeenCalled()
    // No custom error message appears because HTML5 validation blocks the submit
    expect(screen.queryByText('Please fill in all fields')).not.toBeTruthy()
  })

  it('does not submit form when only some fields are provided', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Register' })

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.click(submitButton)

    // Form should not submit due to HTML5 required validation on password fields
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    
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
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('shows error when password is too short', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    
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
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('calls register with correct data when form is submitted successfully', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    
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
    
    expect(mockRegister).toHaveBeenCalledWith('john@example.com', 'password123', 'John Doe')
  })

  it('navigates to todo list on successful registration', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue(true)
    render(<RegisterPage />)

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

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/todolist')
    })
  })

  it('shows error message when email already exists', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue(false)
    render(<RegisterPage />)

    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    const submitButton = screen.getByRole('button', { name: 'Register' })

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'existing@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeTruthy()
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('has correct form validation attributes', () => {
    render(<RegisterPage />)
    
    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    
    expect(nameInput.getAttribute('type')).toBe('text')
    expect(nameInput.hasAttribute('required')).toBe(true)
    expect(emailInput.getAttribute('type')).toBe('email')
    expect(emailInput.hasAttribute('required')).toBe(true)
    expect(passwordInput.getAttribute('type')).toBe('password')
    expect(passwordInput.hasAttribute('required')).toBe(true)
    expect(confirmPasswordInput.getAttribute('type')).toBe('password')
    expect(confirmPasswordInput.hasAttribute('required')).toBe(true)
  })

  it('has correct placeholder text', () => {
    render(<RegisterPage />)
    
    const nameInput = screen.getByPlaceholderText('Enter your name')
    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password')
    
    expect(nameInput).toBeTruthy()
    expect(emailInput).toBeTruthy()
    expect(passwordInput).toBeTruthy()
    expect(confirmPasswordInput).toBeTruthy()
  })

  it('login link navigates to login page', () => {
    render(<RegisterPage />)
    
    const loginLink = screen.getByRole('link', { name: 'Login' })
    expect(loginLink.getAttribute('href')).toBe('/login')
  })

  it('clears error message when form is resubmitted after fixing errors', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    const submitButton = screen.getByRole('button', { name: 'Register' })

    // First submit with mismatched passwords to show error
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'differentpassword')
    await user.click(submitButton)

    expect(screen.getByText('Passwords do not match')).toBeTruthy()

    // Fix the password and submit again
    await user.clear(confirmPasswordInput)
    await user.type(confirmPasswordInput, 'password123')
    await user.click(submitButton)

    // Error should be cleared - wait for async operation
    await waitFor(() => {
      expect(screen.queryByText('Passwords do not match')).not.toBeTruthy()
    })
  })
})
