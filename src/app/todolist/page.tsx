"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { PlusIcon } from "@heroicons/react/16/solid";
import { translations } from "@/utils";
import Logo from "@/assets";
import Image from "next/image";
import { Todo } from "@/types";
import { TodoSection } from "@/app/todolist/components/TodoSection";
import { routes } from "@/routes/routes";
import { api, ApiError } from "@/services/api";

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const t = translations;

  const loadTodos = useCallback(async (clearError = true) => {
    if (!user?.email) return;
    
    setLoading(true);
    if (clearError) {
      setError(null); // Only clear error when explicitly requested
    }
    
    try {
      const response = await api.getTodos(user.email);
      if (response.success) {
        setTodos(response.todos);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load todos');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(routes.login);
      return;
    }

    loadTodos(false); // Don't clear errors when loading todos on mount
  }, [isAuthenticated, user, router]);

  const navigateToCreateTask = () => {
    router.push(routes.todoListNew);
  };

  const navigateToEditTask = (taskId: number) => {
    router.push(routes.todoListId.replace(":id", taskId.toString()));
  };

  const toggleTodo = async (id: number) => {
    if (!user?.email) return;
    
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const response = await api.updateTodo(id, { completed: !todo.completed }, user.email);
      if (response.success) {
        setTodos(todos.map(t => t.id === id ? response.todo : t));
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update todo');
      }
    }
  };

  const deleteTodo = async (id: number) => {
    if (!user?.email) return;
    
    try {
      const response = await api.deleteTodo(id, user.email);
      if (response.success) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to delete todo');
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const todayDate = new Date().toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center py-8">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-6 lg:pt-6 flex flex-col lg:flex-row gap-4 lg:gap-0 justify-between">
        <div className="w-full lg:w-auto">
          <h1 className="text-3xl font-bold">
            {t.todoList.welcome}, {user?.name}!
          </h1>
          <p className="text-sm">{todayDate}</p>
        </div>
        <Button
          color="primary"
          size="sm"
          className="rounded-4xl w-full lg:w-auto"
          onPress={navigateToCreateTask}
          endContent={<PlusIcon className="w-4 h-4" />}
        >
          {t.todoList.addButton}
        </Button>
      </CardHeader>
      <CardBody className="gap-6 px-6 pb-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {todos.filter((todo) => !todo.completed).length === 0 ? (
          <div className="flex flex-col justify-center items-center py-8 gap-4">
            <Image src={Logo} alt="Logo" width={80} />
            <h1 className="text-3xl font-bold">{t.todoList.emptyTitle}</h1>
            <p className="text-center text-gray-500 py-8">
              {t.todoList.emptyDescription}
            </p>
          </div>
        ) : (
          <TodoSection
            title={t.todoList.todoSection}
            todos={todos.filter((todo) => !todo.completed)}
            onToggle={toggleTodo}
            onEdit={navigateToEditTask}
            onDelete={deleteTodo}
          />
        )}
        {todos.filter((todo) => todo.completed).length > 0 && (
          <TodoSection
            title={t.todoList.completedSection}
            todos={todos.filter((todo) => todo.completed)}
            onToggle={toggleTodo}
            onEdit={navigateToEditTask}
            onDelete={deleteTodo}
          />
        )}
      </CardBody>
    </Card>
  );
}
