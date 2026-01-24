
import { useState, useEffect, useRef } from 'react';
import { GameState, AppSettings, LogEntry, InventoryItem, TavernCommand, ActionOption, PhoneMessage, Confidant, MemorySystem, SaveSlot, Task, ContextModuleConfig } from '../types';
import { createNewGameState } from '../utils/dataMapper';
import { generateDungeonMasterResponse, DEFAULT_PROMPT_MODULES, DEFAULT_MEMORY_CONFIG, dispatchAIRequest, generateMemorySummary } from '../utils/ai';
import { P_MEM_S2M, P_MEM_M2L } from '../prompts';
import { Difficulty } from '../types/enums';

interface CommandItem {
    id: string;
    text: string;
    undoAction?: () => void;
    dedupeKey?: string; 
}

const DEFAULT_AI_CONFIG = {
    provider: 'gemini' as const,
    baseUrl: 'https://generativelanguage.googleapis.com',
    apiKey: '',
    modelId: 'gemini-3-flash-preview'
};

const DEFAULT_CONTEXT_MODULES: ContextModuleConfig[] = [
    { id: 'm_sys', type: 'SYSTEM_PROMPTS', name: '系统核心设定', enabled: true, order: 0, params: {} },
    { id: 'm_world', type: 'WORLD_CONTEXT', name: '世界动态', enabled: true, order: 1, params: {} },
    { id: 'm_map', type: 'MAP_CONTEXT', name: '地图环境', enabled: true, order: 2, params: { detailLevel: 'medium' } },
    { id: 'm_player', type: 'PLAYER_DATA', name: '玩家数据', enabled: true, order: 3, params: {} },
    { id: 'm_social', type: 'SOCIAL_CONTEXT', name: '周边NPC', enabled: true, order: 4, params: { includeAttributes: ['appearance', 'status'], specialMemoryLimit: 5, normalMemoryLimit: 30 } },
    { id: 'm_inv', type: 'INVENTORY_CONTEXT', name: '背包/战利品', enabled: true, order: 5, params: { detailLevel: 'medium' } },
    { id: 'm_phone', type: 'PHONE_CONTEXT', name: '手机/消息', enabled: true, order: 6, params: { messageLimit: 5 } },
    { id: 'm_combat', type: 'COMBAT_CONTEXT', name: '战斗数据', enabled: true, order: 6, params: {} }, 
    { id: 'm_task', type: 'TASK_CONTEXT', name: '任务列表', enabled: true, order: 7, params: {} },
    { id: 'm_story', type: 'STORY_CONTEXT', name: '剧情进度', enabled: true, order: 8, params: {} },
    { id: 'm_mem', type: 'MEMORY_CONTEXT', name: '记忆流', enabled: true, order: 9, params: {} },
    { id: 'm_hist', type: 'COMMAND_HISTORY', name: '指令历史', enabled: true, order: 10, params: {} },
    { id: 'm_input', type: 'USER_INPUT', name: '玩家输入', enabled: true, order: 11, params: {} },
];

const DEFAULT_SETTINGS: AppSettings = {
    backgroundImage: '',
    fontSize: 'medium',
    enableActionOptions: true,
    enableStreaming: true,
    promptModules: DEFAULT_PROMPT_MODULES,
    memoryConfig: DEFAULT_MEMORY_CONFIG,
    contextConfig: { modules: DEFAULT_CONTEXT_MODULES },
    aiConfig: {
        mode: 'unified',
        unified: { ...DEFAULT_AI_CONFIG },
        services: {
            social: { ...DEFAULT_AI_CONFIG },
            world: { ...DEFAULT_AI_CONFIG },
            npcSync: { ...DEFAULT_AI_CONFIG },
            npcBrain: { ...DEFAULT_AI_CONFIG },
        }
    }
};

