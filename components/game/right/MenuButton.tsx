
import React from 'react';

interface MenuButtonProps {
    icon: React.ReactNode;
    label: string;
    delay: number;
    colorClass: string;
    hoverColorClass: string;
    onClick: () => void;
    disabled?: boolean;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ icon, label, delay, colorClass, hoverColorClass, onClick, disabled }) => (
    <button 
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`w-full group relative h-14 lg:h-14 shrink-0 overflow-hidden transition-all duration-200 hover:z-10 mb-2 border-2 border-black shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed`}
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Background */}
        <div 
            className={`absolute inset-0 ${colorClass} transition-all duration-300 group-hover:scale-105 ${hoverColorClass}`}
        >
             {/* Stripes texture */}
             <div className="absolute inset-0 bg-stripes opacity-10" />
        </div>

        {/* Slanted Highlight Overlay */}
        <div className="absolute -left-10 top-0 bottom-0 w-20 bg-white/20 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

        {/* Content */}
        <div className="relative h-full flex items-center px-4 justify-start gap-4 z-10 pointer-events-none">
            <div className="text-white transform group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                {icon}
            </div>
            <div className="flex flex-col items-start justify-center flex-1">
                <span className="text-lg lg:text-xl font-display text-white uppercase tracking-widest group-hover:text-black group-hover:tracking-[0.3em] transition-all duration-300 text-shadow leading-none">
                    {label}
                </span>
                <div className="h-0.5 w-0 bg-white group-hover:w-full transition-all duration-500 ease-out mt-1" />
            </div>
        </div>
    </button>
);
