
import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, X, List, Save, Check } from 'lucide-react';
import { AIEndpointConfig, GlobalAISettings } from '../../../../types';

interface SettingsAIServicesProps {
    settings: GlobalAISettings;
    onUpdate: (newSettings: GlobalAISettings) => void;
    onSave?: (newSettings: GlobalAISettings) => void;
}

export const SettingsAIServices: React.FC<SettingsAIServicesProps> = ({ settings, onUpdate, onSave }) => {
    const [localConfig, setLocalConfig] = useState<GlobalAISettings>(settings);
    const [activeTab, setActiveTab] = useState<'SOCIAL' | 'WORLD' | 'NPC_SYNC' | 'NPC_BRAIN'>('SOCIAL');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        setLocalConfig(settings);
        setHasUnsavedChanges(false);
    }, [settings]);

    const handleConfigChange = (newConfig: AIEndpointConfig, path: string) => {
        const nextState = JSON.parse(JSON.stringify(localConfig));
        if (path === 'unified') {
            nextState.unified = newConfig;
        } else {
            nextState.services[path] = newConfig;
        }
        setLocalConfig(nextState);
        setHasUnsavedChanges(true);
    };

    const handleModeChange = (mode: 'unified' | 'separate') => {
        setLocalConfig(prev => ({ ...prev, mode }));
        setHasUnsavedChanges(true);
    };

    const saveChanges = () => {
        if (onSave) onSave(localConfig);
        else onUpdate(localConfig);
        setHasUnsavedChanges(false);
        alert("API 配置已保存");
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center border-b-2 border-black pb-4">
                <div className="flex items-center gap-3">
                    <Cpu className="text-purple-600" />
                    <h3 className="text-2xl font-display uppercase italic text-black">API 服务配置</h3>
                </div>
                <button 
                    onClick={saveChanges}
                    disabled={!hasUnsavedChanges}
                    className={`flex items-center gap-2 px-4 py-2 font-bold uppercase transition-all shadow-md
                        ${hasUnsavedChanges ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}
                    `}
                >
                    {hasUnsavedChanges ? <Save size={18} /> : <Check size={18} />}
                    {hasUnsavedChanges ? "保存修改" : "已同步"}
                </button>
            </div>
            
            <div className="bg-white p-6 border border-zinc-200 shadow-sm flex-1 overflow-y-auto custom-scrollbar">
                <div className="mb-6">
                    <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">API Mode</label>
                    <div className="flex flex-col md:flex-row gap-4">
                        <button 
                            onClick={() => handleModeChange('unified')}
                            className={`flex-1 py-3 border-2 font-bold uppercase ${localConfig.mode === 'unified' ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-200'}`}
                        >
                            Unified (单接口)
                        </button>
                        <button 
                            onClick={() => handleModeChange('separate')}
                            className={`flex-1 py-3 border-2 font-bold uppercase ${localConfig.mode === 'separate' ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-200'}`}
                        >
                            Separate (微服务)
                        </button>
                    </div>
                </div>

                <div className="mb-6 flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="nativeThinkingChain"
                        checked={localConfig.nativeThinkingChain !== false}
                        onChange={e => {
                            const newConfig = { ...localConfig, nativeThinkingChain: e.target.checked };
                            setLocalConfig(newConfig);
                            setHasUnsavedChanges(true);
                        }}
                        className="w-4 h-4 text-red-600 border-zinc-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor="nativeThinkingChain" className="text-xs font-bold uppercase text-zinc-600 select-none cursor-pointer">
                        卡原生思维链
                    </label>
                </div>

                {localConfig.mode === 'unified' ? (
                    <AIConfigForm 
                        label="Unified Endpoint Config"
                        config={localConfig.unified}
                        onChange={(c) => handleConfigChange(c, 'unified')}
                    />
                ) : (
                    <div>
                        <div className="flex border-b border-zinc-200 mb-4 overflow-x-auto">
                            {(['SOCIAL', 'WORLD', 'NPC_SYNC', 'NPC_BRAIN'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-red-600 text-red-600' : 'border-transparent text-zinc-400'}`}
                                >
                                    {tab.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        
                        {activeTab === 'SOCIAL' && (
                            <AIConfigForm config={localConfig.services.social} onChange={(c) => handleConfigChange(c, 'social')} />
                        )}
                        {activeTab === 'WORLD' && (
                            <AIConfigForm config={localConfig.services.world} onChange={(c) => handleConfigChange(c, 'world')} />
                        )}
                        {activeTab === 'NPC_SYNC' && (
                            <AIConfigForm config={localConfig.services.npcSync} onChange={(c) => handleConfigChange(c, 'npcSync')} />
                        )}
                        {activeTab === 'NPC_BRAIN' && (
                            <AIConfigForm config={localConfig.services.npcBrain} onChange={(c) => handleConfigChange(c, 'npcBrain')} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const AIConfigForm = ({ config, onChange, label }: { config: AIEndpointConfig, onChange: (c: AIEndpointConfig) => void, label?: string }) => {
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const [showModelList, setShowModelList] = useState(false);
    const [fetchedModels, setFetchedModels] = useState<string[]>([]);

    const handleFetchModels = async () => {
        if (!config.apiKey) {
            alert("请先输入 API Key");
            return;
        }
        setIsFetchingModels(true);
        setFetchedModels([]);
        try {
            let models: string[] = [];
            if (config.provider === 'gemini') {
                const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.models) {
                    models = data.models.map((m: any) => m.name.replace('models/', ''));
                } else if (data.error) {
                    throw new Error(data.error.message);
                }
            } else if (config.provider === 'deepseek') {
                models = ['deepseek-chat', 'deepseek-coder'];
                setFetchedModels(models);
                setShowModelList(true);
                setIsFetchingModels(false);
                return;
            } else {
                const url = `${config.baseUrl.replace(/\/$/, '')}/models`;
                const res = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${config.apiKey}` }
                });
                const data = await res.json();
                if (data.data) {
                    models = data.data.map((m: any) => m.id);
                } else if (data.error) {
                    throw new Error(data.error.message);
                }
            }
            setFetchedModels(models.sort());
            setShowModelList(true);
        } catch (e: any) {
            alert(`获取模型列表失败: ${e.message}`);
        } finally {
            setIsFetchingModels(false);
        }
    };

    return (
        <div className="space-y-4 bg-white/50 p-4 border border-zinc-300 relative">
            {label && <h4 className="font-display uppercase text-lg text-black">{label}</h4>}
            
            <div>
                 <label className="block text-xs font-bold uppercase mb-1 text-zinc-500">Provider</label>
                 <div className="flex flex-wrap gap-2">
                     {['gemini', 'openai', 'deepseek', 'custom'].map(p => (
                         <button 
                            key={p}
                            onClick={() => onChange({...config, provider: p as any, baseUrl: p === 'gemini' ? 'https://generativelanguage.googleapis.com' : p === 'openai' ? 'https://api.openai.com/v1' : p === 'deepseek' ? 'https://api.deepseek.com' : ''})}
                            className={`px-4 py-2 text-sm font-bold uppercase border-2 ${config.provider === p ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-200'}`}
                         >
                            {p}
                         </button>
                     ))}
                 </div>
            </div>
            <div>
                <label className="block text-xs font-bold uppercase mb-1 text-zinc-500">Base URL</label>
                <input 
                    type="text" 
                    value={config.baseUrl}
                    onChange={e => onChange({...config, baseUrl: e.target.value})}
                    className="w-full bg-white border-b-2 border-zinc-400 p-2 font-mono text-sm text-black focus:border-red-600 outline-none"
                    placeholder={config.provider === 'custom' ? "Enter custom base URL..." : "Default URL"}
                    disabled={config.provider !== 'custom'}
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase mb-1 text-zinc-500">API Key</label>
                <input 
                    type="password" 
                    value={config.apiKey}
                    onChange={e => onChange({...config, apiKey: e.target.value})}
                    className="w-full bg-white border-b-2 border-zinc-400 p-2 font-mono text-sm text-black focus:border-red-600 outline-none"
                    placeholder="sk-..."
                />
            </div>
            <div className="relative">
                <label className="block text-xs font-bold uppercase mb-1 text-zinc-500">Model ID</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={config.modelId}
                        onChange={e => onChange({...config, modelId: e.target.value})}
                        className="flex-1 bg-white border-b-2 border-zinc-400 p-2 font-mono text-sm text-black focus:border-red-600 outline-none"
                        placeholder="model-id"
                    />
                    <button 
                        onClick={handleFetchModels} 
                        disabled={isFetchingModels}
                        className="bg-black text-white px-3 py-1 hover:bg-red-600 transition-colors disabled:opacity-50"
                        title="获取模型列表"
                    >
                        {isFetchingModels ? <RefreshCw className="animate-spin" size={16} /> : <List size={16} />}
                    </button>
                </div>
                
                <div className="mt-2 flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id={`force-json-${label || 'config'}`} 
                        checked={config.forceJsonOutput || false}
                        onChange={e => onChange({...config, forceJsonOutput: e.target.checked})}
                        className="w-4 h-4 text-red-600 border-zinc-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor={`force-json-${label || 'config'}`} className="text-xs font-bold uppercase text-zinc-600 select-none cursor-pointer">
                        强制 JSON 输出
                    </label>
                </div>

                {showModelList && fetchedModels.length > 0 && (
                    <div className="absolute top-full right-0 w-full md:w-64 bg-white border-2 border-black z-50 shadow-xl mt-1 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center bg-black text-white p-2 text-xs font-bold sticky top-0">
                            <span>AVAILABLE MODELS</span>
                            <button onClick={() => setShowModelList(false)}><X size={12}/></button>
                        </div>
                        {fetchedModels.map(model => (
                            <button 
                                key={model}
                                onClick={() => { onChange({...config, modelId: model}); setShowModelList(false); }}
                                className={`w-full text-left px-3 py-2 text-xs font-mono hover:bg-red-50 hover:text-red-600 border-b border-zinc-100 ${config.modelId === model ? 'bg-zinc-100 font-bold' : 'text-black'}`}
                            >
                                {model}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
