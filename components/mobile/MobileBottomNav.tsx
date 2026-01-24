
import React from 'react';
import { MessageSquare, User, Briefcase, Map, Menu } from 'lucide-react';

interface MobileBottomNavProps {
    onTabSelect: (tab: 'CHAT' | 'CHAR' | 'INV' | 'MAP' | 'MENU') => void;
    activeTab: 'CHAT' | 'CHAR' | 'INV' | 'MAP' | 'MENU';
    isHellMode?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onTabSelect, activeTab, isHellMode }) => {
    
    const activeColor = isHellMode ? 'text-red-500 bg-red-900/10' : 'text-blue-500 bg-blue-900/10';
    const indicatorColor = isHellMode ? 'bg-red-600 shadow-[0_0_10px_#dc2626]' : 'bg-blue-500 shadow-[0_0_10px_#3b82f6]';

    const NavItem = ({ id, icon, label }: { id: 'CHAT' | 'CHAR' | 'INV' | 'MAP' | 'MENU', icon: React.ReactNode, label: string }) => {
        const isActive = activeTab === id;
        return (
            <button 
                onClick={() => onTabSelect(id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 relative overflow-hidden
                    ${isActive ? activeColor : 'text-zinc-500 bg-black hover:text-zinc-300'}
                `}
            >
                {isActive && (
                    <div className={`absolute top-0 left-0 w-full h-0.5 ${indicatorColor}`} />
                )}
                <div className={`mb-0.5 transition-transform ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                    {icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </button>
        );
    };

    return (
        <div className="h-16 bg-black border-t border-zinc-800 flex items-stretch shrink-0 z-50 pb-safe">
            <NavItem id="CHAT" icon={<MessageSquare size={20} />} label="对话" />
            <NavItem id="CHAR" icon={<User size={20} />} label="状态" />
            <NavItem id="INV" icon={<Briefcase size={20} />} label="背包" />
            <NavItem id="MAP" icon={<Map size={20} />} label="地图" />
            <NavItem id="MENU" icon={<Menu size={20} />} label="菜单" />
        </div>
    );
};
