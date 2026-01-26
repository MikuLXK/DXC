
export type AIProvider = 'gemini' | 'openai' | 'deepseek' | 'custom';

export interface AIEndpointConfig {
  provider: AIProvider;
  baseUrl: string;
  apiKey: string;
  modelId: string;
  forceJsonOutput?: boolean;
}

export interface GlobalAISettings {
  mode: 'unified' | 'separate';
  unified: AIEndpointConfig;
  services: {
    social: AIEndpointConfig;
    world: AIEndpointConfig;
    npcSync: AIEndpointConfig;
    npcBrain: AIEndpointConfig;
  };
  nativeThinkingChain?: boolean;
}

export interface LogEntry {
  id: string;
  text: string;
  sender: string; 
  timestamp: number;
  turnIndex?: number; // 楼层号/回合数
  rawResponse?: string; // 原始 JSON 响应，用于编辑
  thinking?: string; // AI思考内容（<thinking>解析结果）
  snapshot?: string; // 状态快照 (JSON string of GameState BEFORE this log), 用于回滚
  isRaw?: boolean; // 标记是否为原始流式数据
  responseId?: string; // AI响应分组ID
  repairNote?: string; // 本地修复提示
  gameTime?: string; // NEW: 游戏内完整时间 "YYYY-MM-DD HH:MM"
}

export interface MemoryEntry {
    content: string;
    timestamp: string;
    turnIndex?: number; // Optional turn index for Short Term memory
}

export interface MemorySystem {
    // 游标：指向最后一条已被总结归档到短期记忆的日志索引。
    // 即时消息上下文将从 logs[lastLogIndex] 开始构建。
    lastLogIndex: number;

    // 即时消息：不再直接存储，而是通过 lastLogIndex 动态计算
    instant?: LogEntry[]; // Deprecated but kept for type safety in old code if needed
        
    // 短期记忆：每轮的总结概括
    shortTerm: MemoryEntry[]; 
    
    // 中期记忆：当短期记忆达到数量限制时，对短期记忆的总结
    mediumTerm: string[];  
    
    // 长期记忆：当中期记忆达到数量限制时，对中期记忆的总结
    longTerm: string[];    
}

export type PromptUsage = 'CORE' | 'START' | 'MEMORY_S2M' | 'MEMORY_M2L';

export interface PromptModule {
  id: string;
  name: string;
  group: string; // Group Name for UI grouping
  usage: PromptUsage; // Functional Role
  isActive: boolean;
  content: string;
  order: number; // Sorting order
}

export interface MemoryConfig {
    instantLimit: number; // Instant messages count before summary
    shortTermLimit: number;
    mediumTermLimit: number;
    longTermLimit: number;
}

// --- New Context Management Types (V2) ---

export type ContextModuleType = 
    'SYSTEM_PROMPTS' | 
    'PLAYER_DATA' | // Renamed from PLAYER_STATUS
    'MAP_CONTEXT' |
    'SOCIAL_CONTEXT' | // Nearby NPCs
    'MEMORY_CONTEXT' | 
    'COMMAND_HISTORY' | 
    'USER_INPUT' |
    'PHONE_CONTEXT' |
    'INVENTORY_CONTEXT' | // Merged Loot/Inventory
    'WORLD_CONTEXT' |
    'FAMILIA_CONTEXT' |
    'TASK_CONTEXT' | 
    'STORY_CONTEXT' | 
    'CONTRACT_CONTEXT' |
    'COMBAT_CONTEXT'; 

export interface ContextModuleConfig {
    id: string;
    type: ContextModuleType;
    name: string;
    enabled: boolean;
    order: number;
    // Dynamic params for customization
    params: {
        detailLevel?: 'low' | 'medium' | 'high' | 'raw';
        limit?: number; // e.g., last 10 messages
        includeAttributes?: string[]; // e.g. ['stats', 'appearance']
        [key: string]: any;
    };
}

export interface ContextConfig {
    modules: ContextModuleConfig[];
}

export interface AppSettings {
  backgroundImage: string;
  fontSize: 'small' | 'medium' | 'large';
  enableActionOptions: boolean; // NEW: Toggle for Action Suggestions
  enableStreaming: boolean; // NEW: Toggle for AI Streaming
  chatLogLimit?: number | null; // UI render limit, null for unlimited
  promptModules: PromptModule[];
  aiConfig: GlobalAISettings;
  memoryConfig: MemoryConfig;
  contextConfig: ContextConfig;
}

// --- Tavern Command Protocol ---
export interface TavernCommand {
    action: 'set' | 'add' | 'push' | 'delete'; // Removed update
    key: string;
    value: any;
}

// SIMPLIFIED: ActionOption is now just a string
export type ActionOption = string;

export interface AIResponse {
  logs: { sender: string; text: string }[]; // Logs carries ALL narrative and dialogue
  tavern_commands: TavernCommand[];
  action_options?: ActionOption[];
  shortTerm?: string; // NEW: Replaces 'summary'. Represents the memory entry for this turn.
  rawResponse?: string;
  thinking?: string; // AI思考内容（<thinking>解析结果）
  thinking_pre?: string; // 第一段思考
  thinking_post?: string; // 第二段思考
  narrative?: string; // Optional for legacy support
  repairNote?: string; // 本地修复提示
}
