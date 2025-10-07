import '@testing-library/jest-dom';

// Mock next/headers before any imports that use it
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    getAll: jest.fn(() => []),
    has: jest.fn(),
  })),
}));

// Mock Supabase globally
const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();

jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  })),
}));

jest.mock('@/lib/supabase-server', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getSession: mockGetSession,
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
  })),
}));

beforeEach(() => {
    jest.clearAllMocks();

    // Reset Supabase mocks to default behavior
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });
});
