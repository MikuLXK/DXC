
import React from 'react';
import { LogEntry, CharacterStats, Confidant } from '../../../types';
import { Edit2, Terminal, Trash2, Info, Sparkles } from 'lucide-react';
import { getAvatarColor } from '../../../utils/uiUtils';

interface LogEntryProps {
  log: LogEntry;
  isLatest: boolean;
  playerStats: CharacterStats;
  confidants: Confidant[];
  onEditClick: (log: LogEntry) => void;
  onDelete?: (logId: string) => void;
  onEditUserLog?: (logId: string) => void;
  fontSize?: 'small' | 'medium' | 'large';
  showAiToolbar?: boolean; 
}

export const LogEntryItem: React.FC<LogEntryProps> = ({ 
    log, 
    isLatest, 
    playerStats, 
    confidants, 
    onEditClick, 
    onDelete,
    onEditUserLog,
    fontSize = 'medium',
    showAiToolbar = false
}) => {
    
    const senderName = log.sender || "System";
    const isNarrator = ['旁白', 'narrator', 'narrative', 'scene', '环境'].includes(senderName.toLowerCase());
    const isSystem = ['system', '系统', 'hint', 'guide'].includes(senderName.toLowerCase());
    const isPlayer = senderName === 'player';
    
    const content = log.text || "";
    const isPrimaryAiLog = !!log.rawResponse;
    const canEditAI = !isPlayer && isPrimaryAiLog && !!onEditClick;
    const canEditUser = isPlayer && !!onEditUserLog;
    const canDelete = !!onDelete && (isPrimaryAiLog || isPlayer);
    const hasActions = canEditAI || canEditUser || canDelete;

    const getTextSize = () => {
        switch(fontSize) {
            case 'small': return 'text-xs leading-relaxed';
            case 'large': return 'text-base md:text-xl leading-relaxed';
            case 'medium': default: return 'text-sm md:text-base leading-relaxed';
        }
    };
    const textSizeClass = getTextSize();

    const renderDecoratedText = (text: string, className: string) => {
        const lines = text.split('\n');
        return (
            <div className={`${className} whitespace-pre-wrap space-y-1`}>
                {lines.map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) {
                        return <div key={idx} className="h-3" />;
                    }
                    const isJudge = trimmed.startsWith('【判定】');
                    if (isJudge) {
                        return (
                            <div
                                key={idx}
                                className="px-2 py-1 border border-blue-600/50 bg-blue-950/40 text-blue-200 font-mono tracking-widest text-[11px] uppercase"
                            >
                                {line}
                            </div>
                        );
                    }
                    return (
                        <div key={idx}>
                            {line}
                        </div>
                    );
                })}
            </div>
        );
    };

    const MobileActions = ({ align }: { align: 'left' | 'right' | 'center' }) => {
        if (!hasActions) return null;
        if (!isPlayer && !isPrimaryAiLog) return null;
        const alignClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';
        return (
            <div className={`md:hidden mt-2 flex gap-2 ${alignClass}`}>
                {canEditAI && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditClick(log);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider border border-zinc-700 text-zinc-300 bg-black/70 hover:text-white hover:border-green-500"
                    >
                        <Terminal size={12} /> 原文
                    </button>
                )}
                {canEditUser && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditUserLog?.(log.id);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider border border-zinc-700 text-zinc-300 bg-black/70 hover:text-white hover:border-blue-500"
                    >
                        <Edit2 size={12} /> 编辑
                    </button>
                )}
                {canDelete && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(log.id);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider border border-zinc-700 text-zinc-300 bg-black/70 hover:text-white hover:border-red-500"
                    >
                        <Trash2 size={12} /> 删除
                    </button>
                )}
            </div>
        );
    };

    // Unified Action Menu - Desktop Only
    const ActionMenu = () => {
        if (!hasActions) return null;

        return (
            <div className="hidden md:block absolute z-30" style={{ top: '-1.5rem', right: isPlayer ? 'auto' : '0', left: isPlayer ? '-0.5rem' : 'auto' }}>
                <div className="relative">
                    <div className={`
                        flex flex-row gap-1 
                        bg-zinc-900/95 backdrop-blur-md border border-zinc-700 p-1.5 rounded-lg shadow-xl
                        transition-all duration-200 origin-center
                        opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
                    `}>
                        {/* Edit Action */}
                        {(canEditAI || canEditUser) && (
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (isPlayer) onEditUserLog!(log.id); 
                                    else onEditClick!(log); 
                                }}
                                className="flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-blue-600 rounded transition-colors whitespace-nowrap"
                                title="编辑内容"
                            >
                                <Edit2 size={12} />
                            </button>
                        )}

                        {/* Delete Action */}
                        {canDelete && (
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onDelete(log.id); 
                                }}
                                className="flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-red-600 rounded transition-colors whitespace-nowrap"
                                title="删除消息"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // --- 1. SYSTEM MESSAGE (系统通知) ---
    if (isSystem) {
        return (
            <div className="group relative flex w-full justify-center my-4 animate-in fade-in duration-300">
                <ActionMenu />
                <div className="flex flex-col items-center">
                    <div className="relative max-w-[90%] bg-zinc-900/80 border-x-4 border-zinc-700 px-6 py-2 shadow-sm backdrop-blur-sm">
                        <div className="absolute inset-0 bg-stripes opacity-5 pointer-events-none" />
                        <div className="flex items-center gap-3 text-center">
                            {content.includes('好感度') || content.includes('up') ? (
                                <Sparkles size={14} className="text-yellow-500 shrink-0" />
                            ) : (
                                <Terminal size={14} className="text-green-500 shrink-0" />
                            )}
                            <span className={`font-mono text-xs md:text-sm text-zinc-300 ${content.includes('好感度') ? 'text-yellow-100' : ''}`}>
                                {content}
                            </span>
                        </div>
                    </div>
                    <MobileActions align="center" />
                </div>
            </div>
        );
    }

    // --- 2. NARRATOR (旁白/环境描写) ---
    if (isNarrator) {
        return (
            <div className="group relative w-full my-6 px-2 md:px-8 animate-in fade-in duration-700">
                <div className="flex justify-end pr-4 mb-[-10px] relative z-20">
                    <ActionMenu />
                </div>
                <div className="relative bg-zinc-950/70 border border-blue-900/60 px-5 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-sm">
                    <div className="absolute inset-1 border border-blue-900/30 pointer-events-none" />
                    {renderDecoratedText(content, `font-serif text-zinc-200 text-justify tracking-wide text-sm md:text-base leading-relaxed`)}
                </div>
                <MobileActions align="left" />
            </div>
        );
    }

    // --- 3. PLAYER MESSAGE (玩家) ---
    if (isPlayer) {
        return (
            <div className="group relative flex w-full justify-end my-4 pl-10 animate-in slide-in-from-right-4 fade-in duration-300">
                <ActionMenu />

                <div className="flex items-end gap-3 max-w-full">
                    <div className="flex flex-col items-end">
                        <div className="bg-black border border-zinc-700 text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-[0_4px_10px_rgba(0,0,0,0.5)] relative min-w-[60px] group-hover:border-blue-500 transition-colors">
                            {renderDecoratedText(content, `font-display tracking-wide ${textSizeClass}`)}
                        </div>
                        <MobileActions align="right" />
                    </div>
                    
                    <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full border-2 border-zinc-600 overflow-hidden bg-black shadow-lg">
                        <img src={playerStats.头像 || "https://picsum.photos/200"} alt="You" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        );
    }

    // --- 4. NPC DIALOGUE (角色对话) ---
    const npc = confidants.find(c => c.姓名 === senderName);
    const avatarUrl = npc?.头像;
    const initial = senderName[0] || "?";
    const bgColor = getAvatarColor(senderName);

    return (
        <div className="group relative flex w-full justify-start my-6 pr-10 animate-in slide-in-from-left-4 fade-in duration-300">
            <div className="absolute right-0 top-0">
                 <ActionMenu />
            </div>
            
            <div className="flex items-start gap-4 max-w-full">
                <div className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 border-2 border-zinc-700 overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-black relative z-10
                        ${!avatarUrl ? bgColor : ''}
                    `}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={senderName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-display font-bold text-xl">
                                {initial}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-start relative">
                    <div className="bg-zinc-950 border border-zinc-700 text-zinc-400 px-3 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 transform -skew-x-12 ml-1 shadow-sm">
                        {senderName}
                    </div>

                    <div className="bg-white text-black px-5 py-4 clip-p5-bubble-left shadow-[5px_5px_0_rgba(0,0,0,0.3)] relative min-w-[120px]">
                        {renderDecoratedText(content, `font-display font-bold drop-shadow-sm ${textSizeClass}`)}
                    </div>
                    <MobileActions align="left" />
                </div>
            </div>
        </div>
    );
};
