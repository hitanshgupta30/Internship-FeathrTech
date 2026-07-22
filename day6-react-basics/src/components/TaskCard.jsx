import Card from "./Card";
import Badge from "./Badge";
import Button from "./Button";

function TaskCard({ task, onDelete }) {
  return (
    <Card
      title={task.title}
      description={task.description}
      footer={`Due: ${task.dueDate}`}
    >
      <p>
        <strong>Priority:</strong> {task.priority}
      </p>

      <Badge status={task.status} />

      <div className="task-actions">
        <Button
          text="Delete"
          variant="danger"
          onClick={() => onDelete(task.id)}
        />
      </div>
    </Card>
  );
}

export default TaskCard;