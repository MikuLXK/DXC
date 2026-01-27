
import React, { useState, useEffect, useRef } from 'react';
import { X, Settings as SettingsIcon, LogOut, Save, User, ArrowLeft, ChevronRight, HardDrive, Eye, Cpu, Smartphone, Globe, Brain, Zap, Search, RefreshCw, Download, Plus, Trash2, ToggleLeft, ToggleRight, Edit2, Check, Upload, Database, FileJson, History, FileUp, FileDown, Folder, LayoutList, List, Copy, Code, Clock, ArrowUp, ArrowDown, EyeOff, Radio, Crown, Type, Sword, Server, AlertTriangle, MousePointer2, Activity, Shield } from 'lucide-react';
import { AppSettings, GameState, SaveSlot, PromptModule, PromptUsage, GlobalAISettings } from '../../../types';
import { DEFAULT_PROMPT_MODULES, assembleFullPrompt } from '../../../utils/ai';
import { DEFAULT_SETTINGS } from '../../../hooks/useAppSettings';
import { P5Dropdown } from '../../ui/P5Dropdown';
import { GAME_SCHEMA_DOCS } from './schemaDocs';

// Sub-components
import { SettingsAIServices } from './settings/SettingsAIServices';
import { SettingsContext } from './settings/SettingsContext';

interface MenuButtonProps {
    icon: React.ReactNode;
    label: string;
    subLabel: string;
    onClick: () => void;
    color: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ icon, label, subLabel, onClick, color }) => (
    <button 
        onClick={onClick}
        className={`group flex items-center gap-4 p-6 border-2 transition-all duration-300 bg-white hover:scale-[1.02] shadow-sm hover:shadow-md ${color}`}
    >
        <div className="text-3xl shrink-0 group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <div className="text-left">
            <div className="text-xl font-display uppercase tracking-wider leading-none mb-1 group-hover:tracking-widest transition-all">
                {label}
            </div>
            <div className="text-xs font-mono opacity-60 uppercase">
                {subLabel}
            </div>
        </div>
    </button>
);

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  avatarUrl: string;
  onSaveSettings: (newSettings: AppSettings) => void;
  onSaveGame: (slotId?: number | string) => void;
  onLoadGame: (slotId: number | string) => void;
  onUpdateAvatar: (url: string) => void;
  onExitGame: () => void;
  gameState: GameState;
  onUpdateGameState: (newState: GameState) => void;
  initialView?: SettingsView;
}

