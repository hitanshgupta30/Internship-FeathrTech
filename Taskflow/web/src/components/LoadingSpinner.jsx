import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const spinnerClass = size === 'sm' ? 'spinner spinner-sm' : 'spinner';

  return (
    <div className="spinner-wrapper" role="status" aria-live="polite">
      <div className={spinnerClass} aria-hidden="true"></div>
      {message && <p className="text-muted" style={{ fontSize: '0.9rem' }}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
