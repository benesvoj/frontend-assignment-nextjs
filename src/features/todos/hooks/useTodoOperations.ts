import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '../api/api';
import { Todo } from '@/types';
import { showToast } from '@/components/ui/Toast';
import { translations } from '@/utils';

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ text, description }: { text: string; description?: string }) =>
      api.createTodo(text, description, user?.email),
    onSuccess: (data) => {
      queryClient.setQueryData<Todo[]>(['todos', user?.email], (old) => {
        if (!old) return [data.todo];
        return [data.todo, ...old];
      });
      
      queryClient.invalidateQueries({ queryKey: ['todos', user?.email] });
      showToast.success(translations.toast.todoCreated);
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
      showToast.success(translations.toast.todoUpdated);
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: number) => api.deleteTodo(id, user?.email),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Todo[]>(['todos', user?.email], (old) => {
        if (!old) return [];
        return old.filter(todo => todo.id !== id);
      });
      
      queryClient.invalidateQueries({ queryKey: ['todos', user?.email] });
      showToast.success(translations.toast.todoDeleted);
    },
  });
};

export const useToggleTodo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      // Get the current todo from cache
      const todos = queryClient.getQueryData<Todo[]>(['todos', user?.email]);
      const todo = todos?.find((t) => t.id === id);

      if (!todo) {
        throw new Error('Todo not found');
      }

      // Toggle the current completed state
      const newCompleted = !todo.completed;

      return api.updateTodo(id, { completed: newCompleted }, user?.email);
    },
    onSuccess: (data, id) => {
      // Update with server response
      queryClient.setQueryData<Todo[]>(['todos', user?.email], (prev) =>
        prev?.map((todo) => {
          if (todo.id === id) {
            return data.todo;
          }
          return todo;
        })
      );
      showToast.success(translations.toast.todoUpdated);
    },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError: (err, _id) => {
      console.error('Toggle todo error:', err);
    },
  });
};