const generateNextId = (prefix: string, list: any[]): string => {
    let shortPrefix = prefix;
    if (prefix === 'Inventory' || prefix === 'Item') shortPrefix = 'Itm';
    if (prefix === 'Equipment' || prefix === 'Equip') shortPrefix = 'Eq';
    if (prefix === 'Character' || prefix === 'NPC') shortPrefix = 'Char';
    if (prefix === 'Task') shortPrefix = 'Tsk';
    
    let maxId = 0;
    const regex = new RegExp(`^${shortPrefix}(\\d+)$`);
    list.forEach(item => {
        if (item.id && typeof item.id === 'string') {
            const match = item.id.match(regex);
            if (match) {
                const num = parseInt(match[1], 10);
                if (!isNaN(num) && num > maxId) maxId = num;
            }
        }
    });
    return `${shortPrefix}${(maxId + 1).toString().padStart(3, '0')}`;
};

const generateLegacyId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

const createStorageSnapshot = (state: GameState): GameState => {
    // Deep clone to ensure all nested objects like Map, Memory, Loot are preserved
    const copy = JSON.parse(JSON.stringify(state));
    
    // Clean logs to save space
    if (copy.日志) {
        copy.日志 = copy.日志.map((l: any) => {
            const { snapshot, rawResponse, ...cleanLog } = l;
            return cleanLog as LogEntry;
        });
    }
    
    // Ensure all critical subsections exist
    if (!copy.地图) copy.地图 = state.地图; // Fallback if deep clone missed something weird (unlikely with JSON.parse)
    if (!copy.战利品) copy.战利品 = [];
    if (!copy.记忆) copy.记忆 = { lastLogIndex: 0, instant: [], shortTerm: [], mediumTerm: [], longTerm: [] };

    return copy;
};

