
import React, { useState } from 'react';
import { X, Swords, Heart, Zap, Battery, Shield, User, Backpack, Shirt, Crown, Dna, Clock, Activity } from 'lucide-react';
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

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-7xl h-[85vh] relative flex overflow-hidden shadow-2xl border-4 border-red-700">
        
        {/* Background Slash */}
        <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
            <div className="absolute top-0 right-0 w-[65%] h-full bg-red-900/20 transform -skew-x-[20deg] origin-top-right border-l-2 border-red-500/50" />
            <div className="absolute inset-0 bg-halftone opacity-20 pointer-events-none" />
        </div>

        {/* --- Sidebar (Roster List) --- */}
        <div className="w-1/3 z-10 flex flex-col py-8 pl-8 pr-4 relative border-r border-red-900/50 bg-black/40">
            <div className="text-white mb-8">
                <h2 className="text-4xl font-display uppercase tracking-tighter italic text-red-500 text-shadow-red flex items-center gap-3">
                    <Swords size={36} /> Party Roster
                </h2>
                <p className="text-xs text-zinc-500 font-mono mt-1">ACTIVE COMBAT UNIT</p>
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
                                <div className={`text-lg font-display uppercase italic tracking-wide ${selectedMemberId === c.id ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
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
                        No Party Members
                    </div>
                )}
            </div>
        </div>

        {/* --- Main Content (Detailed Stats) --- */}
        <div className="flex-1 z-10 p-8 relative flex flex-col bg-gradient-to-br from-transparent to-black/80">
             {/* Close Button */}
             <button onClick={onClose} className="absolute top-6 right-6 text-zinc-400 hover:text-white hover:rotate-90 transition-all z-50 p-2">
                <X size={32} />
             </button>

             {selectedMember ? (
                 <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-500">
                     
                     {/* Top: Header & Bio */}
                     <div className="flex justify-between items-end border-b-2 border-red-600 pb-4">
                         <div>
                             <h1 className="text-6xl font-display font-black text-white italic tracking-tighter uppercase leading-none">
                                 {selectedMember.姓名}
                             </h1>
                             <div className="flex gap-4 mt-2 text-sm font-mono text-zinc-400">
                                 <span className="flex items-center gap-1"><Dna size={14}/> {selectedMember.种族}</span>
                                 <span className="flex items-center gap-1"><User size={14}/> {selectedMember.性别}</span>
                                 <span className="flex items-center gap-1"><Clock size={14}/> {selectedMember.年龄}岁</span>
                                 <span className="px-2 bg-red-900 text-white text-xs rounded">{selectedMember.眷族}</span>
                             </div>
                         </div>
                         <div className="text-right">
                             <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Rank</div>
                             <div className="text-4xl font-display text-white">{selectedMember.等级}</div>
                         </div>
                     </div>

                     <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                         
                         {/* Stats Column */}
                         <div className="space-y-6">
                             {/* Vitals */}
                             <div className="bg-black/50 p-4 border border-zinc-700">
                                 <h4 className="text-zinc-500 font-bold uppercase text-xs mb-3 flex items-center gap-2">
                                     <Activity size={14} className="text-red-500"/> Vitals
                                 </h4>
                                 <div className="space-y-2">
                                    <StatBar label="HP" current={selectedMember.生存数值?.当前生命 || 100} max={selectedMember.生存数值?.最大生命 || 100} color="bg-green-600" />
                                    <StatBar label="MP" current={selectedMember.生存数值?.当前精神 || 50} max={selectedMember.生存数值?.最大精神 || 50} color="bg-purple-600" />
                                    <StatBar label="STM" current={selectedMember.生存数值?.当前体力 || 100} max={selectedMember.生存数值?.最大体力 || 100} color="bg-yellow-600" />
                                 </div>
                             </div>

                             {/* Attributes */}
                             <div className="grid grid-cols-2 gap-2">
                                 <StatBlock label="STR 力量" val={selectedMember.能力值?.力量} />
                                 <StatBlock label="END 耐久" val={selectedMember.能力值?.耐久} />
                                 <StatBlock label="DEX 灵巧" val={selectedMember.能力值?.灵巧} />
                                 <StatBlock label="AGI 敏捷" val={selectedMember.能力值?.敏捷} />
                                 <StatBlock label="MAG 魔力" val={selectedMember.能力值?.魔力} />
                             </div>
                         </div>

                         {/* Gear Column */}
                         <div className="space-y-6 flex flex-col">
                             <div className="bg-zinc-800/50 p-4 border-l-4 border-red-600 flex-1">
                                 <h4 className="text-white font-bold uppercase text-sm mb-4 flex items-center gap-2 border-b border-zinc-700 pb-2">
                                     <Shield size={16}/> Equipment
                                 </h4>
                                 <div className="space-y-4">
                                     <EquipRow label="Main Hand" item={selectedMember.装备?.主手} />
                                     <EquipRow label="Off Hand" item={selectedMember.装备?.副手} />
                                     <EquipRow label="Body Armor" item={selectedMember.装备?.身体} />
                                     <EquipRow label="Accessory" item={selectedMember.装备?.饰品} />
                                 </div>
                             </div>

                             <div className="bg-zinc-900 border border-zinc-700 p-4 h-40 overflow-hidden flex flex-col">
                                 <h4 className="text-zinc-500 font-bold uppercase text-xs mb-2 flex items-center gap-2">
                                     <Backpack size={14}/> Backpack (Top Items)
                                 </h4>
                                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                                     <div className="grid grid-cols-2 gap-2">
                                         {selectedMember.背包 && selectedMember.背包.length > 0 ? selectedMember.背包.slice(0, 6).map((item, i) => (
                                             <div key={i} className="bg-black p-2 text-[10px] text-zinc-300 border border-zinc-800 truncate">
                                                 {item.名称} x{item.数量}
                                             </div>
                                         )) : <div className="text-zinc-600 text-xs italic">Empty</div>}
                                     </div>
                                 </div>
                             </div>
                         </div>

                     </div>
                 </div>
             ) : (
                 <div className="flex items-center justify-center h-full text-zinc-600 font-display text-4xl uppercase opacity-50">
                     Select a Character
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
            {item || "Unequipped"}
        </div>
    </div>
);
