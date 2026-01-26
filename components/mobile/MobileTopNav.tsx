import React, { useState } from 'react';
import { Clock, MapPin, Grid, CloudRain, Layers, Sun, Calendar, Maximize2, Minimize2 } from 'lucide-react';
import { GeoPoint } from '../../types';

interface MobileTopNavProps {
    time: string;
    location: string;
    weather: string;
    floor: number;
    coords?: GeoPoint;
    isHellMode?: boolean;
}

export const MobileTopNav: React.FC<MobileTopNavProps> = ({ time, location, weather, floor, coords, isHellMode }) => {
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

    // Parse time string "第X日 HH:MM"
    let dayStr = "DAY 1";
    let timeStr = "00:00";
    let fullDateStr = "1000-01-01";
    
    const match = time.match(/第(\d+)日\s+(\d{2}:\d{2})/);
    if (match) {
        dayStr = `DAY ${match[1]}`;
        timeStr = match[2];
        const start = new Date("1000-01-01");
        start.setDate(start.getDate() + (parseInt(match[1]) - 1));
        fullDateStr = start.toISOString().split('T')[0];
    } else {
        if(time.includes(' ')) {
            const p = time.split(' ');
            dayStr = p[0];
            timeStr = p[1];
        }
    }

    const coordsString = coords ? `X:${Math.round(coords.x)} Y:${Math.round(coords.y)}` : "X:0 Y:0";

    // Theme Constants
    const borderColor = isHellMode ? 'border-red-600' : 'border-blue-600';
    const textColor = isHellMode ? 'text-red-600' : 'text-blue-600';
    const iconColor = isHellMode ? 'text-red-600' : 'text-blue-600';
    const accentBg = isHellMode ? 'bg-red-600' : 'bg-blue-600';

    return (
        <div className="h-14 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-3 shrink-0 z-50 overflow-hidden relative">
             {/* Decorative Top Border */}
            <div className={`absolute top-0 left-0 w-full h-[2px] ${accentBg} opacity-50`} />

            {/* Left: Time & Date */}
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                     <span className={`text-xs font-display font-bold ${textColor}`}>{dayStr}</span>
                     <span className="text-[10px] font-mono text-zinc-500">{fullDateStr}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock size={10} className="text-zinc-400" />
                    <span className="text-sm font-display tracking-widest text-white leading-none">{timeStr}</span>
                </div>
            </div>

            {/* Center: Location */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="flex items-center gap-1">
                    <MapPin size={10} className={iconColor} />
                    <span className={`text-sm font-display font-bold uppercase tracking-wide text-white truncate max-w-[120px]`}>
                        {location}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500">
                    <span>{coordsString}</span>
                    <span className="text-zinc-700">|</span>
                    <span>{floor > 0 ? `B${floor}F` : 'SURFACE'}</span>
                </div>
            </div>

            {/* Right: Weather & Fullscreen */}
            <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded bg-zinc-900 border ${borderColor}`}>
                    {weather.includes('雨') ? <CloudRain size={16} className="text-white" /> : <Sun size={16} className="text-white" />}
                </div>
                <button 
                    onClick={toggleFullscreen}
                    className="p-1.5 text-zinc-400 hover:text-white"
                >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            </div>
        </div>
    );
};
