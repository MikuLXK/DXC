
import React, { useState } from 'react';
import { Clock, Maximize2, Minimize2, MapPin } from 'lucide-react';

interface MobileTopNavProps {
    time: string;
    location: string;
    weather: string;
    floor: number;
    isHellMode?: boolean;
}

export const MobileTopNav: React.FC<MobileTopNavProps> = ({ time, location, weather, floor, isHellMode }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => {
                console.log(`Error attempting to enable fullscreen: ${e.message}`);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Extract basic time (e.g., "07:00")
    const simpleTime = time.includes(' ') ? time.split(' ')[1] : time;
    const accentColor = isHellMode ? 'text-red-600' : 'text-blue-500';

    return (
        <div className="h-12 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 z-50">
            {/* Left: Location & Floor */}
            <div className="flex flex-col">
                <div className={`flex items-center gap-1 ${accentColor} font-display uppercase leading-none`}>
                    <MapPin size={12} />
                    <span className="text-sm tracking-wide truncate max-w-[150px]">{location}</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono leading-none mt-0.5">
                    {floor > 0 ? `B${floor}F` : 'Surface'} | {weather}
                </div>
            </div>

            {/* Right: Time & Fullscreen */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded border border-zinc-700">
                    <Clock size={12} className="text-zinc-400" />
                    <span className="text-xs font-mono font-bold text-white">{simpleTime}</span>
                </div>
                <button 
                    onClick={toggleFullscreen}
                    className="p-1.5 bg-zinc-900 text-zinc-400 border border-zinc-700 rounded hover:text-white active:scale-95 transition-all"
                >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            </div>
        </div>
    );
};
