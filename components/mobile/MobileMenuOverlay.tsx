
import React from 'react';
import { X, Users, ClipboardList, Zap, Settings, Smartphone, Globe, Shield, BookOpen, Scroll, Flag, Gem, Brain, Radar, Swords, Archive, HardDrive } from 'lucide-react';

interface MobileMenuOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    hasPhone?: boolean;
    actions: {
        onOpenSettings: () => void;
        onOpenEquipment: () => void;
        onOpenSocial: () => void;
        onOpenTasks: () => void;
        onOpenSkills: () => void;
        onOpenPhone: () => void;
        onOpenWorld: () => void;
        onOpenFamilia: () => void;
        onOpenStory: () => void;
        onOpenContract: () => void;
        onOpenLoot: () => void;
        onOpenLootVault: () => void;
        onOpenSaveManager: () => void;
        onOpenMemory: () => void;
        onOpenPresent: () => void;
        onOpenParty: () => void;
    };
}

export const MobileMenuOverlay: React.FC<MobileMenuOverlayProps> = ({ isOpen, onClose, actions, hasPhone = true }) => {
    if (!isOpen) return null;

    const menuItems = [
        // Removed Inventory (Briefcase) and Map (Navigation) as they are in bottom bar
        { label: "装备", icon: <Shield />, action: actions.onOpenEquipment, color: "bg-orange-900/80 border-orange-700" },
        { label: "技能", icon: <Zap />, action: actions.onOpenSkills, color: "bg-yellow-800/80 border-yellow-600" },
        { label: "战利品仓库", icon: <Archive />, action: actions.onOpenLootVault, color: "bg-amber-800/80 border-amber-600" },
        { label: "公共战利品", icon: <Gem />, action: actions.onOpenLoot, color: "bg-amber-900/80 border-amber-700" },
        
        { label: "队伍", icon: <Swords />, action: actions.onOpenParty, color: "bg-indigo-900/80 border-indigo-700" },
        { label: "社交", icon: <Users />, action: actions.onOpenSocial, color: "bg-pink-900/80 border-pink-700" },
        { label: "手机", icon: <Smartphone />, action: actions.onOpenPhone, color: "bg-blue-900/80 border-blue-700", disabled: !hasPhone },
        { label: "眷族", icon: <Flag />, action: actions.onOpenFamilia, color: "bg-blue-800/80 border-blue-600" },

        { label: "任务", icon: <ClipboardList />, action: actions.onOpenTasks, color: "bg-purple-900/80 border-purple-700" },
        { label: "存档", icon: <HardDrive />, action: actions.onOpenSaveManager, color: "bg-slate-900/80 border-slate-700" },
        { label: "剧情", icon: <BookOpen />, action: actions.onOpenStory, color: "bg-green-900/80 border-green-700" },
        { label: "契约", icon: <Scroll />, action: actions.onOpenContract, color: "bg-red-900/80 border-red-700" },
        // Removed Map

        { label: "周围", icon: <Radar />, action: actions.onOpenPresent, color: "bg-zinc-800 border-zinc-600" },
        { label: "世界", icon: <Globe />, action: actions.onOpenWorld, color: "bg-cyan-900/80 border-cyan-700" },
        { label: "记忆", icon: <Brain />, action: actions.onOpenMemory, color: "bg-fuchsia-900/80 border-fuchsia-700" },
        { label: "系统", icon: <Settings />, action: actions.onOpenSettings, color: "bg-black border-2 border-white" },
    ];

    return (
        <div className="absolute inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-200">
            {/* Backdrop with heavy blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
            
            {/* Menu Sheet */}
            <div className="relative bg-zinc-950 rounded-t-[2rem] border-t-2 border-zinc-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-24 duration-300 ease-out">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-blue-600 skew-x-[-12deg]" />
                        <span className="text-lg font-display uppercase tracking-widest text-white">System Menu</span>
                    </div>
                    <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white border border-zinc-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto p-6 pb-24 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                    <div className="grid grid-cols-3 gap-4 md:gap-6">
                        {menuItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (item.disabled) return;
                                    item.action();
                                    onClose();
                                }}
                                className={`aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl shadow-lg border active:scale-95 transition-all group ${item.color} ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                <div className="text-white opacity-80 group-hover:scale-110 transition-transform group-hover:opacity-100">{item.icon}</div>
                                <span className="text-[10px] font-bold uppercase text-white tracking-wide shadow-black drop-shadow-md">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Drag Handle Decor */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-zinc-700 rounded-full opacity-30" />
            </div>
        </div>
    );
};
