
import { Screen, Difficulty } from './enums';
import { CharacterStats } from './character';
import { LogEntry, MemorySystem } from './ai';
import { InventoryItem } from './item';
import { Confidant, PhoneMessage, MomentPost } from './social';
import { WorldState, WorldMapData, GeoPoint, FamiliaState, NPCState } from './world';
import { Task, StoryState, Contract } from './story';
import { CombatState } from './combat';
import { Skill } from './character';

export interface RawGameData {
    [key: string]: any;
}

export interface GameState {
  当前界面: Screen;
  游戏难度: Difficulty;
  处理中: boolean;
  
  // 核心数据
  角色: CharacterStats;
  背包: InventoryItem[];
  日志: LogEntry[];
  
  // 环境信息
  游戏时间: string;
  当前日期: string; // YYYY-MM-DD
  当前地点: string;
  当前楼层: number;
  天气: string;
  
  // 坐标系统
  世界坐标: GeoPoint; 
  // 显示坐标 removed - derived from 世界坐标 in UI
  
  // 子系统
  战利品: InventoryItem[]; // 这里的"战利品"指代“战利品保管库(已归档)”
  公共战利品: InventoryItem[]; // NEW: 探索中的临时战利品背包
  战利品背负者: string; // NEW: 谁背着大包 (Player 或 支援者名字)

  社交: Confidant[];
  短信: PhoneMessage[];
  动态: MomentPost[];
  世界: WorldState;
  地图: WorldMapData;
  
  NPC状态: NPCState[];
  任务: Task[];
  技能: Skill[];
  剧情: StoryState;
  契约: Contract[];
  眷族: FamiliaState;
  
  // 核心机制
  记忆: MemorySystem;
  战斗: CombatState;
  回合数: number;
  
  [key: string]: any; 
  
  // Legacy / Archive
  historyArchive?: LogEntry[];
}

export interface SaveSlot {
    id: number | string;
    type: 'MANUAL' | 'AUTO';
    timestamp: number;
    summary: string;
    data: GameState;
    version?: string;
}
