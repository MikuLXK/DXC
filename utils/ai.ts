
import { AppSettings, GameState, PromptModule, AIEndpointConfig, Confidant, MemoryEntry, LogEntry, AIResponse, ContextModuleConfig, InventoryItem, Task, MemoryConfig, PhoneMessage, MemorySystem, MomentPost, WorldMapData } from "../types";
import { GoogleGenAI } from "@google/genai";
import { 
    P_SYS_FORMAT, P_SYS_CORE, P_SYS_STATS, P_SYS_LEVELING, P_SYS_COMBAT,
    P_WORLD_DUNGEON, P_WORLD_PHONE, P_WORLD_ECO, P_DYN_NPC, P_NPC_MEMORY, P_WORLD_NEWS, P_WORLD_DENATUS, P_WORLD_RUMORS, P_DYN_MAP, P_MAP_DISCOVERY,
    P_COT_LOGIC, P_START_REQ, P_MEM_S2M, P_MEM_M2L, P_DATA_STRUCT,
    P_WRITING_REQ, P_WORLD_VALUES, P_LOOT_SYSTEM,
    P_PHYSIOLOGY_EASY, P_PHYSIOLOGY_NORMAL, P_PHYSIOLOGY_HARD, P_PHYSIOLOGY_HELL,
    P_DIFFICULTY_EASY, P_DIFFICULTY_NORMAL, P_DIFFICULTY_HARD, P_DIFFICULTY_HELL,
    P_ACTION_OPTIONS, P_FAMILIA_JOIN, P_STORY_GUIDE
} from "../prompts";
import { Difficulty } from "../types/enums";

// --- Default Configuration ---

