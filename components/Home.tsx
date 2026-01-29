
import React, { useEffect, useState, useRef } from 'react';
import { Sword, Zap } from 'lucide-react';
import { GameState, SaveSlot } from '../types';
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
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);
  const [autoSlots, setAutoSlots] = useState<SaveSlot[]>([]);
  
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

  const loadSaveSlots = () => {
    const manual: SaveSlot[] = [];
    for (let i = 1; i <= 3; i++) {
        const raw = localStorage.getItem(`danmachi_save_manual_${i}`);
        if (!raw) continue;
        try {
            const data = JSON.parse(raw);
            manual.push({ id: i, type: 'MANUAL', timestamp: data.timestamp, summary: data.summary, data: data.data });
        } catch {}
    }
    setSaveSlots(manual);

    const auto: SaveSlot[] = [];
    for (let i = 1; i <= 3; i++) {
        const raw = localStorage.getItem(`danmachi_save_auto_${i}`);
        if (!raw) continue;
        try {
            const data = JSON.parse(raw);
            auto.push({ id: `auto_${i}`, type: 'AUTO', timestamp: data.timestamp, summary: data.summary, data: data.data });
        } catch {}
    }
    auto.sort((a, b) => b.timestamp - a.timestamp);
    setAutoSlots(auto);
  };

  const handleLoadGame = (slotId: number | string) => {
    const isAuto = String(slotId).startsWith('auto');
    const targetKey = isAuto ? `danmachi_save_${slotId}` : `danmachi_save_manual_${slotId}`;
    const savedData = localStorage.getItem(targetKey);
    if (!savedData) {
        alert("未找到该存档。");
        return;
    }
    try {
        const parsedData = JSON.parse(savedData);
        const stateToLoad = parsedData.data ? parsedData.data : parsedData;
        setIsLoadModalOpen(false);
        onStart(stateToLoad);
    } catch (e) {
        alert("存档损坏 / Save Data Corrupted");
    }
  };

  const handleOpenLoadModal = () => {
    loadSaveSlots();
    setIsLoadModalOpen(true);
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
            onLoadGame={handleOpenLoadModal}
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

      {isLoadModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="w-full max-w-2xl bg-zinc-100 border-4 border-black shadow-2xl">
            <div className="flex items-center justify-between bg-black text-white px-6 py-4">
              <div className="text-lg font-display uppercase tracking-widest">选择存档</div>
              <button onClick={() => setIsLoadModalOpen(false)} className="text-white hover:text-red-400">关闭</button>
            </div>
            <div className="p-6 space-y-6 text-black">
              <div>
                <div className="text-xs font-bold uppercase text-zinc-500 border-b border-zinc-300 pb-2 mb-3">自动存档</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {autoSlots.length > 0 ? autoSlots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => handleLoadGame(slot.id)}
                      className="bg-white border-2 border-zinc-300 hover:border-black p-3 text-left"
                    >
                      <div className="text-xs font-bold text-black">AUTO #{String(slot.id).replace('auto_', '')}</div>
                      <div className="text-[10px] text-zinc-500">{new Date(slot.timestamp).toLocaleString()}</div>
                      <div className="text-[11px] text-zinc-700 mt-1 truncate">{slot.summary || '无摘要'}</div>
                    </button>
                  )) : (
                    <div className="text-xs text-zinc-400 italic">暂无自动存档</div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-zinc-500 border-b border-zinc-300 pb-2 mb-3">手动存档</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[1, 2, 3].map(id => {
                    const slot = saveSlots.find(s => s.id === id);
                    return (
                      <button
                        key={id}
                        disabled={!slot}
                        onClick={() => slot && handleLoadGame(id)}
                        className={`border-2 p-3 text-left ${slot ? 'bg-white border-zinc-300 hover:border-black' : 'bg-zinc-200 border-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                      >
                        <div className="text-xs font-bold text-black">SLOT {id}</div>
                        {slot ? (
                          <>
                            <div className="text-[10px] text-zinc-500">{new Date(slot.timestamp).toLocaleString()}</div>
                            <div className="text-[11px] text-zinc-700 mt-1 truncate">{slot.summary || '无摘要'}</div>
                          </>
                        ) : (
                          <div className="text-[10px] italic">空存档</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

