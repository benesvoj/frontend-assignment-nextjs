import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoListPage from '@/app/todolist/page'
import { api } from '@/services/api'

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
const mockUseAuth = jest.fn()
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock the API service
jest.mock('@/services/api', () => ({
  api: {
    getTodos: jest.fn(),
    updateTodo: jest.fn(),
    deleteTodo: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, message: string) {
      super(message)
      this.name = 'ApiError'
    }
  },
}))

describe('TodoListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    })
    // Mock successful empty todos response by default
    ;(api.getTodos as jest.Mock).mockResolvedValue({
      success: true,
      todos: [],
    })
  })

  it('shows loading spinner while fetching todos', async () => {
    // Make the API call take longer
    ;(api.getTodos as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, todos: [] }), 100))
    )

    render(<TodoListPage />)

    // Should show spinner initially (using aria-label since HeroUI Spinner doesn't use progressbar role)
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
    })
  })

  it('renders welcome message and user name after loading', async () => {
    render(<TodoListPage />)

    await waitFor(() => {
      expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText(/Hello, Test User!/)).toBeInTheDocument()
  })

  it('renders current date after loading', async () => {
    render(<TodoListPage />)

    await waitFor(() => {
      expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
    })

    const today = new Date().toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    expect(screen.getByText(today)).toBeInTheDocument()
  })

  it('renders add task button after loading', async () => {
    render(<TodoListPage />)

    await waitFor(() => {
      expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Add task/i })).toBeInTheDocument()
  })

  it('navigates to create task page when add button is clicked', async () => {
    const user = userEvent.setup()
    render(<TodoListPage />)

    await waitFor(() => {
      expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /Add task/i })
    await user.click(addButton)

    expect(mockPush).toHaveBeenCalledWith('/todolist/new')
  })

  it('shows empty state when no todos exist', async () => {
    render(<TodoListPage />)

    await waitFor(() => {
      expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('You are amazing!')).toBeInTheDocument()
    expect(screen.getByText('There is no more task to do.')).toBeInTheDocument()
    expect(screen.getByAltText('Logo')).toBeInTheDocument()
  })

  it('fetches todos from API on mount', async () => {
    render(<TodoListPage />)

    await waitFor(() => {
      expect(api.getTodos).toHaveBeenCalledWith('test@example.com')
    })
  })

  it('displays todos after successful fetch', async () => {
    const mockTodos = [
      {
        id: 1,
        text: 'Test Todo 1',
        description: 'Description 1',
        completed: false,
        userEmail: 'test@example.com',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      {
        id: 2,
        text: 'Test Todo 2',
        description: 'Description 2',
        completed: true,
        userEmail: 'test@example.com',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ]
    ;(api.getTodos as jest.Mock).mockResolvedValue({
      success: true,
      todos: mockTodos,
    })

    render(<TodoListPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
    })

    expect(screen.getByText('Test Todo 2')).toBeInTheDocument()
  })

  it('displays error message when API call fails', async () => {
    const errorMessage = 'Failed to load todos'
    ;(api.getTodos as jest.Mock).mockRejectedValue(new Error(errorMessage))

    render(<TodoListPage />)

    await waitFor(() => {
      expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
    })

    render(<TodoListPage />)

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('does not fetch todos when user email is missing', async () => {
    mockUseAuth.mockReturnValue({
      user: { email: '', name: 'Test User' },
      isAuthenticated: true,
    })

    render(<TodoListPage />)

    // Wait a bit to ensure no API call is made
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    expect(api.getTodos).not.toHaveBeenCalled()
  })

  it('separates completed and incomplete todos', async () => {
    const mockTodos = [
      {
        id: 1,
        text: 'Incomplete Todo',
        description: '',
        completed: false,
        userEmail: 'test@example.com',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      {
        id: 2,
        text: 'Completed Todo',
        description: '',
        completed: true,
        userEmail: 'test@example.com',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ]
    ;(api.getTodos as jest.Mock).mockResolvedValue({
      success: true,
      todos: mockTodos,
    })

    render(<TodoListPage />)

    await waitFor(() => {
      expect(screen.getByText('To-do')).toBeInTheDocument()
    })

    expect(screen.getByText('Completed')).toBeInTheDocument()
  })
})
