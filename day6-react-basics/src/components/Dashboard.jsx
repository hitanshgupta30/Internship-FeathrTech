import { useState } from "react";
import Input from "../components/Input";
import TaskList from "../components/TaskList";
import Modal from "../components/Modal";

function Dashboard() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Learn React",
      description: "Learn React components, props, and state.",
      priority: "High",
      status: "In Progress",
      dueDate: "25 July",
    },
    {
      id: 2,
      title: "Complete JavaScript Practice",
      description: "Practice arrays, objects, and functions.",
      priority: "Medium",
      status: "Pending",
      dueDate: "26 July",
    },
    {
      id: 3,
      title: "Build Portfolio",
      description: "Create a personal portfolio website.",
      priority: "High",
      status: "Pending",
      dueDate: "28 July",
    },
    {
      id: 4,
      title: "Study CSS",
      description: "Learn Flexbox and CSS Grid.",
      priority: "Low",
      status: "Completed",
      dueDate: "20 July",
    },
    {
      id: 5,
      title: "Practice Git",
      description: "Learn branches, commits, and merging.",
      priority: "Medium",
      status: "In Progress",
      dueDate: "29 July",
    },
    {
      id: 6,
      title: "Learn React Hooks",
      description: "Understand useState and useEffect.",
      priority: "High",
      status: "Pending",
      dueDate: "30 July",
    },
    {
      id: 7,
      title: "Build a Mini Project",
      description: "Create a small React application.",
      priority: "Medium",
      status: "In Progress",
      dueDate: "2 August",
    },
    {
      id: 8,
      title: "Review React Basics",
      description: "Revise components, props, and JSX.",
      priority: "Low",
      status: "Completed",
      dueDate: "22 July",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null)

  function handleDelete(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }
  function handleTaskClick(task) {
  setSelectedTask(task);
}
  const filteredTasks = tasks.filter((task) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(search) ||
      task.description.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard">
      <h1>Task Dashboard</h1>

      <p>Manage your tasks and track your progress.</p>
      <div className="search-filter">
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
        </select>
      </div>

      <TaskList tasks={filteredTasks} onDelete={handleDelete} onTaskClick={handleTaskClick} />
      {selectedTask && (
      <Modal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    )}
    </div>
  );
}

export default Dashboard;
