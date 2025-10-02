import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoListPage from '@/app/todolist/page'

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
const mockUser = { email: 'test@example.com', name: 'Test User' }
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
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

describe('TodoListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('renders welcome message and user name', () => {
    render(<TodoListPage />)
    
    expect(screen.getByText('Hello, Test User!')).toBeTruthy()
  })

  it('renders current date', () => {
    render(<TodoListPage />)
    
    const today = new Date().toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    expect(screen.getByText(today)).toBeTruthy()
  })

  it('renders add task button', () => {
    render(<TodoListPage />)
    
    expect(screen.getByRole('button', { name: 'Add task' })).toBeTruthy()
  })

  it('navigates to create task page when add button is clicked', async () => {
    const user = userEvent.setup()
    render(<TodoListPage />)
    
    const addButton = screen.getByRole('button', { name: 'Add task' })
    await user.click(addButton)
    
    expect(mockPush).toHaveBeenCalledWith('/todolist/new')
  })

  it('shows empty state when no todos exist', () => {
    render(<TodoListPage />)
    
    expect(screen.getByText('You are amazing!')).toBeTruthy()
    expect(screen.getByText('There is no more task to do.')).toBeTruthy()
    expect(screen.getByAltText('Logo')).toBeTruthy()
  })

  it('loads todos from localStorage on mount', () => {
    const mockTodos = [
      { id: 1, text: 'Test Todo 1', completed: false },
      { id: 2, text: 'Test Todo 2', completed: true }
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTodos))
    
    render(<TodoListPage />)
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('todos_test@example.com')
  })

  it('saves todos to localStorage when todos change', async () => {
    const { rerender } = render(<TodoListPage />)
    
    // Simulate todos being loaded
    const mockTodos = [{ id: 1, text: 'Test Todo', completed: false }]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTodos))
    
    rerender(<TodoListPage />)
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'todos_test@example.com',
        JSON.stringify(mockTodos)
      )
    })
  })

  it('redirects to login when not authenticated', () => {
    // Mock unauthenticated state
    jest.doMock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        user: null,
        isAuthenticated: false,
      }),
    }))
    
    render(<TodoListPage />)
    
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
