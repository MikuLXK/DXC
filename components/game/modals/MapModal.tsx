
import React, { useState, useRef, useEffect } from 'react';
import { X, Map as MapIcon, Target, Plus, Minus, RotateCcw, Info, Layers, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { WorldMapData, GeoPoint, Confidant, MapMidLocation, MapSmallLocation } from '../../../types';
import { drawWorldMapCanvas, resizeCanvasToContainer } from '../../../utils/mapCanvas';

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
  currentPos = { x: 5000, y: 5000 }, 
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
  const [viewMode, setViewMode] = useState<'macro' | 'mid' | 'small'>('macro');
  const [activeMid, setActiveMid] = useState<MapMidLocation | null>(null);
  const [activeSmall, setActiveSmall] = useState<MapSmallLocation | null>(null);
  const [selectedMacroId, setSelectedMacroId] = useState<string | null>(null);
  const [selectedMidId, setSelectedMidId] = useState<string | null>(null);
  const [selectedSmallId, setSelectedSmallId] = useState<string | null>(null);

  // Layout pan/zoom (for macro/mid/small layouts)
  const [layoutScale, setLayoutScale] = useState(1);
  const [layoutOffset, setLayoutOffset] = useState({ x: 0, y: 0 });
  const [isLayoutDragging, setIsLayoutDragging] = useState(false);
  const [layoutDragStart, setLayoutDragStart] = useState({ x: 0, y: 0 });
  
  // Navigation State
  const [viewingFloor, setViewingFloor] = useState<number>(floor);
  const [isFloorMenuOpen, setIsFloorMenuOpen] = useState(false); 

  // Layer Toggles - Removed Routes
  const [showTerritories, setShowTerritories] = useState(true);
  const [showNPCs, setShowNPCs] = useState(true);
  const [jumpCoord, setJumpCoord] = useState({ x: '', y: '' });

  // Hover State
  const [hoverInfo, setHoverInfo] = useState<{title: string, sub?: string, desc?: string, x: number, y: number} | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layoutContainerRef = useRef<HTMLDivElement>(null);

  // Initial Data
  const mapData = worldMap || { 
      config: { width: 10000, height: 10000 },
      factions: [], territories: [], terrain: [], routes: [], surfaceLocations: [], dungeonStructure: [] 
  };

  const isLayoutView = viewingFloor === 0 && (
      (viewMode === 'small' && !!activeSmall?.layout) ||
      (viewMode === 'mid' && !!activeMid?.layout)
  );

  const macroLocations = mapData.macroLocations || [];
  const midLocations = mapData.midLocations || [];
  const smallLocations = mapData.smallLocations || [];

  const matchByName = (needle?: string, name?: string) => {
      if (!needle || !name) return false;
      return needle.includes(name) || name.includes(needle);
  };

  const resolveAutoView = () => {
      if (floor !== 0) {
          setViewMode('macro');
          setActiveMid(null);
          setActiveSmall(null);
          setSelectedMidId(null);
          setSelectedSmallId(null);
          return;
      }
      const smallMatch = smallLocations.find(s => matchByName(location, s.name)) || null;
      const midMatch = midLocations.find(m => matchByName(location, m.name)) || null;
      if (smallMatch) {
          setViewMode('small');
          setActiveSmall(smallMatch);
          setActiveMid(midMatch);
          setSelectedSmallId(smallMatch.id);
          setSelectedMidId(smallMatch.parentId || midMatch?.id || null);
      } else if (midMatch) {
          setViewMode('mid');
          setActiveMid(midMatch);
          setActiveSmall(null);
          setSelectedMidId(midMatch.id);
          setSelectedSmallId(null);
      } else {
          setViewMode('macro');
          setActiveMid(null);
          setActiveSmall(null);
          setSelectedMidId(null);
          setSelectedSmallId(null);
      }
  };

  const getLayoutMeta = () => {
      if (viewingFloor !== 0) return null;
      if (viewMode === 'small' && activeSmall?.layout) {
          return { layout: activeSmall.layout, area: activeSmall.area, baseCenter: activeSmall.coordinates };
      }
      if (viewMode === 'mid' && activeMid?.layout) {
          return { layout: activeMid.layout, area: activeMid.area, baseCenter: activeMid.coordinates };
      }
      return null;
  };

  const getLayoutSize = (layout: MapSmallLocation["layout"], area?: { width?: number; height?: number }) => ({
      width: area?.width ?? layout.width,
      height: area?.height ?? layout.height
  });

  const toLocalPoint = (
      point: GeoPoint | undefined,
      center: GeoPoint | undefined,
      layoutWidth: number,
      layoutHeight: number
  ) => {
      if (!point || !center) return null;
      const localX = point.x - center.x + layoutWidth / 2;
      const localY = point.y - center.y + layoutHeight / 2;
      if (localX < 0 || localY < 0 || localX > layoutWidth || localY > layoutHeight) return null;
      return { x: localX, y: localY };
  };

  const centerLayoutOnPoint = (localX: number, localY: number, layoutWidth: number, layoutHeight: number) => {
      const container = layoutContainerRef.current;
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      const unit = 14;
      const pixelX = localX * unit * layoutScale;
      const pixelY = localY * unit * layoutScale;
      const targetOffset = {
          x: clientWidth / 2 - pixelX,
          y: clientHeight / 2 - pixelY
      };
      setLayoutOffset(targetOffset);
  };

  const centerOnArea = (center: GeoPoint, area?: { radius?: number; width?: number; height?: number }) => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const diameter = area?.radius ? area.radius * 2 : (area?.width && area?.height ? Math.max(area.width, area.height) : 1200);
      const desiredScale = Math.min(clientWidth / diameter, clientHeight / diameter) * 0.6;
      const targetScale = Math.max(0.3, Math.min(desiredScale, 3.0));
      setOffset({
          x: -center.x * targetScale + clientWidth / 2,
          y: -center.y * targetScale + clientHeight / 2
      });
      setScale(targetScale);
      setViewingFloor(floor);
  };

  const centerOnLayout = (layout: MapSmallLocation["layout"], area?: { center?: GeoPoint; width?: number; height?: number }, baseCenter?: GeoPoint) => {
      const { width: layoutWidth, height: layoutHeight } = getLayoutSize(layout, area);
      const center = area?.center || baseCenter;
      const playerLocal = toLocalPoint(currentPos, center, layoutWidth, layoutHeight);
      const target = playerLocal || { x: layoutWidth / 2, y: layoutHeight / 2 };
      centerLayoutOnPoint(target.x, target.y, layoutWidth, layoutHeight);
  };

  const fitLayoutToScreen = (layout: MapSmallLocation["layout"], area?: { width?: number; height?: number }) => {
      const container = layoutContainerRef.current;
      if (!container) return;
      const { width: layoutWidth, height: layoutHeight } = getLayoutSize(layout, area);
      const unit = 14;
      const targetScale = Math.min(container.clientWidth / (layoutWidth * unit), container.clientHeight / (layoutHeight * unit)) * 0.9;
      const safeScale = Math.max(0.3, Math.min(targetScale, 5.0));
      setLayoutScale(safeScale);
      setLayoutOffset({
          x: (container.clientWidth - layoutWidth * unit * safeScale) / 2,
          y: (container.clientHeight - layoutHeight * unit * safeScale) / 2
      });
  };

  const resetToPlayerView = () => {
      setViewingFloor(floor);
      resolveAutoView();
      setTimeout(() => centerOnPlayer(), 0);
  };

  const selectMacroById = (id: string) => {
      const macro = macroLocations.find(m => m.id === id) || null;
      setSelectedMacroId(id);
      setSelectedMidId(null);
      setSelectedSmallId(null);
      setActiveMid(null);
      setActiveSmall(null);
      setViewingFloor(0);
      setViewMode('macro');
      if (macro) {
          centerOnArea(macro.area?.center || macro.coordinates, macro.area);
      } else {
          centerOnPlayer();
      }
  };

  const selectMidById = (id: string) => {
      const mid = midLocations.find(m => m.id === id) || null;
      setSelectedMidId(id);
      setSelectedMacroId(mid?.parentId || selectedMacroId || null);
      setSelectedSmallId(null);
      setActiveMid(mid);
      setActiveSmall(null);
      setViewingFloor(0);
      setViewMode('mid');
      if (mid?.layout) {
          setTimeout(() => centerOnLayout(mid.layout, mid.area, mid.coordinates), 0);
      } else if (mid) {
          centerOnArea(mid.area?.center || mid.coordinates, mid.area);
      }
  };

  const selectSmallById = (id: string) => {
      const small = smallLocations.find(s => s.id === id) || null;
      if (!small) return;
      const mid = midLocations.find(m => m.id === small.parentId) || null;
      setSelectedSmallId(id);
      setSelectedMidId(small.parentId || mid?.id || null);
      setSelectedMacroId(mid?.parentId || selectedMacroId || null);
      setActiveSmall(small);
      setActiveMid(mid);
      setViewingFloor(0);
      setViewMode('small');
      if (small.layout) {
          setTimeout(() => centerOnLayout(small.layout, small.area, small.coordinates), 0);
      }
  };

  const centerOnPlayer = () => {
      if (isLayoutView) {
          const meta = getLayoutMeta();
          if (!meta) return;
          const { layout, area, baseCenter } = meta;
          const { width: layoutWidth, height: layoutHeight } = getLayoutSize(layout, area);
          const center = area?.center || baseCenter;
          const playerLocal = toLocalPoint(currentPos, center, layoutWidth, layoutHeight);
          const target = playerLocal || { x: layoutWidth / 2, y: layoutHeight / 2 };
          centerLayoutOnPoint(target.x, target.y, layoutWidth, layoutHeight);
          return;
      }
      if (containerRef.current) {
          const { clientWidth, clientHeight } = containerRef.current;
          const targetScale = 1.0; 
          setOffset({
              x: -currentPos.x * targetScale + clientWidth / 2,
              y: -currentPos.y * targetScale + clientHeight / 2
          });
          setScale(targetScale);
          setViewingFloor(floor); 
      }
  };

  const handleJumpToCoord = () => {
      const x = parseFloat(jumpCoord.x);
      const y = parseFloat(jumpCoord.y);
      if (Number.isNaN(x) || Number.isNaN(y)) return;
      if (isLayoutView) {
          const meta = getLayoutMeta();
          if (!meta) return;
          const { layout, area, baseCenter } = meta;
          const { width: layoutWidth, height: layoutHeight } = getLayoutSize(layout, area);
          const center = area?.center || baseCenter;
          const local = toLocalPoint({ x, y }, center, layoutWidth, layoutHeight);
          if (local) centerLayoutOnPoint(local.x, local.y, layoutWidth, layoutHeight);
          return;
      }
      const container = containerRef.current;
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      setOffset({
          x: -x * scale + clientWidth / 2,
          y: -y * scale + clientHeight / 2
      });
  };

  useEffect(() => {
      if (isOpen) {
          setViewingFloor(floor);
          resolveAutoView();
          // Small delay to let ref mount
          setTimeout(() => centerOnPlayer(), 100);
      }
  }, [isOpen, floor, location, worldMap]);

  useEffect(() => {
      if (!isOpen) return;
      if (viewingFloor !== 0) return;
      if (viewMode === 'mid' && activeMid) {
          centerOnArea(activeMid.area?.center || activeMid.coordinates, activeMid.area);
      }
      if (viewMode === 'macro') {
          centerOnPlayer();
      }
  }, [viewMode, activeMid, viewingFloor, isOpen]);

  useEffect(() => {
      if (!isOpen) return;
      const macro = macroLocations[0];
      if (macro && !selectedMacroId) {
          setSelectedMacroId(macro.id);
      }
      if (activeMid?.id) setSelectedMidId(activeMid.id);
      if (activeSmall?.id) setSelectedSmallId(activeSmall.id);
  }, [isOpen, macroLocations.length, activeMid, activeSmall, selectedMacroId]);

  useEffect(() => {
      if (!isOpen) return;
      if (isLayoutView) return;
      const draw = () => {
          const canvas = canvasRef.current;
          const container = containerRef.current;
          if (!canvas || !container) return;
          resizeCanvasToContainer(canvas, container);
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          drawWorldMapCanvas(ctx, mapData, {
              floor: viewingFloor,
              scale,
              offset,
              showTerritories,
              showNPCs,
              showPlayer: viewingFloor === floor || viewingFloor === 0,
              showLabels: true,
              currentPos,
              confidants
          });
      };
      draw();
      window.addEventListener('resize', draw);
      return () => window.removeEventListener('resize', draw);
  }, [isOpen, mapData, scale, offset, viewingFloor, showTerritories, showNPCs, floor, currentPos, confidants, viewMode, isLayoutView]);

  useEffect(() => {
      if (isLayoutView) {
          setHoverInfo(null);
      }
  }, [viewMode, isLayoutView]);

  useEffect(() => {
      if (!isLayoutView) return;
      setLayoutScale(1);
      setLayoutOffset({ x: 0, y: 0 });
      setTimeout(() => centerOnPlayer(), 0);
  }, [isLayoutView, viewMode, activeSmall, activeMid]);

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
      if (isLayoutView) {
          const rect = layoutContainerRef.current?.getBoundingClientRect();
          if (rect) {
              applyLayoutZoom(delta, e.clientX - rect.left, e.clientY - rect.top);
          }
          return;
      }
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) applyZoom(delta, e.clientX - rect.left, e.clientY - rect.top);
  };

  const applyLayoutZoom = (deltaScale: number, containerCenterX?: number, containerCenterY?: number) => {
      const container = layoutContainerRef.current;
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      const safeScale = Math.max(0.3, Math.min(layoutScale + deltaScale, 5.0));
      if (Math.abs(safeScale - layoutScale) < 0.001) return;
      const cx = containerCenterX !== undefined ? containerCenterX : clientWidth / 2;
      const cy = containerCenterY !== undefined ? containerCenterY : clientHeight / 2;
      const mapX = (cx - layoutOffset.x) / layoutScale;
      const mapY = (cy - layoutOffset.y) / layoutScale;
      const newOffsetX = cx - (mapX * safeScale);
      const newOffsetY = cy - (mapY * safeScale);
      setLayoutScale(safeScale);
      setLayoutOffset({ x: newOffsetX, y: newOffsetY });
  };


  // --- Pan Logic ---
  const handleMapMouseDown = (e: React.MouseEvent) => {
      if (isLayoutView) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMapMouseMove = (e: React.MouseEvent) => {
      if (isLayoutView) return;
      if (isDragging) {
          setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      } else {
          updateHoverInfo(e.clientX, e.clientY);
      }
  };
  const handleLayoutMouseDown = (e: React.MouseEvent) => {
      if (!isLayoutView) return;
      setIsLayoutDragging(true);
      setLayoutDragStart({ x: e.clientX - layoutOffset.x, y: e.clientY - layoutOffset.y });
  };
  const handleLayoutMouseMove = (e: React.MouseEvent) => {
      if (!isLayoutView) return;
      if (isLayoutDragging) {
          setLayoutOffset({ x: e.clientX - layoutDragStart.x, y: e.clientY - layoutDragStart.y });
      }
  };

  const getLocationTypeLabel = (type?: string) => {
      if (!type) return '地点';
      if (type === 'GUILD') return '公会';
      if (type === 'SHOP') return '商店';
      if (type === 'FAMILIA_HOME') return '眷族据点';
      if (type === 'DUNGEON_GATE' || type === 'DUNGEON_ENTRANCE') return '入口';
      return '地标';
  };

  const updateHoverInfo = (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mapX = (clientX - rect.left - offset.x) / scale;
      const mapY = (clientY - rect.top - offset.y) / scale;
      const loc = mapData.surfaceLocations
          .filter(l => (l.floor || 0) === viewingFloor)
          .find(l => {
              const dx = mapX - l.coordinates.x;
              const dy = mapY - l.coordinates.y;
              return Math.hypot(dx, dy) <= l.radius;
          });
      if (loc) {
          setHoverInfo({
              title: loc.name,
              sub: getLocationTypeLabel(loc.type),
              desc: loc.description,
              x: clientX,
              y: clientY
          });
      } else {
          setHoverInfo(null);
      }
  };

  const renderSurfaceMap = () => (
      <div 
          ref={containerRef}
          className="flex-1 bg-[#050a14] relative overflow-hidden cursor-move border-t-2 border-b-2 border-blue-900"
          onMouseDown={handleMapMouseDown}
          onMouseMove={handleMapMouseMove}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => { setIsDragging(false); setHoverInfo(null); }}
          onWheel={handleWheel}
      >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
  );

  const renderLayoutView = (
      layout: MapSmallLocation["layout"] | undefined,
      title: string,
      area?: { center?: GeoPoint; width?: number; height?: number },
      baseCenter?: GeoPoint
  ) => {
      if (!layout) {
          return (
              <div className="flex-1 bg-[#050a14] flex items-center justify-center text-zinc-400 text-sm border-t-2 border-b-2 border-blue-900">
                  未找到地点布局数据
              </div>
          );
      }
      const unit = 14;
      const layoutWidth = area?.width ?? layout.width;
      const layoutHeight = area?.height ?? layout.height;
      const center = area?.center || baseCenter;
      const toLocal = (point?: GeoPoint) => toLocalPoint(point, center, layoutWidth, layoutHeight);
      const playerLocal = toLocal(currentPos);
      const npcLocals = confidants
          .filter(c => c.坐标)
          .map(c => ({ name: c.姓名, local: toLocal(c.坐标 as GeoPoint) }))
          .filter(c => c.local);
      return (
          <div
              ref={layoutContainerRef}
              className="flex-1 bg-[#050a14] border-t-2 border-b-2 border-blue-900 overflow-hidden cursor-grab"
              onMouseDown={handleLayoutMouseDown}
              onMouseMove={handleLayoutMouseMove}
              onMouseUp={() => setIsLayoutDragging(false)}
              onMouseLeave={() => setIsLayoutDragging(false)}
              onWheel={handleWheel}
          >
              <div className="p-6 flex flex-col items-center gap-4">
                  <div className="text-xs text-blue-300 font-mono uppercase tracking-widest">
                      {title}
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                      <button
                          onClick={() => fitLayoutToScreen(layout, area)}
                          className="px-2 py-1 bg-zinc-900 text-zinc-200 border border-zinc-700"
                      >
                          适配
                      </button>
                      <button
                          onClick={centerOnPlayer}
                          className="px-2 py-1 bg-blue-700 text-white border border-blue-500"
                      >
                          定位玩家
                      </button>
                  </div>
                  <div
                      className="relative"
                      style={{
                          transform: `translate(${layoutOffset.x}px, ${layoutOffset.y}px) scale(${layoutScale})`,
                          transformOrigin: '0 0'
                      }}
                  >
                      <div
                          className="relative bg-[#f4f1e8] border-4 border-zinc-800 shadow-2xl"
                          style={{
                              width: layoutWidth * unit,
                              height: layoutHeight * unit,
                              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)`,
                              backgroundSize: `${unit}px ${unit}px`
                          }}
                      >
                      {layout.rooms.map(room => (
                          <div
                              key={room.id}
                              className="absolute border-2 border-zinc-900/80 bg-white/70 text-[10px] text-zinc-800 font-bold flex items-center justify-center"
                              style={{
                                  left: room.bounds.x * unit,
                                  top: room.bounds.y * unit,
                                  width: room.bounds.width * unit,
                                  height: room.bounds.height * unit
                              }}
                          >
                              {room.name}
                          </div>
                      ))}
                      {layout.furniture.map(item => (
                          <div
                              key={item.id}
                              className="absolute bg-amber-600/70 border border-amber-900 text-[8px] text-white flex items-center justify-center"
                              style={{
                                  left: item.position.x * unit,
                                  top: item.position.y * unit,
                                  width: (item.size?.width || 1) * unit,
                                  height: (item.size?.height || 1) * unit
                              }}
                              title={item.description || item.name}
                          >
                              {item.name}
                          </div>
                      ))}
                      {layout.entrances.map(entrance => (
                          <div
                              key={entrance.id}
                              className="absolute w-3 h-3 bg-blue-600 border border-blue-900 rounded-full"
                              style={{
                                  left: entrance.position.x * unit - 6,
                                  top: entrance.position.y * unit - 6
                              }}
                              title={entrance.name}
                          />
                      ))}
                      {playerLocal && (
                          <div
                              className="absolute w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow"
                              style={{ left: playerLocal.x * unit - 6, top: playerLocal.y * unit - 6 }}
                              title="玩家"
                          />
                      )}
                      {playerLocal && (
                          <div
                              className="absolute text-[9px] text-emerald-800 font-bold bg-white/80 px-1 rounded"
                              style={{ left: playerLocal.x * unit + 6, top: playerLocal.y * unit - 10 }}
                          >
                              玩家 {Math.round(currentPos.x)},{Math.round(currentPos.y)}
                          </div>
                      )}
                      {npcLocals.map(npc => (
                          <div
                              key={npc.name}
                              className="absolute w-2.5 h-2.5 rounded-full bg-pink-500 border border-white"
                              style={{ left: npc.local!.x * unit - 5, top: npc.local!.y * unit - 5 }}
                              title={npc.name}
                          />
                      ))}
                      </div>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                      比例: {layout.scale} | 尺寸: {layoutWidth} × {layoutHeight} 米
                  </div>
                  <div className="max-w-3xl w-full bg-black/60 border border-zinc-700 p-3 text-[11px] text-zinc-200 space-y-1">
                      <div>玩家坐标: {Math.round(currentPos.x)}, {Math.round(currentPos.y)}</div>
                      {npcLocals.length > 0 && (
                          <div>在场角色: {npcLocals.map(n => n.name).join(' / ')}</div>
                      )}
                  </div>
                  {layout.notes && layout.notes.length > 0 && (
                      <div className="max-w-3xl w-full bg-black/60 border border-zinc-700 p-3 text-[11px] text-zinc-200 space-y-1">
                          {layout.notes.map((note, idx) => (
                              <div key={idx}>• {note}</div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      );
  };

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
                      <button onClick={() => { handleSelectFloor(0); setIsFloorMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-white hover:bg-blue-900 border-b border-zinc-800">
                          欧拉丽地表
                      </button>
                      {Array.from({length: 50}, (_, i) => i + 1).map(f => (
                          <button 
                            key={f} 
                            onClick={() => { handleSelectFloor(f); setIsFloorMenuOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 border-b border-zinc-800 font-mono ${f === floor ? 'text-green-500 font-bold' : 'text-zinc-400'}`}
                          >
                              地下 {f} 层{f === floor ? '(当前)' : ''}
                          </button>
                      ))}
                  </div>
              )}
          </div>
      </div>
  );

  const ViewModeToggle = () => {
      const isSurface = viewingFloor === 0;
      const pickDefaultMidId = () => {
          if (selectedMidId) return selectedMidId;
          const fromMacro = selectedMacroId ? midLocations.find(m => m.parentId === selectedMacroId) : null;
          return fromMacro?.id || midLocations[0]?.id || null;
      };
      const pickDefaultSmallId = () => {
          if (selectedSmallId) return selectedSmallId;
          const fromMid = selectedMidId ? smallLocations.find(s => s.parentId === selectedMidId) : null;
          return fromMid?.id || smallLocations[0]?.id || null;
      };
      const enterMidView = () => {
          const id = pickDefaultMidId();
          if (id) selectMidById(id);
      };
      const enterSmallView = () => {
          const id = pickDefaultSmallId();
          if (id) selectSmallById(id);
      };
      return (
          <div className="absolute top-24 left-[22rem] z-30 flex flex-col gap-2 bg-black/90 border border-blue-500 shadow-lg rounded p-2 text-xs font-bold">
              {isSurface && (
                  <>
                      <div className="flex items-center overflow-hidden rounded border border-zinc-700">
                          <button
                              onClick={() => setViewMode('macro')}
                              className={`px-3 py-2 ${viewMode === 'macro' ? 'bg-blue-700 text-white' : 'text-zinc-400 hover:text-white'}`}
                          >
                              大地图
                          </button>
                          <button
                              onClick={enterMidView}
                              className={`px-3 py-2 ${viewMode === 'mid' ? 'bg-blue-700 text-white' : midLocations.length > 0 ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 cursor-not-allowed'}`}
                          >
                              中地点
                          </button>
                          <button
                              onClick={enterSmallView}
                              className={`px-3 py-2 ${viewMode === 'small' ? 'bg-blue-700 text-white' : smallLocations.length > 0 ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 cursor-not-allowed'}`}
                          >
                              小地点
                          </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-[11px]">
                          <select
                              value={selectedMacroId || ''}
                              onChange={(e) => selectMacroById(e.target.value)}
                              className="bg-zinc-900 text-zinc-200 border border-zinc-700 px-2 py-1"
                          >
                              {macroLocations.length === 0 && <option value="">无大地图</option>}
                              {macroLocations.map(m => (
                                  <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                          </select>
                          <select
                              value={selectedMidId || ''}
                              onChange={(e) => selectMidById(e.target.value)}
                              className="bg-zinc-900 text-zinc-200 border border-zinc-700 px-2 py-1"
                          >
                              <option value="">选择中地点</option>
                              {midLocations
                                  .filter(m => !selectedMacroId || m.parentId === selectedMacroId)
                                  .map(m => (
                                      <option key={m.id} value={m.id}>{m.name}</option>
                                  ))}
                          </select>
                          <select
                              value={selectedSmallId || ''}
                              onChange={(e) => selectSmallById(e.target.value)}
                              className="bg-zinc-900 text-zinc-200 border border-zinc-700 px-2 py-1"
                          >
                              <option value="">选择小地点</option>
                              {smallLocations
                                  .filter(s => !selectedMidId || s.parentId === selectedMidId)
                                  .map(s => (
                                      <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                          </select>
                      </div>
                  </>
              )}
              <div className="flex items-center gap-2">
                  <input
                      value={jumpCoord.x}
                      onChange={(e) => setJumpCoord(prev => ({ ...prev, x: e.target.value }))}
                      placeholder="X"
                      className="w-16 bg-zinc-900 text-zinc-200 border border-zinc-700 px-2 py-1 font-mono"
                  />
                  <input
                      value={jumpCoord.y}
                      onChange={(e) => setJumpCoord(prev => ({ ...prev, y: e.target.value }))}
                      placeholder="Y"
                      className="w-16 bg-zinc-900 text-zinc-200 border border-zinc-700 px-2 py-1 font-mono"
                  />
                  <button
                      onClick={handleJumpToCoord}
                      className="px-2 py-1 bg-blue-700 text-white border border-blue-500"
                  >
                      定位
                  </button>
              </div>
          </div>
      );
  };

  const handleSelectFloor = (nextFloor: number) => {
      setViewingFloor(nextFloor);
      if (nextFloor !== 0) {
          setViewMode('macro');
          setActiveMid(null);
          setActiveSmall(null);
      } else {
          resolveAutoView();
      }
  };

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
            <button
                onClick={() => (isLayoutView ? applyLayoutZoom(0.1) : applyZoom(0.1))}
                className="bg-zinc-800 border border-zinc-600 p-2 text-white hover:bg-blue-600 rounded"
                title="放大"
            >
                <Plus size={20}/>
            </button>
            <button
                onClick={() => (isLayoutView ? applyLayoutZoom(-0.1) : applyZoom(-0.1))}
                className="bg-zinc-800 border border-zinc-600 p-2 text-white hover:bg-blue-600 rounded"
                title="缩小"
            >
                <Minus size={20}/>
            </button>
            <button
                onClick={centerOnPlayer}
                className="bg-zinc-800 border border-zinc-600 p-2 text-white hover:bg-blue-600 rounded"
                title="定位玩家"
            >
                <Target size={16}/>
            </button>
            <button
                onClick={resetToPlayerView}
                className="bg-zinc-800 border border-zinc-600 p-2 text-white hover:bg-blue-600 rounded"
                title="回到玩家地图"
            >
                <RotateCcw size={16}/>
            </button>
        </div>

        {!isLayoutView && <LayerControl />}
        <FloorSelector />
        <ViewModeToggle />

        {/* Legend */}
        {isLayoutView ? (
            <div className="absolute bottom-6 right-6 z-30 bg-black/90 border border-zinc-700 p-4 max-w-xs text-xs text-zinc-300 shadow-xl">
                <h4 className="font-bold text-white border-b border-zinc-600 pb-2 mb-2 uppercase">布局图例</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-white/70 border border-zinc-800" />
                        <span>房间/区域</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-600/70 border border-amber-900" />
                        <span>家具/设施</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-600 border border-blue-900 rounded-full" />
                        <span>出入口</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 border border-white rounded-full" />
                        <span>玩家</span>
                    </div>
                    {showNPCs && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-pink-500 border border-white rounded-full" />
                            <span>在场角色</span>
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <div className="absolute bottom-6 right-6 z-30 bg-black/90 border border-zinc-700 p-4 max-w-xs text-xs text-zinc-300 shadow-xl">
                <h4 className="font-bold text-white border-b border-zinc-600 pb-2 mb-2 uppercase">地图图例</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 border border-white rounded-full" />
                        <span>玩家</span>
                    </div>
                    {showNPCs && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-pink-500 border border-white rounded-full" />
                            <span>在场角色</span>
                        </div>
                    )}
                </div>
                <div className="mt-3 border-t border-zinc-700 pt-2">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase mb-2">势力分布</div>
                    {showTerritories ? (
                        <div className="grid grid-cols-2 gap-2">
                            {mapData.factions.map(f => (
                                <div key={f.id} className="flex items-center gap-2">
                                    <div className="w-3 h-3 border" style={{ backgroundColor: f.color, borderColor: f.borderColor }} />
                                    <span style={{ color: f.textColor }}>{f.name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-[10px] text-zinc-500">领地图层已关闭</div>
                    )}
                </div>
            </div>
        )}

        {/* Map View */}
        {viewingFloor === 0 && viewMode === 'small' && activeSmall
            ? renderLayoutView(activeSmall.layout, `小地点布局 · ${activeSmall.name}`, activeSmall.area, activeSmall.coordinates)
            : viewingFloor === 0 && viewMode === 'mid' && activeMid?.layout
                ? renderLayoutView(activeMid.layout, `中地点布局 · ${activeMid.name}`, activeMid.area, activeMid.coordinates)
                : renderSurfaceMap()}

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


