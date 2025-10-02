'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button, Card, CardBody, CardHeader, Checkbox, Input} from '@heroui/react';
import {useAuth} from '@/contexts/AuthContext';
import {PlusIcon} from "@heroicons/react/16/solid";
import {translations} from "@/utils";
import Logo from "@/assets";
import Image from "next/image";

interface Todo {
	id: number;
	text: string;
	completed: boolean;
}

export default function TodoListPage() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [newTodo, setNewTodo] = useState('');
	const {user, logout, isAuthenticated} = useAuth();
	const router = useRouter();
	const t = translations;

	useEffect(() => {
		if (!isAuthenticated) {
			router.push('/login');
			return;
		}

		const storedTodos = localStorage.getItem(`todos_${user?.email}`);
		if (storedTodos) {
			setTodos(JSON.parse(storedTodos));
		}
	}, [isAuthenticated, user, router]);

	useEffect(() => {
		if (user?.email) {
			localStorage.setItem(`todos_${user.email}`, JSON.stringify(todos));
		}
	}, [todos, user]);

	const addTodo = () => {
		if (newTodo.trim()) {
			setTodos([...todos, {id: Date.now(), text: newTodo, completed: false}]);
			setNewTodo('');
		}
	};

	const toggleTodo = (id: number) => {
		setTodos(todos.map(todo =>
			todo.id === id ? {...todo, completed: !todo.completed} : todo
		));
	};

	const deleteTodo = (id: number) => {
		setTodos(todos.filter(todo => todo.id !== id));
	};

	const handleLogout = () => {
		logout();
		router.push('/login');
	};

	if (!isAuthenticated) {
		return null;
	}

	const todayDate = new Date().toLocaleDateString('cs-CZ', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	});

	return (
		<Card>
			<CardHeader className="px-6 pt-6 flex justify-between">
				<div>
					<h1 className="text-3xl font-bold">{t.todoList.welcome}, {user?.name}!</h1>
					<p className="text-sm">{todayDate}</p>
				</div>
				<Button color="primary" size="sm" className="rounded-4xl" onPress={addTodo}
						endContent={<PlusIcon className="w-4 h-4"/>}>
					{t.todoList.addButton}
				</Button>
			</CardHeader>
			<CardBody className="gap-4 px-6 pb-6">
				<div className="flex gap-2">
					<Input
						placeholder="Add a new todo..."
						value={newTodo}
						onChange={(e) => setNewTodo(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && addTodo()}
						className="flex-1"
					/>
				</div>

				<div className="flex flex-col gap-2">
					{todos.length === 0 ? (
						<div className="flex flex-col justify-center items-center py-8 gap-4">
							<Image src={Logo} alt="Logo" width={80} />
							<h1 className="text-3xl font-bold">{t.todoList.emptyTitle}</h1>
							<p className="text-center text-gray-500 py-8">{t.todoList.emptyDescription}</p>
						</div>
					) : (
						todos.map((todo) => (
							<Card key={todo.id} className="p-3">
								<div className="flex items-center justify-between gap-2">
									<Checkbox
										isSelected={todo.completed}
										onChange={() => toggleTodo(todo.id)}
									>
                        <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                          {todo.text}
                        </span>
									</Checkbox>
									<Button
										size="sm"
										color="danger"
										variant="light"
										onPress={() => deleteTodo(todo.id)}
									>
										Delete
									</Button>
								</div>
							</Card>
						))
					)}
				</div>

				{todos.length > 0 && (
					<div className="mt-4 text-sm text-gray-600">
						{todos.filter(t => !t.completed).length} of {todos.length} tasks remaining
					</div>
				)}
			</CardBody>
		</Card>
	);
}
