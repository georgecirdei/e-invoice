import React from 'react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', children, className = '' }) => {
  const styles = {
    success: 'bg-green-50 border-green-400 text-green-800',
    error: 'bg-red-50 border-red-400 text-red-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800',
  };

  return (
    <div className={`border-l-4 p-4 rounded ${styles[type]} ${className}`} role="alert">
      {children}
    </div>
  );
};

