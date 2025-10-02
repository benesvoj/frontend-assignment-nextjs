# Authentication Tests

This directory contains comprehensive tests for the user registration and login functionality in the Todo App.

## Test Files

### 1. LoginPage.simple.test.tsx
Tests the basic rendering and structure of the login page:
- ✅ Renders login form with all required elements
- ✅ Has correct form validation attributes
- ✅ Has correct placeholder text
- ✅ Register link navigates to register page
- ✅ Renders password visibility toggle button

### 2. RegisterPage.simple.test.tsx
Tests the basic rendering and structure of the registration page:
- ✅ Renders registration form with all required elements
- ✅ Has correct form validation attributes
- ✅ Has correct placeholder text
- ✅ Login link navigates to login page

### 3. TopBar.test.tsx
Tests the TopBar component:
- ✅ Renders app title and logo
- ✅ Shows only logo and title when not authenticated

### 4. simple.test.ts
Basic Jest test to ensure the testing framework is working:
- ✅ Simple test passes

## Test Coverage

The tests cover:

### Login Page
- Form rendering and structure
- Input field validation attributes
- Placeholder text
- Navigation links
- Password visibility toggle

### Registration Page
- Form rendering and structure
- Input field validation attributes
- Placeholder text
- Navigation links

### TopBar Component
- Logo and title display
- Authentication state handling

## Running Tests

```bash
# Run all tests
npm test

# Run only authentication tests
npm test -- --testPathPatterns="(LoginPage.simple|RegisterPage.simple|TopBar|simple.test)"

# Run with coverage
npm run test:coverage
```

## Test Structure

Each test file follows the pattern:
1. Mock external dependencies (Next.js router, Image component, AuthContext)
2. Test basic rendering and structure
3. Test form validation attributes
4. Test navigation links
5. Test component-specific functionality

## Notes

- Tests use React Testing Library for component testing
- Mock implementations are provided for Next.js specific components
- Tests focus on rendering and basic functionality rather than complex user interactions
- The AuthContext tests have some issues with state management that need further investigation
