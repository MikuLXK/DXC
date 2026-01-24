
import { useState, useEffect } from 'react';
import { AppSettings, ContextConfig, ContextModuleConfig } from '../types';
import { DEFAULT_PROMPT_MODULES, DEFAULT_MEMORY_CONFIG } from '../utils/ai';

const DEFAULT_CONTEXT_MODULES: ContextModuleConfig[] = [
    { id: 'm_sys', type: 'SYSTEM_PROMPTS', name: '系统核心设定', enabled: true, order: 0, params: {} },
    { id: 'm_player', type: 'PLAYER_DATA', name: '玩家数据', enabled: true, order: 1, params: {} },
    { id: 'm_map', type: 'MAP_CONTEXT', name: '地图环境', enabled: true, order: 2, params: { detailLevel: 'medium' } },
    { id: 'm_social', type: 'SOCIAL_CONTEXT', name: '周边NPC', enabled: true, order: 3, params: { includeAttributes: ['appearance', 'status'] } },
    { id: 'm_inv', type: 'INVENTORY_CONTEXT', name: '背包/战利品', enabled: true, order: 4, params: { detailLevel: 'medium' } },
    { id: 'm_phone', type: 'PHONE_CONTEXT', name: '手机/消息', enabled: true, order: 5, params: { messageLimit: 5 } },
    { id: 'm_task', type: 'TASK_CONTEXT', name: '任务列表', enabled: true, order: 6, params: {} },
    { id: 'm_world', type: 'WORLD_CONTEXT', name: '世界动态', enabled: true, order: 7, params: {} },
    { id: 'm_story', type: 'STORY_CONTEXT', name: '剧情进度', enabled: true, order: 8, params: {} },
    { id: 'm_mem', type: 'MEMORY_CONTEXT', name: '记忆流', enabled: true, order: 9, params: {} },
    { id: 'm_hist', type: 'COMMAND_HISTORY', name: '指令历史', enabled: true, order: 10, params: {} },
    { id: 'm_input', type: 'USER_INPUT', name: '玩家输入', enabled: true, order: 11, params: {} },
];

const DEFAULT_CONTEXT_CONFIG: ContextConfig = {
    modules: DEFAULT_CONTEXT_MODULES
};

const DEFAULT_SETTINGS: AppSettings = {
    backgroundImage: '',
    fontSize: 'medium',
    enableActionOptions: true,
    enableStreaming: true,
    promptModules: DEFAULT_PROMPT_MODULES,
    aiConfig: {
        mode: 'unified',
        unified: { provider: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com', apiKey: '', modelId: 'gemini-3-flash-preview' },
        services: {
            social: { provider: 'gemini', baseUrl: '', apiKey: '', modelId: '' },
            world: { provider: 'gemini', baseUrl: '', apiKey: '', modelId: '' },
            npcSync: { provider: 'gemini', baseUrl: '', apiKey: '', modelId: '' },
            npcBrain: { provider: 'gemini', baseUrl: '', apiKey: '', modelId: '' },
        }
    },
    memoryConfig: DEFAULT_MEMORY_CONFIG,
    contextConfig: DEFAULT_CONTEXT_CONFIG
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
      const savedSettings = localStorage.getItem('danmachi_settings');
      if (savedSettings) {
          try {
              const parsed = JSON.parse(savedSettings);
              let contextConfig = parsed.contextConfig;
              
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
