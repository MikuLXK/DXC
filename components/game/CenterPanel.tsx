
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { LogEntry, CombatState, CharacterStats, Skill, InventoryItem, Confidant, ActionOption } from '../../types';
import { MessageSquare, Sword, Eye, Loader2, ChevronRight, MousePointer2, Terminal, Layers, ChevronUp } from 'lucide-react';
import { CombatPanel } from './CombatPanel';
import { LogEntryItem } from './center/LogEntry';
import { GameInput } from './center/GameInput';
import { EditLogModal } from './center/EditLogModal';

interface CenterPanelProps {
  logs: LogEntry[];
  combatState: CombatState;
  playerStats: CharacterStats;
  skills: Skill[];
  inventory?: InventoryItem[];
  confidants: Confidant[];
  onSendMessage: (msg: string) => void;
  onReroll?: () => void;
  lastRawResponse?: string;
  onPlayerAction: (action: 'attack' | 'skill' | 'guard' | 'escape' | 'talk' | 'item', payload?: any) => void;
  isProcessing?: boolean;
  isStreaming?: boolean;
  commandQueue?: { id: string, text: string, undoAction?: () => void }[];
  onRemoveCommand?: (id: string) => void;
  
  onEditLog?: (logId: string, newRawResponse: string) => void;
  onDeleteLog?: (logId: string) => void;
  onEditUserLog?: (logId: string, newText: string) => void;
  onUpdateLogText?: (logId: string, newText: string) => void;
  onStopInteraction?: () => void;
  handleUserRewrite?: (logId: string, newText: string) => void; 
  draftInput?: string;
  setDraftInput?: (val: string) => void;

  actionOptions?: ActionOption[];
  fontSize?: 'small' | 'medium' | 'large'; 
  chatLogLimit?: number | null;
  className?: string;
  enableCombatUI?: boolean;
  isHellMode?: boolean;
}

