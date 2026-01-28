
import React from 'react';
import { Play, Lock, Settings, Github } from 'lucide-react';
import { P5Button } from '../ui/P5Button';

interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onLoadGame, onOpenSettings }) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-sm z-20 md:transform md:-skew-x-6 md:translate-y-10">
        
        <div className="w-full transform transition-all hover:scale-105 hover:-translate-x-4 duration-300 animate-in slide-in-from-right duration-700 delay-500">
            <P5Button 
                label="开始游戏" 
                variant="blue" 
                icon={<Play className="fill-current" />} 
                onClick={onNewGame}
                className="w-full shadow-[10px_10px_0_rgba(0,0,0,0.8)] border-white"
            />
        </div>
        
        <div className="w-full transform transition-all hover:scale-105 hover:translate-x-4 duration-300 animate-in slide-in-from-right duration-700 delay-600">
            <P5Button 
                label="继续冒险" 
                variant="black" 
                icon={<Lock />} 
                onClick={onLoadGame}
                className="w-full shadow-[10px_10px_0_rgba(255,255,255,0.2)]"
            />
        </div>

        <div className="w-full transform transition-all hover:scale-105 hover:-translate-x-4 duration-300 animate-in slide-in-from-right duration-700 delay-700">
            <P5Button 
                label="系统设置" 
                variant="white" 
                icon={<Settings className="animate-spin-slow" />} 
                onClick={onOpenSettings}
                className="w-full shadow-[10px_10px_0_rgba(37,99,235,0.5)]"
            />
        </div>

        <div className="w-full transform transition-all hover:scale-105 hover:translate-x-4 duration-300 animate-in slide-in-from-right duration-700 delay-800">
            <P5Button 
                label="GitHub" 
                variant="black" 
                icon={<Github />} 
                onClick={() => window.open('https://github.com/MikuLXK/DXC', '_blank', 'noopener,noreferrer')}
                className="w-full shadow-[10px_10px_0_rgba(255,255,255,0.1)]"
            />
        </div>
    </div>
  );
};
