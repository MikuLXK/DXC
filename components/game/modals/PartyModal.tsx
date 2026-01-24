
import React, { useState, useEffect } from 'react';
import { X, Swords, Shield, User, Backpack, Crown, Dna, Clock, Activity } from 'lucide-react';
import { Confidant } from '../../../types';

interface PartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Confidant[];
}

export const PartyModal: React.FC<PartyModalProps> = ({ isOpen, onClose, characters }) => {
  if (!isOpen) return null;

  const partyMembers = characters.filter(c => c.是否队友);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(partyMembers[0]?.id || "");
  const selectedMember = partyMembers.find(c => c.id === selectedMemberId);

  useEffect(() => {
    if (partyMembers.length === 0) return;
    if (!selectedMemberId || !partyMembers.some(c => c.id === selectedMemberId)) {
      setSelectedMemberId(partyMembers[0].id);
    }
  }, [partyMembers, selectedMemberId]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-7xl h-[85vh] relative flex flex-col md:flex-row overflow-hidden shadow-2xl border-4 border-red-700">
        
        {/* Background Slash */}
        <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
            <div className="absolute top-0 right-0 w-[65%] h-full bg-red-900/20 transform -skew-x-[20deg] origin-top-right border-l-2 border-red-500/50" />
            <div className="absolute inset-0 bg-halftone opacity-20 pointer-events-none" />
        </div>

        {/* --- Sidebar (Roster List) --- */}
        <div className="w-full md:w-1/3 z-10 flex flex-col py-6 px-6 md:pl-8 md:pr-4 relative border-b md:border-b-0 md:border-r border-red-900/50 bg-black/40 max-h-[35vh] md:max-h-none">
            <div className="text-white mb-6">
                <h2 className="text-3xl md:text-4xl font-display uppercase tracking-tighter italic text-red-500 text-shadow-red flex items-center gap-3">
                    <Swords size={30} /> 队伍名单
                </h2>
                <p className="text-[10px] md:text-xs text-zinc-500 font-mono mt-1">当前出战队伍</p>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                {partyMembers.length > 0 ? partyMembers.map(c => (
                    <button 
                        key={c.id}
                        onClick={() => setSelectedMemberId(c.id)}
                        className={`w-full group relative transition-all duration-300 overflow-hidden border-l-4
                            ${selectedMemberId === c.id 
                                ? 'bg-red-900/80 border-white translate-x-2' 
                                : 'bg-zinc-900/80 border-zinc-700 hover:bg-zinc-800 hover:border-red-500'
                            }
                        `}
                    >
                        <div className="flex items-center p-3 gap-4">
                            {/* Small Avatar */}
                            <div className={`w-12 h-12 flex items-center justify-center font-bold text-xl border-2 shrink-0 ${selectedMemberId === c.id ? 'border-white text-white' : 'border-zinc-600 text-zinc-500'}`}>
                                {c.姓名[0]}
                            </div>
                            
                            <div className="flex-1 text-left">
                                <div className={`text-base md:text-lg font-display uppercase italic tracking-wide ${selectedMemberId === c.id ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
                                    {c.姓名}
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex gap-2">
                                    <span>LV.{c.等级}</span>
                                    <span>{c.身份}</span>
                                </div>
                            </div>
                            
                            {selectedMemberId === c.id && <Crown size={16} className="text-yellow-500 animate-pulse" />}
                        </div>
                    </button>
                )) : (
                    <div className="text-zinc-500 text-xl font-display uppercase p-8 border-2 border-zinc-700 border-dashed text-center">
                        暂无队伍成员
                    </div>
                )}
            </div>
        </div>

        {/* --- Main Content (Detailed Stats) --- */}
        <div className="flex-1 z-10 p-6 md:p-8 relative flex flex-col bg-gradient-to-br from-transparent to-black/80 overflow-y-auto custom-scrollbar">
             {/* Close Button */}
             <button onClick={onClose} className="absolute top-6 right-6 text-zinc-400 hover:text-white hover:rotate-90 transition-all z-50 p-2">
                <X size={32} />
             </button>

             {selectedMember ? (
                 <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-500">
                     
                     {/* Top: Header & Bio */}
                     <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b-2 border-red-600 pb-4 gap-4">
                         <div>
                             <h1 className="text-4xl md:text-6xl font-display font-black text-white italic tracking-tighter uppercase leading-none">
                                 {selectedMember.姓名}
                             </h1>
                             <div className="flex flex-wrap gap-3 mt-2 text-xs md:text-sm font-mono text-zinc-400">
                                 <span className="flex items-center gap-1"><Dna size={14}/> {selectedMember.种族}</span>
                                 <span className="flex items-center gap-1"><User size={14}/> {selectedMember.性别}</span>
                                 <span className="flex items-center gap-1"><Clock size={14}/> {selectedMember.年龄}岁</span>
                                 <span className="px-2 bg-red-900 text-white text-xs rounded">{selectedMember.眷族}</span>
                             </div>
                         </div>
                         <div className="text-right">
                             <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">等级</div>
                             <div className="text-4xl font-display text-white">{selectedMember.等级}</div>
                         </div>
                     </div>

                     <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                         
                         {/* Stats Column */}
                         <div className="space-y-6">
                             {/* Vitals */}
                             <div className="bg-black/50 p-4 border border-zinc-700">
                                 <h4 className="text-zinc-500 font-bold uppercase text-xs mb-3 flex items-center gap-2">
                                     <Activity size={14} className="text-red-500"/> 生存数值
                                 </h4>
                                 <div className="space-y-2">
                                    <StatBar label="生命" current={selectedMember.生存数值?.当前生命 || 100} max={selectedMember.生存数值?.最大生命 || 100} color="bg-green-600" />
                                    <StatBar label="精神" current={selectedMember.生存数值?.当前精神 || 50} max={selectedMember.生存数值?.最大精神 || 50} color="bg-purple-600" />
                                    <StatBar label="体力" current={selectedMember.生存数值?.当前体力 || 100} max={selectedMember.生存数值?.最大体力 || 100} color="bg-yellow-600" />
                                 </div>
                             </div>

                             {/* Attributes */}
                             <div className="grid grid-cols-2 gap-2">
                                 <StatBlock label="力量" val={selectedMember.能力值?.力量} />
                                 <StatBlock label="耐久" val={selectedMember.能力值?.耐久} />
                                 <StatBlock label="灵巧" val={selectedMember.能力值?.灵巧} />
                                 <StatBlock label="敏捷" val={selectedMember.能力值?.敏捷} />
                                 <StatBlock label="魔力" val={selectedMember.能力值?.魔力} />
                             </div>
                         </div>

                         {/* Gear Column */}
                         <div className="space-y-6 flex flex-col">
                             <div className="bg-zinc-800/50 p-4 border-l-4 border-red-600 flex-1">
                                 <h4 className="text-white font-bold uppercase text-sm mb-4 flex items-center gap-2 border-b border-zinc-700 pb-2">
                                     <Shield size={16}/> 装备
                                 </h4>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                     <EquipRow label="主武器" item={selectedMember.装备?.主手} />
                                     <EquipRow label="防具" item={selectedMember.装备?.身体} />
                                 </div>
                             </div>

                             <div className="bg-zinc-900 border border-zinc-700 p-4 min-h-[160px] overflow-hidden flex flex-col">
                                 <h4 className="text-zinc-500 font-bold uppercase text-xs mb-2 flex items-center gap-2">
                                     <Backpack size={14}/> 队伍背包
                                 </h4>
                                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                                     <div className="grid grid-cols-2 gap-2">
                                         {selectedMember.背包 && selectedMember.背包.length > 0 ? selectedMember.背包.slice(0, 8).map((item, i) => (
                                             <div key={item.id || i} className="bg-black p-2 text-[10px] text-zinc-300 border border-zinc-800">
                                                 <div className="text-[9px] text-zinc-500 uppercase">{getItemTypeLabel(item.类型)}</div>
                                                 <div className="text-xs text-zinc-200 truncate">{item.名称}</div>
                                                 <div className="flex items-center justify-between text-[9px] text-zinc-500 mt-1">
                                                     <span>x{item.数量}</span>
                                                     <span>{getItemQualityLabel(item.品质)}</span>
                                                 </div>
                                             </div>
                                         )) : <div className="text-zinc-600 text-xs italic">暂无物品</div>}
                                     </div>
                                 </div>
                             </div>
                         </div>

                     </div>
                 </div>
             ) : (
                 <div className="flex items-center justify-center h-full text-zinc-600 font-display text-4xl uppercase opacity-50">
                     请选择队友
                 </div>
             )}
        </div>

      </div>
    </div>
  );
};

const StatBar = ({ label, current, max, color }: any) => (
    <div className="flex items-center gap-2 text-xs font-bold text-white">
        <span className="w-8 font-mono">{label}</span>
        <div className="flex-1 h-4 bg-zinc-900 border border-zinc-700 skew-x-[-15deg] overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${(current/max)*100}%` }} />
        </div>
        <span className="font-mono w-16 text-right text-zinc-400">{current}/{max}</span>
    </div>
);

const StatBlock = ({ label, val }: any) => (
    <div className="bg-zinc-900 border border-zinc-700 p-2 flex justify-between items-baseline hover:bg-zinc-800 transition-colors">
        <span className="text-zinc-500 font-bold text-[10px] uppercase">{label}</span>
        <span className="font-display text-xl text-white">{val || '-'}</span>
    </div>
);

const EquipRow = ({ label, item }: any) => (
    <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">{label}</span>
        <div className="font-display text-lg uppercase bg-black/40 px-3 py-1 border-l-2 border-zinc-600 text-zinc-200">
            {item || "未装备"}
        </div>
    </div>
);

const getItemTypeLabel = (type?: string) => {
    switch (type) {
        case 'consumable': return '消耗品';
        case 'material': return '材料';
        case 'key_item': return '关键';
        case 'weapon': return '武器';
        case 'armor': return '防具';
        case 'loot': return '战利品';
        default: return type || '未知';
    }
};

const getItemQualityLabel = (quality?: string) => {
    switch (quality) {
        case 'Legendary': return '传说';
        case 'Epic': return '史诗';
        case 'Rare': return '稀有';
        case 'Common': return '普通';
        case 'Broken': return '破损';
        default: return quality || '普通';
    }
};
