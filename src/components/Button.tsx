import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-lg min-h-[36px]',
    md: 'text-sm px-4 py-2.5 rounded-xl min-h-[44px]',
    lg: 'text-base px-5 py-3 rounded-xl min-h-[48px]',
  };

  const variantClasses = {
    primary:
      'bg-[#B43B22] hover:bg-[#9E331D] text-white shadow-sm focus-visible:outline-[#B43B22] active:translate-y-[1px]',
    secondary:
      'bg-[#F2ECE3] hover:bg-[#E8DFD3] text-[#28211A] dark:bg-[#2A241F] dark:hover:bg-[#352D26] dark:text-[#F0EAE1] focus-visible:outline-[#746659]',
    outline:
      'border border-[#D8CCC0] dark:border-[#3F3730] text-[#28211A] dark:text-[#F0EAE1] hover:bg-[#F7F2EC] dark:hover:bg-[#26201B] focus-visible:outline-[#B43B22]',
    ghost:
      'text-[#746659] dark:text-[#B3A596] hover:bg-[#F2ECE3] dark:hover:bg-[#2A241F] hover:text-[#28211A] dark:hover:text-[#F0EAE1]',
    danger:
      'bg-red-700 hover:bg-red-800 text-white focus-visible:outline-red-700',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
