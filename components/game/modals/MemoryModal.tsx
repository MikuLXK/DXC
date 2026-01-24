
import React, { useState, useEffect } from 'react';
import { X, Brain, Save, Plus, Trash2, Layers } from 'lucide-react';
import { MemorySystem, MemoryEntry, LogEntry } from '../../../types';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: MemorySystem;
  logs?: LogEntry[]; 
  onUpdateMemory: (newMemory: MemorySystem) => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({ isOpen, onClose, memory, logs = [], onUpdateMemory }) => {
  const [localMemory, setLocalMemory] = useState<MemorySystem>(memory);

  useEffect(() => {
    if (isOpen) {
        setLocalMemory(JSON.parse(JSON.stringify(memory)));
    }
  }, [isOpen, memory]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateMemory(localMemory);
    onClose();
  };

  const handleUpdateList = (key: keyof MemorySystem, newList: any[]) => {
      setLocalMemory(prev => ({ ...prev, [key]: newList }));
  };

  const MemoryListEditor = ({ title, list, onChange, placeholder, isObject }: { title: string, list: any[], onChange: (l: any[]) => void, placeholder: string, isObject?: boolean }) => {
      const addItem = () => {
          if (isObject) {
              onChange([...list, { content: "", timestamp: "Manual" }]);
          } else {
              onChange([...list, ""]);
          }
      };

      const updateItem = (index: number, val: string) => {
          const newArr = [...list];
          if (isObject) {
              newArr[index].content = val;
          } else {
              newArr[index] = val;
          }
          onChange(newArr);
      };

      const removeItem = (index: number) => {
          onChange(list.filter((_, i) => i !== index));
      };

      return (
        <div className="flex-1 flex flex-col h-[320px] bg-zinc-800 p-4 border border-zinc-700 overflow-hidden">
            <div className="flex justify-between items-center mb-2 shrink-0">
                <h4 className="text-zinc-400 font-bold uppercase text-xs">{title} ({list.length})</h4>
                <button 
                    onClick={addItem} 
                    className="text-xs bg-zinc-700 text-white px-2 py-1 hover:bg-green-600 flex items-center gap-1"
                >
                    <Plus size={10} /> Add
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 bg-zinc-900 p-2 border border-zinc-600">
                {list.length === 0 && <div className="text-zinc-600 text-xs italic p-2">{placeholder}</div>}
                {list.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1 border-b border-zinc-800 pb-2 mb-2">
                        {isObject && (
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] text-zinc-500 font-mono">
                                    {item.timestamp || 'No Time'}
                                </span>
                                {item.turnIndex && (
                                    <span className="text-[10px] bg-zinc-700 text-zinc-300 px-1.5 rounded font-bold">
                                        TURN {item.turnIndex}
                                    </span>
                                )}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <textarea
                                className="flex-1 bg-black text-green-400 font-mono text-xs p-2 border border-zinc-700 focus:border-white outline-none resize-none h-16"
                                value={isObject ? item.content : item}
                                onChange={(e) => updateItem(idx, e.target.value)}
                            />
                            <button 
                                onClick={() => removeItem(idx)}
                                className="text-zinc-500 hover:text-red-500 px-1"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      );
  };

  const InstantMemoryView = () => {
      // Group last 30 logs by Turn
      // This is purely for UI display, distinct from context construction logic
      const recentLogs = logs.filter(l => l.sender !== 'system').slice(-30);
      const groupedLogs: { [key: number]: LogEntry[] } = {};
      const turns: number[] = [];

      recentLogs.forEach(log => {
          const turn = log.turnIndex || 0;
          if (!groupedLogs[turn]) {
              groupedLogs[turn] = [];
              turns.push(turn);
          }
          groupedLogs[turn].push(log);
      });

      return (
        <div className="flex-1 flex flex-col h-[320px] bg-zinc-800 p-4 border border-zinc-700 overflow-hidden">
            <div className="flex justify-between items-center mb-2 shrink-0">
                <h4 className="text-zinc-400 font-bold uppercase text-xs">1. 即时记忆 (Instant - Grouped by Turn)</h4>
                <span className="text-[10px] text-zinc-500 uppercase bg-black px-2 py-0.5">Read-Only</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 bg-zinc-900 p-2 border border-zinc-600">
                {turns.length > 0 ? turns.map(turn => (
                    <div key={turn} className="bg-black/40 border border-zinc-700 p-2">
                        {/* Header: Turn ID + Timestamp (taken from first log of the turn) */}
                        <div className="flex items-center gap-2 mb-2 border-b border-zinc-800 pb-1">
                            <Layers size={10} className="text-yellow-600"/>
                            <span className="text-[10px] font-bold text-yellow-600 uppercase">
                                TURN {turn} <span className="text-zinc-500 font-mono ml-2">[{groupedLogs[turn][0]?.gameTime || '??:??'}]</span>
                            </span>
                        </div>
                        {/* Body: Messages without individual timestamps */}
                        {groupedLogs[turn].map((log) => (
                            <div key={log.id} className="mb-2 last:mb-0 flex gap-2">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase shrink-0 min-w-[40px] text-right">{log.sender}:</span>
                                <span className="text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap">{log.text}</span>
                            </div>
                        ))}
                    </div>
                )) : <div className="text-zinc-600 text-xs italic p-2">Waiting for interaction...</div>}
            </div>
        </div>
      );
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-200">
      <div className="w-full h-full md:max-w-7xl md:h-[95vh] bg-zinc-950 border-0 md:border-4 border-purple-600 relative flex flex-col shadow-[0_0_50px_rgba(147,51,234,0.3)]">
        
        {/* Header */}
        <div className="bg-purple-900/50 p-4 flex justify-between items-center border-b border-purple-600 shrink-0">
             <div className="flex items-center gap-3 text-purple-300">
                <Brain size={24} className="animate-pulse" />
                <h2 className="text-xl md:text-3xl font-display uppercase tracking-widest">记忆核心</h2>
             </div>
             <div className="flex gap-4">
                 <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 hover:bg-green-500 transition-colors uppercase font-bold text-xs rounded"
                 >
                    <Save size={14} /> 保存
                 </button>
                 <button onClick={onClose} className="hover:text-white text-purple-300 transition-colors">
                    <X size={24} />
                 </button>
             </div>
        </div>

        {/* Content - Stack vertically on mobile, grid on desktop */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                <InstantMemoryView />

                <MemoryListEditor 
                    title="2. 短期记忆 (Short Term)"
                    list={localMemory.shortTerm}
                    onChange={(l) => handleUpdateList('shortTerm', l)}
                    placeholder="Recent conversation summaries..."
                    isObject
                />

                <MemoryListEditor 
                    title="3. 中期记忆 (Medium Term)"
                    list={localMemory.mediumTerm}
                    onChange={(l) => handleUpdateList('mediumTerm', l)}
                    placeholder="Summarized events of the current period..."
                />

                <MemoryListEditor 
                    title="4. 长期记忆 (Long Term)"
                    list={localMemory.longTerm}
                    onChange={(l) => handleUpdateList('longTerm', l)}
                    placeholder="Critical facts, relationships..."
                />
            </div>
        </div>
        
        <div className="p-2 bg-black text-center text-[10px] text-zinc-600 font-mono border-t border-purple-900 shrink-0">
            WARNING: DIRECT MODIFICATION OF MEMORY CORE MAY CAUSE COGNITIVE DISSONANCE.
        </div>

      </div>
    </div>
  );
};
