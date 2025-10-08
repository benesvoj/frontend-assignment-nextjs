import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '../api/api';
import { Todo } from '@/types';

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ text, description }: { text: string; description?: string }) =>
      api.createTodo(text, description, user?.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.email] });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Pick<Todo, 'text' | 'description' | 'completed'>> }) =>
      api.updateTodo(id, updates, user?.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.email] });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: number) => api.deleteTodo(id, user?.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.email] });
    },
  });
};

export const useToggleTodo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      // Get current todos from cache
      const todos = queryClient.getQueryData<Todo[]>(['todos', user?.email]);
      const todo = todos?.find((t) => t.id === id);

      if (!todo) {
        throw new Error('Todo not found');
      }

      return api.updateTodo(id, { completed: !todo.completed }, user?.email);
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos', user?.email] });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', user?.email]);

      // Optimistically update
      queryClient.setQueryData<Todo[]>(['todos', user?.email], (old) =>
        old?.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );

      return { previousTodos };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', user?.email], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.email] });
    },
  });
};
