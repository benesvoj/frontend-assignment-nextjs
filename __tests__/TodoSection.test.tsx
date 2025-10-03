import { render, screen } from "@testing-library/react";
import { TodoSection } from "@/app/todolist/components/TodoSection";
import { Todo } from "@/types";

// Mock the TaskItem component
jest.mock("@/app/todolist/components/TaskItem", () => ({
  TaskItem: ({
    todo,
    onToggle,
    onEdit,
    onDelete,
  }: {
    todo: Todo;
    onToggle: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
  }) => (
    <div data-testid={`task-item-${todo.id}`}>
      <span>{todo.text}</span>
      <button onClick={() => onToggle(todo.id)}>Toggle</button>
      <button onClick={() => onEdit(todo.id)}>Edit</button>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  ),
}));

describe("TodoSection", () => {
  const mockTodos: Todo[] = [
    { id: 1, text: "Todo 1", completed: false, userEmail: "test@example.com", createdAt: "2023-01-01T00:00:00.000Z", updatedAt: "2023-01-01T00:00:00.000Z" },
    { id: 2, text: "Todo 2", completed: false, userEmail: "test@example.com", createdAt: "2023-01-01T00:00:00.000Z", updatedAt: "2023-01-01T00:00:00.000Z" },
    { id: 3, text: "Todo 3", completed: false, userEmail: "test@example.com", createdAt: "2023-01-01T00:00:00.000Z", updatedAt: "2023-01-01T00:00:00.000Z" },
  ];

  const mockOnToggle = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders section title", () => {
    render(
      <TodoSection
        title="Test Section"
        todos={mockTodos}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Test Section")).toBeTruthy();
  });

  it("renders all todos in the section", () => {
    render(
      <TodoSection
        title="Test Section"
        todos={mockTodos}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId("task-item-1")).toBeTruthy();
    expect(screen.getByTestId("task-item-2")).toBeTruthy();
    expect(screen.getByTestId("task-item-3")).toBeTruthy();
  });

  it("renders divider after title", () => {
    render(
      <TodoSection
        title="Test Section"
        todos={mockTodos}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if divider is present (it should be rendered by HeroUI Divider component)
    const section = screen.getByText("Test Section").closest("div");
    expect(section).toBeTruthy();
  });

  it("passes correct props to TaskItem components", () => {
    render(
      <TodoSection
        title="Test Section"
        todos={mockTodos}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if TaskItem components receive the correct todo data
    expect(screen.getByText("Todo 1")).toBeTruthy();
    expect(screen.getByText("Todo 2")).toBeTruthy();
    expect(screen.getByText("Todo 3")).toBeTruthy();
  });

  it("passes callback functions to TaskItem components", () => {
    render(
      <TodoSection
        title="Test Section"
        todos={mockTodos}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if callback buttons are rendered
    const toggleButtons = screen.getAllByText("Toggle");
    const editButtons = screen.getAllByText("Edit");
    const deleteButtons = screen.getAllByText("Delete");

    expect(toggleButtons).toHaveLength(3);
    expect(editButtons).toHaveLength(3);
    expect(deleteButtons).toHaveLength(3);
  });

  it("returns null when todos array is empty", () => {
    const { container } = render(
      <TodoSection
        title="Empty Section"
        todos={[]}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders with single todo", () => {
    const singleTodo = [mockTodos[0]];

    render(
      <TodoSection
        title="Single Todo Section"
        todos={singleTodo}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Single Todo Section")).toBeTruthy();
    expect(screen.getByTestId("task-item-1")).toBeTruthy();
    expect(screen.queryByTestId("task-item-2")).not.toBeTruthy();
  });

  it("handles todos with different properties", () => {
    const mixedTodos: Todo[] = [
      { id: 1, text: "Simple Todo", completed: false, userEmail: "test@example.com", createdAt: "2023-01-01T00:00:00.000Z", updatedAt: "2023-01-01T00:00:00.000Z" },
      {
        id: 2,
        text: "Todo with Description",
        completed: false,
        description: "This is a description",
        userEmail: "test@example.com",
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-01T00:00:00.000Z"
      },
      { id: 3, text: "Completed Todo", completed: true, userEmail: "test@example.com", createdAt: "2023-01-01T00:00:00.000Z", updatedAt: "2023-01-01T00:00:00.000Z" },
    ];

    render(
      <TodoSection
        title="Mixed Section"
        todos={mixedTodos}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Simple Todo")).toBeTruthy();
    expect(screen.getByText("Todo with Description")).toBeTruthy();
    expect(screen.getByText("Completed Todo")).toBeTruthy();
  });
});
