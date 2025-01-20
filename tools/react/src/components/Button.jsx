import React from 'react';

const Button = ({ 
  children, 
  className = "", 
  onClick, 
  size = "default",
  leadingIcon: LeadingIcon,  // Component for icon before text
  trailingIcon: TrailingIcon, // Component for icon after text
  iconSize = 20,  // Default icon size
  iconClassName = "" // Optional classes for icons
}) => {
  const sizeClasses = {
    default: "px-4 py-2",
    sm: "px-2 py-1 text-sm"
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
        inline-flex items-center justify-center gap-2
        ${sizeClasses[size]} ${className}`}
    >
      {LeadingIcon && (
        <LeadingIcon size={iconSize} className={iconClassName} />
      )}
      {children}
      {TrailingIcon && (
        <TrailingIcon size={iconSize} className={iconClassName} />
      )}
    </button>
  );
};

export default Button;