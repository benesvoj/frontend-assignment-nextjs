import { Todo, User } from '@/types';
import { apiClient, ApiError } from '@/lib/api-client';

export { ApiError };

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<{ success: boolean; user: User }> {
    return apiClient.post('/auth/login', { email, password });
  },

  async register(name: string, email: string, password: string): Promise<{ success: boolean; user: User }> {
    return apiClient.post('/auth/register', { name, email, password });
  },

  // Todos (all use session cookies for authentication)
  async getTodos(userEmail?: string): Promise<{ success: boolean; todos: Todo[] }> {
    const url = userEmail ? `/todos?userEmail=${userEmail}` : `/todos`;
    return apiClient.get(url);
  },

  async createTodo(text: string, description?: string, userEmail?: string): Promise<{ success: boolean; todo: Todo }> {
    return apiClient.post('/todos', { text, description, userEmail });
  },

  async updateTodo(id: number, updates: Partial<Pick<Todo, 'text' | 'description' | 'completed'>>, userEmail?: string): Promise<{ success: boolean; todo: Todo }> {
    return apiClient.put(`/todos/${id}`, { ...updates, userEmail });
  },

  async deleteTodo(id: number, userEmail?: string): Promise<{ success: boolean; message: string }> {
    const url = userEmail ? `/todos/${id}?userEmail=${userEmail}` : `/todos/${id}`;
    return apiClient.delete(url);
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/auth/logout');
  },
}
