import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskItem } from '@/app/todolist/components/TaskItem'
import { Todo } from '@/types'

// Mock the translations
jest.mock('@/utils', () => ({
  translations: {
    button: {
      edit: 'Edit',
      delete: 'Delete',
    },
  },
}))

describe('Todo Basic Functionality', () => {
  const mockTodo: Todo = {
    id: 1,
    text: 'Test Todo',
    completed: false,
    description: 'Test description',
    userEmail: 'test@example.com',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  }

  const mockOnToggle = jest.fn()
  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders todo text and description', () => {
    render(
      <TaskItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    expect(screen.getByText('Test Todo')).toBeTruthy()
    expect(screen.getByText('Test description')).toBeTruthy()
  })

  it('renders todo without description when description is undefined', () => {
    const todoWithoutDescription = { ...mockTodo, description: undefined }
    
    render(
      <TaskItem
        todo={todoWithoutDescription}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    expect(screen.getByText('Test Todo')).toBeTruthy()
    expect(screen.queryByText('Test description')).toBeNull()
  })

  it('renders checkbox with correct checked state', () => {
    render(
      <TaskItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
  })

  it('renders checkbox as checked when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true }
    
    render(
      <TaskItem
        todo={completedTodo}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup()

    render(
      <TaskItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(mockOnToggle).toHaveBeenCalledWith(1)
  })
})