export const DEFAULT_PROMPT_MODULES: PromptModule[] = [
    // 【系统设定】
    { id: 'sys_format', name: '1. 输出格式', group: '系统设定', usage: 'CORE', isActive: true, content: P_SYS_FORMAT, order: 1 },
    { id: 'sys_core', name: '2. 核心规则', group: '系统设定', usage: 'CORE', isActive: true, content: P_SYS_CORE, order: 2 },
    { id: 'sys_data_struct', name: '3. 数据格式', group: '系统设定', usage: 'CORE', isActive: true, content: P_DATA_STRUCT, order: 3 },
    { id: 'sys_writing', name: '4. 写作要求', group: '系统设定', usage: 'CORE', isActive: true, content: P_WRITING_REQ, order: 4 },
    
    // 【世界观设定】
    { id: 'world_dungeon_law', name: '1. 地下城绝对法则', group: '世界观设定', usage: 'CORE', isActive: true, content: P_WORLD_DUNGEON, order: 20 },
    { id: 'world_phone', name: '3. 魔石通讯终端', group: '世界观设定', usage: 'CORE', isActive: true, content: P_WORLD_PHONE, order: 22 },
    { id: 'world_eco_social', name: '4. 经济与社会', group: '世界观设定', usage: 'CORE', isActive: true, content: P_WORLD_ECO, order: 23 },
    { id: 'world_values', name: '5. 世界数值定义', group: '世界观设定', usage: 'CORE', isActive: true, content: P_WORLD_VALUES, order: 24 },
    { id: 'sys_stats', name: '6. 能力值与精神力', group: '世界观设定', usage: 'CORE', isActive: true, content: P_SYS_STATS, order: 25 },
    { id: 'sys_leveling', name: '7. 升级仪式', group: '世界观设定', usage: 'CORE', isActive: true, content: P_SYS_LEVELING, order: 26 },
    { id: 'sys_combat_law', name: '8. 战斗法则与死亡', group: '世界观设定', usage: 'CORE', isActive: true, content: P_SYS_COMBAT, order: 27 },
    { id: 'sys_loot', name: '9. 战利品管理', group: '世界观设定', usage: 'CORE', isActive: true, content: P_LOOT_SYSTEM, order: 28 },
    { id: 'sys_familia_join', name: '10. 眷族加入引导', group: '世界观设定', usage: 'CORE', isActive: true, content: P_FAMILIA_JOIN, order: 29 }, 
    
    // 【世界动态】
    { id: 'world_news', name: '1. 公会新闻生成', group: '世界动态', usage: 'CORE', isActive: true, content: P_WORLD_NEWS, order: 30 },
    { id: 'world_denatus', name: '2. 诸神神会', group: '世界动态', usage: 'CORE', isActive: true, content: P_WORLD_DENATUS, order: 31 },
    { id: 'world_rumors', name: '3. 街头传闻', group: '世界动态', usage: 'CORE', isActive: true, content: P_WORLD_RUMORS, order: 32 },
    { id: 'sys_story_guide', name: '4. 剧情导演', group: '世界动态', usage: 'CORE', isActive: true, content: P_STORY_GUIDE, order: 33 },

    // 【COT思维链】
    { id: 'cot_logic', name: '1. 核心思维链', group: 'COT思维链', usage: 'CORE', isActive: true, content: P_COT_LOGIC, order: 0 },
    
    // 【动态世界提示词】
    { id: 'dyn_npc_event', name: '1. 动态事件生成', group: '动态世界提示词', usage: 'CORE', isActive: true, content: P_DYN_NPC, order: 40 },
    { id: 'dyn_map_gen', name: '2. 地图动态绘制', group: '动态世界提示词', usage: 'CORE', isActive: true, content: P_DYN_MAP, order: 41 },
    { id: 'dyn_npc_mem', name: '3. NPC记忆更新', group: '动态世界提示词', usage: 'CORE', isActive: true, content: P_NPC_MEMORY, order: 42 }, 
    { id: 'dyn_map_discover', name: '4. 新地点发现', group: '动态世界提示词', usage: 'CORE', isActive: true, content: P_MAP_DISCOVERY, order: 43 },
    
    // 【开局提示词】
    { id: 'start_req', name: '1. 开局要求', group: '开局提示词', usage: 'START', isActive: true, content: P_START_REQ, order: 0 },
    
    // 【记忆配置】
    { id: 'mem_s2m', name: '1. 短转中 (S->M)', group: '记忆配置', usage: 'MEMORY_S2M', isActive: true, content: P_MEM_S2M, order: 90 },
    { id: 'mem_m2l', name: '2. 中转长 (M->L)', group: '记忆配置', usage: 'MEMORY_M2L', isActive: true, content: P_MEM_M2L, order: 91 },

    // 难度与生理系统 (默认禁用，动态开启)
    { id: 'diff_easy', name: 'Easy Mode', group: '难度系统', usage: 'CORE', isActive: false, content: P_DIFFICULTY_EASY, order: 100 },
    { id: 'diff_normal', name: 'Normal Mode', group: '难度系统', usage: 'CORE', isActive: false, content: P_DIFFICULTY_NORMAL, order: 100 },
    { id: 'diff_hard', name: 'Hard Mode', group: '难度系统', usage: 'CORE', isActive: false, content: P_DIFFICULTY_HARD, order: 100 },
    { id: 'diff_hell', name: 'Hell Mode', group: '难度系统', usage: 'CORE', isActive: false, content: P_DIFFICULTY_HELL, order: 100 },

    { id: 'phys_easy', name: 'Physiology Easy', group: '生理系统', usage: 'CORE', isActive: false, content: P_PHYSIOLOGY_EASY, order: 21 },
    { id: 'phys_normal', name: 'Physiology Normal', group: '生理系统', usage: 'CORE', isActive: false, content: P_PHYSIOLOGY_NORMAL, order: 21 },
    { id: 'phys_hard', name: 'Physiology Hard', group: '生理系统', usage: 'CORE', isActive: false, content: P_PHYSIOLOGY_HARD, order: 21 },
    { id: 'phys_hell', name: 'Physiology Hell', group: '生理系统', usage: 'CORE', isActive: false, content: P_PHYSIOLOGY_HELL, order: 21 },
];

export const DEFAULT_MEMORY_CONFIG: MemoryConfig = {
    instantLimit: 10, 
    shortTermLimit: 30,
    mediumTermLimit: 100,
    longTermLimit: 0 
};

/**
 * 社交与NPC上下文构建
 */
