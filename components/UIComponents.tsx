import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string, noPadding?: boolean }> = ({ children, className = '', noPadding = false }) => (
  <div className={`bg-card border border-border overflow-hidden ${noPadding ? '' : 'p-6'} ${className} rounded-none`}>
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed border rounded-none tracking-wide";
  
  const variants = {
    primary: "bg-white text-black border-white hover:bg-transparent hover:text-white",
    secondary: "bg-[#1a1a1a] text-white border-[#1a1a1a] hover:bg-[#333] hover:border-[#333]",
    outline: "bg-transparent text-white border-white/40 hover:border-white hover:bg-white/5",
    ghost: "bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-[#1a1a1a]"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode, color?: 'red' | 'green' | 'blue' | 'yellow' | 'gray' | 'purple' }> = ({ children, color = 'gray' }) => {
  // Converted to monochrome/high-contrast outlines for tech look
  const colors = {
    red: 'bg-transparent text-red-500 border-red-500',
    green: 'bg-transparent text-emerald-500 border-emerald-500',
    blue: 'bg-transparent text-blue-500 border-blue-500',
    yellow: 'bg-transparent text-yellow-500 border-yellow-500',
    gray: 'bg-transparent text-gray-400 border-gray-600',
    purple: 'bg-transparent text-violet-500 border-violet-500',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${colors[color]} rounded-none uppercase tracking-wider`}>
      {children}
    </span>
  );
};

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={`relative ${sizes[size]}`}>
      <div className="absolute inset-0 border-2 border-gray-800"></div>
      <div className="absolute inset-0 border-2 border-white border-t-transparent animate-spin"></div>
    </div>
  );
};