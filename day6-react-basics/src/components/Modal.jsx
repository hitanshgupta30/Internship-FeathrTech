function Modal({ task, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{task.title}</h2>

        <p>
          <strong>Description:</strong>
        </p>

        <p>{task.description}</p>

        <p>
          <strong>Due Date:</strong> {task.dueDate}
        </p>

        <p>
          <strong>Priority:</strong> {task.priority}
        </p>

        <p>
          <strong>Status:</strong> {task.status}
        </p>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default Modal;