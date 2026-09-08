import { useState, useEffect } from "react";
import Input from "../components/Input";
import TaskList from "../components/TaskList";
import Modal from "../components/Modal";

const BACKEND_URL = "http://localhost:3000";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);

  // New Task Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch all tasks from Neon DB on mount
  useEffect(() => {
    let isMounted = true;

    const getTasks = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/tasks`);
        if (!res.ok) throw new Error("Failed to fetch tasks from server");
        const data = await res.json();
        if (isMounted) {
          setTasks(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching tasks:", err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Create a new task in Neon DB
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`${BACKEND_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to create task");

      const createdTask = await res.json();
      setTasks((prev) => [createdTask, ...prev]);
      setNewTitle("");
      setNewDescription("");
    } catch (err) {
      alert("Error adding task: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Delete task from Neon DB
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/tasks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete task");

      setTasks((prev) => prev.filter((task) => task.id !== id));
      if (selectedTask?.id === id) {
        setSelectedTask(null);
      }
    } catch (err) {
      alert("Error deleting task: " + err.message);
    }
  };

  // 4. Update task status in Neon DB (for Modal)
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`${BACKEND_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      setSelectedTask((prev) =>
        prev && prev.id === taskId ? { ...prev, status: newStatus } : prev
      );
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const filteredTasks = tasks.filter((task) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (task.title && task.title.toLowerCase().includes(search)) ||
      (task.description && task.description.toLowerCase().includes(search));

    const matchesStatus =
      statusFilter === "All" || (task.status && task.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard">
      <h1>Task Dashboard</h1>
      <p>Manage your tasks and track your progress.</p>

      {/* New Task Form */}
      <form onSubmit={handleCreateTask} className="task-form" style={{ marginBottom: "20px" }}>
        <Input
          placeholder="Task title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
        />
        <Input
          placeholder="Task description..."
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          required
        />
        <button type="submit" disabled={isSubmitting} style={{ marginTop: "8px", padding: "8px 16px", cursor: "pointer" }}>
          {isSubmitting ? "Adding..." : "Add Task"}
        </button>
      </form>

      {/* Search & Filters */}
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

      {/* Content Display */}
      {loading ? (
        <p>Loading tasks from Neon DB...</p>
      ) : error ? (
        <p style={{ color: "red" }}>Error: {error}</p>
      ) : filteredTasks.length > 0 ? (
        <TaskList
          tasks={filteredTasks}
          onDelete={handleDelete}
          onTaskClick={handleTaskClick}
        />
      ) : (
        <p>No tasks found.</p>
      )}

      {/* Detail Modal */}
      {selectedTask && (
        <Modal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}

export default Dashboard;