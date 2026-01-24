
import { InventoryItem } from './item';

// --- Basic Geo Types ---
export interface GeoPoint {
    x: number;
    y: number;
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
    type: 'LANDMARK' | 'SHOP' | 'GUILD' | 'FAMILIA_HOME' | 'SLUM' | 'STREET' | 'DUNGEON_ENTRANCE' | 'SAFE_ZONE';
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

// Refactor Business States to Chinese
export interface WorldState {
  异常指数: number; // tensionLevel
  眷族声望: number; // publicOpinion
  头条新闻: string[]; // breakingNews
  街头传闻: { 主题: string; 传播度: number }[]; // activeRumors
  诸神神会: DenatusState;
  NPC后台跟踪: NpcBackgroundTracking[];
  下次更新?: string; // nextUpdate
}

export interface FamiliaState {
  名称: string;
  等级: string; // Rank
  主神: string;
  资金: number;
  设施状态: any;
  仓库: InventoryItem[]; 
}
