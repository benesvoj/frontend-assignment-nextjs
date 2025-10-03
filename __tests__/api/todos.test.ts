import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/todos/route'
import { PUT, DELETE } from '@/app/api/todos/[id]/route'

// Mock the in-memory storage
const mockTodos: unknown[] = []

// Override the global todos array
jest.mock('@/app/api/todos/route', () => {
  const originalModule = jest.requireActual('@/app/api/todos/route')
  return {
    ...originalModule,
    // We'll need to access the todos array from the route
  }
})

describe('/api/todos', () => {
  beforeEach(() => {
    // Clear todos before each test
    mockTodos.length = 0
  })

  describe('GET /api/todos', () => {
    it('should return todos for a user', async () => {
      const userEmail = 'test@example.com'
      const request = new NextRequest(`http://localhost:3000/api/todos?userEmail=${userEmail}`)
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.todos)).toBe(true)
    })

    it('should return 400 if userEmail is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('User email is required')
    })
  })

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const todoData = {
        text: 'Test Todo',
        description: 'Test Description',
        userEmail: 'test@example.com'
      }
      
      const request = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(todoData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.todo).toMatchObject({
        text: 'Test Todo',
        description: 'Test Description',
        completed: false,
        userEmail: 'test@example.com'
      })
      expect(data.todo.id).toBeDefined()
      expect(data.todo.createdAt).toBeDefined()
      expect(data.todo.updatedAt).toBeDefined()
    })

    it('should return 400 if required fields are missing', async () => {
      const todoData = {
        description: 'Test Description',
        userEmail: 'test@example.com'
        // Missing text
      }
      
      const request = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(todoData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Text and userEmail are required')
    })
  })
})

describe('/api/todos/[id]', () => {
  let createdTodoId: number

  beforeEach(async () => {
    // Create a todo for testing
    const todoData = {
      text: 'Test Todo for Update',
      description: 'Test Description',
      userEmail: 'test@example.com'
    }
    
    const createRequest = new NextRequest('http://localhost:3000/api/todos', {
      method: 'POST',
      body: JSON.stringify(todoData),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const createResponse = await POST(createRequest)
    const createData = await createResponse.json()
    createdTodoId = createData.todo.id
  })

  describe('PUT /api/todos/[id]', () => {
    it('should update a todo', async () => {
      const updateData = {
        text: 'Updated Todo',
        description: 'Updated Description',
        completed: true,
        userEmail: 'test@example.com'
      }
      
      const request = new NextRequest(`http://localhost:3000/api/todos/${createdTodoId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const response = await PUT(request, { params: Promise.resolve({ id: createdTodoId.toString() }) })
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.todo).toMatchObject({
        id: createdTodoId,
        text: 'Updated Todo',
        description: 'Updated Description',
        completed: true,
        userEmail: 'test@example.com'
      })
    })

    it('should return 404 if todo not found', async () => {
      const updateData = {
        text: 'Updated Todo',
        userEmail: 'test@example.com'
      }
      
      const request = new NextRequest('http://localhost:3000/api/todos/99999', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const response = await PUT(request, { params: Promise.resolve({ id: '99999' }) })
      const data = await response.json()
      
      expect(response.status).toBe(404)
      expect(data.error).toBe('Todo not found')
    })
  })

  describe('DELETE /api/todos/[id]', () => {
    it('should delete a todo', async () => {
      const request = new NextRequest(`http://localhost:3000/api/todos/${createdTodoId}?userEmail=test@example.com`)
      
      const response = await DELETE(request, { params: Promise.resolve({ id: createdTodoId.toString() }) })
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Todo deleted successfully')
    })

    it('should return 404 if todo not found', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos/99999?userEmail=test@example.com')
      
      const response = await DELETE(request, { params: Promise.resolve({ id: '99999' }) })
      const data = await response.json()
      
      expect(response.status).toBe(404)
      expect(data.error).toBe('Todo not found')
    })
  })
})
