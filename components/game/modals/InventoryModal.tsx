
import React, { useState, useMemo, useEffect } from 'react';
import { X, Package, Shield, Sword, Box, Gem, ArrowRightCircle, LogOut, Beaker, Leaf, Wrench, AlertTriangle, Zap, Star, Search, Moon } from 'lucide-react';
import { InventoryItem } from '../../../types';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  equipment: { [key: string]: string }; 
  initialTab?: string;
  onEquipItem: (item: InventoryItem) => void;
  onUnequipItem: (slotKey: string, itemName?: string, itemId?: string) => void;
  onUseItem: (item: InventoryItem) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ 
    isOpen, 
    onClose, 
    items, 
    equipment,
    initialTab = 'ALL',
    onEquipItem,
    onUnequipItem,
    onUseItem
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Merge equipped items logic 
  const allItems = useMemo(() => {
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

  const TAB_LABELS: Record<string, string> = {
      'ALL': '全部 ALL',
      'WEAPON': '武器 WEAPON',
      'ARMOR': '防具 ARMOR',
      'CONSUMABLE': '消耗品 ITEM',
      'MATERIAL': '素材 MAT',
      'KEY_ITEM': '重要 KEY',
      'LOOT': '掉落 LOOT'
  };

  const categories = useMemo(() => {
      const cats = new Set<string>(['ALL']);
      allItems.forEach(item => {
          if (item.类型) cats.add(item.类型.toUpperCase());
      });
      return Array.from(cats);
  }, [allItems]);

  useEffect(() => {
    if (isOpen) {
        if (!categories.includes(activeTab) && activeTab !== 'ALL') {
            setActiveTab('ALL');
        } else if (initialTab && categories.includes(initialTab)) {
            setActiveTab(initialTab);
        }
    }
  }, [isOpen, categories, initialTab]);

  const filteredItems = useMemo(() => {
      let filtered = allItems;
      if (activeTab !== 'ALL') {
          filtered = allItems.filter(i => i.类型.toUpperCase() === activeTab);
      }
      return filtered.sort((a, b) => {
          if (a.已装备 !== b.已装备) return a.已装备 ? -1 : 1;
          return 0;
      });
  }, [allItems, activeTab]);

  const handleUseItem = (item: InventoryItem) => {
      onUseItem(item);
  };

  const handleEquipClick = (item: InventoryItem) => {
      onEquipItem(item);
  };

  const handleUnequipClick = (item: InventoryItem) => {
      const slot = item.装备槽位 || (item.类型 === 'weapon' ? '主手' : '身体');
      onUnequipItem(slot, item.名称, item.id);
  };

  const getItemIcon = (type: string) => {
      switch(type) {
          case 'weapon': return <Sword size={28} />;
          case 'armor': return <Shield size={28} />;
          case 'loot': return <Gem size={28} />;
          case 'consumable': return <Beaker size={28} />;
          case 'material': return <Leaf size={28} />;
          case 'key_item': return <Box size={28} />;
          default: return <Package size={28} />;
      }
  };

  const getRarityConfig = (quality: string = 'Common') => {
      switch(quality) {
          case 'Legendary': return { border: 'border-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-900/40', shadow: 'shadow-yellow-500/50' };
          case 'Epic': return { border: 'border-purple-400', text: 'text-purple-300', bg: 'bg-purple-900/40', shadow: 'shadow-purple-500/50' };
          case 'Rare': return { border: 'border-cyan-400', text: 'text-cyan-300', bg: 'bg-cyan-900/40', shadow: 'shadow-cyan-500/50' };
          case 'Broken': return { border: 'border-red-500', text: 'text-red-400', bg: 'bg-red-950/40', shadow: 'shadow-red-500/50' };
          case 'Pristine': return { border: 'border-white', text: 'text-white', bg: 'bg-zinc-800', shadow: 'shadow-white/20' };
          default: return { border: 'border-blue-900', text: 'text-blue-200', bg: 'bg-black', shadow: 'shadow-blue-900/30' };
      }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Main Container */}
      <div className="w-full max-w-7xl h-[90vh] relative flex flex-col md:flex-row overflow-hidden border-4 border-blue-900 bg-black shadow-[0_0_50px_rgba(30,58,138,0.5)]">
        
        {/* Background Decor */}
        <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[60%] h-full bg-blue-900/20 transform -skew-x-12 translate-x-32" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-900" />
        </div>

        {/* Sidebar */}
        <div className="md:w-64 bg-zinc-950/90 z-10 flex flex-col border-b-4 md:border-b-0 md:border-r-4 border-blue-800 relative">
            <div className="p-6 bg-blue-700 text-white transform -skew-x-6 -ml-4 w-[120%] border-b-4 border-black shadow-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600 opacity-80" />
                <div className="transform skew-x-6 ml-4 flex items-center gap-3 relative z-10">
                    <Moon size={32} className="text-cyan-200 fill-current" />
                    <div>
                        <h2 className="text-4xl font-display uppercase tracking-tighter italic text-cyan-50">背包</h2>
                        <p className="text-xs font-mono tracking-widest opacity-80 text-blue-200">INVENTORY SYSTEM</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 relative z-10">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`w-full text-left px-4 py-3 font-display uppercase tracking-wider text-lg border-l-4 transition-all transform hover:translate-x-2
                            ${activeTab === cat 
                                ? 'border-cyan-400 bg-blue-900/50 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                                : 'border-zinc-800 text-zinc-500 hover:text-white hover:border-blue-500'
                            }
                        `}
                    >
                        {TAB_LABELS[cat] || cat}
                    </button>
                ))}
            </div>

            <button 
                onClick={onClose} 
                className="p-4 bg-zinc-900 text-zinc-500 hover:text-cyan-400 hover:bg-black border-t-2 border-zinc-800 transition-colors uppercase font-bold flex items-center justify-center gap-2"
            >
                <LogOut size={20} /> 关闭菜单
            </button>
        </div>

        {/* Item Grid Area */}
        <div className="flex-1 relative z-10 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-black/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                {filteredItems.length > 0 ? filteredItems.map((item) => {
                    const quality = item.品质 || 'Common';
                    const style = getRarityConfig(quality);
                    const isHovered = hoveredItem === item.id;

                    // Durability Calc
                    const durCurrent = item.耐久 ?? 0;
                    const durMax = item.最大耐久 ?? 100;
                    const durPercent = Math.min(100, (durCurrent / durMax) * 100);
                    const isBroken = durCurrent <= 0 && item.耐久 !== undefined;

                    return (
                        <div 
                            key={item.id} 
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            className={`group relative min-h-[160px] flex flex-col border-2 transition-all duration-300 
                                ${style.border} ${style.bg} hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:z-20 hover:border-cyan-400
                                ${item.已装备 ? 'ring-1 ring-offset-2 ring-offset-black ring-cyan-500' : ''}
                            `}
                        >
                            <div className={`absolute top-0 right-0 p-1 px-2 text-[10px] font-bold uppercase tracking-widest border-l-2 border-b-2
                                ${item.已装备 ? 'bg-cyan-900 border-cyan-500 text-cyan-200' : `bg-black ${style.border} ${style.text}`}
                            `}>
                                {item.已装备 ? 'EQUIPPED' : quality}
                            </div>

                            <div className="p-4 flex gap-4 items-start">
                                <div className={`w-14 h-14 shrink-0 flex items-center justify-center border-2 bg-black/80 ${style.border} ${style.text} group-hover:bg-blue-900/20 group-hover:text-cyan-300 transition-colors`}>
                                    {getItemIcon(item.类型)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-display text-xl uppercase tracking-wide truncate ${style.text} ${isBroken ? 'line-through opacity-50' : ''} group-hover:text-white transition-colors`}>
                                        {item.名称}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-mono bg-black/50 px-1.5 py-0.5 border border-zinc-700 text-zinc-400 group-hover:border-blue-500 group-hover:text-blue-300 transition-colors">
                                            x{item.数量}
                                        </span>
                                        <span className="text-[10px] font-mono uppercase text-zinc-500">{item.类型}</span>
                                    </div>
                                    {item.价值 && (
                                        <div className="mt-1 text-[10px] text-yellow-500 font-mono">
                                            售价: {item.价值}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 px-4 pb-2 flex flex-col gap-2">
                                <div className="grid grid-cols-2 gap-1 text-xs font-mono bg-black/40 p-2 border border-blue-900/30 group-hover:border-cyan-500/30 transition-colors">
                                    {item.攻击力 !== undefined && <span className="text-red-400">攻击 {item.攻击力}</span>}
                                    {item.防御力 !== undefined && <span className="text-blue-400">防御 {item.防御力}</span>}
                                    {item.恢复量 !== undefined && <span className="text-green-400">恢复 {item.恢复量}</span>}
                                    
                                    {item.附加属性 && item.附加属性.map((s, i) => (
                                        <span key={i} className="col-span-2 text-[10px] text-cyan-300 flex items-center gap-1">
                                            <Star size={8} fill="currentColor"/> {s.名称} {s.数值}
                                        </span>
                                    ))}
                                </div>

                                {item.耐久 !== undefined && (
                                    <div className="mt-auto">
                                        <div className="flex justify-between text-[9px] text-zinc-500 uppercase mb-0.5">
                                            <span>耐久度</span>
                                            <span className={durPercent < 20 ? 'text-red-500 animate-pulse' : 'text-blue-400'}>{durCurrent}/{durMax}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-black border border-zinc-800 skew-x-[-20deg] overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-300 ${durPercent < 25 ? 'bg-red-600' : 'bg-cyan-500 shadow-[0_0_5px_cyan]'}`} 
                                                style={{ width: `${durPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={`absolute inset-0 bg-blue-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-4 transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                <p className="text-xs text-cyan-100 text-center italic mb-2 line-clamp-3 font-serif">"{item.描述}"</p>
                                
                                <div className="flex gap-2 w-full">
                                    {(item.类型 === 'weapon' || item.类型 === 'armor') && (
                                        item.已装备 ? (
                                            <ActionButton onClick={() => handleUnequipClick(item)} label="卸下" color="yellow" icon={<LogOut size={14}/>} />
                                        ) : (
                                            <ActionButton onClick={() => handleEquipClick(item)} label="装备" color="cyan" icon={<Shield size={14}/>} />
                                        )
                                    )}
                                    {item.类型 === 'consumable' && (
                                        <ActionButton onClick={() => handleUseItem(item)} label="使用" color="green" icon={<ArrowRightCircle size={14}/>} />
                                    )}
                                </div>
                                {item.攻击特效 && item.攻击特效 !== "无" && (
                                    <div className="text-[10px] text-red-400 mt-1 font-bold uppercase animate-pulse">
                                        特效: {item.攻击特效}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full flex flex-col items-center justify-center h-64 opacity-50">
                        <Package size={64} className="mb-4 text-blue-900" />
                        <h3 className="text-2xl font-display uppercase text-blue-800">背包是空的</h3>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

const ActionButton = ({ onClick, label, color, icon }: any) => {
    const colors: any = {
        yellow: 'border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black',
        cyan: 'border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black',
        green: 'border-green-500 text-green-400 hover:bg-green-500 hover:text-black',
    };
    return (
        <button 
            onClick={onClick}
            className={`flex-1 py-2 border-2 ${colors[color]} font-display font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-1 active:translate-y-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
        >
            {icon} {label}
        </button>
    );
};
