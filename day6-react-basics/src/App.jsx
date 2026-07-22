import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  function handleThemeToggle() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <div className="app">
      <ThemeToggle
        theme={theme}
        onToggle={handleThemeToggle}
      />

      <Dashboard />
    </div>
  );
}

export default App;