
import React from 'react';
import { X, Gem, Archive, Box, Backpack } from 'lucide-react';
import { InventoryItem } from '../../../types';

interface LootModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
}

export const LootModal: React.FC<LootModalProps> = ({ isOpen, onClose, items }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-[#1c1917] border-4 border-[#d4af37] relative flex flex-col shadow-[0_0_50px_rgba(212,175,55,0.2)] max-h-[85vh]">
        
        {/* Decorative Header */}
        <div className="bg-[#292524] p-6 flex justify-between items-center border-b border-[#78350f]">
             <div className="flex items-center gap-4 text-[#d4af37]">
                <Archive size={32} />
                <div>
                    <h2 className="text-3xl font-display uppercase tracking-widest text-shadow-gold">战利品保管库</h2>
                    <div className="text-xs font-mono text-[#a8a29e]">LOOT STORAGE</div>
                </div>
             </div>
             <button onClick={onClose} className="hover:text-white text-[#d4af37] transition-colors border border-[#d4af37] p-2">
                <X size={24} />
             </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.length > 0 ? items.map((item) => (
                    <div key={item.id} className="relative bg-[#0c0a09] border border-[#78350f] p-4 flex gap-4 hover:bg-[#1c1917] hover:border-[#d4af37] transition-all group">
                        
                        {/* Icon Box */}
                        <div className="w-16 h-16 bg-[#292524] border border-[#44403c] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                             <Gem className="text-[#d4af37]" size={32} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-[#e7e5e4] font-bold text-lg truncate group-hover:text-[#d4af37] transition-colors">{item.名称}</h3>
                                <span className="text-[#a8a29e] font-mono text-sm bg-[#292524] px-2 py-0.5 rounded">x{item.数量}</span>
                            </div>
                            <p className="text-[#78716c] text-xs line-clamp-2 leading-relaxed">{item.描述}</p>
                            
                            <div className="mt-2 flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 border ${item.获取途径 === 'dungeon' ? 'border-red-900 text-red-500' : 'border-blue-900 text-blue-500'}`}>
                                    {item.获取途径 === 'dungeon' ? '地下城掉落' : '其它途径'}
                                </span>
                            </div>
                        </div>

                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#78350f] group-hover:border-[#d4af37]" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#78350f] group-hover:border-[#d4af37]" />
                    </div>
                )) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-[#57534e]">
                        <Box size={64} className="mb-4 opacity-50" />
                        <span className="font-display text-2xl uppercase tracking-widest">保管库为空</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
