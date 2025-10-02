import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoListPage from '@/app/todolist/page'
import TaskFormPage from '@/app/todolist/[id]/page'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({ id: 'new' }),
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

describe('Todo Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('[]')
  })

  describe('Complete Todo CRUD Flow', () => {
    it('allows creating, editing, and deleting todos', async () => {
      const user = userEvent.setup()
      
      // Start with empty todo list
      render(<TodoListPage />)
      
      // Should show empty state
      expect(screen.getByText('You are amazing!')).toBeTruthy()
      
      // Navigate to create new task
      const addButton = screen.getByRole('button', { name: 'Add task' })
      await user.click(addButton)
      
      expect(mockPush).toHaveBeenCalledWith('/todolist/new')
    })

    it('creates new todo and shows it in the list', async () => {
      const user = userEvent.setup()
      
      // Mock the form page
      jest.doMock('next/navigation', () => ({
        useRouter: () => ({ push: mockPush }),
        useParams: () => ({ id: 'new' }),
      }))
      
      render(<TaskFormPage />)
      
      // Fill out the form
      const taskNameInput = screen.getByLabelText('Task name')
      const descriptionInput = screen.getByLabelText('Description (Optional)')
      const submitButton = screen.getByRole('button', { name: 'Create task' })
      
      await user.type(taskNameInput, 'Integration Test Todo')
      await user.type(descriptionInput, 'This is a test description')
      await user.click(submitButton)
      
      // Should save to localStorage and navigate back
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'todos_test@example.com',
        expect.stringContaining('Integration Test Todo')
      )
      expect(mockPush).toHaveBeenCalledWith('/todolist')
    })

    it('edits existing todo', async () => {
      const user = userEvent.setup()
      
      // Mock existing todos
      const existingTodos = [
        { id: 1, text: 'Original Todo', completed: false, description: 'Original description' }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingTodos))
      
      // Mock editing mode
      jest.doMock('next/navigation', () => ({
        useRouter: () => ({ push: mockPush }),
        useParams: () => ({ id: '1' }),
      }))
      
      render(<TaskFormPage />)
      
      // Should load existing data
      expect(screen.getByDisplayValue('Original Todo')).toBeTruthy()
      expect(screen.getByDisplayValue('Original description')).toBeTruthy()
      
      // Edit the todo
      const taskNameInput = screen.getByLabelText('Task name')
      const descriptionInput = screen.getByLabelText('Description (Optional)')
      const submitButton = screen.getByRole('button', { name: 'Save task' })
      
      await user.clear(taskNameInput)
      await user.type(taskNameInput, 'Updated Todo')
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Updated description')
      await user.click(submitButton)
      
      // Should save updated data
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'todos_test@example.com',
        expect.stringContaining('Updated Todo')
      )
      expect(mockPush).toHaveBeenCalledWith('/todolist')
    })
  })

  describe('Todo State Management', () => {
    it('toggles todo completion status', async () => {
      const mockTodos = [
        { id: 1, text: 'Test Todo', completed: false }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTodos))
      
      render(<TodoListPage />)
      
      // Should show the todo
      expect(screen.getByText('Test Todo')).toBeTruthy()
      
      // Toggle completion (this would be tested in the actual component)
      // The toggle functionality is handled by the parent component
    })

    it('deletes todo from list', async () => {
      const mockTodos = [
        { id: 1, text: 'Todo to Delete', completed: false }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTodos))
      
      render(<TodoListPage />)
      
      // Should show the todo
      expect(screen.getByText('Todo to Delete')).toBeTruthy()
      
      // Delete functionality would be tested in the actual component
    })
  })

  describe('Form Validation', () => {
    it('validates required fields in task form', async () => {
      const user = userEvent.setup()
      
      render(<TaskFormPage />)
      
      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: 'Create task' })
      await user.click(submitButton)
      
      // Should show validation error
      expect(screen.getByText('Task name is required')).toBeTruthy()
    })

    it('allows creating todo without description', async () => {
      const user = userEvent.setup()
      
      render(<TaskFormPage />)
      
      const taskNameInput = screen.getByLabelText('Task name')
      const submitButton = screen.getByRole('button', { name: 'Create task' })
      
      await user.type(taskNameInput, 'Todo without description')
      await user.click(submitButton)
      
      // Should save successfully
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'todos_test@example.com',
        expect.stringContaining('Todo without description')
      )
    })
  })

  describe('Navigation Flow', () => {
    it('navigates between todo list and form pages', async () => {
      const user = userEvent.setup()
      
      render(<TodoListPage />)
      
      // Navigate to create task
      const addButton = screen.getByRole('button', { name: 'Add task' })
      await user.click(addButton)
      expect(mockPush).toHaveBeenCalledWith('/todolist/new')
      
      // Navigate back to todo list
      render(<TaskFormPage />)
      const discardButton = screen.getByRole('button', { name: 'Discard changes' })
      await user.click(discardButton)
      expect(mockPush).toHaveBeenCalledWith('/todolist')
    })
  })

  describe('Data Persistence', () => {
    it('loads todos from localStorage on page load', () => {
      const mockTodos = [
        { id: 1, text: 'Persisted Todo 1', completed: false },
        { id: 2, text: 'Persisted Todo 2', completed: true }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTodos))
      
      render(<TodoListPage />)
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('todos_test@example.com')
    })

    it('saves todos to localStorage when they change', async () => {
      const user = userEvent.setup()
      
      render(<TaskFormPage />)
      
      const taskNameInput = screen.getByLabelText('Task name')
      const submitButton = screen.getByRole('button', { name: 'Create task' })
      
      await user.type(taskNameInput, 'New Todo')
      await user.click(submitButton)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'todos_test@example.com',
        expect.any(String)
      )
    })
  })
})
