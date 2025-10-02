import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskFormPage from '@/app/todolist/[id]/page'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({ id: 'new' }),
}))

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

describe('TaskFormPage - Creating New Task', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('[]')
  })

  it('renders create task form with all required elements', () => {
    render(<TaskFormPage />)
    
    expect(screen.getByText('New task')).toBeTruthy()
    expect(screen.getByLabelText('Task name')).toBeTruthy()
    expect(screen.getByLabelText('Description (Optional)')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Discard changes' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Create task' })).toBeTruthy()
  })

  it('has correct form validation attributes', () => {
    render(<TaskFormPage />)
    
    const taskNameInput = screen.getByLabelText('Task name')
    const descriptionInput = screen.getByLabelText('Description (Optional)')
    
    expect(taskNameInput.hasAttribute('required')).toBe(true)
    expect(descriptionInput.hasAttribute('required')).toBe(false)
  })

  it('has correct placeholder text', () => {
    render(<TaskFormPage />)
    
    const taskNameInput = screen.getByPlaceholderText('Enter task name')
    const descriptionInput = screen.getByPlaceholderText('Enter task description')
    
    expect(taskNameInput).toBeTruthy()
    expect(descriptionInput).toBeTruthy()
  })

  it('shows validation error when form is submitted with empty task name', async () => {
    const user = userEvent.setup()
    render(<TaskFormPage />)
    
    const submitButton = screen.getByRole('button', { name: 'Create task' })
    await user.click(submitButton)
    
    expect(screen.getByText('Task name is required')).toBeTruthy()
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
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'todos_test@example.com',
      expect.stringContaining('"text":"New Test Task"')
    )
    expect(mockPush).toHaveBeenCalledWith('/todolist')
  })

  it('creates task without description when description is empty', async () => {
    const user = userEvent.setup()
    render(<TaskFormPage />)
    
    const taskNameInput = screen.getByLabelText('Task name')
    const submitButton = screen.getByRole('button', { name: 'Create task' })
    
    await user.type(taskNameInput, 'Task without description')
    await user.click(submitButton)
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'todos_test@example.com',
      expect.stringContaining('"text":"Task without description"')
    )
    expect(mockPush).toHaveBeenCalledWith('/todolist')
  })

  it('navigates back to todo list when discard button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskFormPage />)
    
    const discardButton = screen.getByRole('button', { name: 'Discard changes' })
    await user.click(discardButton)
    
    expect(mockPush).toHaveBeenCalledWith('/todolist')
  })

  it('navigates back to todo list when back arrow is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskFormPage />)
    
    const backButton = screen.getByRole('button')
    await user.click(backButton)
    
    expect(mockPush).toHaveBeenCalledWith('/todolist')
  })
})

describe('TaskFormPage - Editing Existing Task', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock editing mode
    jest.doMock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush }),
      useParams: () => ({ id: '1' }),
    }))
  })

  it('renders edit task form with existing data', () => {
    const mockTodos = [
      { id: 1, text: 'Existing Task', completed: false, description: 'Existing description' }
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTodos))
    
    render(<TaskFormPage />)
    
    expect(screen.getByText('Edit task')).toBeTruthy()
    expect(screen.getByDisplayValue('Existing Task')).toBeTruthy()
    expect(screen.getByDisplayValue('Existing description')).toBeTruthy()
  })

  it('updates existing task when form is submitted', async () => {
    const user = userEvent.setup()
    const mockTodos = [
      { id: 1, text: 'Original Task', completed: false, description: 'Original description' }
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTodos))
    
    render(<TaskFormPage />)
    
    const taskNameInput = screen.getByLabelText('Task name')
    const descriptionInput = screen.getByLabelText('Description (Optional)')
    const submitButton = screen.getByRole('button', { name: 'Save task' })
    
    await user.clear(taskNameInput)
    await user.type(taskNameInput, 'Updated Task')
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description')
    await user.click(submitButton)
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'todos_test@example.com',
      expect.stringContaining('"text":"Updated Task"')
    )
    expect(mockPush).toHaveBeenCalledWith('/todolist')
  })

  it('redirects to todo list if task not found', () => {
    localStorageMock.getItem.mockReturnValue('[]')
    
    render(<TaskFormPage />)
    
    expect(mockPush).toHaveBeenCalledWith('/todolist')
  })
})

describe('TaskFormPage - Authentication', () => {
  it('redirects to login when not authenticated', () => {
    jest.doMock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        user: null,
        isAuthenticated: false,
      }),
    }))
    
    render(<TaskFormPage />)
    
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
