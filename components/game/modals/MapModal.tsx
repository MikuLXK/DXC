
import React, { useState, useRef, useEffect } from 'react';
import { X, Map as MapIcon, Target, Plus, Minus, RotateCcw, Info, Layers, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { WorldMapData, GeoPoint, Confidant } from '../../../types';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldMap?: WorldMapData; 
  currentPos?: GeoPoint; 
  floor?: number;
  location?: string;
  playerName?: string;
  confidants?: Confidant[];
}

export const MapModal: React.FC<MapModalProps> = ({ 
  isOpen, 
  onClose, 
  worldMap,
  currentPos = { x: 25000, y: 25000 }, 
  floor = 0,
  location,
  playerName = "YOU",
  confidants = []
}) => {
  // Enhanced Scale: Limit minimum scale to 0.1 to prevent crash
  const [scale, setScale] = useState(0.5); 
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Navigation State
  const [viewingFloor, setViewingFloor] = useState<number>(floor);
  const [isFloorMenuOpen, setIsFloorMenuOpen] = useState(false); 

  // Layer Toggles - Removed Routes
  const [showTerritories, setShowTerritories] = useState(true);
  const [showNPCs, setShowNPCs] = useState(true);

  // Hover State
  const [hoverInfo, setHoverInfo] = useState<{title: string, sub?: string, desc?: string, x: number, y: number} | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial Data
  const mapData = worldMap || { 
      config: { width: 50000, height: 50000 },
      factions: [], territories: [], terrain: [], routes: [], surfaceLocations: [], dungeonStructure: [] 
  };

  useEffect(() => {
      if (isOpen) {
          setViewingFloor(floor);
          // Small delay to let ref mount
          setTimeout(() => centerOnPlayer(), 100);
      }
  }, [isOpen, floor]);

  if (!isOpen) return null;

  // --- Zoom Logic ---
  const applyZoom = (deltaScale: number, containerCenterX?: number, containerCenterY?: number) => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      
      // Safety: Prevent scale from going too small (crash risk) or too large
      const safeScale = Math.max(0.1, Math.min(scale + deltaScale, 5.0));
      if (Math.abs(safeScale - scale) < 0.001) return;

      const cx = containerCenterX !== undefined ? containerCenterX : clientWidth / 2;
      const cy = containerCenterY !== undefined ? containerCenterY : clientHeight / 2;

      const mapX = (cx - offset.x) / scale;
      const mapY = (cy - offset.y) / scale;

      const newOffsetX = cx - (mapX * safeScale);
      const newOffsetY = cy - (mapY * safeScale);

      setScale(safeScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001; 
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
          applyZoom(delta, e.clientX - rect.left, e.clientY - rect.top);
      }
  };

  const centerOnPlayer = () => {
      if (containerRef.current) {
          const { clientWidth, clientHeight } = containerRef.current;
          // Target scale 1.0 for player view
          const targetScale = 1.0; 
          setOffset({
              x: -currentPos.x * targetScale + clientWidth / 2,
              y: -currentPos.y * targetScale + clientHeight / 2
          });
          setScale(targetScale);
          setViewingFloor(floor); 
      }
  };

  // --- Pan Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
      if (isDragging) {
          setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
  };

  // FIX: Explicitly check chinese keys '是否在场' and '坐标'
  const visibleEntities = confidants.filter(c => (c.是否在场 || c.特别关注 || c.是否队友) && c.坐标);

  // ... (renderSurfaceMap logic remains mostly the same, ensuring c.坐标 is used)

  const renderSurfaceMap = () => (
      <div 
          ref={containerRef}
          className="flex-1 bg-[#050a14] relative overflow-hidden cursor-move border-t-2 border-b-2 border-blue-900"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onWheel={handleWheel}
      >
          <svg 
              viewBox={`0 0 ${mapData.config.width} ${mapData.config.height}`} 
              className="absolute top-0 left-0 origin-top-left will-change-transform"
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
                      className="transition-opacity duration-300 hover:fill-opacity-40 cursor-pointer"
                      onMouseEnter={(e) => setHoverInfo({ title: t.name, sub: '区域', desc: '势力控制范围', x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setHoverInfo(null)}
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

              {/* 4. POI Locations */}
              {mapData.surfaceLocations.filter(l => (l.floor || 0) === viewingFloor).map(loc => (
                  <g 
                      key={loc.id}
                      className="cursor-pointer group"
                      onMouseEnter={(e) => setHoverInfo({ title: loc.name, sub: loc.type === 'FAMILIA_HOME' ? '眷族据点' : loc.type === 'SHOP' ? '商店' : '地标', desc: loc.description, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setHoverInfo(null)}
                  >
                      <circle 
                        cx={loc.coordinates.x} 
                        cy={loc.coordinates.y} 
                        r={loc.radius} 
                        fill={loc.type === 'GUILD' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(251, 191, 36, 0.05)'} 
                        stroke={loc.type === 'GUILD' ? '#3b82f6' : '#fbbf24'}
                        strokeWidth="5"
                        className="opacity-50 group-hover:opacity-100 transition-opacity"
                      />
                      <circle cx={loc.coordinates.x} cy={loc.coordinates.y} r="50" fill="#000" stroke="#fff" strokeWidth="5" />
                  </g>
              ))}

              {/* 5. NPCs - Use Chinese Keys */}
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
                       {/* Label for NPC */}
                       <text 
                           x={npc.坐标.x} y={npc.坐标.y - 50} 
                           fill="white" fontSize="100" textAnchor="middle" 
                           style={{ textShadow: "2px 2px 4px #000" }}
                       >
                           {npc.姓名}
                       </text>
                  </g>
              ))}

              {/* 6. Player Marker */}
              {viewingFloor === floor && (
                  <g className="animate-pulse" style={{ transition: 'transform 0.5s ease-out', transform: `translate(${currentPos.x}px, ${currentPos.y}px)` }}>
                      <circle r="60" fill="#22c55e" stroke="#fff" strokeWidth="10" />
                      <circle r="150" fill="none" stroke="#22c55e" strokeWidth="5" strokeDasharray="30,10" className="animate-spin-slow" />
                  </g>
              )}

          </svg>
      </div>
  );

  const LayerControl = () => (
      <div className="absolute top-24 left-6 z-30 flex flex-col gap-2 bg-black/80 p-2 border border-zinc-700 rounded shadow-xl">
          <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1 flex items-center gap-1">
              <Layers size={12} /> 图层控制
          </div>
          <button onClick={() => setShowTerritories(!showTerritories)} className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${showTerritories ? 'bg-blue-900/50 text-blue-200' : 'text-zinc-500'}`}>
              {showTerritories ? <Eye size={12}/> : <EyeOff size={12}/>} 领地范围
          </button>
          <button onClick={() => setShowNPCs(!showNPCs)} className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${showNPCs ? 'bg-blue-900/50 text-blue-200' : 'text-zinc-500'}`}>
              {showNPCs ? <Eye size={12}/> : <EyeOff size={12}/>} 人物定位
          </button>
      </div>
  );

  // Floor Jump Selector
  const FloorSelector = () => (
      <div className="absolute top-24 left-44 z-30">
          <div className="relative">
              <button 
                onClick={() => setIsFloorMenuOpen(!isFloorMenuOpen)}
                className="bg-black/90 text-white border border-blue-500 px-4 py-2 rounded flex items-center gap-2 shadow-lg"
              >
                  <span className="font-bold font-mono">
                      {viewingFloor === 0 ? "地表 (欧拉丽)" : `地下 ${viewingFloor} 层`}
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${isFloorMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFloorMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-black border border-zinc-700 max-h-64 overflow-y-auto custom-scrollbar shadow-xl z-40">
                      <button onClick={() => { setViewingFloor(0); setIsFloorMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-white hover:bg-blue-900 border-b border-zinc-800">
                          欧拉丽地表
                      </button>
                      {Array.from({length: 50}, (_, i) => i + 1).map(f => (
                          <button 
                            key={f} 
                            onClick={() => { setViewingFloor(f); setIsFloorMenuOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 border-b border-zinc-800 font-mono ${f === floor ? 'text-green-500 font-bold' : 'text-zinc-400'}`}
                          >
                              地下 {f} 层 {f === floor ? '(当前)' : ''}
                          </button>
                      ))}
                  </div>
              )}
          </div>
      </div>
  );

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-7xl h-[90vh] bg-black border-4 border-blue-600 relative flex flex-col shadow-[0_0_60px_rgba(37,99,235,0.4)]">
        
        {/* Header */}
        <div className="bg-zinc-900 p-4 flex justify-between items-center border-b-2 border-blue-800 shrink-0 z-20">
            <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-2 text-white shadow-lg"><MapIcon size={24} /></div>
                <div>
                    <h2 className="text-2xl font-display uppercase tracking-widest text-white text-shadow-blue">世界战术地图</h2>
                    <div className="text-xs font-mono text-blue-400">Coordinates: [{Math.round(currentPos.x)}, {Math.round(currentPos.y)}] | {location}</div>
                </div>
            </div>
            <div className="flex gap-4">
                <button onClick={centerOnPlayer} className="p-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-white transition-colors" title="定位玩家"><Target size={20} /></button>
                <button onClick={onClose} className="p-2 bg-red-900/20 border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition-colors"><X size={20} /></button>
            </div>
        </div>

        {/* Controls */}
        <div className="absolute top-24 right-6 z-30 flex flex-col gap-2">
            <button onClick={() => applyZoom(0.1)} className="bg-zinc-800 border border-zinc-600 p-2 text-white hover:bg-blue-600 rounded"><Plus size={20}/></button>
            <button onClick={() => applyZoom(-0.1)} className="bg-zinc-800 border border-zinc-600 p-2 text-white hover:bg-blue-600 rounded"><Minus size={20}/></button>
            <button onClick={centerOnPlayer} className="bg-zinc-800 border border-zinc-600 p-2 text-white hover:bg-blue-600 rounded"><RotateCcw size={16}/></button>
        </div>

        <LayerControl />
        <FloorSelector />

        {/* Legend */}
        <div className="absolute bottom-6 right-6 z-30 bg-black/90 border border-zinc-700 p-4 max-w-xs text-xs text-zinc-300 shadow-xl">
             <h4 className="font-bold text-white border-b border-zinc-600 pb-2 mb-2 uppercase">势力分布</h4>
             <div className="grid grid-cols-2 gap-2">
                 {mapData.factions.map(f => (
                     <div key={f.id} className="flex items-center gap-2">
                         <div className="w-3 h-3 border" style={{ backgroundColor: f.color, borderColor: f.borderColor }} />
                         <span style={{ color: f.textColor }}>{f.name}</span>
                     </div>
                 ))}
             </div>
        </div>

        {/* Map View */}
        {renderSurfaceMap()}

        {/* Tooltip */}
        {hoverInfo && (
            <div 
                className="fixed z-50 bg-black/95 border-2 border-blue-500 p-4 shadow-2xl pointer-events-none max-w-xs transform -translate-y-full mt-[-10px]"
                style={{ top: hoverInfo.y, left: hoverInfo.x }}
            >
                <div className="flex items-center gap-2 mb-2 border-b border-zinc-700 pb-2">
                    <span className="text-xl">📍</span>
                    <h4 className="text-blue-400 font-display text-lg uppercase tracking-wider">{hoverInfo.title}</h4>
                </div>
                {hoverInfo.sub && <div className="text-[10px] bg-blue-900/30 text-blue-200 px-2 py-0.5 inline-block mb-1 font-bold uppercase">{hoverInfo.sub}</div>}
                <p className="text-zinc-300 text-xs font-serif leading-relaxed">{hoverInfo.desc}</p>
            </div>
        )}

      </div>
    </div>
  );
};
