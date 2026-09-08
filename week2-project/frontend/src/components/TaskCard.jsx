import Card from "./Card";
import Badge from "./Badge";
import Button from "./Button";

function TaskCard({ task, onDelete, onTaskClick }) {
  return (
    <Card
      title={task.title}
      description={task.description}
      footer={`Due: ${task.dueDate}`}
      onClick={() => onTaskClick(task)}
    >
      <p>
        <strong>Priority:</strong> {task.priority}
      </p>

      <Badge status={task.status} />

      <div className="task-actions">
        <Button
          text="Delete"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        />
      </div>
    </Card>
  );
}

export default TaskCard;