export const constructSocialContext = (confidants: Confidant[], params: any): string => {
    const specialMemoryDepth = typeof params.specialMemoryLimit === 'number' ? params.specialMemoryLimit : 10; 
    const normalMemoryDepth = typeof params.normalMemoryLimit === 'number' ? params.normalMemoryLimit : 30; 

    let contextOutput = "[社交与NPC状态 (Social & NPCs)]\n";
    contextOutput += "⚠️ 指令提示：修改NPC属性请用 `gameState.社交[Index].属性`。\n";

    const teammates: string[] = [];
    const focusChars: string[] = [];
    const presentChars: string[] = [];
    const absentChars: string[] = [];

    confidants.forEach((c, index) => {
        // 数据准备
        const formatMemories = (mems: any[]) => mems.map(m => `[${m.时间戳}] ${m.内容}`);
        
        const lastMemoriesRaw = c.记忆 ? c.记忆.slice(-normalMemoryDepth) : []; 
        const focusMemoriesRaw = c.记忆 ? c.记忆.slice(-specialMemoryDepth) : []; 
        
        const lastMemories = formatMemories(lastMemoriesRaw);
        const focusMemories = formatMemories(focusMemoriesRaw);
        
        const lastMem = c.记忆 && c.记忆.length > 0 ? c.记忆[c.记忆.length - 1] : { 内容: "无互动", 时间戳: "-" };

        const baseInfo = {
            索引: index, 姓名: c.姓名, 称号: c.称号, 
            性别: c.性别, 种族: c.种族, 眷族: c.眷族, 身份: c.身份,
            等级: c.等级, 好感度: c.好感度, 关系: c.关系状态,
            是否在场: c.是否在场, 坐标: c.坐标
        };

        if (c.是否队友) {
            const fullData = {
                ...baseInfo,
                简介: c.简介, 外貌: c.外貌,
                生存数值: c.生存数值 || "需生成",
                能力值: c.能力值 || "需生成",
                装备: c.装备 || "需生成",
                背包: c.背包 || [],
                最近记忆: focusMemories
            };
            teammates.push(JSON.stringify(fullData, null, 2));
        } else if (c.特别关注 || c.强制包含上下文) {
            const focusData = {
                ...baseInfo,
                简介: c.简介, 外貌: c.外貌, 背景: c.背景,
                位置详情: c.位置详情,
                当前行动: c.当前行动,
                最近记忆: focusMemories
            };
            focusChars.push(JSON.stringify(focusData));
        } else if (c.是否在场) {
            const presentData = {
                ...baseInfo,
                外貌: c.外貌,
                当前行动: c.当前行动,
                最近记忆: lastMemories
            };
            presentChars.push(JSON.stringify(presentData));
        } else {
            const summary = `[${index}] ${c.姓名}/${c.身份}/${c.种族} - 性别:${c.性别} - 最后记录:[${lastMem.时间戳}] ${lastMem.内容}`;
            absentChars.push(summary);
        }
    });

    if (teammates.length > 0) contextOutput += `\n>>> 【队友 (Teammates)】 (最优先):\n${teammates.join('\n')}\n`;
    if (focusChars.length > 0) contextOutput += `\n>>> 【特别关注/强制 (Focus)】:\n${focusChars.join('\n')}\n`;
    if (presentChars.length > 0) contextOutput += `\n>>> 【当前在场 (Present)】:\n${presentChars.join('\n')}\n`;
    if (absentChars.length > 0) contextOutput += `\n>>> 【其他已知 (Known)】:\n${absentChars.join('\n')}\n`;

    return contextOutput;
};

/**
 * 地图上下文 (Optimized: Raw Data based on Floor)
 */
