import React from 'react';

interface P5ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'red' | 'black' | 'white';
  icon?: React.ReactNode;
  label: string;
  animate?: boolean;
}

export const P5Button: React.FC<P5ButtonProps> = ({ 
  variant = 'blue', 
  icon, 
  label, 
  className = '', 
  animate = false,
  ...props 
}) => {
  // Styles inspired by P5 Battle Menu but shifting to Danmachi Blue
  const baseStyles = "group relative px-10 py-4 font-display uppercase tracking-[0.15em] text-2xl transform transition-all duration-300 ease-out clip-trapezoid hover:-translate-y-1 hover:scale-105 active:scale-95 overflow-hidden";
  
  const variants = {
    blue: "bg-blue-600 text-white hover:bg-blue-500",
    red: "bg-red-600 text-white hover:bg-red-500", // Kept for legacy compatibility
    black: "bg-black text-white hover:bg-zinc-900 border-2 border-zinc-800",
    white: "bg-slate-100 text-black hover:bg-white border-2 border-black"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 bg-stripes opacity-10 group-hover:opacity-20 transition-opacity" />
      
      {/* Slanted Highlight */}
      <div className="absolute top-0 -left-full w-full h-full bg-white/30 transform -skew-x-12 group-hover:left-full transition-all duration-500 ease-in-out" />

      <div className="relative z-10 flex items-center justify-center gap-3 transform -skew-x-6 group-hover:skew-x-0 transition-transform">
        {icon && <span className="text-2xl group-hover:rotate-12 transition-transform">{icon}</span>}
        <span className="drop-shadow-md">{label}</span>
      </div>
      
      {/* Glitch Overlay */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:animate-glitch group-hover:opacity-10 mix-blend-overlay pointer-events-none" />
    </button>
  );
};