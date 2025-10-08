import { TodoSectionProps } from "@/types";
import { TaskItem } from "./TaskItem";
import { Divider } from "@heroui/react";

export function TodoSection({ title, todos, onToggle, onEdit, onDelete }: TodoSectionProps) {
  if (todos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <Divider />
      <div className="space-y-3">
        {todos.map((todo) => (
          <TaskItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
