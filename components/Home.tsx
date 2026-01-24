
import React, { useEffect, useState, useRef } from 'react';
import { Sword, Zap } from 'lucide-react';
import { GameState } from '../types';
import { SettingsModal } from './game/modals/SettingsModal';
import { createNewGameState } from '../utils/dataMapper';
import { useAppSettings } from '../hooks/useAppSettings';

// Decoupled Components
import { HeroBackground } from './home/HeroBackground';
import { GameTitle } from './home/GameTitle';
import { MainMenu } from './home/MainMenu';

interface HomeProps {
  onStart: (savedState?: GameState) => void;
  onNewGame: () => void;
}

export const Home: React.FC<HomeProps> = ({ onStart, onNewGame }) => {
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Decoupled Settings Logic
  const { settings, saveSettings } = useAppSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  useEffect(() => {
      const timer = setTimeout(() => setLoaded(true), 100);
      return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
      if (containerRef.current) {
          const { clientWidth, clientHeight } = containerRef.current;
          const x = (e.clientX / clientWidth) - 0.5;
          const y = (e.clientY / clientHeight) - 0.5;
          setMousePos({ x, y });
      }
  };

  const handleLoadGame = (slotId?: number) => {
    let targetKey = '';
    if (slotId) {
        targetKey = `danmachi_save_manual_${slotId}`;
    } else {
        if (localStorage.getItem('danmachi_save_auto_1')) targetKey = 'danmachi_save_auto_1';
        else if (localStorage.getItem('danmachi_save_manual_1')) targetKey = 'danmachi_save_manual_1';
        else if (localStorage.getItem('phantom_seeds_save_1')) targetKey = 'phantom_seeds_save_1'; 
    }

    const savedData = localStorage.getItem(targetKey);
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            const stateToLoad = parsedData.data ? parsedData.data : parsedData;
            onStart(stateToLoad);
        } catch (e) {
            alert("存档损坏 / Save Data Corrupted");
        }
    } else {
        alert("无存档记录 / No Save Data Found");
    }
  };

  // Foreground transform for the content layer
  const fgStyle = {
      transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)`
  };

  return (
    <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-blue-600 selection:text-white"
    >
      
      {/* 1. Decoupled Background Component */}
      <HeroBackground 
          backgroundImage={settings.backgroundImage}
          mousePos={mousePos}
      />

      {/* 2. Main Content Layer */}
      <div 
        className={`relative z-10 w-full h-full flex flex-col md:flex-row items-center md:items-end justify-center md:justify-start p-8 md:p-20 transition-all duration-1000 ${loaded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={fgStyle}
      >
        {/* Title Section */}
        <GameTitle />

        {/* Menu Section */}
        <MainMenu 
            onNewGame={onNewGame}
            onLoadGame={() => handleLoadGame()}
            onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Decorative Floating Elements (Specific to Home layout) */}
        <div className="absolute top-10 right-10 z-10 hidden md:block opacity-30 animate-pulse delay-1000 pointer-events-none">
            <Sword size={150} className="text-white transform rotate-45" strokeWidth={1} />
        </div>
        
        <div className="absolute bottom-4 left-8 text-left z-20 animate-in fade-in duration-1000 delay-1000 pointer-events-none">
             <div className="flex items-center gap-2 text-blue-500 font-display text-xl animate-pulse">
                <Zap size={20} className="fill-current"/>
                <span>STATUS: NORMAL</span>
             </div>
             <p className="text-zinc-600 text-xs font-mono mt-1">ACCESSING PANTHEON ARCHIVES...</p>
        </div>
      </div>
      
      {/* 3. Settings Modal (Global) */}
      <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          avatarUrl=""
          onSaveSettings={saveSettings}
          onSaveGame={() => {}}
          onLoadGame={handleLoadGame}
          onUpdateAvatar={() => {}}
          onExitGame={() => setIsSettingsOpen(false)}
          gameState={createNewGameState("Preview", "Male", "Human")} // Mock state for preview
          onUpdateGameState={(newState) => onStart(newState)}
      />
    </div>
  );
};