export const constructMapContext = (gameState: GameState, params: any): string => {
    const floor = gameState.当前楼层 || 0;
    let output = `[地图环境 (Map Context)]\n`;
    output += `当前位置: ${gameState.当前地点} (Floor: ${floor})\n`;
    output += `坐标: X:${gameState.世界坐标?.x || 0} Y:${gameState.世界坐标?.y || 0}\n`;

    // Map Data extraction
    const mapData = gameState.地图;
    if (!mapData) return output + "(地图数据丢失)";

    if (floor === 0) {
        // Surface: Send Full Surface Locations & Routes (Raw Data)
        output += `【地表设施 (Surface)】:\n${JSON.stringify(mapData.surfaceLocations, null, 2)}\n`;
        output += `【主要道路 (Routes)】:\n${JSON.stringify(mapData.routes, null, 2)}`;
    } else {
        // Dungeon: Send Current Floor Locations & Layer Info
        const floorLocations = mapData.surfaceLocations.filter(l => l.floor === floor);
        const layerInfo = mapData.dungeonStructure?.find(l => floor >= l.floorStart && floor <= l.floorEnd);
        
        if (layerInfo) {
            output += `【区域信息 (Layer)】: ${JSON.stringify(layerInfo)}\n`;
        }
        
        if (floorLocations.length > 0) {
            output += `【已探明节点 (Nodes)】:\n${JSON.stringify(floorLocations, null, 2)}`;
        } else {
            output += `【未知区域】: 本层尚未探索，请根据 <地图动态绘制> 规则生成节点。`;
        }
    }
    return output;
};

/**
 * 任务上下文
 */
export const constructTaskContext = (tasks: Task[], params: any): string => {
    if (!tasks || tasks.length === 0) return "";
    
    const activeTasks = tasks.filter(t => t.状态 === 'active');
    const historyTasks = tasks.filter(t => t.状态 !== 'active');

    let output = "[任务列表 (Quest Log)]\n";
    
    if (activeTasks.length > 0) {
        output += `>>> 进行中:\n${JSON.stringify(activeTasks, null, 2)}\n`;
    }
    
    if (historyTasks.length > 0) {
        const compressed = historyTasks.map(t => {
            const lastLog = t.日志 && t.日志.length > 0 ? t.日志[t.日志.length - 1].内容 : "无记录";
            return { 标题: t.标题, 状态: t.状态, 评级: t.评级, 结案摘要: lastLog };
        });
        output += `>>> 历史记录:\n${JSON.stringify(compressed, null, 2)}`;
    }

    return output;
};

export const constructWorldContext = (world: any, params: any): string => {
    return `[世界动态 (World State)]\n` + 
           `异常指数: ${world.异常指数}\n` +
           `眷族声望: ${world.眷族声望}\n` +
           `头条新闻: ${JSON.stringify(world.头条新闻 || [])}\n` + 
           `街头传闻: ${JSON.stringify(world.街头传闻 || [])}\n` +
           `下次更新: ${world.下次更新 || "待定"}`;
};

export const constructPhoneContext = (messages: PhoneMessage[], moments: MomentPost[], params: any): string => {
    const limit = params?.messageLimit || 5;
    const recentMsgs = messages ? messages.slice(-limit) : [];
    const recentMoments = moments ? moments.slice(-3) : [];
    let output = "[手机通讯 (Phone)]\n";
    if (recentMsgs.length > 0) {
        output += "最新短信:\n" + recentMsgs.map(m => `- [${m.发送者}]: ${m.内容}`).join('\n') + "\n";
    }
    if (recentMoments.length > 0) {
        output += "最新动态:\n" + recentMoments.map(m => `- [${m.发布者}]: ${m.内容}`).join('\n');
    }
    return output.trim();
};

export const constructCombatContext = (combat: any, params: any): string => {
    if (!combat || !combat.是否战斗中) return "";
    return `[战斗状态 (Combat State)]\n敌方: ${combat.敌方 ? JSON.stringify(combat.敌方) : "Unknown"}\n战况记录: ${combat.战斗记录 ? combat.战斗记录.slice(-5).join(' | ') : ""}`;
};

