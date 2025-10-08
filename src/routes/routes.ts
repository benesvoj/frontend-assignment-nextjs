export const routes = {
	login: "/login",
	register: "/register",
	todoList: "/todolist",
	todoListNew: "/todolist/new",
	todoListId: (id: string | number) => `/todolist/${id}`,
} as const;