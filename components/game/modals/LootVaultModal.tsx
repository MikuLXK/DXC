import React from 'react';
import { X, Archive, Gem, Box, Shield, Sword, Beaker, Leaf, Star } from 'lucide-react';
import { InventoryItem } from '../../../types';

interface LootVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
}

const getQualityStyle = (quality: string = 'Common') => {
  switch (quality) {
    case 'Legendary':
      return { border: 'border-yellow-500', text: 'text-yellow-400', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.35)]' };
    case 'Epic':
      return { border: 'border-purple-500', text: 'text-purple-300', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.35)]' };
    case 'Rare':
      return { border: 'border-cyan-500', text: 'text-cyan-300', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.35)]' };
    case 'Broken':
      return { border: 'border-red-600', text: 'text-red-400', glow: 'shadow-[0_0_20px_rgba(220,38,38,0.35)]' };
    default:
      return { border: 'border-zinc-700', text: 'text-zinc-200', glow: 'shadow-[0_0_10px_rgba(24,24,27,0.35)]' };
  }
};

const getItemIcon = (type: string) => {
  switch (type) {
    case 'weapon':
      return <Sword size={28} />;
    case 'armor':
      return <Shield size={28} />;
    case 'consumable':
      return <Beaker size={28} />;
    case 'material':
      return <Leaf size={28} />;
    case 'key_item':
      return <Box size={28} />;
    default:
      return <Gem size={28} />;
  }
};

export const LootVaultModal: React.FC<LootVaultModalProps> = ({ isOpen, onClose, items }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl bg-[#0f0f12] border-4 border-amber-700 relative flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.15)] max-h-[85vh]">
        <div className="bg-[#1b1b21] p-6 flex justify-between items-center border-b border-amber-900/60">
          <div className="flex items-center gap-4 text-amber-300">
            <Archive size={32} />
            <div>
              <h2 className="text-3xl font-display uppercase tracking-widest text-shadow-gold">战利品仓库</h2>
              <div className="text-xs font-mono text-amber-200/70">ARCHIVED LOOT VAULT</div>
            </div>
          </div>
          <button onClick={onClose} className="hover:text-white text-amber-300 transition-colors border border-amber-400/60 p-2">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.length > 0 ? items.map((item) => {
              const quality = item.品质 || 'Common';
              const style = getQualityStyle(quality);
              const durCurrent = item.耐久 ?? null;
              const durMax = item.最大耐久 ?? null;
              const durPercent = durCurrent !== null && durMax ? Math.min(100, (durCurrent / durMax) * 100) : null;

              return (
                <div key={item.id} className={`relative bg-black/70 border-2 ${style.border} p-4 flex flex-col gap-3 ${style.glow}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-14 h-14 flex items-center justify-center border ${style.border} ${style.text} bg-black/60`}>
                      {getItemIcon(item.类型)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-bold text-lg truncate ${style.text}`}>{item.名称}</h3>
                        <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 border border-zinc-700">x{item.数量}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">
                        {item.类型} | {quality}
                      </div>
                      {item.价值 !== undefined && (
                        <div className="text-[10px] text-amber-300 font-mono mt-1">价值: {item.价值}</div>
                      )}
                      {item.重量 !== undefined && (
                        <div className="text-[10px] text-zinc-500 font-mono">重量: {item.重量}</div>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-300 leading-relaxed">{item.描述}</div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono bg-black/50 p-2 border border-zinc-800">
                    {item.攻击力 !== undefined && <span className="text-red-400">攻击 {item.攻击力}</span>}
                    {item.防御力 !== undefined && <span className="text-blue-400">防御 {item.防御力}</span>}
                    {item.恢复量 !== undefined && <span className="text-green-400">恢复 {item.恢复量}</span>}
                    {item.等级需求 !== undefined && <span className="text-purple-300">需求 Lv.{item.等级需求}</span>}
                  </div>

                  {item.附加属性 && item.附加属性.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.附加属性.map((stat, i) => (
                        <span key={i} className="text-[9px] text-cyan-300 border border-cyan-900 px-1.5 py-0.5 flex items-center gap-1">
                          <Star size={10} /> {stat.名称} {stat.数值}
                        </span>
                      ))}
                    </div>
                  )}

                  {(item.效果 || item.攻击特效 || item.防御特效) && (
                    <div className="text-[10px] text-zinc-300 space-y-1">
                      {item.效果 && <div><span className="text-zinc-500">效果:</span> {item.效果}</div>}
                      {item.攻击特效 && item.攻击特效 !== '无' && <div><span className="text-zinc-500">攻击特效:</span> {item.攻击特效}</div>}
                      {item.防御特效 && item.防御特效 !== '无' && <div><span className="text-zinc-500">防御特效:</span> {item.防御特效}</div>}
                    </div>
                  )}

                  {durPercent !== null && (
                    <div className="mt-1">
                      <div className="flex justify-between text-[9px] text-zinc-500 uppercase mb-1">
                        <span>耐久</span>
                        <span className={durPercent < 20 ? 'text-red-400' : 'text-emerald-300'}>
                          {durCurrent}/{durMax}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 border border-zinc-800">
                        <div className={`h-full ${durPercent < 25 ? 'bg-red-600' : 'bg-emerald-500'}`} style={{ width: `${durPercent}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-500">
                <Gem size={64} className="mb-4 opacity-50" />
                <span className="font-display text-2xl uppercase tracking-widest">战利品仓库为空</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