type SettingsView = 'MAIN' | 'PROMPTS' | 'VISUALS' | 'DATA' | 'AI_SERVICES' | 'VARIABLES' | 'MEMORY' | 'SCHEMA' | 'AI_CONTEXT' | 'STORAGE' | 'FULL_LOGS';

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  avatarUrl,
  onSaveSettings, 
  onSaveGame,
  onLoadGame,
  onUpdateAvatar,
  onExitGame,
  gameState,
  onUpdateGameState,
  initialView
}) => {
  const [currentView, setCurrentView] = useState<SettingsView>('MAIN');
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl);
  
  // Prompt Manager States
  const [selectedGroup, setSelectedGroup] = useState<string | null>('系统设定');
  const [activePromptModuleId, setActivePromptModuleId] = useState<string | null>(null);

  // Variable Editor State
  const [variableCategory, setVariableCategory] = useState<string>('角色');
  const [jsonEditText, setJsonEditText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Save Feedback
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVED'>('IDLE');
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);
  const [autoSlots, setAutoSlots] = useState<SaveSlot[]>([]);

  // Storage Management State
  const [storageItems, setStorageItems] = useState<{key: string, size: number, label: string, type: string, details?: string[]}[]>([]);
  const [storageSummary, setStorageSummary] = useState<{ total: number; cache: number; saves: number; settings: number; api: number }>({
      total: 0,
      cache: 0,
      saves: 0,
      settings: 0,
      api: 0
  });
  const [contextStats, setContextStats] = useState<{ tokens: number; chars: number; bytes: number }>({
      tokens: 0,
      chars: 0,
      bytes: 0
  });
  const [logSearch, setLogSearch] = useState('');

  // File Import Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptFileInputRef = useRef<HTMLInputElement>(null);

  // Init Data
  useEffect(() => {
      if(isOpen) {
          setCurrentView(initialView || 'MAIN');
          setFormData(settings); // Sync settings
          loadSaveSlots();
      }
  }, [isOpen, settings, initialView]);

  const loadSaveSlots = () => {
      // Manual Slots
      const manual: SaveSlot[] = [];
      for(let i=1; i<=3; i++) {
          const raw = localStorage.getItem(`danmachi_save_manual_${i}`);
          if(raw) {
              try {
                  const data = JSON.parse(raw);
                  manual.push({ id: i, type: 'MANUAL', timestamp: data.timestamp, summary: data.summary, data: data.data });
              } catch(e) {}
          }
      }
      setSaveSlots(manual);

      // Auto Slots
      const auto: SaveSlot[] = [];
      for(let i=1; i<=3; i++) {
          const raw = localStorage.getItem(`danmachi_save_auto_${i}`);
          if(raw) {
              try {
                  const data = JSON.parse(raw);
                  auto.push({ id: `auto_${i}`, type: 'AUTO', timestamp: data.timestamp, summary: data.summary, data: data.data });
              } catch(e) {}
          }
      }
      auto.sort((a,b) => b.timestamp - a.timestamp);
      setAutoSlots(auto);
  };

  const scanStorage = () => {
      const items: {key: string, size: number, label: string, type: string, details?: string[]}[] = [];
      const summary = { total: 0, cache: 0, saves: 0, settings: 0, api: 0 };
      for(let i=0; i<localStorage.length; i++) {
          const key = localStorage.key(i);
          if(key && (key.startsWith('danmachi_') || key.startsWith('phantom_'))) {
              const value = localStorage.getItem(key) || '';
              const size = new Blob([value]).size; 
              let label = key;
              let type = 'CACHE';
              let details: string[] = [];

              if (key === 'danmachi_settings') {
                  label = '系统设置 (Settings)';
                  type = 'SETTINGS';
                  try {
                      const parsed = JSON.parse(value);
                      const prompts = Array.isArray(parsed.promptModules) ? parsed.promptModules : [];
                      const active = prompts.filter((m: any) => m && m.isActive).length;
                      const contextMods = Array.isArray(parsed.contextConfig?.modules) ? parsed.contextConfig.modules.length : 0;
                      const apiSize = new Blob([JSON.stringify(parsed.aiConfig || {})]).size;
                      details.push('提示词模块: ' + prompts.length + ' (启用 ' + active + ')');
                      details.push('上下文模块: ' + contextMods);
                      details.push('背景: ' + (parsed.backgroundImage ? '已保存' : '未保存'));
                      details.push('API设置: ' + formatBytes(apiSize));
                      summary.api += apiSize;
                  } catch (e) {}
              } else if (key.includes('save_auto')) {
                  label = `自动存档 (Auto Save ${key.split('_').pop()})`;
                  type = 'SAVE_AUTO';
              } else if (key.includes('save_manual')) {
                  label = `手动存档 (Manual Save ${key.split('_').pop()})`;
                  type = 'SAVE_MANUAL';
              }

              if (type === 'SAVE_AUTO' || type === 'SAVE_MANUAL') {
                  try {
                      const parsed = JSON.parse(value);
                      const state = parsed?.data || parsed;
                      const avatar = state?.角色?.头像;
                      const name = state?.角色?.姓名;
                      const level = state?.角色?.等级;
                      if (name) details.push('角色: ' + name);
                      if (level !== undefined) details.push('等级: ' + level);
                      details.push('头像: ' + (avatar ? '已保存' : '无'));
                  } catch (e) {}
              }

              items.push({ key, size, label, type, details: details.length > 0 ? details : undefined });
              summary.total += size;
              if (type === 'CACHE') summary.cache += size;
              if (type === 'SETTINGS') summary.settings += size;
              if (type === 'SAVE_AUTO' || type === 'SAVE_MANUAL') summary.saves += size;
          }
      }
      // Sort by type then key
      items.sort((a, b) => a.type.localeCompare(b.type) || a.key.localeCompare(b.key));
      setStorageItems(items);
      setStorageSummary(summary);
  };

  useEffect(() => {
      if (currentView === 'STORAGE') {
          scanStorage();
          refreshContextStats();
      }
  }, [currentView]);

  // Init JSON Editor when category changes
  useEffect(() => {
      if (currentView === 'VARIABLES' && gameState) {
          // @ts-ignore
          const data = gameState[variableCategory];
          setJsonEditText(JSON.stringify(data, null, 4));
          setJsonError(null);
      }
  }, [variableCategory, currentView, gameState]);

  if (!isOpen) return null;

  const handleGlobalSave = () => {
    onSaveSettings(formData);
    onUpdateAvatar(avatarPreview);
    setSaveStatus('SAVED');
    setTimeout(() => {
        setSaveStatus('IDLE');
        onClose();
    }, 800);
  };

  const handleBack = () => {
    if (currentView === 'MAIN') {
        onClose();
    } else {
        setCurrentView('MAIN');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'bg') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const result = reader.result as string;
              if (type === 'avatar') {
                  setAvatarPreview(result);
              } else {
                  setFormData(prev => ({...prev, backgroundImage: result}));
              }
          };
          reader.readAsDataURL(file);
      }
  };

  // --- Export / Import Logic ---
  const handleExportSave = () => {
      const exportData = {
          id: 'export',
          type: 'EXPORT',
          timestamp: Date.now(),
          summary: `Export: ${gameState.角色?.姓名 || 'Player'} - Lv.${gameState.角色?.等级 || '1'}`,
          data: gameState,
          version: '3.0'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `danmachi_save_${gameState.角色?.姓名 || 'player'}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleImportSave = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
          try {
              const content = ev.target?.result as string;
              let parsed;
              try {
                  parsed = JSON.parse(content);
              } catch (jsonErr) {
                  throw new Error("文件格式错误 (Invalid JSON)");
              }
              
              // Determine if it's a wrapped export or direct state
              let stateToLoad = parsed.data ? parsed.data : parsed;

              // --- MIGRATION LOGIC (Basic English to Chinese keys mapping) ---
              // If 'character' exists but '角色' doesn't, map it.
              if (stateToLoad.character && !stateToLoad.角色) stateToLoad.角色 = stateToLoad.character;
              if (stateToLoad.inventory && !stateToLoad.背包) stateToLoad.背包 = stateToLoad.inventory;
              if (stateToLoad.worldMap && !stateToLoad.地图) stateToLoad.地图 = stateToLoad.worldMap;
              if (stateToLoad.logs && !stateToLoad.日志) stateToLoad.日志 = stateToLoad.logs;
              
              // Validate Core Fields
              const missingFields = [];
              if (!stateToLoad.角色) missingFields.push("角色 (Character)");
              if (!stateToLoad.地图) missingFields.push("地图 (Map)");
              
              if (missingFields.length > 0) {
                  throw new Error(`存档数据不完整，缺失核心字段:\n${missingFields.join(', ')}`);
              }

              // Confirm
              const summary = parsed.summary || stateToLoad.角色?.姓名 || 'Unknown Save';
              const timeStr = parsed.timestamp ? new Date(parsed.timestamp).toLocaleString() : 'Unknown Time';

              if (window.confirm(`确认导入存档？\n\n信息: ${summary}\n时间: ${timeStr}\n\n警告：这将覆盖当前的未保存进度！`)) {
                  // Ensure React state update
                  onUpdateGameState(stateToLoad);
                  
                  // Force close and maybe notify
                  alert("存档导入成功！");
                  onClose();
              }
          } catch(err: any) {
              console.error("Import Error:", err);
              alert("导入失败: " + err.message);
          }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset input
  };

  // --- Prompt Export / Import ---
  const normalizePromptModules = (modules: PromptModule[]) => {
      return modules.map((m, idx) => ({
          id: m.id || `import_${idx}`,
          name: m.name || `未命名模块_${idx + 1}`,
          group: m.group || '未分组',
          usage: (['CORE', 'START', 'MEMORY_S2M', 'MEMORY_M2L'] as PromptUsage[]).includes(m.usage as PromptUsage) ? m.usage : 'CORE',
          isActive: typeof m.isActive === 'boolean' ? m.isActive : true,
          content: typeof m.content === 'string' ? m.content : '',
          order: typeof m.order === 'number' ? m.order : 100
      }));
  };

  const handleExportPrompts = () => {
      const exportData = {
          version: '3.1',
          exportedAt: Date.now(),
          promptModules: formData.promptModules
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `danmachi_prompts_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleImportPrompts = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
          try {
              const content = ev.target?.result as string;
              const parsed = JSON.parse(content);
              const rawModules = Array.isArray(parsed) ? parsed : parsed.promptModules;
              if (!Array.isArray(rawModules)) throw new Error("提示词文件格式错误：未找到 promptModules");
              const normalized = normalizePromptModules(rawModules);
              if (!window.confirm(`确认导入提示词？\n将覆盖当前提示词模块 (${normalized.length} 条)。`)) return;
              setFormData({ ...formData, promptModules: normalized });
              setActivePromptModuleId(null);
              alert("提示词导入成功！");
          } catch (err: any) {
              alert("提示词导入失败: " + err.message);
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  // --- Storage Management Logic ---
  const formatBytes = (bytes: number, decimals = 2) => {
      if (!+bytes) return '0 B';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const estimateTokens = (text: string) => {
      if (!text) return 0;
      const compact = text.replace(/\s+/g, ' ').trim();
      if (!compact) return 0;
      const cjkCount = (compact.match(/[\u4E00-\u9FFF]/g) || []).length;
      const nonCjk = compact.length - cjkCount;
      return Math.ceil(cjkCount + nonCjk / 4);
  };

  const buildSettingsWithApi = (apiConfig: GlobalAISettings | null) => {
      const base = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as AppSettings;
      if (!apiConfig) return { ...base, apiProtectionEnabled: formData.apiProtectionEnabled };
      return { ...base, aiConfig: apiConfig, apiProtectionEnabled: formData.apiProtectionEnabled };
  };

  const cloneDefaultPrompts = () => DEFAULT_PROMPT_MODULES.map(m => ({ ...m }));

  const refreshContextStats = () => {
      try {
          const prompt = assembleFullPrompt("（用户输入预览）", gameState, formData);
          setContextStats({
              chars: prompt.length,
              bytes: new Blob([prompt]).size,
              tokens: estimateTokens(prompt)
          });
      } catch (e) {
          setContextStats({ chars: 0, bytes: 0, tokens: 0 });
      }
  };

  const deleteStorageItem = (key: string) => {
      if (confirm(`确定要删除 ${key} 吗？此操作无法撤销。`)) {
          localStorage.removeItem(key);
          // Manually update the list by rescanning to ensure state sync
          setTimeout(scanStorage, 50); 
      }
  };

  const clearCache = () => {
      if (!confirm("确定要清除缓存吗？这将删除除存档与设置以外的临时数据。")) return;
      const keysToRemove: string[] = [];
      for(let i=0; i<localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          const isSave = key.includes('save_auto') || key.includes('save_manual');
          const isSettings = key === 'danmachi_settings';
          if ((key.startsWith('danmachi_') || key.startsWith('phantom_')) && !isSave && !isSettings) {
              keysToRemove.push(key);
          }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      setTimeout(scanStorage, 50);
  };

  const clearSaves = () => {
      if (!confirm("确定要清除所有存档吗？此操作不可撤销。")) return;
      const keysToRemove: string[] = [];
      for(let i=0; i<localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('save_auto') || key.includes('save_manual'))) {
              keysToRemove.push(key);
          }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      setTimeout(() => {
          loadSaveSlots();
          scanStorage();
      }, 50);
  };

  const restoreDefaultPrompts = () => {
      if (!confirm("确认恢复默认提示词？这将覆盖当前提示词模块配置。")) return;
      const next = { ...formData, promptModules: cloneDefaultPrompts() };
      setFormData(next);
      onSaveSettings(next);
      alert("提示词已恢复为默认配置。");
  };

  const restoreDefaultSettings = () => {
      if (!confirm("确认恢复默认设置？这将重置界面与上下文配置。")) return;
      const preservedApi = formData.apiProtectionEnabled ? formData.aiConfig : null;
      const next = preservedApi ? buildSettingsWithApi(preservedApi) : buildSettingsWithApi(null);
      setFormData(next);
      onSaveSettings(next);
      alert("设置已恢复为默认配置。");
  };

  const factoryReset = () => {
      if (confirm("⚠️ 危险操作：恢复出厂设置\n\n这将清除所有存档、设置和缓存数据，游戏将重置为初始状态。\n\n确定要继续吗？")) {
          const keepApi = !!formData.apiProtectionEnabled;
          const preservedApi = keepApi ? formData.aiConfig : null;
          // Clear only game related keys
          const keysToRemove = [];
          for(let i=0; i<localStorage.length; i++) {
              const key = localStorage.key(i);
              if(key && (key.startsWith('danmachi_') || key.startsWith('phantom_'))) {
                  keysToRemove.push(key);
              }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
          if (keepApi && preservedApi) {
              const next = buildSettingsWithApi(preservedApi);
              localStorage.setItem('danmachi_settings', JSON.stringify(next));
          }
          alert("数据已清除。页面将刷新。");
          window.location.reload();
      }
  };

  // --- View Renderers ---

  const renderMainMenu = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 pb-20">
        <MenuButton 
            icon={<Cpu />} 
            label="API 设置" 
            subLabel="接口连接 / 模型选择"
            onClick={() => setCurrentView('AI_SERVICES')} 
            color="border-purple-600 hover:bg-purple-600 hover:text-white text-black"
        />
        <MenuButton 
            icon={<User />} 
            label="提示词设置" 
            subLabel="角色 / 世界观 / 规则"
            onClick={() => setCurrentView('PROMPTS')} 
            color="border-blue-500 hover:bg-blue-500 hover:text-white text-black"
        />
        <MenuButton 
            icon={<LayoutList />} 
            label="上下文组装" 
            subLabel="结构调整 / 社交规则"
            onClick={() => setCurrentView('AI_CONTEXT')} 
            color="border-indigo-600 hover:bg-indigo-600 hover:text-white text-black"
        />
        <MenuButton 
            icon={<FileJson />} 
            label="实时数据结构" 
            subLabel="LIVE STATE INSPECTOR"
            onClick={() => setCurrentView('SCHEMA')} 
            color="border-cyan-600 hover:bg-cyan-600 hover:text-white text-black"
        />
        <MenuButton 
            icon={<Database />} 
            label="变量管理" 
            subLabel="上帝模式 / 调试数据"
            onClick={() => setCurrentView('VARIABLES')} 
            color="border-green-500 hover:bg-green-500 hover:text-white text-black"
        />
        <MenuButton 
            icon={<History />} 
            label="记忆配置" 
            subLabel="记忆容量 / 限制"
            onClick={() => setCurrentView('MEMORY')} 
            color="border-orange-500 hover:bg-orange-500 hover:text-white text-black"
        />
        <MenuButton 
            icon={<Eye />} 
            label="视觉表现 & 交互" 
            subLabel="头像 / 背景 / 选项开关"
            onClick={() => setCurrentView('VISUALS')} 
            color="border-yellow-500 hover:bg-yellow-500 hover:text-black text-black"
        />
        <MenuButton 
            icon={<List />} 
            label="完整对话流" 
            subLabel="查看全部交互内容"
            onClick={() => setCurrentView('FULL_LOGS')} 
            color="border-slate-600 hover:bg-slate-800 hover:text-white text-black"
        />
        <MenuButton 
            icon={<HardDrive />} 
            label="存档管理" 
            subLabel="保存 / 读取 / 导出"
            onClick={() => setCurrentView('DATA')} 
            color="border-zinc-500 hover:bg-zinc-800 hover:text-white text-black"
        />
        <MenuButton 
            icon={<Server />} 
            label="存储维护" 
            subLabel="清理缓存 / 重置数据"
            onClick={() => setCurrentView('STORAGE')} 
            color="border-red-500 hover:bg-red-600 hover:text-white text-black"
        />
        <MenuButton 
            icon={<LogOut />} 
            label="返回标题" 
            subLabel="退出到主菜单"
            onClick={() => {
                if (confirm("返回标题将结束当前游戏进度，未保存的内容将丢失。确定继续？")) {
                    onExitGame();
                }
            }} 
            color="border-black hover:bg-black hover:text-white text-black"
        />
        <div className="col-span-full mt-4 md:mt-8 flex justify-end pb-4">
            <button 
                onClick={handleGlobalSave}
                disabled={saveStatus === 'SAVED'}
                className={`w-full md:w-auto px-10 py-3 font-display text-xl md:text-2xl uppercase tracking-widest transition-all shadow-[5px_5px_0_#000] flex items-center justify-center gap-3
                    ${saveStatus === 'SAVED' ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-red-600 hover:text-white'}
                `}
            >
                {saveStatus === 'SAVED' ? ( <><Check /> 已保存</> ) : ( "确认并关闭" )}
            </button>
        </div>
    </div>
  );

  const renderStorageView = () => (
      <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-300">
          <SectionHeader title="存储维护" icon={<Server />} />
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-zinc-100 space-y-6">
              <div className="bg-white border border-zinc-300 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-zinc-200 pb-2">
                      <div className="flex items-center gap-2">
                          <Activity className="text-zinc-500" size={20} />
                          <h4 className="font-bold text-sm uppercase text-zinc-700">存储与上下文概览</h4>
                      </div>
                      <button
                          onClick={() => { scanStorage(); refreshContextStats(); }}
                          className="text-xs font-mono text-blue-600 hover:text-blue-800"
                      >
                          刷新
                      </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-zinc-600">
                      <div className="bg-zinc-50 border border-zinc-200 p-3">
                          <div className="text-[10px] uppercase text-zinc-400">总计</div>
                          <div className="text-sm font-bold text-zinc-800">{formatBytes(storageSummary.total)}</div>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-200 p-3">
                          <div className="text-[10px] uppercase text-zinc-400">存档</div>
                          <div className="text-sm font-bold text-zinc-800">{formatBytes(storageSummary.saves)}</div>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-200 p-3">
                          <div className="text-[10px] uppercase text-zinc-400">设置</div>
                          <div className="text-sm font-bold text-zinc-800">{formatBytes(storageSummary.settings)}</div>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-200 p-3">
                          <div className="text-[10px] uppercase text-zinc-400">缓存</div>
                          <div className="text-sm font-bold text-zinc-800">{formatBytes(storageSummary.cache)}</div>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-200 p-3">
                          <div className="text-[10px] uppercase text-zinc-400">API 设置</div>
                          <div className="text-sm font-bold text-zinc-800">{formatBytes(storageSummary.api)}</div>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-200 p-3">
                          <div className="text-[10px] uppercase text-zinc-400">上下文估算</div>
                          <div className="text-sm font-bold text-zinc-800">{contextStats.tokens} tokens</div>
                          <div className="text-[10px] text-zinc-400">{formatBytes(contextStats.bytes)} · {contextStats.chars} 字符</div>
                      </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3">
                      <div className="flex items-center gap-2 text-zinc-600 text-xs">
                          <Shield size={16} className="text-emerald-600" />
                          <span className="font-bold">API 保护</span>
                          <span className="text-[10px] text-zinc-400">启用后，清除全部数据时保留 API 设置</span>
                      </div>
                      <button
                          onClick={() => setFormData(prev => ({ ...prev, apiProtectionEnabled: !prev.apiProtectionEnabled }))}
                          className={`text-2xl transition-colors ${formData.apiProtectionEnabled ? 'text-green-600' : 'text-zinc-300'}`}
                      >
                          {formData.apiProtectionEnabled ? <ToggleRight size={32}/> : <ToggleLeft size={32}/>}
                      </button>
                  </div>
              </div>

              <div className="bg-white border border-zinc-300 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-200 pb-2">
                      <Folder className="text-zinc-500" size={20} />
                      <h4 className="font-bold text-sm uppercase text-zinc-700">快速维护</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <button onClick={clearCache} className="py-2 px-3 border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 font-bold uppercase tracking-widest">清除缓存</button>
                      <button onClick={clearSaves} className="py-2 px-3 border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 font-bold uppercase tracking-widest">清除存档</button>
                      <button onClick={restoreDefaultPrompts} className="py-2 px-3 border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 font-bold uppercase tracking-widest">恢复默认提示词</button>
                      <button onClick={restoreDefaultSettings} className="py-2 px-3 border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 font-bold uppercase tracking-widest">恢复默认设置</button>
                  </div>
              </div>
              <div className="bg-white border border-zinc-300 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-zinc-200 pb-2">
                      <div className="flex items-center gap-2">
                          <Database className="text-zinc-500" size={20} />
                          <h4 className="font-bold text-sm uppercase text-zinc-700">Local Data Explorer</h4>
                      </div>
                      <span className="text-xs font-mono text-zinc-400">Total Items: {storageItems.length}</span>
                  </div>
                  {storageItems.length > 0 ? (
                      <div className="space-y-2">
                          {storageItems.map((item) => (
                              <div key={item.key} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 hover:border-blue-400 transition-colors group">
                                  <div className="flex flex-col min-w-0 flex-1 mr-4">
                                      <span className="font-bold text-xs truncate text-zinc-800" title={item.key}>{item.label}</span>
                                      <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                          <span className="font-mono bg-zinc-200 px-1 rounded">{item.type}</span>
                                          <span>{formatBytes(item.size)}</span>
                                      </div>
                                      {item.details && item.details.length > 0 && (
                                          <div className="text-[10px] text-zinc-500 mt-1">{item.details.join(' | ')}</div>
                                      )}
                                  </div>
                                  <button onClick={() => deleteStorageItem(item.key)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="删除"><Trash2 size={16} /></button>
                              </div>
                          ))}
                      </div>
                  ) : <div className="text-center py-8 text-zinc-400 italic text-sm">本地存储为空</div>}
              </div>
              <div className="bg-red-50 border border-red-200 p-6">
                  <h4 className="font-bold text-red-700 uppercase flex items-center gap-2 mb-4"><AlertTriangle size={20} /> 危险区域 (Danger Zone)</h4>
                  <p className="text-xs text-red-600/80 mb-4 leading-relaxed">执行出厂设置将彻底清除浏览器中保存的所有游戏数据，包括所有进度、设置和自定义内容。操作不可逆。若开启“API 保护”，将保留 API 设置。</p>
                  <button onClick={factoryReset} className="w-full py-3 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 shadow-md flex items-center justify-center gap-2"><RefreshCw size={18} /> 清除全部数据（出厂重置）</button>
              </div>
          </div>
      </div>
  );

  const renderSchemaView = () => (
      <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-300">
          <SectionHeader title="数据结构参考" icon={<FileJson />} />
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6 bg-zinc-100">
              {GAME_SCHEMA_DOCS.map((doc, index) => (
                  <div key={index} className="bg-white border border-zinc-300 shadow-sm overflow-hidden group">
                      <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200 flex justify-between items-center">
                          <h3 className="font-bold text-sm text-zinc-800 uppercase">{doc.title}</h3>
                          <code className="hidden md:block text-xs bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded font-mono">{doc.path}</code>
                      </div>
                      <div className="p-4">
                          <p className="text-xs text-zinc-500 mb-3 italic border-l-2 border-cyan-500 pl-2">{doc.desc}</p>
                          <div className="bg-zinc-900 p-3 overflow-x-auto"><pre className="text-[10px] font-mono text-green-400 leading-relaxed">{JSON.stringify(doc.structure, null, 2)}{/* @ts-ignore */}{doc.itemStructure && `\n\n[Array Item Structure]:\n${JSON.stringify(doc.itemStructure, null, 2)}`}</pre></div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderPromptsView = () => {
      // Group modules
      const groups: Record<string, PromptModule[]> = {};
      formData.promptModules.forEach(m => {
          if (!groups[m.group]) groups[m.group] = [];
          groups[m.group].push(m);
      });

      const handleAddModule = () => {
          const newId = `custom_${Date.now()}`;
          const newModule: PromptModule = {
              id: newId,
              name: '新模块 (New)',
              group: '自定义',
              usage: 'CORE',
              isActive: true,
              content: '请输入提示词内容...',
              order: 100
          };
          setFormData({ ...formData, promptModules: [...formData.promptModules, newModule] });
          setActivePromptModuleId(newId);
      };

      const handleDeleteModule = (id: string) => {
          if (confirm("确定要删除此模块吗？")) {
              const newModules = formData.promptModules.filter(m => m.id !== id);
              setFormData({ ...formData, promptModules: newModules });
              if (activePromptModuleId === id) setActivePromptModuleId(null);
          }
      };

      return (
          <div className="flex flex-col md:flex-row h-full animate-in slide-in-from-right-8 duration-300 overflow-hidden">
              {/* Sidebar List */}
              <div className="w-full md:w-1/3 border-r border-zinc-300 bg-white overflow-y-auto custom-scrollbar flex flex-col">
                  <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
                      <h4 className="font-bold uppercase text-zinc-600 flex items-center gap-2">
                          <User size={16} /> 提示词模块
                      </h4>
                      <div className="flex items-center gap-2">
                          <button onClick={handleExportPrompts} className="p-1 hover:bg-zinc-200 rounded text-zinc-600" title="导出提示词"><FileDown size={16}/></button>
                          <button onClick={() => promptFileInputRef.current?.click()} className="p-1 hover:bg-zinc-200 rounded text-zinc-600" title="导入提示词"><FileUp size={16}/></button>
                          <button onClick={handleAddModule} className="p-1 hover:bg-zinc-200 rounded text-blue-600" title="新增模块"><Plus size={18}/></button>
                      </div>
                  </div>
                  <input type="file" ref={promptFileInputRef} className="hidden" accept=".json" onChange={handleImportPrompts} />
                  <div className="flex-1 p-2 space-y-4">
                      {Object.entries(groups).map(([groupName, mods]) => (
                          <div key={groupName} className="space-y-1">
                              <div className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{groupName}</div>
                              {mods.sort((a,b) => a.order - b.order).map(mod => (
                                  <div 
                                      key={mod.id}
                                      onClick={() => setActivePromptModuleId(mod.id)}
                                      className={`p-3 border rounded cursor-pointer transition-all flex justify-between items-center group
                                          ${activePromptModuleId === mod.id 
                                              ? 'bg-blue-50 border-blue-500 shadow-sm' 
                                              : 'bg-white border-zinc-200 hover:border-blue-300'
                                          }
                                      `}
                                  >
                                      <div>
                                          <div className={`font-bold text-xs ${activePromptModuleId === mod.id ? 'text-blue-700' : 'text-zinc-700'}`}>{mod.name}</div>
                                          <div className="text-[10px] text-zinc-400 font-mono">{mod.usage}</div>
                                      </div>
                                      <button 
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              const newModules = formData.promptModules.map(m => 
                                                  m.id === mod.id ? { ...m, isActive: !m.isActive } : m
                                              );
                                              setFormData({ ...formData, promptModules: newModules });
                                          }}
                                          className={`${mod.isActive ? 'text-green-600' : 'text-zinc-300 hover:text-zinc-500'}`}
                                      >
                                          {mod.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                      </button>
                                  </div>
                              ))}
                          </div>
                      ))}
                  </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 bg-zinc-50 flex flex-col h-full overflow-hidden">
                  {activePromptModuleId ? (() => {
                      const activeMod = formData.promptModules.find(m => m.id === activePromptModuleId);
                      if (!activeMod) return null;
                      
                      const updateField = (key: keyof PromptModule, val: any) => {
                          const newModules = formData.promptModules.map(m => 
                              m.id === activeMod.id ? { ...m, [key]: val } : m
                          );
                          setFormData({ ...formData, promptModules: newModules });
                      };

                      return (
                          <>
                              {/* Metadata Editor */}
                              <div className="p-4 border-b border-zinc-200 bg-white shadow-sm z-10 space-y-3">
                                  <div className="flex justify-between items-center">
                                      <span className="text-xs text-zinc-500 font-mono">ID: {activeMod.id}</span>
                                      <button onClick={() => handleDeleteModule(activeMod.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-[10px] uppercase font-bold text-zinc-400">名称 Name</label>
                                          <input 
                                              type="text" 
                                              value={activeMod.name}
                                              onChange={(e) => updateField('name', e.target.value)}
                                              className="w-full border-b border-zinc-300 text-sm font-bold bg-transparent outline-none focus:border-blue-500"
                                          />
                                      </div>
                                      <div>
                                          <label className="block text-[10px] uppercase font-bold text-zinc-400">分组 Group</label>
                                          <input 
                                              type="text" 
                                              value={activeMod.group}
                                              onChange={(e) => updateField('group', e.target.value)}
                                              className="w-full border-b border-zinc-300 text-sm font-bold bg-transparent outline-none focus:border-blue-500"
                                          />
                                      </div>
                                      <div>
                                          <label className="block text-[10px] uppercase font-bold text-zinc-400">排序 Order</label>
                                          <input 
                                              type="number" 
                                              value={activeMod.order}
                                              onChange={(e) => updateField('order', parseInt(e.target.value))}
                                              className="w-full border-b border-zinc-300 text-sm font-bold bg-transparent outline-none focus:border-blue-500"
                                          />
                                      </div>
                                      <div>
                                          <label className="block text-[10px] uppercase font-bold text-zinc-400">用途 Usage</label>
                                          <select 
                                              value={activeMod.usage} 
                                              onChange={(e) => updateField('usage', e.target.value as PromptUsage)}
                                              className="w-full border-b border-zinc-300 text-sm bg-transparent outline-none"
                                          >
                                              <option value="CORE">CORE</option>
                                              <option value="START">START</option>
                                              <option value="MEMORY_S2M">MEMORY_S2M</option>
                                              <option value="MEMORY_M2L">MEMORY_M2L</option>
                                          </select>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="flex-1 relative">
                                  <textarea 
                                      className="w-full h-full p-4 bg-zinc-900 text-green-400 font-mono text-xs outline-none resize-none custom-scrollbar leading-relaxed"
                                      value={activeMod.content}
                                      onChange={(e) => updateField('content', e.target.value)}
                                      spellCheck={false}
                                  />
                              </div>
                          </>
                      );
                  })() : (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                          <Edit2 size={48} className="mb-4 opacity-20" />
                          <p className="text-sm font-bold uppercase">Select a module to edit</p>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const renderMemoryView = () => (
      <div className="space-y-6 animate-in slide-in-from-right-8 duration-300 overflow-y-auto custom-scrollbar p-1">
          <SectionHeader title="记忆配置" icon={<History />} />
          <div className="bg-white p-6 border border-zinc-200 shadow-sm space-y-6">
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-sm text-blue-800">
                  注意：记忆功能的提示词已统一迁移至「提示词设置」中管理。
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                       <label className="block text-xs font-bold uppercase mb-2 text-red-600">即时记忆容量 (Instant Limit)</label>
                       <div className="flex items-center gap-4">
                           <input type="range" min="4" max="50" value={formData.memoryConfig?.instantLimit || 10} onChange={(e) => setFormData({...formData, memoryConfig: { ...formData.memoryConfig, instantLimit: parseInt(e.target.value) }})} className="flex-1" />
                           <span className="font-mono font-bold text-lg">{formData.memoryConfig?.instantLimit || 10}</span>
                       </div>
                  </div>
                  <div><label className="block text-xs font-bold uppercase mb-2 text-zinc-500">短期记忆条数限制</label><input type="number" min="0" max="50" value={formData.memoryConfig?.shortTermLimit || 10} onChange={(e) => setFormData({...formData, memoryConfig: { ...formData.memoryConfig, shortTermLimit: parseInt(e.target.value) || 10 }})} className="w-full bg-zinc-50 border-b-2 border-zinc-300 p-2 font-mono text-sm" /></div>
                  <div><label className="block text-xs font-bold uppercase mb-2 text-zinc-500">中期记忆条目限制</label><input type="number" min="0" max="20" value={formData.memoryConfig?.mediumTermLimit || 5} onChange={(e) => setFormData({...formData, memoryConfig: { ...formData.memoryConfig, mediumTermLimit: parseInt(e.target.value) || 5 }})} className="w-full bg-zinc-50 border-b-2 border-zinc-300 p-2 font-mono text-sm" /></div>
              </div>
          </div>
      </div>
  );

  const renderDataView = () => (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300 overflow-y-auto custom-scrollbar pb-10">
        <SectionHeader title="存档管理" icon={<HardDrive />} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
                 <h4 className="font-bold text-sm uppercase text-zinc-500 border-b border-zinc-300 pb-1 mb-2">自动存档 (Auto Save)</h4>
                 {autoSlots.length > 0 ? autoSlots.map(slot => (
                     <div key={slot.id} className="flex items-center gap-2 bg-zinc-50 border border-zinc-300 p-3 text-xs opacity-80 hover:opacity-100 hover:border-blue-500 transition-all">
                         <Clock size={16} className="text-zinc-400" />
                         <div className="flex-1 min-w-0"><div className="font-bold truncate">{slot.summary}</div><div className="text-zinc-400">{new Date(slot.timestamp).toLocaleString()}</div></div>
                         <button onClick={() => { onLoadGame(slot.id); onClose(); }} className="text-blue-600 hover:underline font-bold">读取</button>
                     </div>
                 )) : <div className="text-zinc-400 text-xs italic">暂无自动存档</div>}
            </div>
            <div className="space-y-2">
                 <h4 className="font-bold text-sm uppercase text-zinc-500 border-b border-zinc-300 pb-1 mb-2">手动存档 (Manual Save)</h4>
                 {[1, 2, 3].map(id => {
                     const slot = saveSlots.find(s => s.id === id);
                     return (
                         <div key={id} className="flex items-center gap-2 bg-white border border-zinc-300 p-4 shadow-sm hover:border-black transition-colors">
                             <div className="font-display text-xl w-8 text-zinc-400">{id}</div>
                             <div className="flex-1 min-w-0">{slot ? ( <><div className="font-bold text-sm truncate">{slot.summary}</div><div className="text-xs text-zinc-400">{new Date(slot.timestamp).toLocaleString()}</div></> ) : ( <div className="text-zinc-300 italic">空槽位</div> )}</div>
                             <button onClick={() => { onSaveGame(id); loadSaveSlots(); }} className="bg-black text-white px-3 py-1 text-xs font-bold uppercase hover:bg-green-600">保存</button>
                             {slot && ( <button onClick={() => { onLoadGame(id); onClose(); }} className="bg-white border border-black text-black px-3 py-1 text-xs font-bold uppercase hover:bg-blue-600 hover:text-white">读取</button> )}
                         </div>
                     );
                 })}
            </div>
        </div>
        <div className="mt-8 border-t border-zinc-200 pt-6">
            <h4 className="font-bold text-sm uppercase text-zinc-500 border-b border-zinc-300 pb-1 mb-4 flex items-center gap-2"><Database size={16} /> 备份与迁移</h4>
            <div className="flex gap-4">
                <button onClick={handleExportSave} className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-400 hover:border-black hover:bg-zinc-50 transition-all group"><FileDown size={32} className="mb-2 text-zinc-400 group-hover:text-black" /><span className="font-bold uppercase text-sm">导出当前存档</span><span className="text-[10px] text-zinc-400">下载 .json</span></button>
                <div onClick={() => fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-400 hover:border-blue-600 hover:bg-blue-50 transition-all group cursor-pointer"><FileUp size={32} className="mb-2 text-zinc-400 group-hover:text-blue-600" /><span className="font-bold uppercase text-sm group-hover:text-blue-600">导入存档</span><span className="text-[10px] text-zinc-400">读取 .json</span><input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportSave}/></div>
            </div>
        </div>
    </div>
  );

  const renderVariablesView = () => (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300 h-full flex flex-col">
            <SectionHeader title="变量调试" icon={<Database />} />
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <P5Dropdown label="选择数据模块" options={[{ label: '角色 (Character)', value: '角色' }, { label: '背包 (Inventory)', value: '背包' }, { label: '世界 (World)', value: '世界' }, { label: '社交 (Social)', value: '社交' }, { label: '任务 (Tasks)', value: '任务' }, { label: '剧情 (Story)', value: '剧情' }, { label: '眷族 (Familia)', value: '眷族' }, { label: '战斗 (Combat)', value: '战斗' }, { label: '战利品仓库 (Archived Loot)', value: '战利品' }, { label: '公共战利品 (Public Loot)', value: '公共战利品' }, { label: '短信 (Messages)', value: '短信' }, { label: '动态 (Moments)', value: '动态' }, { label: '记忆 (Memory)', value: '记忆' }, { label: '地图 (Map)', value: '地图' }]} value={variableCategory} onChange={(val) => setVariableCategory(val)} className="w-full md:w-64" />
                <div className="flex-1 flex items-end justify-end"><button onClick={() => { try { const parsed = JSON.parse(jsonEditText); onUpdateGameState({ ...gameState, [variableCategory]: parsed }); setJsonError(null); alert("变量已更新"); } catch (e: any) { setJsonError(e.message); } }} className="w-full md:w-auto bg-red-600 text-white px-6 py-3 font-bold uppercase hover:bg-red-50 shadow-[4px_4px_0_#000]"><Save className="inline mr-2" size={18} /> 应用修改</button></div>
            </div>
            <div className="flex-1 border-2 border-black bg-zinc-900 relative"><textarea value={jsonEditText} onChange={(e) => setJsonEditText(e.target.value)} className="w-full h-full bg-zinc-900 text-green-500 font-mono text-xs p-4 outline-none resize-none custom-scrollbar" spellCheck="false" />{jsonError && <div className="absolute bottom-0 left-0 w-full bg-red-900/90 text-white p-2 text-xs font-mono">ERROR: {jsonError}</div>}</div>
        </div>
  );

  const renderVisualsView = () => (
      <div className="space-y-6 animate-in slide-in-from-right-8 duration-300 overflow-y-auto custom-scrollbar">
          <SectionHeader title="视觉表现 & 交互" icon={<Eye />} />
          {(() => {
              const isUnlimited = formData.chatLogLimit === null;
              return (
                  <div className="bg-white p-6 border border-zinc-200 shadow-sm mb-4">
                      <h4 className="font-bold uppercase text-zinc-500 mb-4 flex items-center gap-2">
                          <LayoutList size={16} /> 聊天楼层显示
                      </h4>
                      <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 mb-3">
                          <div>
                              <h5 className="font-bold text-sm text-black">限制渲染条数</h5>
                              <p className="text-[10px] text-zinc-500">默认只渲染最后 30 条聊天楼层，可切换为无限制。</p>
                          </div>
                          <button 
                              onClick={() => setFormData(prev => ({...prev, chatLogLimit: isUnlimited ? 30 : null}))}
                              className={`text-2xl transition-colors ${isUnlimited ? 'text-zinc-300' : 'text-green-600'}`}
                          >
                              {isUnlimited ? <ToggleLeft size={36}/> : <ToggleRight size={36}/>}
                          </button>
                      </div>
                      <div className="flex items-center gap-4">
                          <input 
                              type="number"
                              min="1"
                              max="500"
                              disabled={isUnlimited}
                              value={isUnlimited ? '' : (formData.chatLogLimit ?? 30)}
                              onChange={(e) => setFormData({...formData, chatLogLimit: parseInt(e.target.value) || 30})}
                              className="w-32 bg-zinc-50 border-b-2 border-zinc-300 p-2 font-mono text-sm disabled:opacity-50"
                          />
                          <span className="text-xs text-zinc-500">条 / 设为无限制可显示全部历史楼层</span>
                      </div>
                  </div>
              );
          })()}
          
          {/* AI Streaming Toggle (New) */}
          <div className="bg-white p-6 border border-zinc-200 shadow-sm mb-4">
              <h4 className="font-bold uppercase text-zinc-500 mb-4 flex items-center gap-2">
                  <Activity size={16} /> 消息流式传输 (Streaming)
              </h4>
              <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200">
                  <div>
                      <h5 className="font-bold text-sm text-black">启用打字机效果</h5>
                      <p className="text-[10px] text-zinc-500">开启后，AI 回复将实时显示生成过程。关闭则等待生成完毕后一次性显示。</p>
                  </div>
                  <button 
                      onClick={() => setFormData(prev => ({...prev, enableStreaming: !prev.enableStreaming}))}
                      className={`text-2xl transition-colors ${formData.enableStreaming ? 'text-purple-600' : 'text-zinc-300'}`}
                  >
                      {formData.enableStreaming ? <ToggleRight size={36}/> : <ToggleLeft size={36}/>}
                  </button>
              </div>
          </div>

          {/* Combat UI Toggle */}
          <div className="bg-white p-6 border border-zinc-200 shadow-sm mb-4">
              <h4 className="font-bold uppercase text-zinc-500 mb-4 flex items-center gap-2">
                  <Sword size={16} /> 战斗 UI 设置
              </h4>
              <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200">
                  <div>
                      <h5 className="font-bold text-sm text-black">启用图形化战斗界面</h5>
                      <p className="text-[10px] text-zinc-500">开启后，遭遇战斗时会显示可视化的状态面板和行动按钮。</p>
                  </div>
                  <button 
                      onClick={() => setFormData(prev => ({...prev, enableCombatUI: !prev.enableCombatUI}))}
                      className={`text-2xl transition-colors ${formData.enableCombatUI ? 'text-green-600' : 'text-zinc-300'}`}
                  >
                      {formData.enableCombatUI ? <ToggleRight size={36}/> : <ToggleLeft size={36}/>}
                  </button>
              </div>
          </div>

          {/* Action Options Toggle */}
          <div className="bg-white p-6 border border-zinc-200 shadow-sm mb-4">
              <h4 className="font-bold uppercase text-zinc-500 mb-4 flex items-center gap-2">
                  <MousePointer2 size={16} /> 智能行动推荐
              </h4>
              <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200">
                  <div>
                      <h5 className="font-bold text-sm text-black">启用行动选项建议</h5>
                      <p className="text-[10px] text-zinc-500">
                          开启后，AI 将在每次回复末尾提供 3-5 个具体的行动建议。
                      </p>
                  </div>
                  <button 
                      onClick={() => setFormData(prev => ({...prev, enableActionOptions: !prev.enableActionOptions}))}
                      className={`text-2xl transition-colors ${formData.enableActionOptions ? 'text-blue-600' : 'text-zinc-300'}`}
                  >
                      {formData.enableActionOptions ? <ToggleRight size={36}/> : <ToggleLeft size={36}/>}
                  </button>
              </div>
          </div>

          {/* Font Size */}
          <div className="bg-white p-6 border border-zinc-200 shadow-sm mb-4">
              <h4 className="font-bold uppercase text-zinc-500 mb-4 flex items-center gap-2">
                  <Type size={16} /> 字体设置 (Font Size)
              </h4>
              <div className="flex gap-4">
                  {['small', 'medium', 'large'].map((size) => (
                      <button
                          key={size}
                          onClick={() => setFormData(prev => ({...prev, fontSize: size as any}))}
                          className={`flex-1 py-3 border-2 font-display uppercase tracking-widest transition-all
                              ${formData.fontSize === size 
                                  ? 'bg-black text-white border-black shadow-[4px_4px_0_rgba(255,0,0,0.5)]' 
                                  : 'bg-white text-zinc-400 border-zinc-200 hover:border-black hover:text-black'
                              }
                          `}
                      >
                          {size}
                      </button>
                  ))}
              </div>
          </div>

          {/* 字数要求设置 */}
          <div className="bg-white p-6 border border-zinc-200 shadow-sm mb-4">
              <h4 className="font-bold uppercase text-zinc-500 mb-4 flex items-center gap-2">
                  <Type size={16} /> 字数要求 (Word Count Requirement)
              </h4>
              <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200">
                  <div>
                      <h5 className="font-bold text-sm text-black">启用字数要求</h5>
                      <p className="text-[10px] text-zinc-500">开启后，AI 会在玩家输入后检查日志字数，若不足则提示补充。</p>
                  </div>
                  <button
                      onClick={() => setFormData(prev => ({
                          ...prev,
                          writingConfig: {
                              ...prev.writingConfig,
                              enableWordCountRequirement: !prev.writingConfig.enableWordCountRequirement
                          }
                      }))}
                      className={`text-2xl transition-colors ${formData.writingConfig.enableWordCountRequirement ? 'text-green-600' : 'text-zinc-300'}`}
                  >
                      {formData.writingConfig.enableWordCountRequirement ? <ToggleRight size={36}/> : <ToggleLeft size={36}/>}
                  </button>
              </div>
              <div className="flex items-center gap-4 mt-4">
                  <input
                      type="number"
                      min="1"
                      max="5000"
                      disabled={!formData.writingConfig.enableWordCountRequirement}
                      value={formData.writingConfig.requiredWordCount ?? 800}
                      onChange={(e) => setFormData(prev => ({
                          ...prev,
                          writingConfig: {
                              ...prev.writingConfig,
                              requiredWordCount: parseInt(e.target.value) || 800
                          }
                      }))}
                      className="w-32 bg-zinc-50 border-b-2 border-zinc-300 p-2 font-mono text-sm disabled:opacity-50"
                  />
                  <span className="text-xs text-zinc-500">字 (默认 800)</span>
              </div>
          </div>

          {/* 写作人称管理设置 */}
          <div className="bg-white p-6 border border-zinc-200 shadow-sm mb-4">
              <h4 className="font-bold uppercase text-zinc-500 mb-4 flex items-center gap-2">
                  <User size={16} /> 写作人称管理 (Narrative Perspective)
              </h4>
              <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200">
                  <div>
                      <h5 className="font-bold text-sm text-black">启用写作人称管理</h5>
                      <p className="text-[10px] text-zinc-500">开启后，AI 将根据选定的人称模式（第一/第二/第三人称）调整叙述风格。</p>
                  </div>
                  <button
                      onClick={() => setFormData(prev => ({
                          ...prev,
                          writingConfig: {
                              ...prev.writingConfig,
                              enableNarrativePerspective: !prev.writingConfig.enableNarrativePerspective
                          }
                      }))}
                      className={`text-2xl transition-colors ${formData.writingConfig.enableNarrativePerspective ? 'text-green-600' : 'text-zinc-300'}`}
                  >
                      {formData.writingConfig.enableNarrativePerspective ? <ToggleRight size={36}/> : <ToggleLeft size={36}/>}
                  </button>
              </div>
              <div className="flex items-center gap-4 mt-4">
                  <div className="flex gap-4">
                      <button
                          onClick={() => setFormData(prev => ({
                              ...prev,
                              writingConfig: {
                                  ...prev.writingConfig,
                                  narrativePerspective: 'first'
                              }
                          }))}
                          className={`py-2 px-4 border-2 font-display uppercase tracking-widest transition-all
                              ${formData.writingConfig.narrativePerspective === 'first'
                                  ? 'bg-black text-white border-black shadow-[4px_4px_0_rgba(255,0,0,0.5)]'
                                  : 'bg-white text-zinc-400 border-zinc-200 hover:border-black hover:text-black'
                              }
                          `}
                      >
                          第一人称
                      </button>
                      <button
                          onClick={() => setFormData(prev => ({
                              ...prev,
                              writingConfig: {
                                  ...prev.writingConfig,
                                  narrativePerspective: 'second'
                              }
                          }))}
                          className={`py-2 px-4 border-2 font-display uppercase tracking-widest transition-all
                              ${formData.writingConfig.narrativePerspective === 'second'
                                  ? 'bg-black text-white border-black shadow-[4px_4px_0_rgba(255,0,0,0.5)]'
                                  : 'bg-white text-zinc-400 border-zinc-200 hover:border-black hover:text-black'
                              }
                          `}
                      >
                          第二人称
                      </button>
                      <button
                          onClick={() => setFormData(prev => ({
                              ...prev,
                              writingConfig: {
                                  ...prev.writingConfig,
                                  narrativePerspective: 'third'
                              }
                          }))}
                          className={`py-2 px-4 border-2 font-display uppercase tracking-widest transition-all
                              ${formData.writingConfig.narrativePerspective === 'third'
                                  ? 'bg-black text-white border-black shadow-[4px_4px_0_rgba(255,0,0,0.5)]'
                                  : 'bg-white text-zinc-400 border-zinc-200 hover:border-black hover:text-black'
                              }
                          `}
                      >
                          第三人称
                      </button>
                  </div>
                  <span className="text-xs text-zinc-500">默认第三人称</span>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Avatar Upload */}
              <div className="bg-white p-6 border border-zinc-200 shadow-sm flex flex-col items-center">
                  <h4 className="font-bold uppercase text-zinc-500 mb-4">Player Avatar</h4>
                  <div className="w-48 h-48 bg-zinc-100 border-4 border-black mb-4 overflow-hidden relative group">
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white font-bold text-xs uppercase">Change Image</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'avatar')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                  </div>
              </div>

              {/* Background Upload */}
              <div className="bg-white p-6 border border-zinc-200 shadow-sm flex flex-col items-center">
                  <h4 className="font-bold uppercase text-zinc-500 mb-4">Game Background</h4>
                  <div className="w-full h-48 bg-zinc-900 border-4 border-black mb-4 overflow-hidden relative group">
                      {formData.backgroundImage ? (
                          <img src={formData.backgroundImage} alt="BG" className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs uppercase">No Custom Background</div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white font-bold text-xs uppercase">Change Background</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'bg')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                  </div>
                  <button 
                    onClick={() => setFormData(prev => ({...prev, backgroundImage: ''}))}
                    className="mt-2 text-red-600 text-xs underline"
                  >
                      Reset to Default
                  </button>
              </div>
          </div>
      </div>
  );

  const renderFullLogsView = () => {
      const keyword = logSearch.trim().toLowerCase();
      const visibleLogs = gameState.日志.filter(log => {
          if (!keyword) return true;
          return `${log.sender} ${log.text}`.toLowerCase().includes(keyword);
      });
      return (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300 h-full flex flex-col">
              <SectionHeader title="完整对话流" icon={<List />} />
              <div className="px-6 md:px-0">
                  <input
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      placeholder="搜索：角色名 / 关键词..."
                      className="w-full md:w-96 bg-white border border-zinc-300 px-3 py-2 text-xs font-mono outline-none focus:border-black"
                  />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-0">
                  <div className="space-y-3">
                      {visibleLogs.length > 0 ? visibleLogs.map((log, idx) => (
                          <div key={log.id || idx} className="bg-white border border-zinc-200 p-4 shadow-sm">
                              <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase font-mono mb-2">
                                  <span>{log.sender || 'Unknown'}</span>
                                  <span>{log.gameTime || (log.turnIndex !== undefined ? `Turn ${log.turnIndex}` : 'No Time')}</span>
                              </div>
                              <div className="text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed">
                                  {log.text}
                              </div>
                          </div>
                      )) : (
                          <div className="text-zinc-400 text-xs italic text-center py-10">暂无记录</div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-6xl h-full md:h-[90vh] bg-zinc-100 relative shadow-2xl overflow-hidden flex flex-col md:flex-row md:border-4 md:border-black">
         
         {/* Mobile Header / Desktop Sidebar */}
         <div className="w-full md:w-28 bg-black flex flex-row md:flex-col items-center justify-between md:justify-start px-4 md:px-0 md:py-6 gap-0 md:gap-6 md:border-r-4 border-b-2 md:border-b-0 border-red-600 z-10 shrink-0 h-16 md:h-auto">
            <SettingsIcon className="text-white animate-spin-slow w-6 h-6 md:w-8 md:h-8" />
            <div className="md:hidden text-red-600 font-display text-lg uppercase tracking-widest">系统配置</div>
            {currentView !== 'MAIN' && (
                <button onClick={handleBack} className="text-white hover:text-red-500 transition-colors p-2 md:bg-zinc-900 rounded-full md:mb-4">
                    <ArrowLeft size={24} />
                </button>
            )}
            <button onClick={onClose} className="md:hidden text-white"><X size={24}/></button>
            <div className="hidden md:block flex-1 w-px bg-zinc-800" />
            <div className="hidden md:block text-red-600 font-display text-lg uppercase tracking-widest vertical-rl pb-4" style={{ writingMode: 'vertical-rl' }}>系统配置</div>
         </div>

         {/* Content Area */}
         <div className="flex-1 flex flex-col relative bg-zinc-100 text-black overflow-hidden h-full">
             <div className="hidden md:flex bg-black text-white p-4 justify-between items-center shadow-lg z-20 shrink-0">
                 <h2 className="text-2xl font-display uppercase tracking-widest truncate">{currentView === 'SCHEMA' ? 'SCHEMA / CONTEXT' : currentView}</h2>
                 <button onClick={onClose} className="hover:text-red-600 transition-colors"><X size={28} /></button>
             </div>
             <div className="flex-1 p-0 md:p-8 overflow-y-auto custom-scrollbar w-full">
                {currentView === 'MAIN' && renderMainMenu()}
                {currentView === 'PROMPTS' && renderPromptsView()}
                {currentView === 'VISUALS' && renderVisualsView()}
                {currentView === 'DATA' && renderDataView()}
                {currentView === 'STORAGE' && renderStorageView()}
                {currentView === 'AI_SERVICES' && (
                    <SettingsAIServices 
                        settings={formData.aiConfig} 
                        onUpdate={(newAiConfig) => setFormData({...formData, aiConfig: newAiConfig})} 
                        onSave={(newAiConfig) => {
                            const next = { ...formData, aiConfig: newAiConfig };
                            setFormData(next);
                            onSaveSettings(next);
                        }}
                    />
                )}
                {currentView === 'VARIABLES' && renderVariablesView()}
                {currentView === 'MEMORY' && renderMemoryView()}
                {currentView === 'SCHEMA' && renderSchemaView()}
                {currentView === 'FULL_LOGS' && renderFullLogsView()}
                {currentView === 'AI_CONTEXT' && (
                    <SettingsContext 
                        settings={formData} 
                        onUpdate={setFormData}
                        gameState={gameState}
                        onUpdateGameState={onUpdateGameState}
                    />
                )}
             </div>
         </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, icon }: any) => (
    <div className="flex items-center gap-3 border-b-2 border-black pb-4 mb-6 pt-6 px-6 md:px-0 md:pt-0">
        <div className="text-red-600">{icon}</div>
        <h3 className="text-2xl md:text-3xl font-display uppercase italic text-black">{title}</h3>
    </div>
);
