
import { useState, useEffect } from 'react';
import { AppSettings, ContextConfig, ContextModuleConfig } from '../types';
import { DEFAULT_PROMPT_MODULES, DEFAULT_MEMORY_CONFIG } from '../utils/ai';

const DEFAULT_CONTEXT_MODULES: ContextModuleConfig[] = [
    { id: 'm_sys', type: 'SYSTEM_PROMPTS', name: '系统核心设定', enabled: true, order: 0, params: {} },
    { id: 'm_player', type: 'PLAYER_DATA', name: '玩家数据', enabled: true, order: 1, params: {} },
    { id: 'm_map', type: 'MAP_CONTEXT', name: '地图环境', enabled: true, order: 2, params: { detailLevel: 'medium', alwaysIncludeDungeon: true } },
    { id: 'm_social', type: 'SOCIAL_CONTEXT', name: '周边NPC', enabled: true, order: 3, params: { includeAttributes: ['appearance', 'status'], presentMemoryLimit: 30, absentMemoryLimit: 6, specialPresentMemoryLimit: 30, specialAbsentMemoryLimit: 12 } },
    { id: 'm_familia', type: 'FAMILIA_CONTEXT', name: '眷族信息', enabled: true, order: 4, params: {} },
    { id: 'm_inv', type: 'INVENTORY_CONTEXT', name: '背包/公共战利品', enabled: true, order: 5, params: { detailLevel: 'medium' } },
    { id: 'm_phone', type: 'PHONE_CONTEXT', name: '手机/消息', enabled: true, order: 6, params: { perTargetLimit: 10, includeMoments: true, momentLimit: 6 } },
    { id: 'm_combat', type: 'COMBAT_CONTEXT', name: '战斗数据', enabled: true, order: 7, params: {} },
    { id: 'm_task', type: 'TASK_CONTEXT', name: '任务列表', enabled: true, order: 8, params: {} },
    { id: 'm_world', type: 'WORLD_CONTEXT', name: '世界动态', enabled: true, order: 9, params: {} },
    { id: 'm_story', type: 'STORY_CONTEXT', name: '剧情进度', enabled: true, order: 10, params: {} },
    { id: 'm_mem', type: 'MEMORY_CONTEXT', name: '记忆流', enabled: true, order: 11, params: {} },
    { id: 'm_hist', type: 'COMMAND_HISTORY', name: '指令历史', enabled: true, order: 12, params: {} },
    { id: 'm_input', type: 'USER_INPUT', name: '玩家输入', enabled: true, order: 13, params: {} },
];

const DEFAULT_CONTEXT_CONFIG: ContextConfig = {
    modules: DEFAULT_CONTEXT_MODULES
};

export const DEFAULT_SETTINGS: AppSettings = {
    backgroundImage: '',
    fontSize: 'medium',
    enableActionOptions: true,
    enableStreaming: true,
    chatLogLimit: 30,
    apiProtectionEnabled: false,
    promptModules: DEFAULT_PROMPT_MODULES,
    aiConfig: {
        mode: 'unified',
        nativeThinkingChain: true,
        unified: { provider: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com', apiKey: '', modelId: 'gemini-3-flash-preview', forceJsonOutput: false },
        services: {
            social: { provider: 'gemini', baseUrl: '', apiKey: '', modelId: '', forceJsonOutput: false },
            world: { provider: 'gemini', baseUrl: '', apiKey: '', modelId: '', forceJsonOutput: false },
            npcSync: { provider: 'gemini', baseUrl: '', apiKey: '', modelId: '', forceJsonOutput: false },
            npcBrain: { provider: 'gemini', baseUrl: '', apiKey: '', modelId: '', forceJsonOutput: false },
        }
    },
    memoryConfig: DEFAULT_MEMORY_CONFIG,
    contextConfig: DEFAULT_CONTEXT_CONFIG,
    writingConfig: {
        enableWordCountRequirement: false,
        requiredWordCount: 800,
        enableNarrativePerspective: true,
        narrativePerspective: 'third',
    }
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
      const savedSettings = localStorage.getItem('danmachi_settings');
      if (savedSettings) {
          try {
              const parsed = JSON.parse(savedSettings);
              let contextConfig = parsed.contextConfig;
              const renameMap: Record<string, string> = {
                  'Easy Mode': '难度-轻松',
                  'Normal Mode': '难度-普通',
                  'Hard Mode': '难度-困难',
                  'Hell Mode': '难度-地狱',
                  'Physiology Easy': '生理-轻松',
                  'Physiology Normal': '生理-普通',
                  'Physiology Hard': '生理-困难',
                  'Physiology Hell': '生理-地狱'
              };
              const savedModules = Array.isArray(parsed.promptModules) ? parsed.promptModules : [];
              const savedMap = new Map(savedModules.map((m: any) => [m.id, m]));
              const mergedDefaults = DEFAULT_PROMPT_MODULES.map(def => {
                  const saved = savedMap.get(def.id);
                  if (!saved) return def;
                  const renamed = renameMap[saved.name] ? def.name : saved.name;
                  return { ...def, ...saved, name: renamed };
              });
              const defaultIds = new Set(DEFAULT_PROMPT_MODULES.map(m => m.id));
              const extraModules = savedModules.filter((m: any) => !defaultIds.has(m.id) && m.id !== 'world_if');
              const mergedPromptModules = [...mergedDefaults, ...extraModules];
              
              if (!contextConfig || Array.isArray(contextConfig.order)) {
                  contextConfig = DEFAULT_CONTEXT_CONFIG;
              } else {
                  const mergedModules = DEFAULT_CONTEXT_CONFIG.modules.map(defMod => {
                      const savedMod = contextConfig.modules?.find((m: any) => m.id === defMod.id);
                      return savedMod ? { ...defMod, ...savedMod } : defMod;
                  });
                  contextConfig = { modules: mergedModules };
              }

              setSettings({ 
                  ...DEFAULT_SETTINGS, 
                  ...parsed,
                  promptModules: mergedPromptModules,
                  contextConfig: contextConfig
              });
          } catch(e) {
              console.error("Failed to load settings", e);
          }
      }
  }, []);

  const saveSettings = (newSettings: AppSettings) => {
      setSettings(newSettings);
      localStorage.setItem('danmachi_settings', JSON.stringify(newSettings));
  };

  return { settings, saveSettings };
};
