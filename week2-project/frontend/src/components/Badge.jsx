function Badge({ status }) {
  return (
    <span className={`badge ${status.toLowerCase().replace(" ", "-")}`}>
      {status}
    </span>
  );
}

export default Badge;