import { Todo } from "@/types";

export interface TaskItemProps {
	todo: Todo;
	onToggle: (id: number) => void;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}