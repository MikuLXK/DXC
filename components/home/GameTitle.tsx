
import React from 'react';
import { Activity } from 'lucide-react';

export const GameTitle: React.FC = () => {
  return (
    <div className="mb-16 md:mb-0 md:mr-auto flex flex-col items-start z-20 max-w-4xl relative">
        
        {/* Top Tagline */}
        <div className="bg-blue-600 text-white px-4 py-1 transform -skew-x-12 border-l-4 border-white mb-6 shadow-[5px_5px_0_rgba(0,0,0,0.5)] animate-in slide-in-from-left duration-700 delay-200">
            <p className="font-display tracking-[0.3em] text-sm md:text-lg transform skew-x-12 flex items-center gap-2">
                <Activity size={16} className="text-white"/>
                GUILD DATABASE // ORARIO
            </p>
        </div>

        {/* Main Title - DanMachi */}
        <h1 className="relative font-display font-black tracking-tighter text-white italic leading-none">
            <div className="flex flex-col gap-2">
                <span className="block text-5xl md:text-8xl transform -skew-x-6 text-stroke-black drop-shadow-[5px_5px_0_#2563eb] mb-2 animate-in slide-in-from-bottom duration-700 delay-300">
                    在地下城寻求邂逅
                </span>
                <span className="block text-4xl md:text-7xl transform -skew-x-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-300 drop-shadow-[5px_5px_0_#000] animate-in slide-in-from-bottom duration-700 delay-400">
                    是否搞错了什么
                </span>
            </div>
        </h1>
        
        {/* Subtitle / Footer of Title */}
        <div className="mt-8 flex flex-col items-start animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-4 mb-2">
                 <div className="h-1 w-20 bg-blue-500" />
                 <p className="text-zinc-300 font-bold tracking-widest text-sm md:text-base uppercase">
                    DanMachi: Familia Myth / Interactive Adventure
                 </p>
            </div>
        </div>
    </div>
  );
};
