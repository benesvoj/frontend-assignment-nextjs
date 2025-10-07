import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/login/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
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
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: false,
  }),
}))

describe('LoginPage - Basic Rendering', () => {
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

  it('renders password visibility toggle button', () => {
    render(<LoginPage />)
    
    const toggleButton = screen.getByLabelText('toggle password visibility')
    expect(toggleButton).toBeTruthy()
  })
})
