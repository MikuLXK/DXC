
import React from 'react';
import { X, Flag, Coins, Home, Package } from 'lucide-react';
import { FamiliaState } from '../../../types';

interface FamiliaModalProps {
  isOpen: boolean;
  onClose: () => void;
  familia: FamiliaState;
}

export const FamiliaModal: React.FC<FamiliaModalProps> = ({ isOpen, onClose, familia }) => {
  if (!isOpen) return null;

  // Safety fallback
  const safeFamilia = familia || {
      名称: "无",
      主神: "None",
      等级: "I",
      资金: 0,
      仓库: [],
      设施状态: {}
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-blue-900/20 border-4 border-blue-600 relative flex flex-col shadow-[0_0_50px_rgba(37,99,235,0.3)] backdrop-blur-xl max-h-[85vh]">
        
        <div className="bg-blue-800 p-4 flex justify-between items-center text-white shrink-0">
             <div className="flex items-center gap-3">
                <Flag size={32} />
                <h2 className="text-3xl font-display uppercase tracking-widest">眷族</h2>
             </div>
             <button onClick={onClose} className="hover:text-blue-300">
                <X size={24} />
             </button>
        </div>

        <div className="p-8 text-white space-y-8 flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Header Info */}
            <div className="text-center">
                <div className="inline-block border-2 border-white p-6 bg-black/50 mb-4 transform rotate-1">
                    <h1 className="text-5xl font-display uppercase text-blue-400 text-shadow">{safeFamilia.名称}</h1>
                </div>
                <div className="text-zinc-400 font-mono">主神: <span className="text-white font-bold">{safeFamilia.主神}</span></div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 border border-blue-500/30 p-4 flex items-center gap-4">
                    <div className="bg-blue-600 p-3 rounded-full text-white"><Coins /></div>
                    <div>
                        <div className="text-xs text-blue-300 uppercase">眷族资金</div>
                        <div className="text-2xl font-mono">{safeFamilia.资金?.toLocaleString() || 0} Valis</div>
                    </div>
                </div>
                <div className="bg-black/40 border border-blue-500/30 p-4 flex items-center gap-4">
                    <div className="bg-blue-600 p-3 rounded-full text-white"><Home /></div>
                    <div>
                        <div className="text-xs text-blue-300 uppercase">据点等级</div>
                        <div className="text-2xl font-mono">Rank {safeFamilia.等级}</div>
                    </div>
                </div>
            </div>

            {/* Warehouse Section */}
            <div className="border-t border-blue-800 pt-4">
                <div className="flex items-center gap-2 mb-4">
                    <Package className="text-blue-400" />
                    <h3 className="text-blue-400 uppercase font-bold text-xl">眷族仓库</h3>
                </div>
                
                <div className="bg-black/50 border border-blue-900 p-4 min-h-[150px]">
                    {safeFamilia.仓库 && safeFamilia.仓库.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {safeFamilia.仓库.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-blue-900/20 p-2 border border-blue-900/50 hover:bg-blue-900/40">
                                    <span className="text-white text-sm">{item.名称}</span>
                                    <span className="text-blue-300 text-xs font-mono">x{item.数量}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-500 italic text-center py-10">仓库空空如也。</p>
                    )}
                </div>
            </div>

            {/* Facilities Section */}
            <div className="border-t border-blue-800 pt-4">
                <h3 className="text-blue-400 uppercase font-bold mb-2">据点设施状态</h3>
                {safeFamilia.设施状态 && Object.keys(safeFamilia.设施状态).length > 0 ? (
                    <div className="text-sm text-zinc-300">
                        {JSON.stringify(safeFamilia.设施状态)}
                    </div>
                ) : (
                    <div className="text-sm text-zinc-500 italic">暂无特殊设施建设。</div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};
