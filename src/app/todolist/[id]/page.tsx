"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Textarea,
  Spinner,
} from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/16/solid";
import { translations } from "@/utils";
import { routes } from "@/routes/routes";
import { api, ApiError } from "@/features/todos/api/api";

export default function TaskFormPage() {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const t = translations;

  const taskId = params.id as string;
  const isEditing = taskId !== "new";
  const isCreating = taskId === "new";

  const loadTask = useCallback(async () => {
    if (!user?.email) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.getTodos(user.email);
      if (response.success) {
        const task = response.todos.find((todo) => todo.id === parseInt(taskId));
        if (task) {
          setTaskName(task.text);
          setDescription(task.description || "");
        } else {
          router.push(routes.todoList);
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load task');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.email, taskId, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(routes.login);
      return;
    }

    if (isEditing) {
      loadTask();
    }
  }, [isAuthenticated, user, router, taskId, isEditing, loadTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (!taskName.trim()) {
      setError(t.taskForm.error);
      setSaving(false);
      return;
    }

    if (!user?.email) {
      setSaving(false);
      return;
    }

    try {
      if (isCreating) {
        const response = await api.createTodo(
          taskName.trim(),
          description.trim() || undefined,
          user.email
        );

        if (response.success) {
          router.push(routes.todoList);
        }
      } else {
        const response = await api.updateTodo(parseInt(taskId), {
          text: taskName.trim(),
          description: description.trim() || undefined,
        }, user.email);

        if (response.success) {
          router.push(routes.todoList);
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to save task');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    router.push(routes.todoList);
  };

  if (!isAuthenticated) {
    return null;
  }

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
      <CardHeader className="px-6 lg:pt-6">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            radius="full"
            size="sm"
            onPress={handleDiscard}
            className="min-w-0"
            isDisabled={saving}
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
              isDisabled={saving}
            >
              {t.button.discard}
            </Button>
            <Button
              type="submit"
              color="primary"
              size="sm"
              className="rounded-4xl"
              endContent={saving ? <Spinner size="sm" /> : <CheckIcon className="w-4 h-4" />}
              isLoading={saving}
              isDisabled={saving}
            >
              {isCreating ? t.button.create : t.button.save}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
