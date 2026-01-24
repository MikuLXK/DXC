
import React from 'react';
import { X, Gem, Archive, Box, Shield, Sword, Beaker, Leaf, Star } from 'lucide-react';
import { InventoryItem } from '../../../types';

interface LootModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  carrier?: string;
}

export const LootModal: React.FC<LootModalProps> = ({ isOpen, onClose, items, carrier }) => {
  if (!isOpen) return null;

  const getQualityStyle = (quality: string = 'Common') => {
      switch (quality) {
          case 'Legendary': return { border: 'border-yellow-500', text: 'text-yellow-400', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.35)]' };
          case 'Epic': return { border: 'border-purple-500', text: 'text-purple-300', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.35)]' };
          case 'Rare': return { border: 'border-cyan-500', text: 'text-cyan-300', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.35)]' };
          case 'Broken': return { border: 'border-red-600', text: 'text-red-400', glow: 'shadow-[0_0_20px_rgba(220,38,38,0.35)]' };
          default: return { border: 'border-[#78350f]', text: 'text-[#e7e5e4]', glow: 'shadow-[0_0_20px_rgba(120,53,15,0.25)]' };
      }
  };

  const getItemIcon = (type: string) => {
      switch(type) {
          case 'weapon': return <Sword size={28} />;
          case 'armor': return <Shield size={28} />;
          case 'consumable': return <Beaker size={28} />;
          case 'material': return <Leaf size={28} />;
          case 'key_item': return <Box size={28} />;
          default: return <Gem size={28} />;
      }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-[#1c1917] border-4 border-[#d4af37] relative flex flex-col shadow-[0_0_50px_rgba(212,175,55,0.2)] max-h-[85vh]">
        
        {/* Decorative Header */}
        <div className="bg-[#292524] p-6 flex justify-between items-center border-b border-[#78350f]">
             <div className="flex items-center gap-4 text-[#d4af37]">
                <Archive size={32} />
                <div>
                    <h2 className="text-3xl font-display uppercase tracking-widest text-shadow-gold">公共战利品</h2>
                    <div className="text-xs font-mono text-[#a8a29e]">PUBLIC LOOT</div>
                    {carrier && (
                        <div className="text-[10px] font-mono text-[#d4af37] mt-1">背负者: {carrier}</div>
                    )}
                </div>
             </div>
             <button onClick={onClose} className="hover:text-white text-[#d4af37] transition-colors border border-[#d4af37] p-2">
                <X size={24} />
             </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.length > 0 ? items.map((item) => {
                    const quality = item.品质 || 'Common';
                    const style = getQualityStyle(quality);
                    const durCurrent = item.耐久 ?? null;
                    const durMax = item.最大耐久 ?? null;
                    const durPercent = durCurrent !== null && durMax ? Math.min(100, (durCurrent / durMax) * 100) : null;
                    return (
                    <div key={item.id} className={`relative bg-[#0c0a09] border-2 ${style.border} p-4 flex flex-col gap-3 hover:bg-[#1c1917] transition-all group ${style.glow}`}>
                        
                        <div className="flex gap-4">
                            {/* Icon Box */}
                            <div className={`w-16 h-16 bg-[#292524] border ${style.border} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${style.text}`}>
                                 {getItemIcon(item.类型)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-bold text-lg truncate group-hover:text-[#d4af37] transition-colors ${style.text}`}>{item.名称}</h3>
                                    <span className="text-[#a8a29e] font-mono text-sm bg-[#292524] px-2 py-0.5 rounded">x{item.数量}</span>
                                </div>
                                <div className="text-[10px] text-[#a8a29e] uppercase tracking-widest">{item.类型} | {quality}</div>
                                <p className="text-[#78716c] text-xs line-clamp-2 leading-relaxed mt-1">{item.描述}</p>
                                
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 border ${item.获取途径 === 'dungeon' ? 'border-red-900 text-red-500' : 'border-blue-900 text-blue-500'}`}>
                                        {item.获取途径 === 'dungeon' ? '地下城掉落' : '其它途径'}
                                    </span>
                                    {item.价值 !== undefined && (
                                        <span className="text-[10px] text-[#d4af37] font-mono">价值 {item.价值}</span>
                                    )}
                                    {item.重量 !== undefined && (
                                        <span className="text-[10px] text-[#a8a29e] font-mono">重量 {item.重量}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono bg-black/40 p-2 border border-[#78350f]">
                            {item.攻击力 !== undefined && <span className="text-red-400">攻击 {item.攻击力}</span>}
                            {item.防御力 !== undefined && <span className="text-blue-400">防御 {item.防御力}</span>}
                            {item.恢复量 !== undefined && <span className="text-green-400">恢复 {item.恢复量}</span>}
                            {item.等级需求 !== undefined && <span className="text-purple-300">需求 Lv.{item.等级需求}</span>}
                        </div>

                        {item.附加属性 && item.附加属性.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {item.附加属性.map((s, i) => (
                                    <span key={i} className="text-[9px] text-cyan-300 border border-cyan-900 px-1.5 py-0.5 flex items-center gap-1">
                                        <Star size={10} /> {s.名称} {s.数值}
                                    </span>
                                ))}
                            </div>
                        )}

                        {(item.效果 || item.攻击特效 || item.防御特效) && (
                            <div className="text-[10px] text-[#d6d3d1] space-y-1">
                                {item.效果 && <div><span className="text-[#a8a29e]">效果:</span> {item.效果}</div>}
                                {item.攻击特效 && item.攻击特效 !== '无' && <div><span className="text-[#a8a29e]">攻击特效:</span> {item.攻击特效}</div>}
                                {item.防御特效 && item.防御特效 !== '无' && <div><span className="text-[#a8a29e]">防御特效:</span> {item.防御特效}</div>}
                            </div>
                        )}

                        {durPercent !== null && (
                            <div>
                                <div className="flex justify-between text-[9px] text-[#a8a29e] uppercase mb-1">
                                    <span>耐久</span>
                                    <span className={durPercent < 20 ? 'text-red-400' : 'text-emerald-300'}>{durCurrent}/{durMax}</span>
                                </div>
                                <div className="h-1.5 w-full bg-[#292524] border border-[#44403c]">
                                    <div className={`h-full ${durPercent < 25 ? 'bg-red-600' : 'bg-emerald-500'}`} style={{ width: `${durPercent}%` }} />
                                </div>
                            </div>
                        )}

                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#78350f] group-hover:border-[#d4af37]" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#78350f] group-hover:border-[#d4af37]" />
                    </div>
                )}) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-[#57534e]">
                        <Box size={64} className="mb-4 opacity-50" />
                        <span className="font-display text-2xl uppercase tracking-widest">公共战利品为空</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
