import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '../api/api';
import { Todo } from '@/types';

export const useTodos = () => {
  const { user } = useAuth();

  return useQuery<Todo[]>({
    queryKey: ['todos', user?.email],
    queryFn: async () => {
      const response = await api.getTodos(user?.email);
      return response.todos;
    },
    enabled: !!user?.email,
    staleTime: 1000 * 30, // 30 seconds
  });
};