export const constructMemoryContext = (memory: MemorySystem, logs: LogEntry[], config: MemoryConfig, params: any): string => {
    let output = "[记忆流 (Memory Stream)]\n";
    const instantTurnLimit = config.instantLimit || 10; // Number of turns
    const shortTermEntryLimit = config.shortTermLimit || 30; // Number of summaries
    
    // 1. Long Term (All)
    if (memory.longTerm?.length) {
        output += `【长期记忆 (Long Term)】:\n${memory.longTerm.join('\n')}\n\n`;
    }
    
    // 2. Medium Term (All)
    if (memory.mediumTerm?.length) {
        output += `【中期记忆 (Medium Term)】:\n${memory.mediumTerm.join('\n')}\n\n`;
    }

    // Determine Turn Cutoff for Instant vs Short Term
    // We want the last N turns to be Instant.
    // Get all unique turn indices from logs (assuming logs are sorted by time, or sort them)
    // Actually, simply scanning logs is safer.
    const allTurns = Array.from(new Set(logs.map(l => l.turnIndex || 0))).sort((a, b) => b - a);
    const activeInstantTurns = allTurns.slice(0, instantTurnLimit);
    // The cutoff is the smallest turn number in the active set. 
    // Anything smaller than this goes to Short Term Context.
    const minInstantTurn = activeInstantTurns.length > 0 ? activeInstantTurns[activeInstantTurns.length - 1] : 0;

    // 3. Short Term (Recent Summaries EXCLUDING Instant Turns)
    // Filter out summaries that correspond to the active instant turns (to avoid overlap)
    // We want the M summaries *before* minInstantTurn.
    const validShortTerms = memory.shortTerm
        .filter(m => (m.turnIndex || 0) < minInstantTurn)
        .slice(-shortTermEntryLimit); // Take the last M of the older turns
        
    if (validShortTerms.length > 0) {
        output += `【短期记忆 (Short Term Summary)】:\n${validShortTerms.map(m => `[Turn ${m.turnIndex}] ${m.content}`).join('\n')}\n\n`;
    }

    // 4. Instant Logs (Grouped by Turn)
    // Filter logs that belong to the active instant turns
    const instantLogs = logs.filter(l => (l.turnIndex || 0) >= minInstantTurn);
    
    if (instantLogs.length > 0) {
        output += `【即时剧情 (Instant Log - Recent ${activeInstantTurns.length} Turns)】:\n`;
        
        let currentTurn = -1;
        instantLogs.forEach(l => {
            const turn = l.turnIndex || 0;
            // Group header
            if (turn !== currentTurn) {
                currentTurn = turn;
                output += `\n[Turn ${currentTurn} | ${l.gameTime || '??:??'}]\n`;
            }
            output += `[${l.sender}]: ${l.text}\n`;
        });
    } else {
        output += "【即时剧情】: (暂无新消息)";
    }

    return output.trim();
};

export const constructInventoryContext = (inventory: InventoryItem[], loot: InventoryItem[], params: any): string => {
    let invContent = `[背包物品 (Inventory)]\n${JSON.stringify(inventory, null, 2)}\n\n[战利品保管库 (Loot Storage)]\n${JSON.stringify(loot, null, 2)}`;
    return invContent;
};

// --- Main Prompt Assembler ---

