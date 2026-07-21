import { useState } from "react";
import Button from "./components/Button";
import Card from "./components/Card";
import Badge from "./components/Badge";
import Input from "./components/Input";
import "./styles/components.css";

function App() {
  const [text, setText] = useState("");

  function handleClick() {
    alert("Button clicked!");
  }

  return (
    <div>
      <h1>Task Manager</h1>

      <Input
        placeholder="Search tasks..."
        value={text}
        onChange={(event) => setText(event.target.value)}
      />

      <p>You typed: {text}</p>

      <Button
        text="Add Task"
        variant="primary"
        onClick={handleClick}
      />

      <Card
        title="Learn React"
        description="Learn React components and props."
        footer="Due: 25 July"
      >
        <p>Priority: High</p>
        <Badge status="In Progress" />
      </Card>
    </div>
  );
}

export default App;