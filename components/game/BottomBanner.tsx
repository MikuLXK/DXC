
import React from 'react';

interface BottomBannerProps {
  isHellMode?: boolean;
  announcements?: string[];
}

export const BottomBanner: React.FC<BottomBannerProps> = ({ isHellMode, announcements }) => {
  const overlayColor = isHellMode ? 'bg-red-600' : 'bg-blue-600';
  const accentText = isHellMode ? 'text-red-800' : 'text-blue-800';
  const baseAnnouncements = Array.isArray(announcements)
    ? announcements.filter((item) => typeof item === 'string' && item.trim().length > 0)
    : [];
  const displayItems = baseAnnouncements.length > 0
    ? baseAnnouncements.map((item) => `公会官方通告：${item}`)
    : ['公会官方通告：暂无最新公告'];
  const loopItems = displayItems.length > 1 ? [...displayItems, ...displayItems] : displayItems;

  return (
    <div className="w-full h-10 bg-black flex items-center relative overflow-hidden border-t-2 border-zinc-800 shrink-0 z-40">
        {/* Scrolling Ticker Animation */}
        <div className="absolute whitespace-nowrap animate-marquee flex items-center gap-8 text-zinc-600 font-display uppercase tracking-widest text-lg select-none opacity-50">
            {loopItems.map((item, idx) => (
                <React.Fragment key={`${item}-${idx}`}>
                    <span>{item}</span>
                    {idx < loopItems.length - 1 && <span className={accentText}>///</span>}
                </React.Fragment>
            ))}
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
