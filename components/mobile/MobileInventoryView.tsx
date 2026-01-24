
import React, { useState, useMemo } from 'react';
import { Package, Sword, Shield, Box, Gem, ArrowRightCircle, LogOut, Beaker, X, AlertCircle, Wrench, Star, ChevronRight } from 'lucide-react';
import { InventoryItem } from '../../types';

interface MobileInventoryViewProps {
  items: InventoryItem[];
  equipment: { [key: string]: string };
  onEquipItem: (item: InventoryItem) => void;
  onUnequipItem: (slotKey: string, itemName?: string, itemId?: string) => void;
  onUseItem: (item: InventoryItem) => void;
}

export const MobileInventoryView: React.FC<MobileInventoryViewProps> = ({
    items,
    equipment,
    onEquipItem,
    onUnequipItem,
    onUseItem
}) => {
    const [filter, setFilter] = useState<'ALL' | 'WEAPON' | 'ARMOR' | 'CONSUMABLE'>('ALL');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const allItems = useMemo(() => {
        // Safety check: ensure items is an array and equipment is an object
        const safeItems = Array.isArray(items) ? items : [];
        const safeEquipment = equipment || {};

        const equippedList: InventoryItem[] = [];
        Object.entries(safeEquipment).forEach(([slot, itemName]) => {
            if (itemName) {
                const existsInInventory = safeItems.some(i => i.名称 === itemName);
                if (!existsInInventory) {
                    equippedList.push({
                        id: `equipped-${slot}`,
                        名称: itemName as string,
                        描述: '当前已装备',
                        数量: 1,
                        类型: slot === '主手' || slot === '副手' ? 'weapon' : 'armor',
                        品质: 'Common',
                        已装备: true,
                        装备槽位: slot
                    });
                }
            }
        });
        return [...safeItems, ...equippedList];
    }, [items, equipment]);

    const filteredItems = useMemo(() => {
        if (filter === 'ALL') return allItems;
        return allItems.filter(i => i.类型.toUpperCase() === filter);
    }, [allItems, filter]);

    const getItemIcon = (type: string) => {
        switch(type) {
            case 'weapon': return <Sword size={20} />;
            case 'armor': return <Shield size={20} />;
            case 'loot': return <Gem size={20} />;
            case 'consumable': return <Beaker size={20} />;
            default: return <Package size={20} />;
        }
    };

    const getRarityColor = (quality: string = 'Common') => {
        switch(quality) {
            case 'Legendary': return 'text-yellow-400 border-yellow-500 bg-yellow-950/20';
            case 'Epic': return 'text-purple-300 border-purple-500 bg-purple-950/20';
            case 'Rare': return 'text-cyan-300 border-cyan-500 bg-cyan-950/20';
            case 'Broken': return 'text-red-400 border-red-600 bg-red-950/20';
            default: return 'text-blue-100 border-zinc-700 bg-zinc-900';
        }
    };

    const LABELS = {
        'ALL': '全部',
        'WEAPON': '武器',
        'ARMOR': '防具',
        'CONSUMABLE': '物品'
    };

    return (
        <div className="w-full h-full bg-black flex flex-col relative">
            {/* Filter Tabs - Blue Theme */}
            <div className="flex overflow-x-auto bg-zinc-900 border-b border-blue-900 shrink-0 no-scrollbar py-1">
                {['ALL', 'WEAPON', 'ARMOR', 'CONSUMABLE'].map(f => (
                    <button
                        key={f}
                        onClick={() => { setFilter(f as any); setSelectedItem(null); }}
                        className={`px-6 py-3 text-xs font-bold uppercase whitespace-nowrap transition-all transform skew-x-[-10deg] mx-1 border-2
                            ${filter === f 
                                ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                                : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-blue-800 hover:text-blue-400'
                            }
                        `}
                    >
                        {/* @ts-ignore */}
                        <span className="block transform skew-x-[10deg]">{LABELS[f]}</span>
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-32 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] bg-zinc-950">
                {filteredItems.length > 0 ? filteredItems.map(item => {
                    const quality = item.品质 || 'Common';
                    const rarityStyle = getRarityColor(quality);
                    const isSelected = selectedItem?.id === item.id;
                    
                    return (
                        <div 
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className={`flex items-center gap-4 p-3 border-l-4 transition-all active:bg-blue-900/20
                                ${isSelected 
                                    ? 'border-cyan-400 bg-blue-900/30' 
                                    : item.已装备 ? 'border-cyan-600 bg-cyan-950/20' : `border-zinc-800 bg-black ${rarityStyle.split(' ')[2]}`
                                }
                            `}
                        >
                            <div className={`w-10 h-10 flex items-center justify-center rounded border ${rarityStyle.split(' ')[1]} ${rarityStyle.split(' ')[0]} shrink-0 bg-black`}>
                                {getItemIcon(item.类型)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h4 className={`font-bold text-sm truncate uppercase font-display tracking-wide ${isSelected ? 'text-cyan-300' : rarityStyle.split(' ')[0]}`}>
                                        {item.名称}
                                    </h4>
                                    {item.数量 > 1 && <span className="text-[10px] text-zinc-400 bg-zinc-900 px-1.5 border border-zinc-700">x{item.数量}</span>}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-[9px] text-zinc-500 uppercase">{quality} {item.类型}</span>
                                    {item.已装备 && <span className="text-[9px] text-black font-bold bg-cyan-500 px-1 uppercase skew-x-[-10deg]">已装备</span>}
                                </div>
                            </div>
                            <ChevronRight size={16} className={`transition-transform ${isSelected ? 'text-cyan-400 rotate-90' : 'text-zinc-700'}`} />
                        </div>
                    );
                }) : (
                    <div className="flex flex-col items-center justify-center py-20 text-blue-900">
                        <Box size={48} className="mb-2 opacity-50"/>
                        <span className="uppercase font-display tracking-widest">暂无物品</span>
                    </div>
                )}
            </div>

            {/* Detail Sheet (Bottom Drawer) - Unified Blue */}
            {selectedItem && (
                <div className="absolute bottom-0 left-0 w-full bg-zinc-950 border-t-4 border-blue-600 p-5 shadow-[0_-10px_50px_rgba(0,0,0,0.9)] animate-in slide-in-from-bottom-full z-20 max-h-[70vh] flex flex-col">
                    {/* Decorative Header Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-cyan-400 to-blue-900" />
                    
                    <div className="flex justify-between items-start mb-4 border-b border-blue-900 pb-3">
                        <div>
                            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">选中物品</div>
                            <h3 className={`text-2xl font-display uppercase tracking-tighter italic ${getRarityColor(selectedItem.品质).split(' ')[0]}`}>
                                {selectedItem.名称}
                            </h3>
                        </div>
                        <button onClick={() => setSelectedItem(null)} className="text-blue-500 p-2 bg-black border border-blue-800 hover:text-white hover:border-white transition-colors rounded-full">
                            <X size={20}/>
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-black p-3 border border-blue-900/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-1 bg-blue-900/30 border-l border-b border-blue-800 text-[9px] text-blue-300 uppercase">属性</div>
                            
                            {selectedItem.攻击力 !== undefined && <span className="text-red-400 font-bold text-base">攻击 {selectedItem.攻击力}</span>}
                            {selectedItem.防御力 !== undefined && <span className="text-blue-400 font-bold text-base">防御 {selectedItem.防御力}</span>}
                            {selectedItem.恢复量 !== undefined && <span className="text-green-400 font-bold text-base">恢复 {selectedItem.恢复量}</span>}
                            {selectedItem.价值 !== undefined && <span className="text-yellow-500 font-bold text-base">售价 {selectedItem.价值}</span>}
                            
                            {/* Visual Durability */}
                            {selectedItem.耐久 !== undefined && (
                                <div className="col-span-2 mt-2">
                                    <div className="flex justify-between text-[9px] text-zinc-500 uppercase mb-1">
                                        <span>耐久度</span>
                                        <span>{selectedItem.耐久}/{selectedItem.最大耐久}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-900 border border-zinc-700 skew-x-[-15deg] overflow-hidden">
                                        <div 
                                            className={`h-full ${selectedItem.耐久 < 20 ? 'bg-red-600 animate-pulse' : 'bg-cyan-500 shadow-[0_0_5px_cyan]'}`} 
                                            style={{ width: `${(selectedItem.耐久 / (selectedItem.最大耐久 || 100)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bonus Stats Tags */}
                        {selectedItem.附加属性 && selectedItem.附加属性.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedItem.附加属性.map((stat, i) => (
                                    <span key={i} className="text-[10px] bg-cyan-900/20 text-cyan-300 border border-cyan-800 px-2 py-1 flex items-center gap-1 font-bold uppercase tracking-wider">
                                        <Star size={10} /> {stat.名称} <span className="text-white">{stat.数值}</span>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Effects */}
                        {(selectedItem.效果 || selectedItem.攻击特效) && (
                            <div className="space-y-2 bg-blue-900/10 p-3 border-l-2 border-purple-500">
                                {selectedItem.攻击特效 && selectedItem.攻击特效 !== "无" && (
                                    <div className="text-[10px] text-red-400 flex items-start gap-2">
                                        <span className="shrink-0 font-bold bg-red-900/30 px-1">特效</span> 
                                        {selectedItem.攻击特效}
                                    </div>
                                )}
                                {selectedItem.效果 && (
                                    <div className="text-[10px] text-cyan-400 flex items-start gap-2">
                                        <span className="shrink-0 font-bold bg-cyan-900/30 px-1">被动</span> 
                                        {selectedItem.效果}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Description */}
                        <p className="text-xs text-blue-200/70 leading-relaxed pt-2 italic font-serif">
                            "{selectedItem.描述}"
                        </p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-dashed border-blue-900 shrink-0">
                        {(selectedItem.类型 === 'weapon' || selectedItem.类型 === 'armor') && (
                            selectedItem.已装备 ? (
                                <button 
                                    onClick={() => { onUnequipItem(selectedItem.装备槽位 || (selectedItem.类型==='weapon'?'主手':'身体'), selectedItem.名称, selectedItem.id); setSelectedItem(null); }}
                                    className="flex-1 py-3 bg-black text-yellow-500 border-2 border-yellow-600 font-bold uppercase flex items-center justify-center gap-2 hover:bg-yellow-600 hover:text-black transition-colors"
                                >
                                    <LogOut size={16}/> 卸下
                                </button>
                            ) : (
                                <button 
                                    onClick={() => { onEquipItem(selectedItem); setSelectedItem(null); }}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all border-2 border-blue-400"
                                >
                                    <Shield size={16}/> 装备
                                </button>
                            )
                        )}
                        {selectedItem.类型 === 'consumable' && (
                            <button 
                                onClick={() => { onUseItem(selectedItem); setSelectedItem(null); }}
                                className="flex-1 py-3 bg-green-600 text-white font-bold uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all border-2 border-green-400"
                            >
                                <ArrowRightCircle size={16}/> 使用
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
