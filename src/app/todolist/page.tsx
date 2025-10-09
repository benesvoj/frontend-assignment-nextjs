"use client";

import {useRouter} from "next/navigation";
import {Alert, Button, Card, CardBody, CardHeader, Spinner} from "@heroui/react";
import {useAuth} from "@/contexts/AuthContext";
import {PlusIcon} from "@heroicons/react/16/solid";
import {translations} from "@/utils";
import Logo from "@/assets";
import Image from "next/image";
import {TodoSection} from "@/features/todos/components/TodoSection";
import {routes} from "@/routes/routes";
import {useTodos} from "@/features/todos/hooks";
import {useToggleTodo, useDeleteTodo} from "@/features/todos/hooks";
import {CustomButton} from "@/components/ui/CustomButton";

export default function TodoListPage() {
	const {user, isAuthenticated} = useAuth();
	const router = useRouter();
	const t = translations;

	const { data: todos, isLoading: loading, error: queryError } = useTodos();
	const toggleMutation = useToggleTodo();
	const deleteMutation = useDeleteTodo();

	const navigateToCreateTask = () => {
		router.push(routes.todoListNew);
	};

	const navigateToEditTask = (taskId: number) => {
		router.push(routes.todoListId(taskId));
	};

	const handleToggleTodo = (id: number) => {
		toggleMutation.mutate(id);
	};

	const handleDeleteTodo = (id: number) => {
		deleteMutation.mutate(id);
	};

	const error = queryError?.message || toggleMutation.error?.message || deleteMutation.error?.message;

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
					<Spinner size="lg"/>
				</CardBody>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="px-6 md:pt-6 flex flex-col md:flex-row gap-4 justify-between">
				<div className="w-full lg:w-auto">
					<h1 className="text-3xl font-bold">
						{t.todoList.welcome}, {user?.name}!
					</h1>
					<p className="text-sm">{todayDate}</p>
				</div>
				<CustomButton title={t.todoList.addButton} onPress={navigateToCreateTask} icon="plus"/>
			</CardHeader>
			<CardBody className="gap-6 px-6 pb-6">
				{error && (
					<Alert color="danger" className="w-full">
						{error}
					</Alert>
				)}
				{(todos || []).filter((todo) => !todo.completed).length === 0 ? (
					<div className="flex flex-col justify-center items-center py-8 gap-4">
						<Image src={Logo} alt="Logo" width={80}/>
						<h1 className="text-3xl font-bold">{t.todoList.emptyTitle}</h1>
						<p className="text-center text-gray-500 py-8">
							{t.todoList.emptyDescription}
						</p>
					</div>
				) : (
					<TodoSection
						title={t.todoList.todoSection}
						todos={(todos || []).filter((todo) => !todo.completed)}
						onToggle={handleToggleTodo}
						onEdit={navigateToEditTask}
						onDelete={handleDeleteTodo}
					/>
				)}
				{(todos || []).filter((todo) => todo.completed).length > 0 && (
					<TodoSection
						title={t.todoList.completedSection}
						todos={(todos || []).filter((todo) => todo.completed)}
						onToggle={handleToggleTodo}
						onEdit={navigateToEditTask}
						onDelete={handleDeleteTodo}
					/>
				)}
			</CardBody>
		</Card>
	);
}
