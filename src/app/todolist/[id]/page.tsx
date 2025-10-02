"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Textarea,
} from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/16/solid";
import { translations } from "@/utils";
import { Todo } from "@/types";
import { routes } from "@/routes/routes";

export default function TaskFormPage() {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const t = translations;

  const taskId = params.id as string;
  const isEditing = taskId !== "new";
  const isCreating = taskId === "new";

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(routes.login);
      return;
    }

    if (isEditing) {
      // Load existing task data
      const storedTodos = localStorage.getItem(`todos_${user?.email}`);
      if (storedTodos) {
        const todos: Todo[] = JSON.parse(storedTodos);
        const task = todos.find((todo) => todo.id === parseInt(taskId));
        if (task) {
          setTaskName(task.text);
          setDescription(task.description || "");
        } else {
          router.push(routes.todoList);
        }
      }
    }
  }, [isAuthenticated, user, router, taskId, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!taskName.trim()) {
      setError(t.taskForm.error);
      return;
    }

    if (!user?.email) return;

    const storedTodos = localStorage.getItem(`todos_${user.email}`);
    const todos: Todo[] = storedTodos ? JSON.parse(storedTodos) : [];

    if (isCreating) {
      const newTask: Todo = {
        id: Date.now(),
        text: taskName.trim(),
        completed: false,
        description: description.trim() || undefined,
      };
      todos.push(newTask);
    } else {
      const taskIndex = todos.findIndex((todo) => todo.id === parseInt(taskId));
      if (taskIndex !== -1) {
        todos[taskIndex] = {
          ...todos[taskIndex],
          text: taskName.trim(),
          description: description.trim() || undefined,
        };
      }
    }

    localStorage.setItem(`todos_${user.email}`, JSON.stringify(todos));
    router.push(routes.todoList);
  };

  const handleDiscard = () => {
    router.push(routes.todoList);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="px-6 lg:pt-6">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            radius="full"
            size="sm"
            onPress={handleDiscard}
            className="min-w-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isCreating ? t.taskForm.newTask : t.taskForm.editTask}
          </h1>
        </div>
      </CardHeader>
      <CardBody className="gap-4 px-6 pb-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label={t.taskForm.taskName}
            placeholder={t.taskForm.placeholder}
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            isRequired
            className="w-full"
          />
          <Textarea
            label={t.taskForm.description}
            placeholder={t.taskForm.placeholderDescription}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 justify-between">
            <Button
              type="button"
              size="sm"
              onPress={handleDiscard}
              className="rounded-4xl"
            >
              {t.button.discard}
            </Button>
            <Button
              type="submit"
              color="primary"
              size="sm"
              className="rounded-4xl"
              endContent={<CheckIcon className="w-4 h-4" />}
            >
              {isCreating ? t.button.create : t.button.save}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
