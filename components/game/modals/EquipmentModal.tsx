
import React from 'react';
import { X, Shield, Sword, User, AlertCircle } from 'lucide-react';
import { InventoryItem } from '../../../types';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: any;
  inventory: InventoryItem[];
  onAddToQueue: (cmd: string) => void;
  onUnequipItem: (slotKey: string) => void;
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({ 
    isOpen, 
    onClose, 
    equipment, 
    inventory, 
    onAddToQueue,
    onUnequipItem
}) => {
  if (!isOpen) return null;

  const equipSlots = [
    { key: '主手', label: '主手武器', icon: <Sword size={20}/> },
    { key: '副手', label: '副手', icon: <Shield size={20}/> },
    { key: '头部', label: '头部', icon: <User size={20}/> },
    { key: '身体', label: '身体', icon: <User size={20}/> },
    { key: '腿部', label: '腿部', icon: <User size={20}/> },
    { key: '足部', label: '足部', icon: <User size={20}/> },
    { key: '饰品1', label: '饰品 1', icon: <User size={20}/> },
    { key: '饰品2', label: '饰品 2', icon: <User size={20}/> },
  ];

  // Helper to find item object
  const getEquippedItem = (itemName: string): InventoryItem | undefined => {
      return inventory.find(i => i.名称 === itemName && i.已装备);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-200">
      <div className="w-full h-full md:h-[85vh] md:max-w-5xl bg-zinc-900 border-0 md:border-4 border-blue-600 relative flex flex-col shadow-[0_0_50px_rgba(37,99,235,0.3)]">
        
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
            {/* Visualizer - Hidden on Mobile to save space for slots */}
            <div className="hidden md:flex w-1/3 bg-black border-r border-zinc-700 flex-col items-center justify-center p-8 relative shrink-0">
                <div className="absolute inset-0 bg-halftone-blue opacity-10" />
                <User size={150} className="text-zinc-700 mb-4" />
                <div className="text-zinc-500 font-display text-2xl uppercase">Character Layout</div>
                
                {/* Global Stats Summary (Mockup logic) */}
                <div className="w-full mt-8 border-t border-zinc-800 pt-4 space-y-2">
                    <div className="flex justify-between text-xs font-mono text-zinc-400">
                        <span>Total ATK Est.</span>
                        <span className="text-red-500">---</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono text-zinc-400">
                        <span>Total DEF Est.</span>
                        <span className="text-blue-500">---</span>
                    </div>
                </div>
            </div>

            {/* Slots List - Full Width on Mobile */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-3 bg-zinc-900">
                {equipSlots.map((slot) => {
                    const itemName = equipment[slot.key];
                    const itemData = itemName ? getEquippedItem(itemName) : null;
                    
                    return (
                        <div key={slot.key} className="flex flex-col gap-2 bg-black/50 p-4 border-l-4 border-blue-600 hover:bg-zinc-800 transition-colors group">
                            
                            {/* Top Row: Icon, Slot Name, Item Name, Unequip */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-blue-500 group-hover:text-white group-hover:bg-blue-600 transition-colors shrink-0">
                                    {slot.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{slot.label}</div>
                                    <div className={`text-sm md:text-lg font-display uppercase truncate ${itemName ? 'text-white' : 'text-zinc-600 italic'}`}>
                                        {itemName || 'Empty'}
                                    </div>
                                </div>
                                
                                {itemName ? (
                                    <button 
                                        onClick={() => onUnequipItem(slot.key)}
                                        className="text-xs text-zinc-400 border border-zinc-600 px-3 py-1 hover:bg-red-600 hover:text-white hover:border-white uppercase transition-colors shrink-0"
                                    >
                                        卸下
                                    </button>
                                ) : (
                                    <span className="text-xs text-zinc-600 px-3 py-1 shrink-0">---</span>
                                )}
                            </div>

                            {/* Stats Detail Row (Flattened Access) */}
                            {itemData && (
                                <div className="mt-2 pt-2 border-t border-zinc-700/50 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                                    {itemData.攻击力 !== undefined && (
                                        <span className="text-red-400">ATK: {itemData.攻击力}</span>
                                    )}
                                    {itemData.防御力 !== undefined && (
                                        <span className="text-blue-400">DEF: {itemData.防御力}</span>
                                    )}
                                    {itemData.耐久 !== undefined && (
                                        <span className={`${itemData.耐久 < 20 ? 'text-red-500' : 'text-zinc-400'}`}>
                                            DUR: {itemData.耐久}
                                        </span>
                                    )}
                                    {itemData.品质 && (
                                        <span className="text-yellow-500 col-span-2 md:col-span-1">{itemData.品质}</span>
                                    )}
                                    {itemData.效果 && (
                                        <span className="text-cyan-500 col-span-2 md:col-span-4 flex items-center gap-1 truncate">
                                            <AlertCircle size={10} /> {itemData.效果}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {/* Mobile Bottom Padding to avoid nav overlap if any */}
                <div className="h-16 md:hidden" />
            </div>
        </div>
      </div>
    </div>
  );
};
