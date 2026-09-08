function Card({ title, description, footer, children, onClick, }) {
  return (
    <div className="card"
      onClick={onClick}
    >
      <h2>{title}</h2>

      {description && <p>{description}</p>}

      {children}

      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

export default Card;