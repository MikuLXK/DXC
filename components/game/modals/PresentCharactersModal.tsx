
import React from 'react';
import { X, Radar, MapPin, Heart, Zap, Battery } from 'lucide-react';
import { Confidant } from '../../../types';

interface PresentCharactersModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Confidant[];
}

export const PresentCharactersModal: React.FC<PresentCharactersModalProps> = ({ isOpen, onClose, characters }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-900 border-4 border-teal-500 relative flex flex-col shadow-[0_0_50px_rgba(20,184,166,0.3)] max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-teal-900/50 p-4 flex justify-between items-center border-b-2 border-teal-500 shrink-0">
             <div className="flex items-center gap-3 text-teal-400">
                <Radar size={32} className="animate-spin-slow" />
                <h2 className="text-3xl font-display uppercase tracking-widest">环境扫描</h2>
             </div>
             <button onClick={onClose} className="hover:text-white text-teal-500 transition-colors border-2 border-teal-500 p-1">
                <X size={24} />
             </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {characters.length > 0 ? characters.map((c) => (
                    <div key={c.id} className="relative bg-black border border-teal-800 p-4 flex gap-4 shadow-lg group hover:border-teal-400 transition-colors">
                        {/* Avatar Stub */}
                        <div className="w-16 h-16 bg-zinc-800 border border-teal-700 flex items-center justify-center shrink-0 text-2xl font-bold text-teal-500">
                            {c.姓名[0]}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-white font-bold text-lg truncate">{c.姓名}</h3>
                                <span className="text-teal-500 font-mono text-sm border border-teal-900 px-2 rounded">
                                    Lv.{c.等级 || "???"}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3">
                                <MapPin size={12} />
                                <span className="uppercase tracking-wider">{c.位置详情 || "未知位置"}</span>
                            </div>

                            {/* Vitals Bars (Mock if undefined, or use real data) */}
                            {c.身份 === '冒险者' ? (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase font-bold">
                                        <Heart size={10} className="text-red-500"/> HP
                                        <div className="flex-1 h-1.5 bg-zinc-800">
                                            <div className="h-full bg-red-600" style={{ width: c.生存数值 ? `${(c.生存数值.当前生命/c.生存数值.最大生命)*100}%` : '100%' }} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase font-bold">
                                        <Zap size={10} className="text-purple-500"/> MP
                                        <div className="flex-1 h-1.5 bg-zinc-800">
                                            <div className="h-full bg-purple-600" style={{ width: c.生存数值 ? `${(c.生存数值.当前精神/c.生存数值.最大精神)*100}%` : '100%' }} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase font-bold">
                                        <Battery size={10} className="text-yellow-500"/> STM
                                        <div className="flex-1 h-1.5 bg-zinc-800">
                                            <div className="h-full bg-yellow-600" style={{ width: c.生存数值 ? `${(c.生存数值.当前体力/c.生存数值.最大体力)*100}%` : '100%' }} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-teal-900 text-xs italic mt-2">非战斗人员 - 无生命体征监测</div>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-teal-800/50">
                        <Radar size={64} className="mb-4" />
                        <span className="font-display text-2xl uppercase tracking-widest">未检测到生命反应</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
