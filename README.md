# Todo App - Frontend Assignment

A modern, full-stack Todo application built with Next.js 15, featuring Supabase authentication, React Query for state management, comprehensive testing, and a beautiful UI using HeroUI components.

## 🚀 Features

- **Supabase Authentication**: Secure login and registration with Supabase Auth
- **Task Management**: Create, edit, complete, and delete todo items
- **Real-time Updates**: Optimistic updates with React Query
- **Persistent Storage**: Tasks are saved to Supabase database
- **Responsive Design**: Beautiful UI that works on all devices
- **Route Protection**: Middleware-based authentication guards
- **Modern UI**: Built with HeroUI components and Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Comprehensive Testing**: 133+ tests with Jest and React Testing Library
- **API Routes**: Full-stack application with Next.js API routes
- **Error Handling**: Robust error handling and user feedback

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript 5
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Query (TanStack Query)
- **UI Library**: HeroUI React Components
- **Styling**: Tailwind CSS 4
- **Icons**: Heroicons
- **Animations**: Framer Motion
- **Testing**: Jest, React Testing Library, Playwright
- **Code Quality**: ESLint, Husky, lint-staged

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend-assignment-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── todos/         # Todo CRUD endpoints
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── todolist/          # Todo list pages
│   │   ├── [id]/          # Task form page (create/edit)
│   │   └── components/    # Todo-specific components
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── providers.tsx      # Context providers
├── components/             # Reusable components
│   ├── layout/            # Layout components
│   ├── ui/                # UI components
│   └── features/          # Feature-specific components
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── features/              # Feature-based architecture
│   ├── auth/              # Authentication feature
│   └── todos/             # Todo management feature
│       ├── api/           # API layer
│       ├── components/    # Todo components
│       ├── hooks/         # Custom hooks
│       └── types/         # Type definitions
├── lib/                   # Library configurations
│   ├── api-client.ts      # HTTP client
│   ├── react-query.ts     # React Query config
│   └── supabase.ts        # Supabase client
├── types/                 # Global type definitions
├── utils/                 # Utility functions
│   ├── serverUtils.ts     # Server-side utilities
│   ├── userUtils.ts       # User-related utilities
│   └── translations.ts    # App translations
└── middleware.ts          # Next.js middleware for route protection
```

## 🔐 Authentication

The app uses Supabase for authentication:

- **Registration**: Users can create accounts with email, password, and name
- **Login**: Secure login with email and password
- **Session Management**: Persistent login state using Supabase sessions
- **Route Protection**: Middleware automatically redirects unauthenticated users
- **User Management**: Automatic user profile creation and management

### Database Schema

The app uses Supabase with the following tables:
- `users`: User profiles and authentication data
- `todos`: Todo items with user association

## 📱 Usage

### Getting Started
1. Visit the application at `http://localhost:3000`
2. Register a new account or login with existing credentials
3. Start managing your tasks!

### Managing Tasks
- **Add Task**: Click the "Add Task" button or navigate to `/todolist/new`
- **Edit Task**: Click on any task or navigate to `/todolist/[id]`
- **Complete Task**: Check the checkbox next to any task
- **Delete Task**: Click the "Delete" button on any task
- **View Progress**: See remaining tasks count at the bottom

## 🧪 Testing

The application includes comprehensive testing:

### Test Coverage
- **133+ tests** across 16 test suites
- **Unit Tests**: Component and hook testing with Jest
- **Integration Tests**: Full user flow testing
- **API Tests**: Backend endpoint testing
- **E2E Tests**: Playwright for end-to-end testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Test Structure
```
__tests__/
├── api/                   # API endpoint tests
├── AuthContext.test.tsx   # Authentication context tests
├── AuthIntegration.test.tsx # Auth flow integration tests
├── BackendIntegration.test.tsx # Backend integration tests
├── LoginPage.test.tsx     # Login page tests
├── RegisterPage.test.tsx  # Registration page tests
├── TaskFormPage.test.tsx  # Task form tests
├── TodoListPage.test.tsx  # Todo list tests
└── ...                    # Additional component tests
```

## 🎨 UI Components

The application uses HeroUI components for a consistent and modern design:

- **Cards**: For task items and main containers
- **Inputs**: For forms and task input
- **Buttons**: For actions and navigation
- **Checkboxes**: For task completion status
- **User Component**: For displaying user information
- **Toast**: For user feedback and notifications

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run tsc` - Run TypeScript type checking
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests

## 🌐 Internationalization

The app includes a translation system in `src/utils/translations.ts` for easy localization:

```typescript
export const translations = {
  app: {
    title: 'Todo App',
  },
  todoList: {
    welcome: "Hello",
    emptyTitle: "You are amazing!",
    emptyDescription: "There is no more task to do.",
    addButton: "Add Task",
  },
  toast: {
    todoCreated: "Task created successfully!",
    todoUpdated: "Task updated successfully!",
    todoDeleted: "Task deleted successfully!",
  }
} as const;
```

## 🔒 Security Features

- **Route Protection**: Middleware prevents unauthorized access to protected routes
- **Input Validation**: Form validation for email, password, and required fields
- **Password Security**: Supabase handles password hashing and validation
- **Session Management**: Secure session handling with Supabase
- **CSRF Protection**: Built-in protection with Next.js and Supabase
- **Type Safety**: Full TypeScript coverage prevents runtime errors

## 🚀 Deployment

The application can be deployed to any platform that supports Next.js:

1. **Vercel** (Recommended):
   ```bash
   npm run build
   # Deploy to Vercel with environment variables
   ```

2. **Other Platforms**:
   ```bash
   npm run build
   npm run start
   ```

### Environment Variables for Production
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📝 Development Notes

- The app uses Next.js 15 with the new App Router
- Turbopack is enabled for faster development builds
- TypeScript is configured with strict type checking
- ESLint is configured for code quality with automatic fixing
- Husky and lint-staged ensure code quality on commit
- Feature-based architecture for better maintainability
- React Query for efficient data fetching and caching
- Supabase for authentication and database

## 🏗️ Architecture

### Frontend Architecture
- **Feature-based structure**: Organized by features (auth, todos)
- **Custom hooks**: Reusable logic with React Query
- **Context providers**: Global state management
- **Component composition**: Reusable UI components

### Backend Architecture
- **API Routes**: Next.js API routes for backend logic
- **Database**: Supabase PostgreSQL database
- **Authentication**: Supabase Auth integration
- **Server utilities**: Helper functions for data processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `npm test && npm run lint`
5. Commit your changes (Husky will run pre-commit hooks)
6. Submit a pull request

## 📄 License

This project is part of a frontend assignment and is for educational purposes.

---

Built with ❤️ using Next.js, TypeScript, Supabase, React Query, and HeroUI