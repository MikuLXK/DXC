
import React from 'react';

// Danmachi Rank Logic
export const getRankLetter = (val: number): string => {
    if (val >= 1000) return 'SS';
    if (val >= 900) return 'S';
    if (val >= 800) return 'A';
    if (val >= 700) return 'B';
    if (val >= 600) return 'C';
    if (val >= 500) return 'D';
    if (val >= 400) return 'E';
    if (val >= 300) return 'F';
    if (val >= 200) return 'G';
    if (val >= 100) return 'H';
    return 'I';
};

export const getRankColor = (rank: string): string => {
    if (['S', 'SS', 'SSS'].includes(rank)) return 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]';
    if (['A', 'B'].includes(rank)) return 'text-blue-500';
    if (['C', 'D', 'E'].includes(rank)) return 'text-green-400';
    return 'text-white';
};

export const VitalBar = ({ label, current, max, color, icon }: any) => (
    <div className="relative">
        <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-0.5 uppercase tracking-wider">
            <span className="flex items-center gap-1">{icon} {label}</span>
            <span className="font-mono text-white">{current}/{max}</span>
        </div>
        <div className="h-2 w-full bg-zinc-900 border border-zinc-700">
            <div 
                className={`h-full ${color} transition-all duration-500`}
                style={{ width: `${Math.min(100, Math.max(0, (current / max) * 100))}%` }}
            />
        </div>
    </div>
);

export const StatRow = ({ label, val }: { label: string, val: number }) => {
    const rank = getRankLetter(val);
    const colorClass = getRankColor(rank);
    return (
        <div className="flex justify-between items-center px-3 py-1.5 hover:bg-white/5 transition-colors group">
            <span className="text-zinc-400 text-xs font-bold tracking-wider group-hover:text-white transition-colors">{label}</span>
            <div className="flex items-baseline gap-3">
                <span className={`font-display text-xl font-bold ${colorClass} w-6 text-center`}>{rank}</span>
                <span className="font-mono text-zinc-500 text-sm w-8 text-right group-hover:text-zinc-300">{val}</span>
            </div>
        </div>
    );
};

// EquipRow Removed in favor of new Slot component in main file