export const generateSingleModuleContext = (mod: ContextModuleConfig, gameState: GameState, settings: AppSettings, commandHistory: string[] = [], playerInput: string = ""): string => {
    switch(mod.type) {
        case 'SYSTEM_PROMPTS':
            // Recalculate system prompts based on settings & state
            const isStart = (gameState.回合数 || 1) <= 1; 
            const difficulty = gameState.游戏难度 || Difficulty.NORMAL;
            const hasFamilia = gameState.角色.所属眷族 && gameState.角色.所属眷族 !== '无' && gameState.角色.所属眷族 !== 'None';
            
            // Map Generation Check
            const currentFloor = gameState.当前楼层 || 0;
            const mapData = gameState.地图;
            // Check if map data exists for THIS floor
            const hasMapDataForFloor = currentFloor === 0 
                ? true 
                : mapData.surfaceLocations.some(l => l.floor === currentFloor);
            
            const activePromptModules = settings.promptModules.filter(m => {
                if (!m.isActive) {
                    // Difficulty / Physiology Logic
                    if (m.group === '难度系统' || m.group === '生理系统') {
                        if (m.id.includes(difficulty.toLowerCase().replace('normal', 'normal'))) return true;
                        return false;
                    }
                    // Dynamic Map Gen Logic: Enable if in dungeon AND no map data
                    if (m.id === 'dyn_map_gen') {
                        return (currentFloor > 0 && !hasMapDataForFloor); 
                    }
                    // Dynamic Map Discovery: Always enabled if core is enabled, but good to have explicit check
                    if (m.id === 'dyn_map_discover') return true; 

                    return false;
                }
                
                if (m.id === 'sys_familia_join' && hasFamilia) return false;
                if (m.usage === 'CORE') return true;
                if (m.usage === 'START' && isStart) return true;
                return false;
            });
            
            const sorted = [...activePromptModules].sort((a, b) => a.order - b.order);
            let content = sorted.map(m => m.content).join('\n\n');
            if (settings.enableActionOptions) content += "\n\n" + P_ACTION_OPTIONS;
            return content;

        case 'WORLD_CONTEXT':
            let worldContent = `[当前世界时间 (World Clock)]\n${gameState.当前日期} ${gameState.游戏时间}\n\n`;
            worldContent += constructWorldContext(gameState.世界, mod.params);
            return worldContent;

        case 'PLAYER_DATA':
            // Optimization: Remove heavy avatar base64 data from context
            const { 头像, ...cleanPlayerData } = gameState.角色;
            return `[玩家数据 (Player Data)]\n${JSON.stringify(cleanPlayerData, null, 2)}`;
        case 'MAP_CONTEXT':
            return constructMapContext(gameState, mod.params);
        case 'SOCIAL_CONTEXT':
            return constructSocialContext(gameState.社交, mod.params);
        case 'INVENTORY_CONTEXT':
            let inv = constructInventoryContext(gameState.背包, gameState.战利品, mod.params);
            if (gameState.公共战利品 && gameState.公共战利品.length > 0) {
                inv += `\n\n[公共战利品背包 (Public Loot - Carrier: ${gameState.战利品背负者 || 'Unknown'})]\n${JSON.stringify(gameState.公共战利品, null, 2)}`;
            }
            return inv;
        case 'PHONE_CONTEXT':
            return constructPhoneContext(gameState.短信, gameState.动态, mod.params);
        case 'TASK_CONTEXT':
            return constructTaskContext(gameState.任务, mod.params);
        case 'FAMILIA_CONTEXT':
            return `[眷族 (Familia)]\n${JSON.stringify(gameState.眷族, null, 2)}`;
        case 'STORY_CONTEXT':
            return `[剧情进度 (Story Progress)]\n${JSON.stringify(gameState.剧情, null, 2)}`;
        case 'CONTRACT_CONTEXT':
            return `[契约 (Contracts)]\n${JSON.stringify(gameState.契约, null, 2)}`;
        case 'COMBAT_CONTEXT': 
            return constructCombatContext(gameState.战斗, mod.params);
        case 'MEMORY_CONTEXT':
            return constructMemoryContext(gameState.记忆, gameState.日志, settings.memoryConfig || DEFAULT_MEMORY_CONFIG, mod.params);
        case 'COMMAND_HISTORY':
            return commandHistory.length > 0 ? `[指令历史]\n${commandHistory.join('\n')}` : "[指令历史] (Empty)";
        case 'USER_INPUT':
            return `\n[玩家输入]\n"${playerInput}"`;
        default:
            return "";
    }
};

export const assembleFullPrompt = (
    playerInput: string,
    gameState: GameState,
    settings: AppSettings,
    commandHistory: string[] = []
): string => {
    const contextModules = settings.contextConfig?.modules || [];
    let fullContent = "";
    
    const sortedContextModules = [...contextModules]
        .filter(m => m.enabled)
        .sort((a, b) => a.order - b.order);

    sortedContextModules.forEach(mod => {
        const modContent = generateSingleModuleContext(mod, gameState, settings, commandHistory, playerInput);
        if (modContent) {
            fullContent += modContent + "\n\n";
        }
    });

    return fullContent.trim();
};

