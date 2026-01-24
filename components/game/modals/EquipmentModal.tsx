
import React, { useEffect, useMemo, useState } from 'react';
import { X, Shield, Sword, User, AlertCircle, Gem, ChevronRight, Star } from 'lucide-react';
import { InventoryItem } from '../../../types';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: any;
  inventory: InventoryItem[];
  onUnequipItem: (slotKey: string, itemName?: string, itemId?: string) => void;
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({ 
    isOpen, 
    onClose, 
    equipment, 
    inventory, 
    onUnequipItem
}) => {
  if (!isOpen) return null;

  const equipSlots = [
    { key: '主手', label: '主手武器', icon: <Sword size={18}/> },
    { key: '副手', label: '副手武器', icon: <Shield size={18}/> },
    { key: '头部', label: '头部', icon: <User size={18}/> },
    { key: '身体', label: '身体', icon: <Shield size={18}/> },
    { key: '手部', label: '手部', icon: <Shield size={18}/> },
    { key: '腿部', label: '腿部', icon: <User size={18}/> },
    { key: '足部', label: '足部', icon: <User size={18}/> },
    { key: '饰品1', label: '饰品 1', icon: <Gem size={18}/> },
    { key: '饰品2', label: '饰品 2', icon: <Gem size={18}/> },
    { key: '饰品3', label: '饰品 3', icon: <Gem size={18}/> }
  ];

  const [activeSlot, setActiveSlot] = useState<string>(equipSlots[0].key);

  useEffect(() => {
      if (!isOpen) return;
      const firstSlotWithItem = equipSlots.find(slot => equipment?.[slot.key]);
      setActiveSlot(firstSlotWithItem?.key || equipSlots[0].key);
  }, [isOpen, equipment]);

  const slotItem = useMemo(() => {
      const itemName = equipment?.[activeSlot];
      if (itemName) {
          const byName = inventory.find(i => i.名称 === itemName);
          if (byName) return { item: byName, label: itemName };
      }
      const bySlot = inventory.find(i => i.已装备 && i.装备槽位 === activeSlot);
      if (bySlot) return { item: bySlot, label: bySlot.名称 };
      if (itemName) return { item: null, label: itemName };
      return { item: null, label: '' };
  }, [activeSlot, equipment, inventory]);

  const getQualityLabel = (quality?: string) => {
      switch (quality) {
          case 'Legendary': return '传说';
          case 'Epic': return '史诗';
          case 'Rare': return '稀有';
          case 'Common': return '普通';
          case 'Broken': return '破损';
          default: return quality || '普通';
      }
  };

  const getTypeLabel = (type?: string) => {
      switch (type) {
          case 'weapon': return '武器';
          case 'armor': return '防具';
          case 'consumable': return '消耗品';
          case 'material': return '材料';
          case 'key_item': return '关键';
          case 'loot': return '战利品';
          default: return type || '未知';
      }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-200">
      <div className="w-full h-full md:h-[85vh] md:max-w-6xl bg-zinc-900 border-0 md:border-4 border-blue-600 relative flex flex-col shadow-[0_0_50px_rgba(37,99,235,0.3)]">
        
        {/* Header */}
        <div className="bg-blue-800 p-4 flex justify-between items-center text-white z-10 shrink-0">
             <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 md:w-8 md:h-8" />
                <h2 className="text-xl md:text-3xl font-display uppercase tracking-widest">装备详情</h2>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white hover:text-blue-800 transition-colors border-2 border-white">
                <X size={24} />
             </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Slot List */}
            <div className="w-full md:w-1/3 bg-black border-b md:border-b-0 md:border-r border-zinc-800 p-4 md:p-6 overflow-y-auto custom-scrollbar space-y-3">
                <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-2">装备槽位</div>
                {equipSlots.map((slot) => {
                    const itemName = equipment?.[slot.key];
                    const isActive = activeSlot === slot.key;
                    return (
                        <button
                            key={slot.key}
                            type="button"
                            onClick={() => setActiveSlot(slot.key)}
                            className={`w-full flex items-center gap-3 p-3 border transition-all text-left ${
                                isActive ? 'border-blue-500 bg-blue-950/40' : 'border-zinc-800 bg-zinc-900/50 hover:border-blue-700'
                            }`}
                        >
                            <div className={`w-10 h-10 flex items-center justify-center border ${
                                isActive ? 'border-blue-500 text-blue-300' : 'border-zinc-700 text-zinc-500'
                            }`}>
                                {slot.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{slot.label}</div>
                                <div className={`text-sm truncate ${itemName ? 'text-white' : 'text-zinc-600 italic'}`}>
                                    {itemName || '未装备'}
                                </div>
                            </div>
                            <ChevronRight size={14} className={isActive ? 'text-blue-400' : 'text-zinc-600'} />
                        </button>
                    );
                })}
            </div>

            {/* Detail Panel */}
            <div className="flex-1 bg-zinc-950 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <div className="flex items-start justify-between border-b border-zinc-800 pb-4 mb-6">
                    <div>
                        <div className="text-[10px] uppercase text-zinc-500 tracking-widest">当前槽位</div>
                        <div className="text-3xl md:text-4xl font-display text-white">{equipSlots.find(s => s.key === activeSlot)?.label}</div>
                        <div className="text-xs text-zinc-500 mt-1">路径: gameState.角色.装备.{activeSlot}</div>
                    </div>
                    {slotItem.label && (
                        <button
                            type="button"
                            onClick={() => onUnequipItem(activeSlot, slotItem.label, slotItem.item?.id)}
                            className="px-4 py-2 border border-red-500 text-red-300 hover:bg-red-600 hover:text-white transition-colors text-xs uppercase font-bold"
                        >
                            卸下装备
                        </button>
                    )}
                </div>

                <div className="bg-black/60 border border-zinc-800 p-5 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-zinc-900 border border-blue-900 flex items-center justify-center text-blue-400">
                            {slotItem.item?.类型 === 'weapon' ? <Sword size={32} /> : slotItem.item?.类型 === 'armor' ? <Shield size={32} /> : <Gem size={32} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] uppercase text-zinc-500 tracking-widest">装备名称</div>
                            <div className={`text-2xl font-display truncate ${slotItem.label ? 'text-white' : 'text-zinc-600 italic'}`}>
                                {slotItem.label || '未装备'}
                            </div>
                            {slotItem.item && (
                                <div className="flex flex-wrap gap-2 text-[10px] text-zinc-400 mt-2">
                                    <span className="border border-zinc-700 px-2 py-0.5">类型: {getTypeLabel(slotItem.item.类型)}</span>
                                    <span className="border border-zinc-700 px-2 py-0.5">品质: {getQualityLabel(slotItem.item.品质)}</span>
                                    {slotItem.item.等级需求 !== undefined && (
                                        <span className="border border-zinc-700 px-2 py-0.5">需求等级: {slotItem.item.等级需求}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {slotItem.item ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                                {slotItem.item.攻击力 !== undefined && (
                                    <div className="bg-zinc-900 border border-zinc-800 p-2 text-red-400">攻击 {slotItem.item.攻击力}</div>
                                )}
                                {slotItem.item.防御力 !== undefined && (
                                    <div className="bg-zinc-900 border border-zinc-800 p-2 text-blue-400">防御 {slotItem.item.防御力}</div>
                                )}
                                {slotItem.item.恢复量 !== undefined && (
                                    <div className="bg-zinc-900 border border-zinc-800 p-2 text-green-400">恢复 {slotItem.item.恢复量}</div>
                                )}
                                {slotItem.item.价值 !== undefined && (
                                    <div className="bg-zinc-900 border border-zinc-800 p-2 text-yellow-400">价值 {slotItem.item.价值}</div>
                                )}
                            </div>

                            {slotItem.item.耐久 !== undefined && (
                                <div>
                                    <div className="flex justify-between text-[10px] text-zinc-500 uppercase mb-1">
                                        <span>耐久度</span>
                                        <span>{slotItem.item.耐久}/{slotItem.item.最大耐久 ?? 100}</span>
                                    </div>
                                    <div className="h-2 bg-zinc-900 border border-zinc-700 overflow-hidden">
                                        <div
                                            className={`h-full ${slotItem.item.耐久 < 20 ? 'bg-red-600' : 'bg-cyan-500'}`}
                                            style={{ width: `${Math.min(100, (slotItem.item.耐久 / (slotItem.item.最大耐久 || 100)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {slotItem.item.附加属性 && slotItem.item.附加属性.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {slotItem.item.附加属性.map((stat, i) => (
                                        <span key={i} className="text-[10px] bg-blue-900/20 text-blue-300 border border-blue-900 px-2 py-1 flex items-center gap-1 font-bold uppercase tracking-wider">
                                            <Star size={10} /> {stat.名称} <span className="text-white">{stat.数值}</span>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {(slotItem.item.效果 || slotItem.item.攻击特效 || slotItem.item.防御特效) && (
                                <div className="space-y-2 bg-blue-900/10 p-3 border-l-2 border-blue-600">
                                    {slotItem.item.效果 && (
                                        <div className="text-[10px] text-cyan-300 flex items-start gap-2">
                                            <AlertCircle size={10} className="mt-0.5"/> {slotItem.item.效果}
                                        </div>
                                    )}
                                    {slotItem.item.攻击特效 && slotItem.item.攻击特效 !== '无' && (
                                        <div className="text-[10px] text-red-300 flex items-start gap-2">
                                            <AlertCircle size={10} className="mt-0.5"/> {slotItem.item.攻击特效}
                                        </div>
                                    )}
                                    {slotItem.item.防御特效 && slotItem.item.防御特效 !== '无' && (
                                        <div className="text-[10px] text-blue-300 flex items-start gap-2">
                                            <AlertCircle size={10} className="mt-0.5"/> {slotItem.item.防御特效}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800 pt-3">
                                {slotItem.item.描述 || '暂无描述。'}
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-zinc-500 italic">当前槽位没有装备。</div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
