"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { PlusIcon } from "@heroicons/react/16/solid";
import { translations } from "@/utils";
import Logo from "@/assets";
import Image from "next/image";
import { Todo } from "@/types";
import { TodoSection } from "@/app/todolist/components/TodoSection";
import { routes } from "@/routes/routes";

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const t = translations;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(routes.login);
      return;
    }

    const storedTodos = localStorage.getItem(`todos_${user?.email}`);
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
    setIsInitialized(true);
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (user?.email && isInitialized) {
      localStorage.setItem(`todos_${user.email}`, JSON.stringify(todos));
    }
  }, [todos, user, isInitialized]);

  const navigateToCreateTask = () => {
    router.push(routes.todoListNew);
  };

  const navigateToEditTask = (taskId: number) => {
    router.push(routes.todoListId.replace(":id", taskId.toString()));
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  if (!isAuthenticated) {
    return null;
  }

  const todayDate = new Date().toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

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
