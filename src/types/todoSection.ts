import { Todo } from "@/types";

export interface TodoSectionProps {
    title: string;
    todos: Todo[];
    onToggle: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
  }