import { render, screen } from '@testing-library/react'
import RegisterPage from '@/app/register/page'

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
    register: jest.fn(),
    isAuthenticated: false,
  }),
}))

describe('RegisterPage - Basic Rendering', () => {
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
})
