
import React from 'react';
import { X, BookOpen, Clock, MapPin, GitBranch, Target, AlertTriangle } from 'lucide-react';
import { StoryState } from '../../../types';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: StoryState;
}

export const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose, story }) => {
  if (!isOpen) return null;

  // Safe check for story object
  const safeStory = story || {
      当前卷数: 1,
      当前篇章: "Unknown",
      是否正史: true,
      偏移度: 0,
      关键节点: "Unknown",
      节点状态: "Unknown",
      下一触发: "Unknown",
      预定日期: "Unknown",
      描述: "暂无剧情数据。"
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-200">
      <div className="w-full h-full md:h-auto md:max-h-[85vh] md:max-w-4xl bg-zinc-900 border-y-0 md:border-y-8 border-green-600 relative flex flex-col shadow-2xl overflow-hidden">
        
        <div className="absolute top-4 right-4 z-50">
             <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors border border-zinc-700 p-2 bg-black">
                <X size={24} />
             </button>
        </div>

        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]" />

        <div className="p-8 md:p-12 flex flex-col relative z-10 h-full overflow-y-auto custom-scrollbar pb-32 md:pb-12">
            
            {/* Header: Current Arc */}
            <div className="flex flex-col items-center text-center mb-10 mt-8 md:mt-0">
                <BookOpen size={48} className="text-green-600 mb-4" />
                <h2 className="text-zinc-500 uppercase tracking-[0.5em] text-xs mb-2">当前篇章 (Vol.{safeStory.当前卷数})</h2>
                <h1 className="text-4xl md:text-6xl font-display uppercase text-white text-shadow">{safeStory.当前篇章}</h1>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                
                {/* Left: Progression & Path */}
                <div className="bg-black/40 border-l-4 border-green-600 p-6 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 text-green-500 mb-2 font-bold uppercase tracking-wider text-sm">
                            <GitBranch size={16} /> 剧情路线
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-2xl font-display ${safeStory.是否正史 ? 'text-white' : 'text-yellow-500'}`}>
                                {safeStory.是否正史 ? "原著正史" : "IF 分歧线"}
                            </span>
                        </div>
                        {/* Deviation Bar */}
                        <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-zinc-500 uppercase mb-1">
                                <span>原著</span>
                                <span>偏移度 {safeStory.偏移度 || 0}%</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${safeStory.偏移度 && safeStory.偏移度 > 50 ? 'bg-yellow-500' : 'bg-green-600'}`} 
                                    style={{ width: `${safeStory.偏移度 || 0}%` }} 
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                         <div className="flex items-center gap-2 text-green-500 mb-2 font-bold uppercase tracking-wider text-sm">
                            <MapPin size={16} /> 下一关键节点
                        </div>
                        <div className="text-xl text-white font-bold">{safeStory.关键节点}</div>
                        <div className="inline-block mt-1 px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded border border-zinc-700">
                            Status: {safeStory.节点状态}
                        </div>
                    </div>
                </div>

                {/* Right: Triggers & Guide */}
                <div className="bg-black/40 border-r-4 border-green-600 p-6 space-y-6 text-right">
                    <div>
                        <div className="flex items-center justify-end gap-2 text-green-500 mb-2 font-bold uppercase tracking-wider text-sm">
                            <Target size={16} /> 触发条件
                        </div>
                        <div className="text-xl text-white font-bold">{safeStory.下一触发 || "???"}</div>
                        <div className="text-zinc-500 text-sm mt-1 flex items-center justify-end gap-2">
                             <Clock size={12} /> 预定: {safeStory.预定日期}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800">
                        <div className="flex items-center justify-end gap-2 text-yellow-600 mb-2 font-bold uppercase tracking-wider text-sm">
                            <AlertTriangle size={16} /> 引导
                        </div>
                        <p className="text-zinc-300 text-sm italic leading-relaxed">
                            {safeStory.描述 || "暂无具体引导，请自由探索。"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer Quote */}
            <div className="mt-auto w-full bg-zinc-800 p-4 text-center border-t border-green-900/50">
                <p className="text-zinc-500 text-xs font-mono">
                    "英雄的愿望是白色的钟声。做出你的选择，冒险者。"
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
