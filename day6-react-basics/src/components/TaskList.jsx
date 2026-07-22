import TaskCard from "./TaskCard";

function TaskList({ tasks, onDelete, onTaskClick }) {
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={onDelete}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
}

export default TaskList;