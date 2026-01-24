
import React, { useState } from 'react';
import { LayoutList, ArrowUp, ArrowDown, ToggleLeft, ToggleRight, Settings, Code, Eye, EyeOff, Radio, Check, Star, Settings2, Maximize2, Minimize2, Swords } from 'lucide-react';
import { AppSettings, ContextModuleConfig, GameState, Confidant } from '../../../../types';
import { assembleFullPrompt, generateSingleModuleContext } from '../../../../utils/ai';

interface SettingsContextProps {
    settings: AppSettings;
    onUpdate: (newSettings: AppSettings) => void;
    gameState: GameState;
    onUpdateGameState: (gs: GameState) => void;
}

export const SettingsContext: React.FC<SettingsContextProps> = ({ settings, onUpdate, gameState, onUpdateGameState }) => {
    const modules = settings.contextConfig?.modules || [];
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<'FULL' | 'MODULE'>('FULL');
    const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

    const handleUpdateModule = (id: string, updates: Partial<ContextModuleConfig>) => {
        let newModules = modules.map(m => m.id === id ? { ...m, ...updates } : m);
        onUpdate({ ...settings, contextConfig: { ...settings.contextConfig, modules: newModules } });
    };

    const handleUpdateParams = (id: string, paramKey: string, value: any) => {
        const target = modules.find(m => m.id === id);
        if (!target) return;
        handleUpdateModule(id, { params: { ...target.params, [paramKey]: value } });
    };

    const moveModule = (index: number, direction: 'up' | 'down') => {
        const newModules = [...modules];
        if (direction === 'up' && index > 0) {
            [newModules[index - 1], newModules[index]] = [newModules[index], newModules[index - 1]];
            newModules.forEach((m, i) => m.order = i);
            onUpdate({ ...settings, contextConfig: { ...settings.contextConfig, modules: newModules } });
        } else if (direction === 'down' && index < newModules.length - 1) {
            [newModules[index + 1], newModules[index]] = [newModules[index], newModules[index + 1]];
            newModules.forEach((m, i) => m.order = i);
            onUpdate({ ...settings, contextConfig: { ...settings.contextConfig, modules: newModules } });
        }
    };

    const toggleNPCProp = (npcId: string, prop: keyof Confidant) => {
        const newConfidants = gameState.社交.map(c => {
            if (c.id === npcId) {
                return { ...c, [prop]: !c[prop] };
            }
            return c;
        });
        onUpdateGameState({ ...gameState, 社交: newConfidants });
    };

    const getPreviewText = () => {
        if (previewMode === 'MODULE' && selectedModuleId) {
            const mod = modules.find(m => m.id === selectedModuleId);
            if (mod) return generateSingleModuleContext(mod, gameState, settings);
            return "(Module not found)";
        }
        return assembleFullPrompt("（用户输入预览）", gameState, settings);
    };

    const previewText = getPreviewText();
    const sortedModules = [...modules].sort((a,b) => a.order - b.order);
    const activeModule = selectedModuleId ? modules.find(m => m.id === selectedModuleId) : null;

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-300 gap-4 overflow-hidden relative">
            <div className="flex items-center gap-3 border-b-2 border-black pb-4 shrink-0">
                <LayoutList className="text-indigo-600" />
                <h3 className="text-2xl font-display uppercase italic text-black">上下文模块管理</h3>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden relative">
                {/* Left Sidebar: List - Hide when expanded */}
                <div className={`md:w-1/3 border-r border-zinc-200 bg-zinc-50 flex flex-col transition-all duration-300 ${isPreviewExpanded ? 'w-0 opacity-0 pointer-events-none md:w-0' : 'w-full'}`}>
                    <div className="p-3 bg-zinc-100 font-bold text-xs uppercase text-zinc-500 border-b border-zinc-200 truncate">
                        Modules Sequence
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {sortedModules.map((mod, index) => (
                            <div 
                                key={mod.id} 
                                onClick={() => setSelectedModuleId(mod.id)}
                                className={`border rounded p-2 cursor-pointer flex items-center gap-2 group transition-all
                                    ${selectedModuleId === mod.id ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-zinc-200 hover:border-indigo-300'}
                                    ${!mod.enabled ? 'opacity-60' : ''}
                                `}
                            >
                                <div className="flex flex-col gap-1 mr-1" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => moveModule(index, 'up')} disabled={index === 0} className="hover:text-indigo-600 disabled:opacity-10 text-zinc-400"><ArrowUp size={10}/></button>
                                    <button onClick={() => moveModule(index, 'down')} disabled={index === modules.length - 1} className="hover:text-indigo-600 disabled:opacity-10 text-zinc-400"><ArrowDown size={10}/></button>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className={`font-bold text-xs truncate ${selectedModuleId === mod.id ? 'text-indigo-700' : 'text-zinc-700'}`}>{mod.name}</div>
                                    <div className="text-[9px] text-zinc-400 font-mono">{mod.type}</div>
                                </div>

                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleUpdateModule(mod.id, { enabled: !mod.enabled }); }} 
                                    className={`${mod.enabled ? 'text-green-500' : 'text-zinc-300 hover:text-zinc-500'}`}
                                >
                                    {mod.enabled ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Area: Config & Preview */}
                <div className={`flex-1 flex flex-col bg-white overflow-hidden transition-all duration-300 ${isPreviewExpanded ? 'w-full' : ''}`}>
                    
                    {/* Module Configuration (Hidden when expanded) */}
                    {!isPreviewExpanded && (
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-zinc-50 border-b border-zinc-200">
                            {activeModule ? (
                                <div>
                                    <h4 className="font-bold text-sm uppercase text-black mb-4 flex items-center gap-2 pb-2 border-b border-zinc-200">
                                        <Settings2 size={16} /> 模块配置: {activeModule.name}
                                    </h4>
                                    
                                    <div className="space-y-6">
                                        {/* Params Config based on Type */}
                                        {activeModule.type === 'SOCIAL_CONTEXT' ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-white p-3 border border-zinc-200 rounded">
                                                        <label className="block text-xs font-bold text-zinc-500 mb-1">特别关注记忆数</label>
                                                        <div className="flex items-center gap-2">
                                                            <input 
                                                                type="number" min="1" max="20"
                                                                value={activeModule.params.specialMemoryLimit || 5} 
                                                                onChange={(e) => handleUpdateParams(activeModule.id, 'specialMemoryLimit', parseInt(e.target.value))}
                                                                className="w-16 p-1 border border-zinc-300 text-xs font-mono"
                                                            />
                                                            <span className="text-[10px] text-zinc-400">条</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white p-3 border border-zinc-200 rounded">
                                                        <label className="block text-xs font-bold text-zinc-500 mb-1">在场普通记忆数</label>
                                                        <div className="flex items-center gap-2">
                                                            <input 
                                                                type="number" min="0" max="100"
                                                                value={activeModule.params.normalMemoryLimit || 30} 
                                                                onChange={(e) => handleUpdateParams(activeModule.id, 'normalMemoryLimit', parseInt(e.target.value))}
                                                                className="w-16 p-1 border border-zinc-300 text-xs font-mono"
                                                            />
                                                            <span className="text-[10px] text-zinc-400">条</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border border-zinc-200 rounded overflow-hidden bg-white shadow-sm">
                                                    <div className="bg-zinc-100 px-3 py-2 border-b border-zinc-200 text-xs font-bold text-zinc-500 flex justify-between">
                                                        <span>NPC 状态覆写 (Direct Override)</span>
                                                        <span className="text-[10px] font-normal">Count: {gameState.社交.length}</span>
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                        <table className="w-full text-xs text-left">
                                                            <thead className="bg-zinc-50 text-zinc-400 font-medium sticky top-0">
                                                                <tr>
                                                                    <th className="p-2 font-light">Name</th>
                                                                    <th className="p-2 text-center font-light">Present</th>
                                                                    <th className="p-2 text-center font-light">Focus</th>
                                                                    <th className="p-2 text-center font-light">Party</th>
                                                                    <th className="p-2 text-center font-light">Force Context</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {gameState.社交.map(c => (
                                                                    <tr key={c.id} className="border-b border-zinc-100 hover:bg-indigo-50 transition-colors">
                                                                        <td className="p-2 font-bold text-zinc-700">{c.姓名}</td>
                                                                        <td className="p-2 text-center">
                                                                            <button onClick={() => toggleNPCProp(c.id, '是否在场')} className={c.是否在场 ? 'text-green-500' : 'text-zinc-300'}>
                                                                                <Eye size={16}/>
                                                                            </button>
                                                                        </td>
                                                                        <td className="p-2 text-center">
                                                                            <button onClick={() => toggleNPCProp(c.id, '特别关注')} className={c.特别关注 ? 'text-yellow-500' : 'text-zinc-300'}>
                                                                                <Star size={16} fill={c.特别关注 ? 'currentColor' : 'none'}/>
                                                                            </button>
                                                                        </td>
                                                                        <td className="p-2 text-center">
                                                                            <button onClick={() => toggleNPCProp(c.id, '是否队友')} className={c.是否队友 ? 'text-indigo-500' : 'text-zinc-300'}>
                                                                                <Swords size={16}/>
                                                                            </button>
                                                                        </td>
                                                                        <td className="p-2 text-center">
                                                                            <button onClick={() => toggleNPCProp(c.id, '强制包含上下文')} className={c.强制包含上下文 ? 'text-blue-500' : 'text-zinc-300'}>
                                                                                <Radio size={16}/>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Generic Params */
                                            <div className="grid grid-cols-2 gap-4">
                                                {activeModule.params.messageLimit !== undefined && (
                                                    <div className="bg-white p-3 border border-zinc-200 rounded">
                                                        <label className="block text-xs font-bold text-zinc-500 mb-1">消息条数限制</label>
                                                        <div className="flex items-center gap-2">
                                                            <input 
                                                                type="range" min="1" max="20" className="flex-1"
                                                                value={activeModule.params.messageLimit} 
                                                                onChange={(e) => handleUpdateParams(activeModule.id, 'messageLimit', parseInt(e.target.value))}
                                                            />
                                                            <span className="font-mono text-sm font-bold">{activeModule.params.messageLimit}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {activeModule.type === 'MAP_CONTEXT' ? null : activeModule.params.detailLevel !== undefined && (
                                                    <div className="bg-white p-3 border border-zinc-200 rounded">
                                                        <label className="block text-xs font-bold text-zinc-500 mb-1">详细程度</label>
                                                        <select 
                                                            value={activeModule.params.detailLevel} 
                                                            onChange={(e) => handleUpdateParams(activeModule.id, 'detailLevel', e.target.value)}
                                                            className="w-full border border-zinc-300 rounded p-1 text-xs bg-transparent"
                                                        >
                                                            <option value="low">简略 (Low)</option>
                                                            <option value="medium">标准 (Medium)</option>
                                                            <option value="high">详细 (High)</option>
                                                            <option value="raw">原始数据 (Raw JSON)</option>
                                                        </select>
                                                    </div>
                                                )}
                                                {Object.keys(activeModule.params).length === 0 && (
                                                    <div className="col-span-2 text-center py-8 text-zinc-400 text-xs italic">
                                                        此模块无额外配置项
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                                    <Settings size={48} className="mb-4 opacity-20" />
                                    <p className="text-xs uppercase font-bold tracking-widest">Select a module to configure</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preview Area */}
                    <div className={`${isPreviewExpanded ? 'flex-1 h-full' : 'h-48'} bg-zinc-900 border-t border-zinc-800 flex flex-col transition-all duration-300 relative`}>
                        <div className="flex justify-between items-center p-2 bg-black text-zinc-500 text-[10px] font-bold uppercase tracking-wider shrink-0">
                            <span className="flex items-center gap-2"><Code size={12} /> Output Preview</span>
                            <div className="flex gap-2 items-center">
                                <button onClick={() => setPreviewMode('MODULE')} className={previewMode === 'MODULE' ? 'text-indigo-400' : 'hover:text-white'}>Module Only</button>
                                <span>|</span>
                                <button onClick={() => setPreviewMode('FULL')} className={previewMode === 'FULL' ? 'text-green-400' : 'hover:text-white'}>Full Context</button>
                                <div className="w-px h-3 bg-zinc-700 mx-1" />
                                <button onClick={() => setIsPreviewExpanded(!isPreviewExpanded)} className="hover:text-white text-zinc-300">
                                    {isPreviewExpanded ? (
                                        <div className="flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded"><Minimize2 size={12}/> Exit Full</div>
                                    ) : (
                                        <div className="flex items-center gap-1"><Maximize2 size={12}/> Expand</div>
                                    )}
                                </button>
                            </div>
                        </div>
                        <textarea 
                            readOnly 
                            value={previewText}
                            className="flex-1 bg-transparent text-green-500 font-mono text-[10px] p-3 resize-none outline-none custom-scrollbar leading-relaxed whitespace-pre-wrap"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
