import React from 'react';

const EmptyState = ({
  title = 'No items found',
  description = 'Get started by creating an item.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button type="button" className="btn btn-primary btn-sm" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
