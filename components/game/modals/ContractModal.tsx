
import React from 'react';
import { X, Scroll, PenTool } from 'lucide-react';
import { Contract } from '../../../types';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contracts: Contract[];
}

export const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose, contracts = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      
      {/* Background Frame */}
      <div className="w-full max-w-5xl h-[85vh] relative flex flex-col perspective-1000">
        
        {/* Header */}
        <div className="bg-[#2c1a1a] p-6 flex justify-between items-center border-b-4 border-red-900 shadow-xl z-20 transform -rotate-1">
             <div className="flex items-center gap-4 text-red-500">
                <Scroll size={40} className="drop-shadow-md" />
                <div>
                    <h2 className="text-4xl font-display uppercase tracking-widest text-white text-shadow-red">契约</h2>
                    <span className="text-xs font-mono text-zinc-400 tracking-wider">THOU ART I... AND I AM THOU...</span>
                </div>
             </div>
             <button onClick={onClose} className="hover:text-white text-red-600 transition-colors border-2 border-red-600 hover:bg-red-600 p-2 rounded-full">
                <X size={24} />
             </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] bg-[#1a1212] relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] border-x-4 border-b-4 border-[#3d2b2b]">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {contracts.length > 0 ? contracts.map((c, idx) => (
                    <div 
                        key={c.id} 
                        className="relative group perspective-500 hover:z-10"
                        style={{ transitionDelay: `${idx * 100}ms` }}
                    >
                        {/* Paper Sheet */}
                        <div className="relative bg-[#f0e6d2] text-black p-8 shadow-[10px_10px_30px_rgba(0,0,0,0.5)] transform transition-all duration-500 group-hover:rotate-0 group-hover:scale-105 group-hover:shadow-[20px_20px_50px_rgba(0,0,0,0.7)] origin-top-left"
                             style={{ transform: `rotate(${idx % 2 === 0 ? '-2deg' : '2deg'})` }}
                        >
                            {/* Paper Texture Overlay */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] opacity-40 pointer-events-none" />
                            <div className="absolute top-0 left-0 w-full h-full border-2 border-[#d4c5a9] m-2 pointer-events-none" />

                            {/* Stamp - Status Feedback */}
                            <div className={`absolute top-6 right-6 w-24 h-24 border-4 rounded-full flex items-center justify-center transform rotate-[-15deg] opacity-80 mix-blend-multiply pointer-events-none
                                ${c.状态 === 'Active' || c.状态 === '生效中' ? 'border-red-800 text-red-800' : 'border-zinc-500 text-zinc-500'}
                            `}>
                                <div className="text-xl font-display font-bold uppercase tracking-widest border-y border-current py-1">
                                    {c.状态}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 font-serif">
                                <div className="flex items-center gap-3 border-b-2 border-black pb-3 mb-4">
                                    <PenTool size={24} />
                                    <h3 className="text-3xl font-display uppercase tracking-tighter">{c.名称}</h3>
                                </div>
                                
                                <p className="text-base leading-relaxed mb-6 italic text-[#4a3b3b]">
                                    "{c.描述}"
                                </p>
                                
                                <div className="bg-[#e3d7c1] p-4 border border-[#c4b59d] text-xs font-mono text-[#5c4024] relative">
                                    <div className="absolute -top-2 left-4 bg-[#f0e6d2] px-2 font-bold uppercase text-[10px]">Terms of Agreement</div>
                                    <p>{c.条款 || "By establishing this bond, I vow to provide assistance in your rebellion."}</p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-dashed border-black/30 flex justify-between items-end">
                                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                                        Contract ID: #{c.id.substring(0,8)}
                                    </div>
                                    <div className="font-cursive text-2xl text-black transform -rotate-6">
                                        Take Your Heart
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Pin (Visual Decor) */}
                        <div className="absolute -top-3 left-1/2 w-4 h-4 rounded-full bg-red-900 shadow-md border border-white z-20" />
                    </div>
                )) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                        <h3 className="text-[#8b5a2b] font-display text-4xl uppercase tracking-widest mb-4">No Contracts Found</h3>
                        <p className="text-zinc-500 font-mono">Forge bonds to gain strength.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
