
import { InventoryItem } from './item';

// --- Basic Geo Types ---
export interface GeoPoint {
    x: number;
    y: number;
}

export interface MapArea {
  shape: 'CIRCLE' | 'RECT' | 'POLYGON';
  center?: GeoPoint;
  radius?: number;
  width?: number;
  height?: number;
  points?: GeoPoint[];
  note?: string;
}

export interface MapMacroLocation {
  id: string;
  name: string;
  type?: string;
  coordinates: GeoPoint;
  area: MapArea;
  size?: { width: number; height: number; unit?: string };
  buildings?: MapBuilding[];
  layout?: MapSmallLayout;
  description?: string;
  floor?: number;
}

export interface MapMidLocation {
  id: string;
  name: string;
  parentId: string;
  coordinates: GeoPoint;
  area?: MapArea;
  size?: { width: number; height: number; unit?: string };
  buildings?: MapBuilding[];
  layout?: MapSmallLayout;
  description?: string;
  floor?: number;
}

export interface MapRoom {
  id: string;
  name: string;
  type?: string;
  bounds: { x: number; y: number; width: number; height: number };
  connections?: string[];
  features?: string[];
}

export interface MapFurniture {
  id: string;
  name: string;
  type?: string;
  position: GeoPoint;
  size?: { width: number; height: number };
  roomId?: string;
  description?: string;
}

export interface MapEntrance {
  id: string;
  name: string;
  position: GeoPoint;
  connectsTo?: string;
}

export interface MapSmallLayout {
  scale: string;
  width: number;
  height: number;
  rooms: MapRoom[];
  furniture: MapFurniture[];
  entrances: MapEntrance[];
  paths?: { id: string; from: string; to: string; note?: string }[];
  notes?: string[];
}

export interface MapBuilding {
  id: string;
  name: string;
  type?: string;
  floors?: number;
  size?: { width: number; height: number; unit?: string };
  description?: string;
  notes?: string[];
}

export interface MapSmallLocation {
  id: string;
  name: string;
  parentId: string;
  coordinates?: GeoPoint;
  area?: MapArea;
  layout: MapSmallLayout;
  description?: string;
  floor?: number;
}

// --- Map Features ---
export interface MapFaction {
  id: string;
  name: string; 
  color: string; 
  borderColor: string;
  textColor: string;
  emblem?: string; 
  description: string;
  strength: number; 
}

export interface TerritoryData {
  id: string;
  factionId: string;
  name: string;
  boundary?: string; // SVG path (legacy)
  centerX: number;
  centerY: number;
  color: string;
  opacity?: number;
  floor?: number;
  shape?: 'SECTOR' | 'CIRCLE' | 'POLYGON';
  sector?: { startAngle: number; endAngle: number; innerRadius?: number; outerRadius: number };
  points?: GeoPoint[];
}

export interface TerrainFeature {
  id: string;
  type: 'WALL' | 'WATER' | 'MOUNTAIN' | 'FOREST' | 'OBSTACLE';
  name: string;
  path: string; 
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  floor?: number;
}

export interface TradeRoute {
  id: string;
  name: string;
  path: string; 
  type: 'MAIN_STREET' | 'ALLEY' | 'TRADE_ROUTE';
  width: number;
  color: string;
  floor?: number;
}

export interface OrarioLocation {
    id: string;
    name: string; 
    type: 'LANDMARK' | 'SHOP' | 'GUILD' | 'FAMILIA_HOME' | 'SLUM' | 'STREET' | 'DUNGEON_ENTRANCE' | 'SAFE_ZONE' | 'STAIRS_UP' | 'STAIRS_DOWN' | 'POINT';
    coordinates: GeoPoint; 
    radius: number; 
    description: string;
    icon?: string;
    floor?: number; 
}

export interface DungeonLayer {
    floorStart: number;
    floorEnd: number;
    name: string; 
    description: string;
    dangerLevel: string;
    landmarks: { floor: number, name: string, type: 'SAFE_ZONE' | 'BOSS' | 'POINT' }[];
}

export interface WorldMapConfig {
  width: number;
  height: number;
}

// Keep technical map data in English for compatibility with the map renderer
export interface WorldMapData {
    config: WorldMapConfig;
    factions: MapFaction[];
    territories: TerritoryData[];
    terrain: TerrainFeature[];
    routes: TradeRoute[];
    surfaceLocations: OrarioLocation[];
    dungeonStructure: DungeonLayer[];
    macroLocations?: MapMacroLocation[];
    midLocations?: MapMidLocation[];
    smallLocations?: MapSmallLocation[];
}

export interface DenatusState {
  下次神会开启时间: string;
  神会主题: string;
  讨论内容: { 角色: string; 对话: string }[];
  最终结果: string;
}

export interface NpcBackgroundTracking {
  NPC: string;
  当前行动: string;
  位置?: string;
  进度?: string;
  预计完成?: string;
}

export interface FactionTierState {
  S级: string[];
  A级: string[];
  B级至I级: string[];
  备注?: string;
}

export interface WarGameState {
  状态: '未开始' | '筹备' | '进行中' | '结束' | string;
  参战眷族: string[];
  形式: string;
  赌注: string;
  举办时间?: string;
  结束时间?: string;
  结果?: string;
  备注?: string;
}

// Refactor Business States to Chinese
export interface WorldState {
  异常指数: number; // tensionLevel
  头条新闻: string[]; // breakingNews
  街头传闻: { 主题: string; 传播度: number }[]; // activeRumors
  诸神神会: DenatusState;
  NPC后台跟踪: NpcBackgroundTracking[];
  派阀格局?: FactionTierState;
  战争游戏?: WarGameState;
  下次更新?: string; // nextUpdate
}

export interface FamiliaState {
  名称: string;
  等级: string; // Rank
  主神: string;
  资金: number;
  声望: number;
  设施状态: any;
  仓库: InventoryItem[]; 
}
