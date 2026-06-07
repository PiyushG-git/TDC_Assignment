import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({ children, variant = 'primary', size = 'md', className = '', isLoading = false, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-full";

  const variants = {
    primary: "text-white focus:ring-brand-green",
    secondary: "border-2 border-brand-gold text-brand-gold hover:bg-brand-gold/10 focus:ring-brand-gold",
    outline: "border-2 border-brand-green text-brand-green hover:bg-brand-green/10 focus:ring-brand-green",
    ghost: "hover:bg-brand-cream text-slate-700",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
  };

  const primaryStyle = variant === 'primary' ? {
    background: 'linear-gradient(145deg, #244c3c, #1b3a2f)',
    boxShadow: '0px 1px 1px 0px rgba(37,37,39,0.15), inset 0px 1px 2px 2px #386058'
  } : {};

  const sizes = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-5 py-2 text-sm",
    lg: "px-7 py-3 text-base"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={primaryStyle}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};