export const dispatchAIRequest = async (
    config: AIEndpointConfig, 
    systemPrompt: string, 
    userContent: string, 
    onStream?: (chunk: string) => void
): Promise<string> => {
    if (!config.apiKey) throw new Error(`Missing API Key for ${config.provider}`);

    if (config.provider === 'gemini') {
        const ai = new GoogleGenAI({ apiKey: config.apiKey });
        const modelId = config.modelId || 'gemini-3-flash-preview';
        
        try {
            const responseStream = await ai.models.generateContentStream({
                model: modelId,
                contents: [
                    { role: 'user', parts: [{ text: systemPrompt + "\n\n" + userContent }] }
                ],
                config: { responseMimeType: "application/json" }
            });

            let fullText = "";
            for await (const chunk of responseStream) {
                const text = chunk.text;
                if (text) {
                    fullText += text;
                    if (onStream) onStream(fullText);
                }
            }
            if (!fullText) return "{}";
            return fullText;
        } catch (e: any) { 
            throw new Error(`Gemini Error: ${e.message}`); 
        }
    } else if (config.provider === 'openai' || config.provider === 'deepseek' || config.provider === 'custom') {
        let baseUrl = config.baseUrl;
        if (config.provider === 'deepseek') baseUrl = 'https://api.deepseek.com';
        else if (config.provider === 'openai') baseUrl = 'https://api.openai.com/v1';
        baseUrl = baseUrl.replace(/\/$/, "");
        const model = config.modelId || 'gpt-4o-mini';

        try {
            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }],
                    response_format: { type: "json_object" },
                    stream: true
                })
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`API Error ${response.status}: ${err}`);
            }
            if (!response.body) throw new Error("No response body");
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let fullText = "";
            let buffer = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                const lines = buffer.split('\n');
                buffer = lines.pop() || ""; 
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(trimmed.slice(6));
                            const content = data.choices[0]?.delta?.content || "";
                            fullText += content;
                            if (onStream) onStream(fullText);
                        } catch (e) {}
                    }
                }
            }
            if (!fullText) return "{}";
            return fullText;
        } catch (e: any) {
            throw new Error(`${config.provider} Error: ${e.message}`);
        }
    }
    throw new Error(`Unknown provider`);
};

export const generateMemorySummary = async (
    logsToSummarize: LogEntry[], 
    type: 'S2M' | 'M2L', 
    settings: AppSettings
): Promise<string> => {
    const promptTemplate = type === 'S2M' ? P_MEM_S2M : P_MEM_M2L;
    const content = logsToSummarize.map(l => {
        // @ts-ignore
        if (l.text) return `[${l.sender}]: ${l.text}`;
        // @ts-ignore
        if (l.content) return l.content;
        return "";
    }).join('\n');

    try {
        const raw = await dispatchAIRequest(
            settings.aiConfig.unified, 
            "你是一个专业的记录员。请根据以下要求进行总结。",
            `${promptTemplate}\n\n【待总结内容】:\n${content}`
        );
        try {
            const parsed = JSON.parse(raw);
            return parsed.summary || parsed.content || raw; 
        } catch {
            return raw;
        }
    } catch (e) {
        console.error("Summary Failed", e);
        return "总结失败。";
    }
};

export const generateDungeonMasterResponse = async (
    input: string,
    gameState: GameState,
    settings: AppSettings,
    exitsStr: string,
    commandsOverride: string[],
    onStream?: (chunk: string) => void
): Promise<AIResponse> => {
    const systemPrompt = assembleFullPrompt(input, gameState, settings, commandsOverride);
    const userContent = `Player Input: "${input}"\nPlease respond in JSON format as defined in system prompt.`;

    try {
        const streamCallback = settings.enableStreaming ? onStream : undefined;
        const rawText = await dispatchAIRequest(settings.aiConfig.unified, systemPrompt, userContent, streamCallback);

        if (!rawText || !rawText.trim()) throw new Error("AI returned empty response.");

        // Robust JSON extraction
        let cleanJson = rawText.trim();
        
        // 1. Try regex to match outermost braces
        // Find the FIRST '{' and the LAST '}'
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        } else {
            // Fallback: Remove markdown blocks if regex failed
            if (cleanJson.includes('```json')) cleanJson = cleanJson.split('```json')[1].split('```')[0];
            else if (cleanJson.includes('```')) cleanJson = cleanJson.split('```')[1].split('```')[0];
        }

        const parsed = JSON.parse(cleanJson);
        return { ...parsed, rawResponse: rawText };
    } catch (error: any) {
        console.error("AI Generation Error", error);
        return {
            tavern_commands: [],
            logs: [{ sender: "system", text: `(系统错误: ${error.message})\nRaw: ${error.rawText || 'N/A'}` }],
            shortTerm: "Error occurred.", 
            rawResponse: error.message
        };
    }
};