export const CenterPanel: React.FC<CenterPanelProps> = ({ 
    logs, 
    combatState,
    playerStats,
    skills,
    inventory,
    confidants = [],
    onSendMessage, 
    onReroll, 
    onPlayerAction,
    isProcessing,
    isStreaming,
    lastRawResponse,
    commandQueue = [],
    onRemoveCommand,
    
    onEditLog,
    onDeleteLog,
    onEditUserLog,
    onUpdateLogText,
    onStopInteraction,
    handleUserRewrite,
    draftInput,
    setDraftInput,

    actionOptions = [],
    fontSize = 'medium',
    chatLogLimit = 30,
    className = '',
    enableCombatUI = true,
    isHellMode
}) => {
  const [showCombatUI, setShowCombatUI] = useState(false); 
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMode, setEditMode] = useState<'AI_RAW' | 'USER_TEXT'>('AI_RAW');
  const [jumpTarget, setJumpTarget] = useState('');
  const [jumpHint, setJumpHint] = useState('');
  const [jumpExpanded, setJumpExpanded] = useState(false);
  const [jumpFocused, setJumpFocused] = useState(false);
  const jumpHideTimer = useRef<number | null>(null);
  
  // Refs for scrolling
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  const prevProcessing = useRef(isProcessing);
  const prevLogsLength = useRef(logs.length);

  // Theme constants
  const halftoneColor = isHellMode ? 'bg-red-900/10' : 'bg-halftone-blue opacity-5';
  const textColor = isHellMode ? 'text-red-500' : 'text-blue-500';
  const processingText = isHellMode ? 'text-red-600' : 'text-blue-600';
  const turnDividerColor = isHellMode ? 'border-red-900 text-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]' : 'border-blue-900 text-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.2)]';
  const turnDividerGradient = isHellMode ? 'from-transparent to-red-900' : 'from-transparent to-blue-900';
  const actionBorder = isHellMode ? 'border-red-500/50 hover:border-red-400 hover:bg-red-900/40' : 'border-blue-500/50 hover:border-blue-400 hover:bg-blue-900/40';
  const actionIcon = isHellMode ? 'text-red-500' : 'text-blue-500';
  const actionChevron = isHellMode ? 'text-red-600' : 'text-blue-600';
  const actionBgHighlight = isHellMode ? 'bg-red-500/10' : 'bg-blue-500/10';
  const marqueeTextClass = isHellMode ? 'text-red-200' : 'text-white';
  const marqueeDuplicateClass = isHellMode ? 'text-red-300/70' : 'text-white/70';
  const showCombatShortcut = combatState.是否战斗中 && enableCombatUI && !isProcessing;
  const showQuickActions = !isProcessing && !combatState.是否战斗中 && actionOptions.length > 0;
  const hasCommandQueue = commandQueue.length > 0;
  const logPaddingClass = (showQuickActions || showCombatShortcut)
      ? (hasCommandQueue ? 'pb-28 md:pb-60' : 'pb-20 md:pb-48')
      : (hasCommandQueue ? 'pb-20 md:pb-32' : 'pb-6 md:pb-16');
  const actionDockOffset = hasCommandQueue ? 'bottom-[9.5rem] md:bottom-[150px]' : 'bottom-[5.5rem] md:bottom-[95px]';

  const turnIndices = logs
      .map(l => (typeof l.turnIndex === 'number' ? l.turnIndex : null))
      .filter((t): t is number => t !== null);
  const uniqueTurns = Array.from(new Set(turnIndices)).sort((a, b) => a - b);
  const playableTurns = uniqueTurns.filter(t => t > 0);
  const orderedTurns = playableTurns.length > 0 ? playableTurns : uniqueTurns;
  const totalTurns = orderedTurns.length;
  const limit = chatLogLimit === null ? null : (typeof chatLogLimit === 'number' ? chatLogLimit : 30);
  const startTurnIndex = limit ? Math.max(0, totalTurns - limit) : 0;
  const visibleTurns = orderedTurns.slice(startTurnIndex);
  const visibleTurnSet = new Set(visibleTurns);
  const visibleLogs = logs.filter(l => {
      const t = typeof l.turnIndex === 'number' ? l.turnIndex : null;
      if (t === null) return limit === null;
      if (t === 0) return true;
      return visibleTurnSet.has(t);
  });
  const logIndexMap = new Map<string, number>();
  logs.forEach((log, idx) => logIndexMap.set(log.id, idx));

  const handleJump = () => {
      const target = parseInt(jumpTarget, 10);
      const maxTurn = totalTurns > 0 ? orderedTurns[orderedTurns.length - 1] : 0;
      const minTurn = totalTurns > 0 ? orderedTurns[0] : 0;
      if (Number.isNaN(target) || target < minTurn || target > maxTurn) {
          setJumpHint(`范围: ${minTurn}-${maxTurn || minTurn}`);
          return;
      }
      if (!visibleTurnSet.has(target)) {
          setJumpHint('目标楼层未渲染');
          return;
      }
      const targetLog = logs.find(l => l.turnIndex === target);
      if (!targetLog) {
          setJumpHint('目标楼层不存在');
          return;
      }
      const el = logRefs.current.get(targetLog.id);
      if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setJumpHint(`已跳转: ${target}`);
          setJumpExpanded(true);
      }
  };

  // Scroll Logic
  useLayoutEffect(() => {
      if (prevLogsLength.current === 0 && logs.length > 0) {
          endRef.current?.scrollIntoView({ behavior: 'auto' });
      }
  }, []);

  useEffect(() => {
      if (prevProcessing.current === true && isProcessing === false) {
          if (logs.length > 0) {
              const lastLog = logs[logs.length - 1];
              const lastLogElement = logRefs.current.get(lastLog.id);
              if (lastLogElement) {
                  lastLogElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                  endRef.current?.scrollIntoView({ behavior: 'smooth' });
              }
          }
      }
      else if (isStreaming) {
           endRef.current?.scrollIntoView({ behavior: 'smooth' });
      }

      prevProcessing.current = !!isProcessing;
      prevLogsLength.current = logs.length;
      setJumpHint('');
  }, [isProcessing, isStreaming, logs, lastRawResponse]); 

  useEffect(() => {
      if (!jumpExpanded) return;
      if (jumpFocused || jumpTarget) return;
      if (jumpHideTimer.current) {
          window.clearTimeout(jumpHideTimer.current);
      }
      jumpHideTimer.current = window.setTimeout(() => {
          setJumpExpanded(false);
      }, 3500);
      return () => {
          if (jumpHideTimer.current) {
              window.clearTimeout(jumpHideTimer.current);
          }
      };
  }, [jumpExpanded, jumpFocused, jumpTarget, jumpHint]);

  // Fix: Scroll to bottom when exiting combat UI
  useEffect(() => {
      if (!showCombatUI && logs.length > 0) {
          setTimeout(() => {
              endRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 50);
      }
  }, [showCombatUI]);

  const handleEditAIClick = (log: LogEntry) => {
      if (log.rawResponse) {
          setEditingLogId(log.id);
          setEditContent(log.rawResponse);
          setEditMode('AI_RAW');
      }
  };

  const handleEditUserClick = (logId: string) => {
      const log = logs.find(l => l.id === logId);
      if (log) {
          setEditingLogId(logId);
          setEditContent(log.text);
          setEditMode('USER_TEXT');
      }
  };

  const handleApplyEdit = (content: string, type: 'REWRITE' | 'TEXT_ONLY') => {
      if (editingLogId) {
          if (editMode === 'AI_RAW' && onEditLog) {
              onEditLog(editingLogId, content);
          } else if (editMode === 'USER_TEXT') {
              if (type === 'REWRITE' && handleUserRewrite) {
                  handleUserRewrite(editingLogId, content);
              } else if (type === 'TEXT_ONLY' && onUpdateLogText) {
                  onUpdateLogText(editingLogId, content);
              }
          }
          setEditingLogId(null);
      }
  };

  const setLogRef = (id: string, el: HTMLDivElement | null) => {
      if (el) {
          logRefs.current.set(id, el);
      } else {
          logRefs.current.delete(id);
      }
  };

  const TurnDivider = ({ turn }: { turn?: number }) => {
      if (turn === undefined || turn === 0) return null;
      return (
          <div className="w-full flex items-center justify-center py-6 mb-4">
              <div className={`h-px w-12 md:w-24 bg-gradient-to-r ${turnDividerGradient}`}></div>
              <div className={`mx-4 px-3 py-1 bg-black border ${turnDividerColor} text-[10px] font-display uppercase tracking-[0.2em]`}>
                  Turn {turn}
              </div>
              <div className={`h-px w-12 md:w-24 bg-gradient-to-l ${turnDividerGradient}`}></div>
          </div>
      );
  };

  if (combatState.是否战斗中 && showCombatUI && enableCombatUI) {
      return (
          <div className={`w-full lg:w-[60%] h-full relative flex flex-col bg-zinc-900 md:border-r-4 md:border-black ${className}`}>
              <div className="absolute top-4 right-4 z-50">
                  <button 
                    type="button"
                    onClick={() => setShowCombatUI(false)}
                    className="bg-black/80 text-white border border-white px-3 py-1 text-xs uppercase hover:bg-white hover:text-black flex items-center gap-2"
                  >
                      <MessageSquare size={14} /> <span className="hidden md:inline">返回剧情</span> <span className="md:hidden">Back</span>
                  </button>
              </div>

              <CombatPanel 
                  combatState={combatState} 
                  playerStats={playerStats} 
                  skills={skills}
                  inventory={inventory || []}
                  onPlayerAction={(action, payload) => {
                      onPlayerAction(action, payload);
                      setShowCombatUI(false); 
                  }}
              />
          </div>
      );
  }

  return (
    <div className={`w-full lg:w-[60%] h-full relative flex flex-col bg-zinc-900/95 backdrop-blur-sm overflow-hidden md:border-r-4 md:border-black ${className}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute inset-0 ${halftoneColor}`} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {isProcessing && !isStreaming && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
              <div className={`flex flex-col items-center gap-4 ${processingText}`}>
                  <div className="relative">
                      <Loader2 size={48} className="animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                          <Eye size={18} className="animate-pulse" />
                      </div>
                  </div>
                  <span className="font-display text-xl uppercase tracking-widest animate-pulse">Processing...</span>
              </div>
          </div>
      )}

      {totalTurns > 0 && (
          <div className="absolute top-4 right-4 z-30">
              {jumpExpanded ? (
                  <div
                      onMouseEnter={() => setJumpExpanded(true)}
                      className="flex flex-col gap-2 bg-black/80 border border-zinc-700 px-3 py-2 text-[10px] text-zinc-300 shadow-lg"
                  >
                      <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                              <span className="uppercase tracking-widest">楼层跳转</span>
                              <span className="text-zinc-500">
                                  {visibleTurns[0]}-{visibleTurns[visibleTurns.length - 1]}/{orderedTurns[orderedTurns.length - 1]}
                              </span>
                          </div>
                          <button
                              onClick={() => setJumpExpanded(false)}
                              className="text-zinc-500 hover:text-white"
                              title="自动隐藏"
                          >
                              <ChevronUp size={12} />
                          </button>
                      </div>
                      <div className="flex items-center gap-2">
                          <input
                              type="number"
                              min={orderedTurns[0] ?? 0}
                              max={orderedTurns[orderedTurns.length - 1] ?? 0}
                              value={jumpTarget}
                              onChange={(e) => setJumpTarget(e.target.value)}
                              onFocus={() => setJumpFocused(true)}
                              onBlur={() => setJumpFocused(false)}
                              onKeyDown={(e) => e.key === 'Enter' && handleJump()}
                              className="w-16 bg-zinc-900 border border-zinc-700 text-zinc-200 px-2 py-1 text-[10px] font-mono outline-none"
                              placeholder="楼层"
                          />
                          <button
                              onClick={handleJump}
                              className="px-2 py-1 bg-blue-600 text-white text-[10px] uppercase tracking-widest hover:bg-blue-500"
                          >
                              跳转
                          </button>
                      </div>
                      {jumpHint && <div className="text-[10px] text-zinc-500">{jumpHint}</div>}
                  </div>
              ) : (
                  <button
                      onClick={() => setJumpExpanded(true)}
                      className="flex items-center gap-2 bg-black/80 border border-zinc-700 px-3 py-2 text-[10px] text-zinc-300 hover:text-white hover:border-blue-500"
                  >
                      <Layers size={12} className="text-blue-400" />
                      楼层跳转
                  </button>
              )}
          </div>
      )}

      {/* Logs Scroll Area */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-y-auto p-4 md:p-10 z-10 custom-scrollbar scroll-smooth ${logPaddingClass}`}
      >
        {visibleLogs.map((log) => {
            const globalIndex = logIndexMap.get(log.id) ?? 0;
            const prevLog = logs[globalIndex - 1];
            const isNewTurn = log.turnIndex !== undefined && log.turnIndex > 0 && (!prevLog || log.turnIndex !== prevLog.turnIndex);
            
            const showAiToolbar = !!log.rawResponse;

            return (
                <div key={log.id} ref={(el) => setLogRef(log.id, el)}>
                    {isNewTurn && <TurnDivider turn={log.turnIndex} />}
                    <LogEntryItem 
                        log={log} 
                        isLatest={globalIndex === logs.length - 1} 
                        playerStats={playerStats} 
                        confidants={confidants}
                        onEditClick={handleEditAIClick}
                        onDelete={onDeleteLog}
                        onEditUserLog={handleEditUserClick}
                        fontSize={fontSize} 
                        showAiToolbar={showAiToolbar}
                    />
                </div>
            );
        })}
        
        {/* Streaming Raw Data Display */}
        {isStreaming && lastRawResponse ? (
            <div className="p-4 my-4 bg-black/90 border-l-4 border-green-500 text-[10px] md:text-xs text-green-400 whitespace-pre-wrap shadow-lg opacity-90 animate-in fade-in slide-in-from-bottom-2 font-mono leading-relaxed break-all">
                <div className="flex items-center gap-2 mb-2 text-green-600 font-bold uppercase tracking-widest border-b border-green-900/50 pb-1">
                    <Terminal size={12} className="animate-pulse" /> Incoming Data Stream...
                </div>
                {lastRawResponse}
                <span className="animate-pulse ml-1 text-green-500">_</span>
            </div>
        ) : isStreaming && isProcessing ? (
            <div className={`flex gap-2 items-center p-4 opacity-50 animate-pulse ${textColor}`}>
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs font-mono">Initializing Stream...</span>
            </div>
        ) : null}

        <div ref={endRef} />
      </div>

      {(showCombatShortcut || showQuickActions) && (
          <div className={`absolute ${actionDockOffset} left-0 w-full z-50 pointer-events-none`}>
              <div className="w-full flex flex-col justify-end gap-3 pointer-events-auto">
                  {showCombatShortcut && (
                      <div className="flex justify-center px-4 md:px-10">
                          <button 
                            type="button"
                            onClick={() => setShowCombatUI(true)}
                            className="bg-red-600 text-white border-2 border-white px-6 py-2 font-display text-base md:text-xl uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_25px_red] animate-pulse"
                          >
                              <Sword size={20} /> 进入战斗面板
                          </button>
                      </div>
                  )}

                  {showQuickActions && (
                      <>
                          <div className="w-full h-8 bg-gradient-to-t from-zinc-900/90 to-transparent pointer-events-none" />
                          <div className="flex gap-3 overflow-x-auto px-4 pb-3 custom-scrollbar snap-x touch-pan-x items-end bg-zinc-900/80 backdrop-blur-sm">
                              {actionOptions.map((opt, idx) => {
                                  const shouldMarquee = opt.length > 12;
                                  return (
                                  <button
                                      key={idx}
                                      onClick={() => {
                                          if (setDraftInput) setDraftInput(opt);
                                      }}
                                      className={`flex-shrink-0 snap-start bg-zinc-950/95 border text-left p-3 min-w-[140px] max-w-[220px] group transition-all transform active:scale-95 relative overflow-hidden shadow-lg rounded-sm ${actionBorder}`}
                                  >
                                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${actionBgHighlight}`} />
                                      <div className="flex items-center gap-2 mb-1">
                                          <MousePointer2 size={14} className={`${actionIcon} shrink-0`} />
                                          <div className="relative overflow-hidden w-full">
                                              <div className={`flex w-max items-center gap-6 ${shouldMarquee ? 'action-option-marquee' : ''}`}>
                                                  <span className={`font-bold text-xs md:text-sm whitespace-nowrap leading-tight ${marqueeTextClass}`}>
                                                      {opt}
                                                  </span>
                                                  {shouldMarquee && (
                                                      <span className={`font-bold text-xs md:text-sm whitespace-nowrap leading-tight ${marqueeDuplicateClass}`}>
                                                          {opt}
                                                      </span>
                                                  )}
                                              </div>
                                          </div>
                                      </div>
                                      <ChevronRight size={14} className={`absolute bottom-1 right-1 opacity-50 group-hover:opacity-100 transition-all ${actionChevron}`} />
                                  </button>
                              )})}
                              <div className="w-4 flex-shrink-0" />
                          </div>
                      </>
                  )}
              </div>
              <style>{`
                @keyframes actionOptionMarquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .action-option-marquee {
                  animation: actionOptionMarquee 8s linear infinite;
                }
              `}</style>
          </div>
      )}

      {/* Input Area */}
      <GameInput 
          onSendMessage={onSendMessage} 
          onReroll={onReroll}
          onStopInteraction={onStopInteraction}
          isProcessing={!!isProcessing}
          combatState={combatState}
          commandQueue={commandQueue}
          onRemoveCommand={onRemoveCommand}
          draftInput={draftInput}
          setDraftInput={setDraftInput}
          enableCombatUI={enableCombatUI}
          isHellMode={isHellMode}
      />

      {/* Editing Modal */}
      {editingLogId && (
          <EditLogModal 
            initialContent={editContent} 
            mode={editMode}
            onClose={() => setEditingLogId(null)} 
            onApply={handleApplyEdit} 
          />
      )}
    </div>
  );
};
