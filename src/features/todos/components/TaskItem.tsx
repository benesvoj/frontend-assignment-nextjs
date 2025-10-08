import { TaskItemProps } from "@/types";
import {
  Checkbox,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import { translations } from "@/utils";

export function TaskItem({ todo, onToggle, onEdit, onDelete }: TaskItemProps) {
  const t = translations;

  return (
    <div className="p-4 hover:border-gray-400 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-2 flex-1">
          <Checkbox
            isSelected={todo.completed}
            onChange={() => onToggle(todo.id)}
            radius="full"
            size="lg"
            className="self-start p-0 m-0"
          />
          <div className="flex-1">
            <h3
              className={'font-medium text-gray-900'}
            >
              {todo.text}
            </h3>
            {todo.description && (
              <p
                className={`text-sm mt-1 ${
                  todo.completed ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {todo.description}
              </p>
            )}
          </div>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="min-w-0"
              radius="full"
            >
              <EllipsisVerticalIcon className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Task actions">
            <DropdownItem
              key="edit"
              className="text-primary"
              onPress={() => onEdit(todo.id)}
              startContent={<PencilIcon className="w-4 h-4" />}
            >
              {t.button.edit}
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              onPress={() => onDelete(todo.id)}
              startContent={<TrashIcon className="w-4 h-4" />}
            >
              {t.button.delete}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
}
