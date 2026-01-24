
import React, { useState, useRef } from 'react';
import { X, Heart, Star, BookOpen, Eye, EyeOff, Shield, Upload, MessageSquareDashed, Swords, Dna, Clock, ChevronDown, ChevronUp, Radio, Backpack } from 'lucide-react';
import { Confidant } from '../../../types';

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  confidants: Confidant[];
  onAddToQueue: (cmd: string, undoAction?: () => void, dedupeKey?: string) => void;
  onUpdateConfidant: (id: string, updates: Partial<Confidant>) => void;
}

type SocialTab = 'SPECIAL' | 'ALL';

interface NormalCardProps {
    c: Confidant;
    onToggleAttention: (c: Confidant) => void;
    onToggleContext: (c: Confidant) => void;
}

const NormalCard: React.FC<NormalCardProps> = ({ c, onToggleAttention, onToggleContext }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasGear = !!c.装备 && Object.values(c.装备 || {}).some(Boolean);
    const bagItems = (c.背包 || []).slice(0, 4);

    return (
      <div className="relative bg-zinc-900 border border-zinc-700 p-4 hover:bg-zinc-800 transition-all group shadow-md">
          <div className="flex gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 bg-black border border-zinc-600 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                  {c.头像 ? (
                      <img src={c.头像} alt={c.姓名} className="w-full h-full object-cover" />
                  ) : (
                      <div className="text-zinc-500 font-bold text-2xl">{c.姓名[0]}</div>
                  )}
              </div>
              
              {/* Header Info */}
              <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                      <h3 className="text-white font-bold text-lg truncate group-hover:text-pink-500 transition-colors flex items-center gap-2">
                          {c.姓名}
                          <span className="text-zinc-500 text-[10px] uppercase border border-zinc-700 px-1.5 rounded">{c.身份}</span>
                      </h3>
                      <div className="flex gap-1">
                           {/* Include Context Toggle */}
                          <button 
                              onClick={() => onToggleContext(c)}
                              className={`transition-colors p-1 rounded ${c.强制包含上下文 ? 'text-green-500 bg-green-900/30' : 'text-zinc-600 hover:text-green-500'}`}
                              title="强制包含至AI上下文"
                          >
                              <Radio size={16} />
                          </button>
                          <button 
                              onClick={() => onToggleAttention(c)}
                              className="text-zinc-600 hover:text-yellow-500 transition-colors p-1"
                              title="设为特别关心"
                          >
                              <Eye size={16} />
                          </button>
                      </div>
                  </div>
                  
                  <div className="text-zinc-400 text-xs mt-1 flex flex-wrap items-center gap-3">
                      <span className="uppercase font-mono text-zinc-300">{c.眷族}</span>
                      <span className="text-zinc-700">|</span>
                      <span>{c.种族} · {c.性别} · {c.年龄}岁</span>
                      <span className="text-zinc-700">|</span>
                      <span className="text-pink-400 font-bold">关系: {c.关系状态}</span>
                      {c.称号 && <span className="text-[10px] text-zinc-400 border border-zinc-700 px-1">「{c.称号}」</span>}
                      {c.是否在场 && <span className="text-[10px] text-emerald-400 border border-emerald-900 px-1">在场</span>}
                      {c.是否队友 && <span className="text-[10px] text-indigo-400 border border-indigo-900 px-1">队友</span>}
                      {c.已交换联系方式 && <span className="text-[10px] text-blue-400 border border-blue-900 px-1">已交换联系方式</span>}
                  </div>
              </div>
          </div>

          {/* Intro / Appearance (Always Visible snippet) */}
          <div className="mt-3 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800 pt-2">
              <span className="text-zinc-500 font-bold uppercase mr-2">简介:</span>
              {c.简介 || c.外貌 || "暂无详细描述。"}
          </div>

          {/* Expand Toggle */}
          <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full mt-3 flex items-center justify-center gap-1 text-[10px] text-zinc-600 hover:text-white uppercase tracking-widest bg-black/20 py-1"
          >
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {isExpanded ? "收起信息" : "查看记忆与详情"}
          </button>

          {/* Expanded Content: Memories + Status */}
          {isExpanded && (
              <div className="mt-2 bg-black/40 p-3 border-t border-zinc-700 animate-in slide-in-from-top-2">
                  <h4 className="text-zinc-500 font-bold uppercase text-[10px] flex items-center gap-2 mb-2">
                      <MessageSquareDashed size={10} /> 关键记忆
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                      {c.记忆 && c.记忆.length > 0 ? (
                          c.记忆.map((mem, idx) => (
                              <div key={idx} className="text-[10px] text-zinc-400 border-b border-zinc-800 pb-1 last:border-0 flex gap-2">
                                  <span className="text-zinc-600 font-mono shrink-0">[{mem.时间戳.split(' ')[1] || '??:??'}]</span>
                                  <span>{mem.内容}</span>
                              </div>
                          ))
                      ) : (
                          <div className="text-[10px] text-zinc-700 italic">暂无互动记录</div>
                      )}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                      <div className="bg-zinc-900/60 border border-zinc-800 p-2">
                          <div className="text-[10px] text-zinc-500 uppercase mb-1">档案摘要</div>
                          <div className="text-[10px] text-zinc-300 space-y-1">
                              {c.背景 && <div>背景: {c.背景}</div>}
                              {c.外貌 && <div>外貌: {c.外貌}</div>}
                              {c.性格 && <div>性格: {c.性格}</div>}
                              {c.已知能力 && <div>能力: {c.已知能力}</div>}
                              {!c.背景 && !c.外貌 && !c.性格 && !c.已知能力 && <div className="text-zinc-600 italic">暂无更多档案</div>}
                          </div>
                      </div>
                      {hasGear && (
                          <div className="bg-zinc-900/60 border border-zinc-800 p-2">
                              <div className="text-[10px] text-zinc-500 uppercase mb-1">装备摘要</div>
                              <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-300">
                                  {Object.entries(c.装备 || {}).map(([slot, name]) => (
                                      name ? <span key={slot} className="truncate">{slot}: {name}</span> : null
                                  ))}
                              </div>
                          </div>
                      )}
                      {bagItems.length > 0 && (
                          <div className="bg-zinc-900/60 border border-zinc-800 p-2">
                              <div className="text-[10px] text-zinc-500 uppercase mb-1 flex items-center gap-1">
                                  <Backpack size={10} /> 背包摘要
                              </div>
                              <div className="flex flex-wrap gap-1">
                                  {bagItems.map(item => (
                                      <span key={item.id} className="text-[9px] text-zinc-300 border border-zinc-700 px-1">
                                          {item.名称} x{item.数量}
                                      </span>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          )}
      </div>
    );
};

export const SocialModal: React.FC<SocialModalProps> = ({ 
    isOpen, 
    onClose, 
    confidants, 
    onAddToQueue,
    onUpdateConfidant
}) => {
  const [activeTab, setActiveTab] = useState<SocialTab>('SPECIAL');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedConfidantId, setSelectedConfidantId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleAttention = (c: Confidant) => {
      const isNowSpecial = !c.特别关注;
      onUpdateConfidant(c.id, { 特别关注: isNowSpecial });
      const cmd = isNowSpecial 
        ? `设置 [${c.姓名}] 为特别关注对象，AI补全完整信息。`
        : `取消 [${c.姓名}] 的特别关注`;
      onAddToQueue(cmd, () => onUpdateConfidant(c.id, { 特别关注: !isNowSpecial }), `toggle_special_${c.id}`);
  };

  const handleToggleParty = (c: Confidant) => {
      const isNowParty = !c.是否队友;
      onUpdateConfidant(c.id, { 是否队友: isNowParty });
      const cmd = isNowParty ? `邀请 [${c.姓名}] 加入队伍。` : `将 [${c.姓名}] 移出队伍。`;
      onAddToQueue(cmd, () => onUpdateConfidant(c.id, { 是否队友: !isNowParty }), `toggle_party_${c.id}`);
  };

  const handleToggleContext = (c: Confidant) => {
      const isNowForced = !c.强制包含上下文;
      onUpdateConfidant(c.id, { 强制包含上下文: isNowForced });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && selectedConfidantId) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  onUpdateConfidant(selectedConfidantId, { 头像: ev.target.result as string });
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const triggerUpload = (id: string) => {
      setSelectedConfidantId(id);
      fileInputRef.current?.click();
  };

  const getFilteredConfidants = () => {
      const filtered = activeTab === 'SPECIAL'
          ? confidants.filter(c => c.特别关注)
          : confidants.filter(c => !c.特别关注);
      return [...filtered].sort((a, b) => {
          const presentDiff = Number(!!b.是否在场) - Number(!!a.是否在场);
          if (presentDiff !== 0) return presentDiff;
          const partyDiff = Number(!!b.是否队友) - Number(!!a.是否队友);
          if (partyDiff !== 0) return partyDiff;
          return a.姓名.localeCompare(b.姓名);
      });
  };

  const renderSpecialCard = (c: Confidant) => {
      return (
      <div key={c.id} className="relative bg-zinc-800 border-l-8 border-pink-500 p-6 shadow-lg flex flex-col md:flex-row gap-6 mb-8">
          <div className="absolute top-0 left-0 bg-pink-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
              特别关心
          </div>
          {/* Left Visual */}
          <div className="w-full md:w-64 shrink-0 flex flex-col items-center">
              <div 
                  onClick={() => triggerUpload(c.id)}
                  className="w-48 h-48 bg-black border-4 border-white shadow-[5px_5px_0_rgba(236,72,153,0.8)] overflow-hidden mb-4 relative group flex items-center justify-center cursor-pointer"
              >
                  {c.头像 ? (
                      <img src={c.头像} alt={c.姓名} className="w-full h-full object-cover" />
                  ) : (
                      <div className="text-zinc-700 font-display text-8xl">{c.姓名[0]}</div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload className="text-white" />
                  </div>
                  <div className="absolute bottom-0 w-full bg-pink-600 text-white text-center text-xs font-bold py-1">
                      {c.种族 || "种族不明"}
                  </div>
              </div>
              
              <div className="text-center w-full space-y-1">
                  <h3 className="text-3xl text-white font-display italic tracking-wide">{c.姓名}</h3>
                  <div className="bg-black text-pink-400 px-3 py-1 inline-block font-mono text-xs uppercase tracking-widest border border-pink-900">
                      {c.眷族 || "无眷族"}
                  </div>
                  {c.称号 && (
                      <div className="text-[10px] text-zinc-300 uppercase tracking-widest border border-zinc-700 px-2 py-0.5 inline-block">
                          「{c.称号}」
                      </div>
                  )}
                  <div className="flex justify-center gap-4 mt-2 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><Dna size={12}/> {c.性别 || '未知'}</span>
                      <span className="flex items-center gap-1"><Clock size={12}/> {c.年龄 ? `${c.年龄}岁` : '未知'}</span>
                  </div>
                  <div className="flex justify-center gap-2 mt-2 text-[10px]">
                      {c.是否在场 && <span className="text-emerald-400 border border-emerald-900 px-2">在场</span>}
                      {c.是否队友 && <span className="text-indigo-400 border border-indigo-900 px-2">队友</span>}
                      {c.已交换联系方式 && <span className="text-blue-400 border border-blue-900 px-2">已交换ID</span>}
                  </div>
              </div>
              
              <div className="flex flex-col w-full gap-2 mt-4">
                  <button 
                      onClick={() => handleToggleAttention(c)}
                      className={`w-full py-1.5 flex items-center justify-center gap-2 border transition-all font-bold uppercase text-[10px]
                          ${c.特别关注 
                              ? 'bg-yellow-500 border-yellow-500 text-black hover:bg-yellow-400' 
                              : 'bg-transparent border-zinc-500 text-zinc-500 hover:text-white hover:border-white'
                          }
                      `}
                  >
                      {c.特别关注 ? <Eye size={12} /> : <EyeOff size={12} />}
                      {c.特别关注 ? '特别关心中' : '设为特别关心'}
                  </button>

                  <button 
                      onClick={() => handleToggleParty(c)}
                      className={`w-full py-1.5 flex items-center justify-center gap-2 border transition-all font-bold uppercase text-[10px]
                          ${c.是否队友 
                              ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-500' 
                              : 'bg-transparent border-zinc-500 text-zinc-500 hover:text-white hover:border-white'
                          }
                      `}
                  >
                      <Swords size={12} />
                      {c.是否队友 ? '已入队' : '邀请入队'}
                  </button>
              </div>
          </div>

          {/* Right Info */}
          <div className="flex-1 flex flex-col">
               <div className="flex flex-wrap gap-6 border-b border-zinc-700 pb-4 mb-4">
                   <div className="flex flex-col">
                       <span className="text-[10px] text-zinc-500 uppercase font-bold">等级</span>
                       <span className="text-2xl font-display text-white">{c.等级 || '???'}</span>
                   </div>
                   <div className="flex flex-col">
                       <span className="text-[10px] text-zinc-500 uppercase font-bold">好感度</span>
                       <span className="text-2xl font-display text-pink-500 flex items-center gap-1">
                           <Heart size={18} fill="currentColor"/> {c.好感度}
                       </span>
                   </div>
                   <div className="flex flex-col">
                       <span className="text-[10px] text-zinc-500 uppercase font-bold">关系</span>
                       <span className="text-lg font-sans text-zinc-300 mt-1">{c.关系状态}</span>
                   </div>
                   
               </div>

               <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="space-y-4 flex flex-col">
                       <div>
                           <h4 className="text-pink-400 font-bold uppercase text-xs flex items-center gap-2 mb-1"><BookOpen size={14}/> 背景</h4>
                           <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                               {c.背景 || "暂无背景信息。"}
                           </p>
                       </div>
                       <div>
                           <h4 className="text-pink-400 font-bold uppercase text-xs flex items-center gap-2 mb-1"><Star size={14}/> 外貌</h4>
                           <p className="text-zinc-400 text-xs leading-relaxed">
                               {c.外貌 || c.简介 || "暂无外貌描述。"}
                           </p>
                       </div>
                       <div>
                           <h4 className="text-pink-400 font-bold uppercase text-xs flex items-center gap-2 mb-1"><Star size={14}/> 性格</h4>
                           <p className="text-zinc-400 text-xs leading-relaxed">
                               {c.性格 || "暂无性格信息。"}
                           </p>
                       </div>
                       <div>
                           <h4 className="text-pink-400 font-bold uppercase text-xs flex items-center gap-2 mb-1"><Star size={14}/> 能力</h4>
                           <p className="text-zinc-400 text-xs leading-relaxed">
                               {c.已知能力 || "暂无情报"}
                           </p>
                       </div>

                       <div className="flex-1 min-h-[100px] bg-black/40 p-3 border border-pink-900/30 overflow-hidden flex flex-col">
                           <h4 className="text-zinc-500 font-bold uppercase text-xs flex items-center gap-2 mb-2">
                               <MessageSquareDashed size={12} /> 关键记忆
                           </h4>
                           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                               {c.记忆 && c.记忆.length > 0 ? (
                                   c.记忆.map((mem, idx) => (
                                       <div key={idx} className="text-[10px] text-zinc-400 border-b border-zinc-800 pb-1 last:border-0 flex gap-2">
                                           <span className="text-zinc-600 font-mono shrink-0">[{mem.时间戳.split(' ')[1] || '??:??'}]</span>
                                           <span>{mem.内容}</span>
                                       </div>
                                   ))
                               ) : (
                                   <div className="text-[10px] text-zinc-600 italic">暂无互动记录</div>
                               )}
                           </div>
                       </div>
                   </div>

                   <div className="bg-black/40 p-4 border border-zinc-700 h-full">
                       <h4 className="text-zinc-500 font-bold uppercase text-xs mb-3 flex items-center gap-2">
                           <Shield size={12} /> 角色档案
                       </h4>
                       <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-300">
                           <div>身份: {c.身份 || '未知'}</div>
                           <div>种族: {c.种族 || '未知'}</div>
                           <div>眷族: {c.眷族 || '未知'}</div>
                           <div>称号: {c.称号 || '暂无'}</div>
                       </div>
                       <div className="text-[10px] text-zinc-400 mt-3 leading-relaxed">
                           {c.简介 || '暂无补充档案。'}
                       </div>
                   </div>
               </div>
               <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                   <div className="bg-black/40 p-4 border border-zinc-700">
                       <h4 className="text-zinc-500 font-bold uppercase text-xs mb-2 flex items-center gap-2">
                           <Backpack size={12} /> 装备与背包
                       </h4>
                       <div className="text-[10px] text-zinc-300 space-y-1">
                           {c.装备 && Object.values(c.装备).some(Boolean) ? (
                               <div className="grid grid-cols-2 gap-1">
                                   {Object.entries(c.装备).map(([slot, name]) => (
                                       name ? <span key={slot} className="truncate">{slot}: {name}</span> : null
                                   ))}
                               </div>
                           ) : (
                               <div className="text-zinc-600 italic">暂无装备</div>
                           )}
                           {(c.背包 || []).length > 0 && (
                               <div className="flex flex-wrap gap-1 mt-2">
                                   {c.背包?.slice(0, 6).map(item => (
                                       <span key={item.id} className="text-[9px] text-zinc-200 border border-zinc-700 px-1">
                                           {item.名称} x{item.数量}
                                       </span>
                                   ))}
                               </div>
                           )}
                       </div>
                   </div>
               </div>
          </div>
      </div>
      );
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl bg-zinc-900 border-2 border-pink-500 transform skew-x-2 relative shadow-[10px_10px_0_0_rgba(236,72,153,0.5)] max-h-[90vh] flex flex-col">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
        <div className="bg-pink-600 p-4 flex justify-between items-center border-b-2 border-white">
            <div className="flex items-center gap-4 text-white">
                <Heart className="w-8 h-8 fill-current" />
                <h2 className="text-4xl font-display uppercase tracking-wider transform -skew-x-2">社交 / 羁绊</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:text-pink-600 transition-colors border border-white transform -skew-x-2">
                <X className="w-6 h-6" />
            </button>
        </div>
        <div className="flex bg-black border-b border-pink-900">
            <button onClick={() => setActiveTab('SPECIAL')} className={`flex-1 py-3 font-display uppercase text-xl tracking-widest transition-colors ${activeTab === 'SPECIAL' ? 'bg-zinc-800 text-pink-500 border-b-4 border-pink-500' : 'text-zinc-600 hover:text-zinc-300'}`}>特别关心</button>
            <button onClick={() => setActiveTab('ALL')} className={`flex-1 py-3 font-display uppercase text-xl tracking-widest transition-colors ${activeTab === 'ALL' ? 'bg-zinc-800 text-pink-500 border-b-4 border-pink-500' : 'text-zinc-600 hover:text-zinc-300'}`}>普通联系人</button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-zinc-900">
            <div className={`grid gap-4 ${activeTab === 'ALL' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {getFilteredConfidants().length > 0 ? (
                    getFilteredConfidants().map(c => activeTab === 'SPECIAL' ? renderSpecialCard(c) : <NormalCard key={c.id} c={c} onToggleAttention={handleToggleAttention} onToggleContext={handleToggleContext} />)
                ) : <div className="col-span-full text-center text-zinc-500 font-display text-2xl py-20">{activeTab === 'SPECIAL' ? "暂无特别关心对象" : "暂无普通联系人"}</div>}
            </div>
        </div>
      </div>
    </div>
  );
};

