
import React, { useState, useRef, useEffect } from 'react';
import { Target, Plus, Minus, Layers, Eye, EyeOff, Map as MapIcon, Info, X, ChevronDown } from 'lucide-react';
import { WorldMapData, GeoPoint, Confidant } from '../../types';

interface MobileMapViewProps {
  worldMap: WorldMapData;
  currentPos: GeoPoint;
  playerName: string;
  confidants: Confidant[];
  floor: number;
}

export const MobileMapView: React.FC<MobileMapViewProps> = ({ 
  worldMap,
  currentPos,
  playerName,
  confidants,
  floor
}) => {
  // Zoom & Pan State
  const [scale, setScale] = useState(0.5); // Default closer zoom for mobile
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // UI State
  const [showLayers, setShowLayers] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showFloorSelect, setShowFloorSelect] = useState(false);
  const [viewingFloor, setViewingFloor] = useState(floor);
  
  // Layers State
  const [showTerritories, setShowTerritories] = useState(true);
  const [showNPCs, setShowNPCs] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initial Data (Fallback if undefined)
  const mapData = worldMap || { 
      config: { width: 50000, height: 50000 },
      factions: [], territories: [], terrain: [], routes: [], surfaceLocations: [], dungeonStructure: [] 
  };

  // Initial Center & Sync with Prop Updates
  useEffect(() => {
      setViewingFloor(floor);
      setTimeout(() => centerOnPlayer(), 100);
  }, [currentPos, floor]); 

  // --- Zoom Logic (Visual Center) ---
  const applyZoom = (deltaScale: number) => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      
      const newScale = Math.min(Math.max(0.05, scale + deltaScale), 3.0);
      if (Math.abs(newScale - scale) < 0.0001) return;

      const cx = clientWidth / 2;
      const cy = clientHeight / 2;

      const mapX = (cx - offset.x) / scale;
      const mapY = (cy - offset.y) / scale;

      const newOffsetX = cx - (mapX * newScale);
      const newOffsetY = cy - (mapY * newScale);

      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const centerOnPlayer = () => {
      if (containerRef.current) {
          const { clientWidth, clientHeight } = containerRef.current;
          // Target scale for mobile needs to be smaller to see context, or 0.5 for detail
          const targetScale = 0.5; 
          setOffset({
              x: -currentPos.x * targetScale + clientWidth / 2,
              y: -currentPos.y * targetScale + clientHeight / 2
          });
          setScale(targetScale);
          setViewingFloor(floor);
      }
  };

  // --- Touch Pan Logic ---
  const handleTouchStart = (e: React.TouchEvent) => {
      if(e.touches.length === 1) {
          setIsDragging(true);
          setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
          setOffset({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
      }
  };

  // FIX: Using Chinese keys from GameState
  const visibleEntities = confidants.filter(c => (c.是否在场 || c.特别关注 || c.是否队友) && c.坐标);

  return (
    <div className="w-full h-full relative bg-[#050a14] overflow-hidden flex flex-col font-sans">
        
        {/* Map Canvas */}
        <div 
            ref={containerRef}
            className="flex-1 w-full h-full touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDragging(false)}
        >
            <svg 
                viewBox={`0 0 ${mapData.config.width} ${mapData.config.height}`} 
                className="origin-top-left will-change-transform"
                style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                    width: `${mapData.config.width}px`,
                    height: `${mapData.config.height}px`
                }}
            >
                {/* 0. Background Grid */}
                <rect x="0" y="0" width={mapData.config.width} height={mapData.config.height} fill="#020408" />
                
                {/* 1. Territories */}
                {showTerritories && mapData.territories.filter(t => (t.floor || 0) === viewingFloor).map(t => (
                    <path
                        key={t.id}
                        d={t.boundary}
                        fill={t.color}
                        fillOpacity={t.opacity || 0.2}
                        stroke={t.color}
                        strokeWidth="10" 
                        strokeDasharray="100,50"
                    />
                ))}

                {/* 2. Terrain */}
                {mapData.terrain.filter(f => (f.floor || 0) === viewingFloor).map(feat => (
                    <path
                        key={feat.id}
                        d={feat.path}
                        fill={feat.color}
                        stroke={feat.strokeColor || 'none'}
                        strokeWidth={feat.strokeWidth ? Math.min(feat.strokeWidth, 20) : 0}
                    />
                ))}

                {/* 4. Locations */}
                {mapData.surfaceLocations.filter(l => (l.floor || 0) === viewingFloor).map(loc => (
                    <g key={loc.id}>
                        <circle 
                            cx={loc.coordinates.x} 
                            cy={loc.coordinates.y} 
                            r={loc.radius} 
                            fill={loc.type === 'GUILD' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(251, 191, 36, 0.05)'} 
                            stroke={loc.type === 'GUILD' ? '#3b82f6' : '#fbbf24'}
                            strokeWidth="5"
                        />
                        <circle cx={loc.coordinates.x} cy={loc.coordinates.y} r="50" fill="#000" stroke="#fff" strokeWidth="5" />
                    </g>
                ))}

                {/* 5. NPCs - Using Chinese Keys */}
                {showNPCs && visibleEntities.map(npc => npc.坐标 && (
                    <g key={npc.id} className="animate-float">
                        <rect 
                           x={npc.坐标.x - 30} 
                           y={npc.坐标.y - 30} 
                           width="60" height="60" 
                           fill={npc.是否队友 ? '#9333ea' : '#ec4899'} 
                           stroke="white" strokeWidth="5" 
                           transform={`rotate(45 ${npc.坐标.x} ${npc.坐标.y})`}
                       />
                    </g>
                ))}

                {/* 6. Player - Only show if on same floor */}
                {viewingFloor === floor && ( 
                    <g className="animate-pulse" style={{ transform: `translate(${currentPos.x}px, ${currentPos.y}px)` }}>
                        <circle r="60" fill="#22c55e" stroke="#fff" strokeWidth="10" />
                        <circle r="150" fill="none" stroke="#22c55e" strokeWidth="5" strokeDasharray="30,10" className="animate-spin-slow" />
                    </g>
                )}
            </svg>
        </div>

        {/* --- UI Overlays --- */}

        {/* Floor Selection (Top Center) */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20">
            <button 
                onClick={() => setShowFloorSelect(!showFloorSelect)}
                className="bg-black/80 backdrop-blur-sm border border-blue-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg"
            >
                {viewingFloor === 0 ? "地表区域" : `地下 ${viewingFloor} 层`}
                <ChevronDown size={12} />
            </button>
            {showFloorSelect && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-40 bg-zinc-900 border border-zinc-700 rounded shadow-xl max-h-60 overflow-y-auto custom-scrollbar flex flex-col">
                    <button onClick={() => { setViewingFloor(0); setShowFloorSelect(false); }} className="p-3 text-xs text-left text-white border-b border-zinc-800 hover:bg-blue-900">
                        地表 (欧拉丽)
                    </button>
                    {Array.from({length: 37}, (_, i) => i + 1).map(f => (
                        <button 
                            key={f} 
                            onClick={() => { setViewingFloor(f); setShowFloorSelect(false); }}
                            className={`p-3 text-xs text-left border-b border-zinc-800 hover:bg-zinc-800 ${f === floor ? 'text-green-500 font-bold' : 'text-zinc-400'}`}
                        >
                            地下 {f} 层 {f === floor ? '(当前)' : ''}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Coordinates Pill */}
        <div className="absolute top-4 left-4 bg-black/80 px-3 py-1.5 rounded-full text-xs text-white border border-zinc-700 pointer-events-none flex items-center gap-2 backdrop-blur-sm shadow-lg z-10">
            <Target size={14} className="text-blue-500"/>
            <span className="font-mono">{Math.round(currentPos.x)}, {Math.round(currentPos.y)}</span>
        </div>

        {/* Right Controls Group */}
        <div className="absolute bottom-24 right-4 flex flex-col gap-3 z-20">
            {/* Layer Toggle */}
            <button 
                onClick={() => setShowLayers(!showLayers)}
                className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-lg transition-colors ${showLayers ? 'bg-blue-600 text-white border-blue-400' : 'bg-zinc-800 text-zinc-400 border-zinc-600'}`}
            >
                <Layers size={20} />
            </button>

            {/* Layer Menu (Popup) */}
            {showLayers && (
                <div className="absolute right-14 bottom-0 bg-black/90 border border-zinc-700 rounded-lg p-3 w-40 flex flex-col gap-2 shadow-xl animate-in slide-in-from-right-4 fade-in">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">图层控制</div>
                    <button onClick={() => setShowTerritories(!showTerritories)} className={`flex items-center gap-2 text-xs px-2 py-2 rounded border ${showTerritories ? 'bg-blue-900/30 text-blue-300 border-blue-800' : 'bg-transparent text-zinc-500 border-zinc-800'}`}>
                        {showTerritories ? <Eye size={12}/> : <EyeOff size={12}/>} <span>领地</span>
                    </button>
                    <button onClick={() => setShowNPCs(!showNPCs)} className={`flex items-center gap-2 text-xs px-2 py-2 rounded border ${showNPCs ? 'bg-blue-900/30 text-blue-300 border-blue-800' : 'bg-transparent text-zinc-500 border-zinc-800'}`}>
                        {showNPCs ? <Eye size={12}/> : <EyeOff size={12}/>} <span>人物</span>
                    </button>
                </div>
            )}

            <div className="h-px bg-zinc-700/50 my-1" />

            {/* Zoom Controls */}
            <button onClick={() => applyZoom(0.1)} className="w-12 h-12 bg-zinc-800/90 text-white rounded-full flex items-center justify-center border border-zinc-600 shadow-lg active:scale-95">
                <Plus size={24}/>
            </button>
            <button onClick={() => applyZoom(-0.1)} className="w-12 h-12 bg-zinc-800/90 text-white rounded-full flex items-center justify-center border border-zinc-600 shadow-lg active:scale-95">
                <Minus size={24}/>
            </button>
            <button onClick={centerOnPlayer} className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center border border-blue-400 shadow-lg active:scale-95">
                <Target size={24}/>
            </button>
        </div>

        {/* Legend Button (Bottom Left) */}
        <button 
            onClick={() => setShowLegend(!showLegend)}
            className={`absolute bottom-24 left-4 p-2 rounded-lg border flex items-center gap-2 shadow-lg backdrop-blur-sm transition-colors z-20 ${showLegend ? 'bg-white text-black border-white' : 'bg-black/60 text-zinc-300 border-zinc-600'}`}
        >
            <Info size={16} />
            <span className="text-xs font-bold uppercase">图例</span>
        </button>

        {/* Legend Sheet Overlay */}
        {showLegend && (
            <>
                <div className="absolute inset-0 bg-black/40 z-30 animate-in fade-in duration-200" onClick={() => setShowLegend(false)} />
                <div className="absolute bottom-0 left-0 w-full bg-zinc-900 border-t border-blue-600 p-4 pb-6 z-40 animate-in slide-in-from-bottom-full rounded-t-2xl shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-white font-display uppercase tracking-widest text-sm flex items-center gap-2">
                            <Info size={16} className="text-blue-500" />
                            势力 & 地标
                        </h4>
                        <button onClick={() => setShowLegend(false)} className="bg-zinc-800 p-1.5 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors">
                            <X size={16}/>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar">
                        {mapData.factions.map(f => (
                            <div key={f.id} className="flex items-center gap-3 bg-black/50 p-2.5 rounded border border-zinc-800/50">
                                <div className="w-3 h-3 rounded-full border shadow-[0_0_5px_currentColor]" style={{ backgroundColor: f.color, borderColor: f.borderColor, color: f.color }} />
                                <span className="text-xs text-zinc-300 font-bold truncate">{f.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}
    </div>
  );
};
