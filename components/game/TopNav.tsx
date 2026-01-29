
import React, { useState } from 'react';
import { Clock, MapPin, Grid, CloudRain, Layers, Sun, Calendar, Maximize2, Minimize2 } from 'lucide-react';
import { GeoPoint } from '../../types';

interface TopNavProps {
  time: string;
  location: string;
  locationHierarchy?: { macro?: string; mid?: string; small?: string };
  floor: number;
  weather: string;
  coords: GeoPoint;
  isHellMode?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({ time, location, locationHierarchy, floor, weather, coords, isHellMode }) => {
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
  let fullDateStr = "1000-01-01"; // Fallback
  
  // Regex to extract Day number and Time
  const match = time.match(/第(\d+)日\s+(\d{2}:\d{2})/);
  if (match) {
      dayStr = `DAY ${match[1]}`;
      timeStr = match[2];
      
      // Fake Date Calculation: Start 1000-01-01 + (Day-1)
      const start = new Date("1000-01-01");
      start.setDate(start.getDate() + (parseInt(match[1]) - 1));
      fullDateStr = start.toISOString().split('T')[0];
  } else {
      // Handle legacy format if any
      if(time.includes(' ')) {
        const p = time.split(' ');
        dayStr = p[0];
        timeStr = p[1];
      }
  }

  const coordsString = `X:${Math.round(coords.x)} Y:${Math.round(coords.y)}`;
  const locationPath = [locationHierarchy?.macro, locationHierarchy?.mid, locationHierarchy?.small].filter(Boolean).join(' > ');
  const mainLocation = locationHierarchy?.small || locationHierarchy?.mid || locationHierarchy?.macro || location;

  // Theme Constants
  const borderColor = isHellMode ? 'border-red-600' : 'border-blue-600';
  const textColor = isHellMode ? 'text-red-600' : 'text-blue-600';
  const textStrokeClass = isHellMode ? 'text-stroke-red' : 'text-stroke-blue';
  const iconColor = isHellMode ? 'text-red-600' : 'text-blue-600';
  const accentBg = isHellMode ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className="w-full h-20 relative z-50 shrink-0 pointer-events-none">
        
        {/* Background slanted bar */}
        <div className={`absolute top-0 left-0 w-[110%] h-full bg-black -skew-x-12 -translate-x-4 border-b-4 ${borderColor} shadow-lg overflow-hidden`}>
             <div className="absolute inset-0 bg-stripes opacity-20" />
        </div>

        {/* Content Container - Unskew text */}
        <div className="relative w-full h-full flex items-center justify-between px-8 text-white pointer-events-auto">
            
            {/* Left: Date/Time (Enhanced) */}
            <div className={`flex items-center gap-4 transform -skew-x-12 bg-zinc-100 text-black px-6 py-2 border-l-8 ${borderColor} shadow-[4px_4px_0_rgba(0,0,0,0.5)]`}>
                <div className="flex flex-col items-center leading-none transform skew-x-12">
                    <span className="text-2xl font-display font-bold">{dayStr}</span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-black text-white px-2 py-0.5 mt-0.5 flex items-center gap-1">
                        <Calendar size={8} /> {fullDateStr}
                    </span>
                </div>
                <div className="w-px h-8 bg-zinc-300 transform skew-x-12 mx-2" />
                <div className="flex items-center gap-2 transform skew-x-12">
                    <Clock size={20} className={iconColor} />
                    <span className="text-xl font-display uppercase tracking-wide">{timeStr}</span>
                </div>
            </div>

            {/* Center: Location */}
            <div className="flex flex-col items-center justify-center drop-shadow-md">
                 <div className={`flex items-center gap-2 ${textColor} mb-1`}>
                     <MapPin size={24} className="animate-bounce" />
                     <span className={`text-3xl font-display uppercase italic tracking-wider text-white ${textStrokeClass}`}>{mainLocation}</span>
                 </div>
                 <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 bg-black/80 px-3 py-1 rounded-sm border border-zinc-700">
                    <span className="flex items-center gap-1"><Grid size={12}/> {coordsString}</span>
                    <span className={textColor}>|</span>
                    <span className="flex items-center gap-1 text-white"><Layers size={12}/> {floor > 0 ? `B${floor}F` : 'SURFACE'}</span>
                 </div>
                 {locationPath && (
                     <div className="mt-1 text-[10px] font-mono text-zinc-500 bg-black/60 px-2 py-0.5 border border-zinc-800">
                         {locationPath}
                     </div>
                 )}
            </div>

            {/* Right: Weather & Fullscreen */}
            <div className="flex items-center gap-4">
                <div className={`flex items-center gap-3 transform -skew-x-12 bg-zinc-900 px-6 py-2 border-r-8 ${borderColor} shadow-[-4px_4px_0_rgba(255,255,255,0.2)]`}>
                    <div className="transform skew-x-12 text-right">
                        <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Weather</div>
                        <div className="text-xl font-display uppercase text-white">{weather}</div>
                    </div>
                    <div className={`${accentBg} p-2 rounded-full transform skew-x-12 rotate-12 shadow-lg`}>
                        {weather.includes('雨') ? <CloudRain size={24} className="text-white" /> : <Sun size={24} className="text-white" />}
                    </div>
                </div>
                
                <button 
                    onClick={toggleFullscreen}
                    className="p-2 bg-zinc-900 border-2 border-zinc-700 text-zinc-400 hover:text-white hover:border-white transition-all rounded shadow-lg"
                    title="Toggle Fullscreen"
                >
                    {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                </button>
            </div>

        </div>
    </div>
  );
};
