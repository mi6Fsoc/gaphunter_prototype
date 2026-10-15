import React from 'react';

export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  noPadding?: boolean;
  hoverEffect?: boolean;
}> = ({ 
  children, 
  className = '', 
  noPadding = false,
  hoverEffect = false,
}) => (
  <div 
    className={`bg-lumina-surface border border-lumina-border rounded-lg overflow-hidden transition-all duration-300 ${
      hoverEffect ? 'hover:border-lumina-orange/40 hover:shadow-[0_8px_30px_rgba(232,93,34,0.08)]' : ''
    } ${noPadding ? '' : 'p-6 sm:p-7'} ${className}`}
  >
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  ...props 
}) => {
  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base font-medium",
  };

  const baseStyles = "inline-flex items-center justify-center gap-2 font-sans font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lumina-orange/50 focus:ring-offset-2 focus:ring-offset-[#0D0D0E] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-lumina-orange text-white hover:bg-lumina-accent shadow-sm hover:shadow-[0_4px_20px_rgba(232,93,34,0.35)]",
    secondary: "bg-[#242426] text-white border border-[#333338] hover:bg-[#2C2C30] hover:border-[#44444C]",
    outline: "bg-transparent text-white border border-lumina-border hover:border-lumina-orange/60 hover:bg-lumina-orange/5",
    ghost: "bg-transparent text-lumina-muted hover:text-white hover:bg-lumina-surface",
    accent: "bg-white text-black hover:bg-gray-100 font-semibold shadow-sm",
  };

  return (
    <button className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Badge: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'orange' | 'red' | 'emerald' | 'amber' | 'slate' | 'blue';
  mono?: boolean;
}> = ({ 
  children, 
  variant = 'slate',
  mono = false 
}) => {
  const styles = {
    orange: 'bg-lumina-orange/10 text-lumina-orange border-lumina-orange/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/25',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    slate: 'bg-white/5 text-zinc-300 border-white/10',
    blue: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded-full ${styles[variant]} ${mono ? 'font-mono' : 'font-sans'}`}>
      {children}
    </span>
  );
};

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={`relative ${sizes[size]}`}>
      <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
      <div className="absolute inset-0 rounded-full border-2 border-lumina-orange border-t-transparent animate-spin"></div>
    </div>
  );
};