import { render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'

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

// Mock the AuthContext
const mockLogin = jest.fn()
const mockLogout = jest.fn()
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: mockLogin,
    logout: mockLogout,
    isAuthenticated: false,
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

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLogin.mockReturnValue(false)
  })

  it('renders login form with all required elements', () => {
    render(<LoginPage />)
    
    expect(screen.getByText("It's good to have you back!")).toBeTruthy()
    expect(screen.getByText("Welcome to our secure portal! To access the full functionality of our app, kindly provide your credentials below. Your privacy is our priority.")).toBeTruthy()
    expect(screen.getByLabelText('Email')).toBeTruthy()
    expect(screen.getByLabelText('Password')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Login' })).toBeTruthy()
    expect(screen.getByText("Don't have an account?")).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Register' })).toBeTruthy()
  })

  it('shows validation error when form is submitted with empty fields', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const submitButton = screen.getByRole('button', { name: 'Login' })
    await user.click(submitButton)
    
    expect(screen.getByText('Please fill in all fields')).toBeTruthy()
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('shows validation error when only email is provided', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Login' })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)
    
    expect(screen.getByText('Please fill in all fields')).toBeTruthy()
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('shows validation error when only password is provided', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Login' })
    
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(screen.getByText('Please fill in all fields')).toBeTruthy()
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('calls login with correct credentials when form is submitted', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Login' })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('navigates to todo list on successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockReturnValue(true)
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Login' })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(mockPush).toHaveBeenCalledWith('/todolist')
  })

  it('shows error message on failed login', async () => {
    const user = userEvent.setup()
    mockLogin.mockReturnValue(false)
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Login' })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    expect(screen.getByText('Invalid email or password')).toBeTruthy()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('toggles password visibility when eye icon is clicked', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const passwordInput = screen.getByLabelText('Password')
    const toggleButton = screen.getByLabelText('toggle password visibility')
    
    expect(passwordInput.getAttribute('type')).toBe('password')
    
    await user.click(toggleButton)
    expect(passwordInput.getAttribute('type')).toBe('text')
    
    await user.click(toggleButton)
    expect(passwordInput.getAttribute('type')).toBe('password')
  })

  it('calls logout on component mount', () => {
    render(<LoginPage />)
    expect(mockLogout).toHaveBeenCalled()
  })

  it('has correct form validation attributes', () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    
    expect(emailInput.getAttribute('type')).toBe('email')
    expect(emailInput.hasAttribute('required')).toBe(true)
    expect(passwordInput.hasAttribute('required')).toBe(true)
  })

  it('has correct placeholder text', () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    
    expect(emailInput).toBeTruthy()
    expect(passwordInput).toBeTruthy()
  })

  it('register link navigates to register page', () => {
    render(<LoginPage />)
    
    const registerLink = screen.getByRole('link', { name: 'Register' })
    expect(registerLink.getAttribute('href')).toBe('/register')
  })
})
