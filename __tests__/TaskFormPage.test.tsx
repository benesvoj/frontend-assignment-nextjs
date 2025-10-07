import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskFormPage from '@/app/todolist/[id]/page'

// Mock Next.js router
const mockPush = jest.fn()
let mockParams = { id: 'new' }
const mockRouter = { push: mockPush }

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useParams: () => mockParams,
}))

// Mock the AuthContext
const mockUser = { email: 'test@example.com', name: 'Test User' }
let mockIsAuthenticated = true

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockIsAuthenticated ? mockUser : null,
    isAuthenticated: mockIsAuthenticated,
  }),
}))

// Mock the API service
const mockGetTodos = jest.fn()
const mockCreateTodo = jest.fn()
const mockUpdateTodo = jest.fn()

jest.mock('@/services/api', () => ({
  api: {
    getTodos: (...args: any[]) => mockGetTodos(...args),
    createTodo: (...args: any[]) => mockCreateTodo(...args),
    updateTodo: (...args: any[]) => mockUpdateTodo(...args),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, message: string) {
      super(message)
      this.name = 'ApiError'
    }
  },
}))

describe('TaskFormPage - Creating New Task', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockParams = { id: 'new' }
    mockIsAuthenticated = true
    mockCreateTodo.mockResolvedValue({ success: true, todo: { id: 1, text: 'New Task', completed: false } })
  })

  it('renders create task form with all required elements', () => {
    render(<TaskFormPage />)

    expect(screen.getByText('New task')).toBeTruthy()
    expect(screen.getByLabelText('Task name')).toBeTruthy()
    expect(screen.getByLabelText('Description (Optional)')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Discard changes' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Create task' })).toBeTruthy()
  })

  it('has correct placeholder text', () => {
    render(<TaskFormPage />)

    const taskNameInput = screen.getByPlaceholderText('Enter task name')
    const descriptionInput = screen.getByPlaceholderText('Enter task description')

    expect(taskNameInput).toBeTruthy()
    expect(descriptionInput).toBeTruthy()
  })

  it('does not submit form when task name is empty due to HTML5 validation', async () => {
    const user = userEvent.setup()
    render(<TaskFormPage />)

    const submitButton = screen.getByRole('button', { name: 'Create task' })
    await user.click(submitButton)

    // HTML5 required validation prevents form submission
    expect(mockCreateTodo).not.toHaveBeenCalled()

    // Custom error message is not displayed because HTML5 validation blocks submission
    expect(screen.queryByText('Task name is required')).not.toBeTruthy()
  })

  it('creates new task when form is submitted with valid data', async () => {
    const user = userEvent.setup()
    render(<TaskFormPage />)

    const taskNameInput = screen.getByLabelText('Task name')
    const descriptionInput = screen.getByLabelText('Description (Optional)')
    const submitButton = screen.getByRole('button', { name: 'Create task' })

    await user.type(taskNameInput, 'New Test Task')
    await user.type(descriptionInput, 'Test description')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith(
        'New Test Task',
        'Test description',
        'test@example.com'
      )
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/todolist')
    })
  })

  it('creates task without description when description is empty', async () => {
    const user = userEvent.setup()
    render(<TaskFormPage />)

    const taskNameInput = screen.getByLabelText('Task name')
    const submitButton = screen.getByRole('button', { name: 'Create task' })

    await user.type(taskNameInput, 'Task without description')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith(
        'Task without description',
        undefined,
        'test@example.com'
      )
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/todolist')
    })
  })

  it('navigates back to todo list when discard button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskFormPage />)

    const discardButton = screen.getByRole('button', { name: 'Discard changes' })
    await user.click(discardButton)

    expect(mockPush).toHaveBeenCalledWith('/todolist')
  })

  it('displays error message when API call fails', async () => {
    const user = userEvent.setup()
    const ApiError = require('@/services/api').ApiError
    mockCreateTodo.mockRejectedValue(new ApiError(500, 'Server error'))

    render(<TaskFormPage />)

    const taskNameInput = screen.getByLabelText('Task name')
    const submitButton = screen.getByRole('button', { name: 'Create task' })

    await user.type(taskNameInput, 'Test Task')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeTruthy()
    })
  })
})

describe('TaskFormPage - Editing Existing Task', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockParams = { id: '1' }
    mockIsAuthenticated = true
    mockUpdateTodo.mockResolvedValue({ success: true, todo: { id: 1, text: 'Updated Task', completed: false } })
  })

  it('renders edit task form with existing data', async () => {
    const mockTodos = [
      { id: 1, text: 'Existing Task', completed: false, description: 'Existing description', userEmail: 'test@example.com' }
    ]
    mockGetTodos.mockResolvedValueOnce({ success: true, todos: mockTodos })

    render(<TaskFormPage />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(mockGetTodos).toHaveBeenCalledWith('test@example.com')
    })

    await waitFor(() => {
      expect(screen.getByText('Edit task')).toBeTruthy()
    })

    expect(screen.getByDisplayValue('Existing Task')).toBeTruthy()
    expect(screen.getByDisplayValue('Existing description')).toBeTruthy()
  })

  it('updates existing task when form is submitted', async () => {
    const user = userEvent.setup()
    const mockTodos = [
      { id: 1, text: 'Original Task', completed: false, description: 'Original description', userEmail: 'test@example.com' }
    ]
    mockGetTodos.mockResolvedValue({ success: true, todos: mockTodos })

    render(<TaskFormPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Original Task')).toBeTruthy()
    })

    const taskNameInput = screen.getByLabelText('Task name')
    const descriptionInput = screen.getByLabelText('Description (Optional)')
    const submitButton = screen.getByRole('button', { name: 'Save task' })

    await user.clear(taskNameInput)
    await user.type(taskNameInput, 'Updated Task')
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateTodo).toHaveBeenCalledWith(
        1,
        {
          text: 'Updated Task',
          description: 'Updated description',
        },
        'test@example.com'
      )
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/todolist')
    })
  })

  it('redirects to todo list if task not found', async () => {
    mockGetTodos.mockResolvedValue({ success: true, todos: [] })

    render(<TaskFormPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/todolist')
    })
  })

  it('displays error message when loading task fails', async () => {
    const ApiError = require('@/services/api').ApiError
    mockGetTodos.mockRejectedValueOnce(new ApiError(500, 'Failed to load task'))

    render(<TaskFormPage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load task')).toBeTruthy()
    }, { timeout: 3000 })
  })
})

describe('TaskFormPage - Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockParams = { id: 'new' }
  })

  it('redirects to login when not authenticated', () => {
    mockIsAuthenticated = false

    render(<TaskFormPage />)

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('renders nothing while redirecting when not authenticated', () => {
    mockIsAuthenticated = false

    const { container } = render(<TaskFormPage />)

    expect(container.firstChild).toBeNull()
  })
})
