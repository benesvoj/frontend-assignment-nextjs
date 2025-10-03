import { NextRequest } from 'next/server'
import { POST as loginPOST } from '@/app/api/auth/login/route'
import { POST as registerPOST } from '@/app/api/auth/register/route'

describe('/api/auth', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      }
      
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const response = await registerPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com'
      })
      expect(data.user.password).toBeUndefined()
    })

    it('should return 400 if required fields are missing', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
        // Missing password
      }
      
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const response = await registerPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Name, email, and password are required')
    })

    it('should return 400 if password is too short', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '12345'
      }
      
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const response = await registerPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Password must be at least 6 characters')
    })

    it('should return 409 if email already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      }
      
      // First registration
      const request1 = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      await registerPOST(request1)
      
      // Second registration with same email
      const request2 = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const response = await registerPOST(request2)
      const data = await response.json()
      
      expect(response.status).toBe(409)
      expect(data.error).toBe('Email already exists')
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      }
      
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      await registerPOST(request)
    })

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      }
      
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const response = await loginPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com'
      })
      expect(data.user.password).toBeUndefined()
    })

    it('should return 400 if credentials are missing', async () => {
      const loginData = {
        email: 'john@example.com'
        // Missing password
      }
      
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const response = await loginPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Email and password are required')
    })

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      }
      
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const response = await loginPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid email or password')
    })

    it('should return 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      }
      
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const response = await loginPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid email or password')
    })
  })
})
