
import React from 'react';

export const BottomBanner: React.FC<{ isHellMode?: boolean }> = ({ isHellMode }) => {
  const overlayColor = isHellMode ? 'bg-red-600' : 'bg-blue-600';
  const accentText = isHellMode ? 'text-red-800' : 'text-blue-800';

  return (
    <div className="w-full h-10 bg-black flex items-center relative overflow-hidden border-t-2 border-zinc-800 shrink-0 z-40">
        {/* Scrolling Ticker Animation */}
        <div className="absolute whitespace-nowrap animate-marquee flex items-center gap-8 text-zinc-600 font-display uppercase tracking-widest text-lg select-none opacity-50">
            <span>Welcome to Orario / 欢迎来到欧拉丽</span>
            <span className={accentText}>///</span>
            <span>Guild Registry System v4.0</span>
            <span className={accentText}>///</span>
            <span>Dungeon Warning: Floor 1-5 Safe for Beginners</span>
            <span className={accentText}>///</span>
            <span>Familia Myth</span>
            <span className={accentText}>///</span>
            <span>Update Status: Falna Synced</span>
            <span className={accentText}>///</span>
            <span>Is It Wrong to Try to Pick Up Girls in a Dungeon?</span>
            <span className={accentText}>///</span>
            <span>冒险者公会公告：今日地下城入口拥堵</span>
            <span className={accentText}>///</span>
            <span>Take Your Heart (Legacy Protocol)</span>
        </div>
        
        {/* Style injection for marquee */}
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
        `}</style>
        
        {/* Decorative Overlay */}
        <div className={`absolute top-0 right-0 w-32 h-full ${overlayColor} transform skew-x-[-20deg] translate-x-10`}></div>
    </div>
  );
};
