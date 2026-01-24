
import React, { useState, useEffect } from 'react';
import { Command, X, RotateCcw, Loader2, Square } from 'lucide-react';
import { CombatState } from '../../../types';

interface GameInputProps {
  onSendMessage: (msg: string) => void;
  onReroll?: () => void;
  onStopInteraction?: () => void;
  isProcessing: boolean;
  combatState: CombatState;
  commandQueue: { id: string, text: string, undoAction?: () => void }[];
  onRemoveCommand?: (id: string) => void;
  draftInput?: string;
  setDraftInput?: (val: string) => void;
  enableCombatUI?: boolean;
  isHellMode?: boolean;
}

export const GameInput: React.FC<GameInputProps> = ({ 
    onSendMessage, 
    onReroll, 
    onStopInteraction,
    isProcessing, 
    combatState, 
    commandQueue, 
    onRemoveCommand,
    draftInput,
    setDraftInput,
    enableCombatUI,
    isHellMode
}) => {
    const [input, setInput] = useState('');

    useEffect(() => {
        if (draftInput !== undefined) {
            setInput(draftInput);
        }
    }, [draftInput]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        if (setDraftInput) setDraftInput(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isProcessing) return;
        const hasCommands = commandQueue.length > 0;
        if (!input.trim() && !hasCommands) return;
        const safeInput = input.trim() ? input : '执行用户指令';
        onSendMessage(safeInput);
        setInput('');
        if (setDraftInput) setDraftInput('');
    };

    const handleStop = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onStopInteraction) onStopInteraction();
    };

    // Theme logic
    const borderColor = isProcessing ? 'border-blue-600 shadow-[0_0_15px_blue]' : (isHellMode ? 'border-zinc-600 group-hover:border-red-600 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'border-zinc-600 group-hover:border-blue-600 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]');
    const caretColor = isHellMode ? 'text-red-600' : 'text-blue-600';
    const btnHover = isHellMode ? 'hover:bg-red-600' : 'hover:bg-blue-600';

    return (
        <div className="p-6 z-20 bg-gradient-to-t from-black via-zinc-900/90 to-transparent pt-4">
            
            {commandQueue.length > 0 && (
                <div className="mb-3 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 uppercase tracking-widest mb-2">
                        <Command size={10} />
                        用户指令
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {commandQueue.map(cmd => (
                            <div key={cmd.id} className="bg-zinc-900 border border-amber-500/70 text-amber-300 text-xs px-2 py-1 flex items-center gap-2 rounded">
                                <span>{cmd.text}</span>
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveCommand?.(cmd.id);
                                    }}
                                    className="hover:text-white"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative group max-w-4xl mx-auto flex items-end gap-2">
                {onReroll ? (
                    <button
                        type="button"
                        onClick={!isProcessing ? onReroll : undefined}
                        disabled={isProcessing}
                        className={`bg-white text-black h-[60px] w-[100px] transform -skew-x-6 border-2 border-transparent transition-all flex items-center justify-center shadow-lg
                            ${isProcessing 
                                ? 'bg-zinc-800 text-zinc-500 border-zinc-700' 
                                : `hover:border-white ${btnHover} hover:text-white`
                            }
                        `}
                    >
                        <div className="transform skew-x-6 font-display uppercase tracking-widest text-xs font-bold flex items-center gap-2">
                            <RotateCcw size={14} /> REROLL
                        </div>
                    </button>
                ) : (
                    <div className="h-[60px] w-[100px]" />
                )}

                <div className="flex-1 relative">
                    <div className="flex justify-end mb-2 opacity-50 hover:opacity-100 transition-opacity">
                        {isProcessing && (
                            <span className="text-xs text-blue-500 animate-pulse font-mono">
                                AI IS GENERATING RESPONSE...
                            </span>
                        )}
                    </div>

                    <div className={`relative bg-black transform -skew-x-6 border-2 flex items-center p-1 shadow-lg transition-all ${borderColor}`}>
                        <div className={`pl-4 pr-2 transform skew-x-6 ${caretColor}`}>
                            <span className="font-display text-2xl">{`>`}</span>
                        </div>
                        <input
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            placeholder={isProcessing ? "处理中..." : combatState.是否战斗中 ? (enableCombatUI ? "战斗中 | 输入文字进行自由行动..." : "战斗模式 | 请输入指令...") : "你打算做什么？"}
                            disabled={isProcessing}
                            className="flex-1 bg-transparent text-white font-display text-xl px-2 py-3 outline-none placeholder-zinc-700 transform skew-x-6 disabled:cursor-not-allowed"
                            autoFocus
                        />
                    </div>
                </div>

                <button 
                    type={isProcessing ? "button" : "submit"}
                    onClick={isProcessing ? handleStop : undefined}
                    disabled={isProcessing}
                    className={`bg-white text-black h-[60px] w-[100px] transform -skew-x-6 border-2 border-transparent transition-all flex items-center justify-center shadow-lg
                        ${isProcessing 
                            ? 'bg-red-600 text-white hover:bg-red-500 border-red-400' 
                            : `hover:border-white ${btnHover} hover:text-white disabled:bg-zinc-800 disabled:text-zinc-600`
                        }
                    `}
                >
                    <div className="transform skew-x-6 font-display uppercase tracking-widest text-lg font-bold flex items-center gap-2">
                        {isProcessing ? (
                            <>
                                <Square size={16} fill="currentColor" /> STOP
                            </>
                        ) : 'ACT'}
                    </div>
                </button>
            </form>
        </div>
    );
};
