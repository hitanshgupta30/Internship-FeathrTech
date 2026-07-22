import { useState } from "react";
import TaskList from "../components/TaskList";

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

  function handleDelete(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  return (
    <div className="dashboard">
      <h1>Task Dashboard</h1>

      <p>Manage your tasks and track your progress.</p>

      <TaskList
        tasks={tasks}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default Dashboard;