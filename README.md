# Todo App - Frontend Assignment

A modern, responsive Todo application built with Next.js 15, featuring user authentication, task management, and a beautiful UI using HeroUI components.

## 🚀 Features

- **User Authentication**: Secure login and registration system
- **Task Management**: Create, complete, and delete todo items
- **Persistent Storage**: Tasks are saved per user in localStorage
- **Responsive Design**: Beautiful UI that works on all devices
- **Route Protection**: Middleware-based authentication guards
- **Modern UI**: Built with HeroUI components and Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript 5
- **UI Library**: HeroUI React Components
- **Styling**: Tailwind CSS 4
- **Icons**: Heroicons
- **Animations**: Framer Motion
- **Fonts**: Geist Sans & Geist Mono

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

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── components/         # Reusable components
│   │   └── TopBar.tsx     # Navigation bar component
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── todolist/          # Todo list page and layout
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── providers.tsx      # Context providers
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── utils/                 # Utility functions
│   ├── index.ts           # Utility exports
│   └── translations.ts    # App translations
├── assets/                # Static assets
│   └── logo.svg           # Application logo
└── middleware.ts          # Next.js middleware for route protection
```

## 🔐 Authentication

The app includes a complete authentication system:

- **Registration**: Users can create accounts with email, password, and name
- **Login**: Secure login with email and password
- **Session Management**: Persistent login state using localStorage and cookies
- **Route Protection**: Middleware automatically redirects unauthenticated users

### Default Credentials
Since this is a demo application, you can register a new account or use any email/password combination (stored locally).

## 📱 Usage

### Getting Started
1. Visit the application at `http://localhost:3000`
2. Register a new account or login with existing credentials
3. Start managing your tasks!

### Managing Tasks
- **Add Task**: Click the "Add Task" button or press Enter in the input field
- **Complete Task**: Check the checkbox next to any task
- **Delete Task**: Click the "Delete" button on any task
- **View Progress**: See remaining tasks count at the bottom

## 🎨 UI Components

The application uses HeroUI components for a consistent and modern design:

- **Cards**: For task items and main containers
- **Inputs**: For forms and task input
- **Buttons**: For actions and navigation
- **Checkboxes**: For task completion status
- **User Component**: For displaying user information

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

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
  }
} as const;
```

## 🔒 Security Features

- **Route Protection**: Middleware prevents unauthorized access to protected routes
- **Input Validation**: Form validation for email, password, and required fields
- **Password Security**: Minimum password length requirements
- **Session Management**: Secure cookie-based session handling

## 🚀 Deployment

The application can be deployed to any platform that supports Next.js:

1. **Vercel** (Recommended):
   ```bash
   npm run build
   # Deploy to Vercel
   ```

2. **Other Platforms**:
   ```bash
   npm run build
   npm run start
   ```

## 📝 Development Notes

- The app uses Next.js 15 with the new App Router
- Turbopack is enabled for faster development builds
- TypeScript is configured with strict type checking
- ESLint is configured for code quality
- Tailwind CSS 4 is used for styling with custom utilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is part of a frontend assignment and is for educational purposes.

---

Built with ❤️ using Next.js, TypeScript, and HeroUI