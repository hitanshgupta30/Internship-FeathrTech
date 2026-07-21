function Card({ title, description, footer, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>

      {description && <p>{description}</p>}

      {children}

      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

export default Card;