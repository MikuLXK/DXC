
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface P5DropdownOption {
  label: string;
  value: string;
}

interface P5DropdownProps {
  options: P5DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const P5Dropdown: React.FC<P5DropdownProps> = ({ options, value, onChange, label, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold uppercase mb-1 text-zinc-500">{label}</label>
      )}
      
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border-b-2 border-black p-3 flex justify-between items-center group transition-all hover:bg-zinc-100 ${isOpen ? 'border-red-600 bg-red-50' : ''}`}
      >
        <span className="font-display uppercase text-xl text-black tracking-wide transform group-hover:translate-x-1 transition-transform">
          {selectedOption.label}
        </span>
        <ChevronDown 
          className={`text-black transition-transform duration-300 ${isOpen ? 'rotate-180 text-red-600' : ''}`} 
          size={20} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full z-50 mt-1">
          <div className="relative bg-black border-2 border-white shadow-[5px_5px_0_rgba(220,38,38,0.8)] max-h-60 overflow-y-auto custom-scrollbar transform origin-top animate-in fade-in slide-in-from-top-2 duration-200">
             {/* Decorative Stripe */}
             <div className="absolute top-0 left-0 w-1 h-full bg-red-600 z-10" />
             
             {options.map((option) => (
               <button
                 key={option.value}
                 onClick={() => {
                   onChange(option.value);
                   setIsOpen(false);
                 }}
                 className={`w-full text-left px-6 py-3 font-display uppercase tracking-wider text-lg relative z-20 border-b border-zinc-800 transition-all
                   ${option.value === value 
                     ? 'text-red-500 bg-zinc-900' 
                     : 'text-white hover:bg-white hover:text-black hover:pl-8'
                   }
                 `}
               >
                 {option.label}
               </button>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};
