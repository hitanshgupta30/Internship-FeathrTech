function Button({ text, variant = "primary", disabled = false, onClick }) {
  return (
    <button
      className={`button ${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default Button;