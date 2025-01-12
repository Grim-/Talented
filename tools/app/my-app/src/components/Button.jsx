import React from 'react';

const Button = ({ children, className = "", onClick, size = "default" }) => {
  const sizeClasses = {
    default: "px-4 py-2",
    sm: "px-2 py-1 text-sm"
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
        ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
