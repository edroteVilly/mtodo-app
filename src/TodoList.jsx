import { useState, useEffect } from "react";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [updatedText, setUpdatedText] = useState("");
  const [viewFilter, setViewFilter] = useState("all");
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") === "dark" ? "dark" : "light"
  );

  const API_URL = "http://localhost/todo-api-new/index.php?path=tasks";

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setTasks)
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTask, status: "pending" }),
      });

      const created = await res.json();
      setTasks([...tasks, created]);
      setNewTask("");
    } catch (err) {
      console.error("Add error:", err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await fetch(`${API_URL}&id=${id}`, {
        method: "DELETE",
      });

      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === "pending" ? "completed" : "pending";

    try {
      await fetch(`${API_URL}&id=${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      setTasks(
        tasks.map((t) =>
          t.id === task.id ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setUpdatedText(task.text);
  };

  const saveEdit = async (id) => {
    try {
      await fetch(`${API_URL}&id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: updatedText }),
      });

      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, text: updatedText } : task
        )
      );
      setEditingTaskId(null);
      setUpdatedText("");
    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (viewFilter === "completed") return task.status === "completed";
    if (viewFilter === "pending") return task.status === "pending";
    return true;
  });

  return (
    <div className="task-wrapper">
      <header>
        <h1>Task Manager</h1>
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? "🌑 Dark Mode" : "☀️ Light Mode"}
        </button>
      </header>

      <div className="input-section">
        <input
          type="text"
          placeholder="Enter a task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button className="add-btn" onClick={handleAddTask}>Add</button>
      </div>

      <div className="filter-section">
        <button onClick={() => setViewFilter("all")}>All</button>
        <button onClick={() => setViewFilter("completed")}>Completed</button>
        <button onClick={() => setViewFilter("pending")}>Pending</button>
      </div>

      <ul className="task-list">
        {filteredTasks.map((task) => (
          <li key={task.id} className={`task-item ${task.status}`}>
            {editingTaskId === task.id ? (
              <input
                type="text"
                value={updatedText}
                onChange={(e) => setUpdatedText(e.target.value)}
              />
            ) : (
              <span
                className="task-text"
                onClick={() => toggleTaskStatus(task)}
              >
                {task.text}
              </span>
            )}

            <div className="task-controls">
              <button onClick={() => toggleTaskStatus(task)}>
                {task.status === "completed" ? "✅ Completed" : "✔ Complete"}
              </button>
              <button onClick={() => handleDeleteTask(task.id)}>❌</button>
              {editingTaskId === task.id ? (
                <button onClick={() => saveEdit(task.id)}>💾</button>
              ) : (
                <button onClick={() => startEditing(task)}>✏️</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
