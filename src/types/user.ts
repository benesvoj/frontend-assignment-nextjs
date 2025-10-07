// Public user interface for frontend (from Supabase)
export interface User {
  id: string;
  email: string;
  name: string;
}

// Internal user interface for backend storage
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}
