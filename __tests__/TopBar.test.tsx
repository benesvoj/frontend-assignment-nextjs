import { render, screen } from '@testing-library/react'
import { TopBar } from '@/app/components/TopBar'

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
    logout: jest.fn(),
    isAuthenticated: false,
  }),
}))

describe('TopBar', () => {
  it('renders app title and logo', () => {
    render(<TopBar />)
    
    expect(screen.getByText('Todo App')).toBeTruthy()
    expect(screen.getByAltText('Logo')).toBeTruthy()
  })

  it('shows only logo and title when not authenticated', () => {
    render(<TopBar />)
    
    expect(screen.getByText('Todo App')).toBeTruthy()
    expect(screen.queryByRole('button')).not.toBeTruthy()
  })
})