export const useGameLogic = (initialState?: GameState, onExitCb?: () => void) => {
    const [gameState, setGameState] = useState<GameState>(() => {
        if (initialState) {
            // Migration
            if (typeof initialState.记忆.lastLogIndex !== 'number') {
                initialState.记忆.lastLogIndex = Math.max(0, initialState.日志.length - 10);
            }
            return initialState;
        }
        return createNewGameState("Adventurer", "Male", "Human");
    });

    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [commandQueue, setCommandQueue] = useState<CommandItem[]>([]);
    const [currentOptions, setCurrentOptions] = useState<ActionOption[]>([]);
    const [lastAIResponse, setLastAIResponse] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [draftInput, setDraftInput] = useState<string>('');
    const [snapshotState, setSnapshotState] = useState<GameState | null>(null);

    useEffect(() => {
        const savedSettings = localStorage.getItem('danmachi_settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            } catch(e) { console.warn("Settings corrupted"); }
        }
    }, []);

    useEffect(() => {
        if (!gameState.游戏难度) return;
        setSettings(prev => {
            const currentDiff = gameState.游戏难度 || Difficulty.NORMAL;
            let hasChanged = false;
            const newPromptModules = prev.promptModules.map(mod => {
                let shouldBeActive = mod.isActive;
                if (mod.group === '难度系统') {
                    if (currentDiff === Difficulty.EASY && mod.id === 'diff_easy') shouldBeActive = true;
                    else if (currentDiff === Difficulty.NORMAL && mod.id === 'diff_normal') shouldBeActive = true;
                    else if (currentDiff === Difficulty.HARD && mod.id === 'diff_hard') shouldBeActive = true;
                    else if (currentDiff === Difficulty.HELL && mod.id === 'diff_hell') shouldBeActive = true;
                    else shouldBeActive = false;
                }
                if (mod.group === '生理系统') {
                    if (currentDiff === Difficulty.EASY && mod.id === 'phys_easy') shouldBeActive = true;
                    else if (currentDiff === Difficulty.NORMAL && mod.id === 'phys_normal') shouldBeActive = true;
                    else if (currentDiff === Difficulty.HARD && mod.id === 'phys_hard') shouldBeActive = true;
                    else if (currentDiff === Difficulty.HELL && mod.id === 'phys_hell') shouldBeActive = true;
                    else shouldBeActive = false;
                }
                if (shouldBeActive !== mod.isActive) {
                    hasChanged = true;
                    return { ...mod, isActive: shouldBeActive };
                }
                return mod;
            });
            if (hasChanged) return { ...prev, promptModules: newPromptModules };
            return prev;
        });
    }, [gameState.游戏难度]);

    useEffect(() => {
        if (gameState.回合数 > 1) {
            const slotNum = ((gameState.回合数 - 1) % 3) + 1;
            const saveKey = `danmachi_save_auto_${slotNum}`;
            const optimizedState = createStorageSnapshot(gameState);
            const saveData: SaveSlot = {
                id: `auto_${slotNum}`,
                type: 'AUTO',
                timestamp: Date.now(),
                summary: `AUTO: Lv.${optimizedState.角色.等级} ${optimizedState.当前地点}`,
                data: optimizedState,
                version: '3.0'
            };
            try {
                localStorage.setItem(saveKey, JSON.stringify(saveData));
            } catch (e) { console.error("Auto-save quota exceeded", e); }
        }
    }, [gameState.回合数, gameState.当前地点]);

    const manualSave = (slotId: number | string) => {
        const saveKey = `danmachi_save_manual_${slotId}`;
        const optimizedState = createStorageSnapshot(gameState);
        const saveData: SaveSlot = {
            id: slotId,
            type: 'MANUAL',
            timestamp: Date.now(),
            summary: `MANUAL: Lv.${optimizedState.角色.等级} ${optimizedState.当前地点} ${optimizedState.游戏时间}`,
            data: optimizedState,
            version: '3.0'
        };
        try {
            localStorage.setItem(saveKey, JSON.stringify(saveData));
            console.log(`Saved to ${saveKey}`);
        } catch (e) { alert("保存失败：本地存储空间不足"); }
    };

    const loadGame = (slotId: number | string) => {
        let targetKey = `danmachi_save_manual_${slotId}`;
        if (String(slotId).startsWith('auto')) targetKey = `danmachi_save_${slotId}`;
        const raw = localStorage.getItem(targetKey);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                const state = parsed.data || parsed;
                setGameState(state);
            } catch(e) { console.error("Load failed", e); }
        }
    };

    const updateStateByPath = (state: any, path: string, value: any, action: string): { success: boolean, error?: string } => {
        let cleanPath = path.startsWith('gameState.') ? path.replace('gameState.', '') : path;
        cleanPath = cleanPath.replace(/^character\./, '角色.');
        cleanPath = cleanPath.replace(/^inventory\./, '背包.');
        cleanPath = cleanPath.replace(/^confidants\./, '社交.');
        cleanPath = cleanPath.replace(/^time/, '游戏时间');
        cleanPath = cleanPath.replace(/^location/, '当前地点');
        const normalizedPath = cleanPath.replace(/\[(\d+)\]/g, '.$1');
        const parts = normalizedPath.split('.');
        let current = state;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (current[part] === undefined || current[part] === null) return { success: false, error: `Invalid path: '${part}' in '${cleanPath}'` };
            current = current[part];
        }
        const lastKey = parts[parts.length - 1];
        try {
            if (action === 'set') current[lastKey] = value;
            else if (action === 'add') {
                const oldVal = current[lastKey] || 0;
                if (typeof oldVal === 'number') current[lastKey] = oldVal + (typeof value === 'number' ? value : parseFloat(value) || 0);
            } else if (action === 'push') {
                if (!Array.isArray(current[lastKey])) {
                    if (current[lastKey] === undefined) current[lastKey] = [];
                    else return { success: false, error: `Target '${lastKey}' is not array` };
                }
                if (lastKey === '背包' || path.includes('inventory') || lastKey === '公共战利品') {
                    const newItem = value as InventoryItem;
                    const compItem: InventoryItem = { ...newItem, id: newItem.id, 名称: newItem.名称, 描述: newItem.描述, 数量: newItem.数量 || 1, 类型: newItem.类型 || 'loot' };
                    const existingIdx = current[lastKey].findIndex((i: InventoryItem) => i.名称 === compItem.名称);
                    if (existingIdx >= 0) current[lastKey][existingIdx].数量 += (compItem.数量 || 1);
                    else {
                        if(!compItem.id) compItem.id = generateNextId("Item", current[lastKey]);
                        current[lastKey].push(compItem);
                    }
                } else current[lastKey].push(value);
            } else if (action === 'delete') {
               if (Array.isArray(current) && !isNaN(parseInt(lastKey))) current.splice(parseInt(lastKey), 1);
               else delete current[lastKey];
            }
            return { success: true };
        } catch (e: any) { return { success: false, error: e.message }; }
    };

    const processTavernCommands = (state: GameState, commands: TavernCommand[]): { newState: GameState, logs: LogEntry[] } => {
        let nextState = JSON.parse(JSON.stringify(state)); 
        const systemLogs: LogEntry[] = [];
        if (Array.isArray(commands)) {
            commands.forEach(cmd => {
                try { updateStateByPath(nextState, cmd.key, cmd.value, cmd.action); } catch (e) { console.warn(`Command failed: ${cmd?.action} ${cmd?.key}`, e); }
            });
        }
        if (state.战斗.是否战斗中 && !nextState.战斗.是否战斗中) {
            nextState.战斗.敌方 = null;
            nextState.战斗.战斗记录 = [];
        }
        return { newState: nextState, logs: systemLogs };
    };

    // Refactored Compression: Only Short -> Medium -> Long
    const compressMemory = async (currentState: GameState): Promise<GameState> => {
        const memory = { ...currentState.记忆 };
        const config = settings.memoryConfig;
        
        const instantLimit = config.instantLimit || 10;
        const shortTermLimit = config.shortTermLimit || 30;
        const mediumTermLimit = config.mediumTermLimit || 100;

        // Buffer = Short Limit + Instant Limit (because Instant Turns also produce ShortTerm entries kept in reserve)
        const safetyBuffer = instantLimit; 
        const maxShortTermLength = shortTermLimit + safetyBuffer;

        let hasUpdates = false;

        // --- Step 1: Compress Short -> Medium Term ---
        if (memory.shortTerm.length > maxShortTermLength) {
            // Compress the excess old entries
            // Calculate how many to compress. We want to be back at shortTermLimit.
            // But we actually need to keep 'safetyBuffer' too? No, shortTermLimit implies "Visible Short Term".
            // The buffer is just "invisible short term that corresponds to Instant logs".
            // So if total > M+N, we compress.
            const overflowCount = memory.shortTerm.length - maxShortTermLength;
            // Batch at least 5 items for meaningful summary, or just overflow
            const batchSize = Math.max(overflowCount, 5); 
            
            const chunkToCompress = memory.shortTerm.slice(0, batchSize);
            setLastAIResponse(`(System: Compressing Short Term Memories to Medium Term...)`);
            
            const fakeLogs = chunkToCompress.map(m => ({ 
                text: m.content, 
                sender: 'Memory', 
                id: '', 
                timestamp: 0 
            } as LogEntry));
            
            const summaryText = await generateMemorySummary(fakeLogs, 'S2M', settings);
            memory.mediumTerm.push(summaryText);
            
            // Remove the compressed entries
            memory.shortTerm = memory.shortTerm.slice(batchSize);
            hasUpdates = true;
        }

        // --- Step 2: Compress Medium -> Long Term ---
        if (memory.mediumTerm.length > mediumTermLimit) {
            const batchSize = 5; 
            const chunkToCompress = memory.mediumTerm.slice(0, batchSize);
            setLastAIResponse(`(System: Archiving Medium Term Memories...)`);
            const fakeLogs = chunkToCompress.map(m => ({ text: m, sender: 'Memory', id: '', timestamp: 0 } as LogEntry));
            const summaryText = await generateMemorySummary(fakeLogs, 'M2L', settings);
            memory.longTerm.push(summaryText);
            memory.mediumTerm = memory.mediumTerm.slice(batchSize);
            hasUpdates = true;
        }

        if (hasUpdates) {
            return { ...currentState, 记忆: memory };
        }
        return currentState;
    };

    const handleAIInteraction = async (input: string, contextType: 'ACTION'|'PHONE'='ACTION', commandsOverride?: string[], stateOverride?: GameState) => {
        if (!stateOverride) setSnapshotState(JSON.parse(JSON.stringify(gameState)));
        const baseState = stateOverride || gameState;
        const turnIndex = (baseState.回合数 || 1);
        
        setIsProcessing(true);
        setLastAIResponse('');
        if (settings.enableStreaming) setIsStreaming(true);
        
        const newUserLog: LogEntry = { 
            id: generateLegacyId(), 
            text: input, 
            sender: 'player', 
            timestamp: Date.now(), 
            turnIndex: turnIndex, 
            snapshot: JSON.stringify(createStorageSnapshot(baseState)), 
            gameTime: baseState.游戏时间 
        };

        const stateWithUserLog = { 
            ...baseState, 
            日志: [...baseState.日志, newUserLog],
            处理中: true 
        };

        setGameState(stateWithUserLog);
        
        try {
            // Run memory compression (Short->Medium, etc) BEFORE sending to AI
            const compressedState = await compressMemory(stateWithUserLog);
            if (compressedState !== stateWithUserLog) {
                setGameState(compressedState);
            }

            const onStreamChunk = (chunk: string) => setLastAIResponse(chunk);

            const aiResponse = await generateDungeonMasterResponse(
                input, 
                compressedState, 
                settings, 
                "", 
                commandsOverride || [],
                onStreamChunk
            );
            
            setGameState(prev => {
                if (aiResponse.rawResponse) setLastAIResponse(aiResponse.rawResponse);
                if (aiResponse.action_options) setCurrentOptions(aiResponse.action_options || []);

                const commands = Array.isArray(aiResponse.tavern_commands) ? aiResponse.tavern_commands : [];
                let logs = Array.isArray(aiResponse.logs) ? aiResponse.logs : [];
                const narrative = aiResponse.narrative || "";
                
                if (logs.length === 0 && !narrative && aiResponse.rawResponse) {
                    logs = [{ sender: "system", text: `(数据解析异常，原始响应):\n${aiResponse.rawResponse}` }];
                }

                const { newState } = processTavernCommands(prev, commands);
                const newLogs: LogEntry[] = [];
                const aiLogGameTime = newState.游戏时间;

                // 1-to-1 Mapping: AI generates shortTerm summary for THIS turn
                if (aiResponse.shortTerm) {
                    if (!newState.记忆.shortTerm) newState.记忆.shortTerm = [];
                    newState.记忆.shortTerm.push({
                        content: aiResponse.shortTerm,
                        timestamp: aiLogGameTime,
                        turnIndex: turnIndex
                    });
                } else {
                    // Fallback: Use logs summary if AI forgot to generate shortTerm
                    const fallbackSummary = logs.map(l => l.text).join(' ').substring(0, 100) + "...";
                    newState.记忆.shortTerm.push({
                        content: `[Auto-Gen] ${fallbackSummary}`,
                        timestamp: aiLogGameTime,
                        turnIndex: turnIndex
                    });
                }

                if (logs.length > 0) {
                    logs.forEach((l, idx) => {
                        let sender = l.sender;
                        if (sender === 'narrative' || sender === '旁白' || sender === 'narrator') sender = '旁白';
                        
                        const rawData = idx === 0 ? aiResponse.rawResponse : undefined;

                        newLogs.push({ 
                            id: generateLegacyId(), 
                            text: l.text, 
                            sender: sender, 
                            timestamp: Date.now() + idx, 
                            turnIndex, 
                            gameTime: aiLogGameTime,
                            rawResponse: rawData
                        });
                    });
                } else if (narrative) {
                     newLogs.push({ 
                         id: generateLegacyId(), 
                         text: narrative, 
                         sender: '旁白', 
                         timestamp: Date.now(), 
                         turnIndex, 
                         gameTime: aiLogGameTime,
                         rawResponse: aiResponse.rawResponse 
                     });
                }
                
                newState.日志 = [...newState.日志, ...newLogs];
                newState.处理中 = false;
                newState.回合数 = (prev.回合数 || 1) + 1;
                return newState;
            });
        } catch (error: any) {
            console.error("Interaction failed:", error);
            setGameState(prev => ({ 
                ...prev, 
                处理中: false, 
                日志: [...prev.日志, { id: generateLegacyId(), text: `Error: ${error.message}`, sender: 'system', timestamp: Date.now() }] 
            }));
        } finally {
            setIsProcessing(false);
            setIsStreaming(false);
        }
    };

    const updateConfidant = (id: string, updates: Partial<Confidant>) => {
        setGameState(prev => ({ ...prev, 社交: prev.社交.map(c => c.id === id ? { ...c, ...updates } : c) }));
    };
    const updateMemory = (newMem: MemorySystem) => setGameState(prev => ({ ...prev, 记忆: newMem }));
    const addToQueue = (cmd: string) => setCommandQueue(prev => [...prev, { id: Date.now().toString(), text: cmd }]); 
    const removeFromQueue = (id: string) => setCommandQueue(prev => prev.filter(c => c.id !== id));
    const stopInteraction = () => { setIsProcessing(false); setIsStreaming(false); };
    const handleSendMessage = (text: string, channel: 'private'|'group' = 'private', target?: string) => {
        let fullText = text;
        if (channel === 'group' && target) fullText = `[群聊: ${target}] ${text}`;
        else if (channel === 'private' && target && target !== 'Player') fullText = `[私信: ${target}] ${text}`;
        handleAIInteraction(fullText, 'PHONE');
    };
    const handlePlayerAction = (action: 'attack' | 'skill' | 'guard' | 'escape' | 'talk' | 'item', payload?: any) => {
        if (isProcessing) return;
        let input = "";
        switch (action) {
            case 'attack': input = "我发起攻击。"; break;
            case 'guard': input = "我采取防御姿态。"; break;
            case 'escape': input = "我尝试逃跑！"; break;
            case 'talk': input = `(自由行动) ${payload}`; break;
            case 'skill': input = `我使用技能【${payload?.名称 || 'Unknown'}】。`; break;
            case 'item': input = `我使用道具【${payload?.名称 || 'Unknown'}】。`; break;
        }
        if (input) handleAIInteraction(input, 'ACTION');
    };
    const saveSettings = (newSettings: AppSettings) => { setSettings(newSettings); localStorage.setItem('danmachi_settings', JSON.stringify(newSettings)); };
    const handleReroll = () => {
        if (isProcessing) return;
        const logs = gameState.日志;
        if (logs.length === 0) return;
        let lastPlayerIndex = -1;
        for (let i = logs.length - 1; i >= 0; i--) { if (logs[i].sender === 'player') { lastPlayerIndex = i; break; } }
        if (lastPlayerIndex === -1) return;
        const lastLog = logs[lastPlayerIndex];
        let stateToUse = gameState;
        if (lastLog.snapshot) { try { stateToUse = JSON.parse(lastLog.snapshot); } catch (e) { stateToUse = { ...gameState, 日志: logs.slice(0, lastPlayerIndex) }; } }
        else { stateToUse = { ...gameState, 日志: logs.slice(0, lastPlayerIndex) }; }
        handleAIInteraction(lastLog.text, 'ACTION', [], stateToUse);
    };
    const handleEditLog = (logId: string, newRawResponse: string) => setGameState(prev => ({ ...prev, 日志: prev.日志.map(l => l.id === logId ? { ...l, rawResponse: newRawResponse } : l) }));
    const handleDeleteLog = (logId: string) => setGameState(prev => ({ ...prev, 日志: prev.日志.filter(l => l.id !== logId) }));
    const handleUpdateLogText = (logId: string, newText: string) => setGameState(prev => ({ ...prev, 日志: prev.日志.map(l => l.id === logId ? { ...l, text: newText } : l) }));
    const handleEditUserLog = handleUpdateLogText;
    const handleUserRewrite = (logId: string, newText: string) => {
        const log = gameState.日志.find(l => l.id === logId);
        if (!log || !log.snapshot) { alert("无法回溯此节点 (缺少快照)"); return; }
        try {
            const restoredState = JSON.parse(log.snapshot);
            handleAIInteraction(newText, 'ACTION', [], restoredState);
        } catch (e) { console.error("Rewrite failed", e); }
    };
    const handleDeleteTask = (taskId: string) => {
        setGameState(prev => ({ ...prev, 任务: prev.任务.filter(t => t.id !== taskId) }));
    };

    return {
        gameState, setGameState, settings, setSettings,
        commandQueue, addToQueue, removeFromQueue, currentOptions, lastAIResponse, isProcessing, isStreaming, draftInput, setDraftInput,
        handleAIInteraction, stopInteraction, handlePlayerAction, handleSendMessage, saveSettings, manualSave, loadGame, updateConfidant, updateMemory,
        handleReroll, handleEditLog, handleDeleteLog, handleEditUserLog, handleUpdateLogText, handleUserRewrite, handleDeleteTask
    };
};
