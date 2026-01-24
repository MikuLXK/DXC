

import React, { useState } from 'react';
import { X, Globe, Crown, Mic2, AlertTriangle, Scroll, Clock, Trash2 } from 'lucide-react';
import { WorldState } from '../../../types';

interface DynamicWorldModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldState?: WorldState;
  npcStates?: any[];
}

type WorldTab = 'GUILD' | 'DENATUS' | 'RUMORS';

export const DynamicWorldModal: React.FC<DynamicWorldModalProps> = ({ 
    isOpen, 
    onClose,
    worldState
}) => {
  const [activeTab, setActiveTab] = useState<WorldTab>('GUILD');

  if (!isOpen) return null;

  const safeWorldState = worldState || {
      异常指数: 0,
      眷族声望: 50,
      头条新闻: [],
      街头传闻: [],
      下次更新: "未知"
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-4 animate-in zoom-in-95 duration-200">
      <div className="w-full h-full md:h-[85vh] md:max-w-6xl bg-[#0f172a] border-0 md:border-4 border-[#3b82f6] relative flex flex-col shadow-[0_0_50px_rgba(59,130,246,0.3)]">
        
        {/* Header */}
        <div className="bg-[#1e3a8a] p-4 flex justify-between items-center border-b-2 border-[#3b82f6] shrink-0">
             <div className="flex items-center gap-3 text-white">
                <Globe className="animate-spin-slow" />
                <div>
                    <h2 className="text-xl md:text-3xl font-display uppercase tracking-widest text-shadow-sm truncate">世界情报监测</h2>
                    <div className="text-[10px] font-mono opacity-70">WORLD MONITOR SYSTEM // ORARIO</div>
                </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white hover:text-[#1e3a8a] text-white transition-colors border border-white rounded-full">
                <X size={24} />
             </button>
        </div>

        {/* Sidebar + Content Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-[#020617] border-b md:border-b-0 md:border-r border-[#1e293b] p-0 md:p-4 flex md:flex-col shrink-0 overflow-x-auto">
                <TabButton 
                    label="公会公告" 
                    icon={<Scroll size={18}/>} 
                    active={activeTab === 'GUILD'} 
                    onClick={() => setActiveTab('GUILD')} 
                />
                <TabButton 
                    label="诸神神会" 
                    icon={<Crown size={18}/>} 
                    active={activeTab === 'DENATUS'} 
                    onClick={() => setActiveTab('DENATUS')} 
                />
                <TabButton 
                    label="街头传闻" 
                    icon={<Mic2 size={18}/>} 
                    active={activeTab === 'RUMORS'} 
                    onClick={() => setActiveTab('RUMORS')} 
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-[#0f172a] relative overflow-y-auto custom-scrollbar pb-32 md:pb-8">
                
                {/* Next Update Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full border border-blue-900/50">
                    <Clock size={12} className="text-blue-400" />
                    <span className="text-[10px] text-zinc-400 font-mono">下次更新: {safeWorldState.下次更新 || "计算中..."}</span>
                </div>

                {activeTab === 'GUILD' && <GuildPanel world={safeWorldState} />}
                {activeTab === 'DENATUS' && <DenatusPanel world={safeWorldState} />}
                {activeTab === 'RUMORS' && <RumorsPanel world={safeWorldState} />}
            </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ label, icon, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex-1 md:flex-none md:w-full text-center md:text-left p-3 flex items-center justify-center md:justify-start gap-2 md:gap-3 font-display uppercase tracking-wide transition-all border-b-4 md:border-b-0 md:border-l-4 whitespace-nowrap text-sm md:text-base
            ${active 
                ? 'bg-[#1e293b] border-blue-500 text-blue-400' 
                : 'border-transparent text-zinc-500 hover:text-white hover:bg-[#0f172a]'
            }
        `}
    >
        {icon} <span>{label}</span>
    </button>
);

// --- Panels ---

const GuildPanel = ({ world }: { world: WorldState }) => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="border-b border-blue-900 pb-2 mb-6">
            <h3 className="text-blue-400 font-display text-2xl uppercase tracking-widest">公会官方通告</h3>
        </div>

        {/* Threat Level */}
        <div className="bg-[#020617] p-6 border border-blue-900/50 shadow-lg relative overflow-hidden">
             <div className="flex justify-between items-center mb-2 z-10 relative">
                 <h4 className="text-white font-bold uppercase flex items-center gap-2"><AlertTriangle size={18} className="text-red-500"/> 地下城异常指数 (Irregularity)</h4>
                 <span className="text-red-500 font-mono text-2xl font-bold">{world.异常指数}%</span>
             </div>
             <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700 relative z-10">
                  <div 
                    className="h-full bg-gradient-to-r from-green-600 via-yellow-500 to-red-600 transition-all duration-1000"
                    style={{ width: `${world.异常指数}%` }}
                  />
             </div>
             <p className="text-zinc-500 text-xs mt-3 italic relative z-10">
                 {world.异常指数 < 30 ? "目前处于稳定期，建议新人进行探索。" : 
                  world.异常指数 < 70 ? "中层区域观测到不规则怪物刷新，请注意安全。" : 
                  "警报！深层区域出现‘强化种’反应，非第一级冒险者请勿靠近。"}
             </p>
             <div className="absolute right-0 top-0 text-red-900/10 transform rotate-12 pointer-events-none">
                 <AlertTriangle size={150} />
             </div>
        </div>

        {/* News Feed */}
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                 <h4 className="text-blue-300 font-bold uppercase text-sm border-l-4 border-blue-600 pl-2">头条新闻 (Breaking News)</h4>
                 <span className="text-[10px] text-zinc-600">SOURCE: GUILD HQ</span>
             </div>
             {world.头条新闻.length > 0 ? (
                 world.头条新闻.map((news, i) => (
                     <div key={i} className="bg-zinc-900/80 p-4 border-l-2 border-zinc-700 hover:border-blue-500 transition-colors flex justify-between group">
                         <p className="text-zinc-300 font-sans text-sm">{news}</p>
                     </div>
                 ))
             ) : (
                 <div className="text-zinc-600 italic p-4 text-center border border-dashed border-zinc-800">暂无重大新闻。</div>
             )}
        </div>
    </div>
);

const DenatusPanel = ({ world }: { world: WorldState }) => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="border-b border-purple-900 pb-2 mb-6">
            <h3 className="text-purple-400 font-display text-2xl uppercase tracking-widest">诸神神会 (Denatus)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Reputation */}
            <div className="bg-[#020617] p-6 border border-purple-900/50 relative overflow-hidden text-center flex flex-col justify-center">
                <div className="absolute -top-6 -right-6 text-purple-900/20">
                    <Crown size={120} />
                </div>
                <h4 className="text-purple-400 font-bold uppercase mb-2 relative z-10">眷族声望 (Reputation)</h4>
                <div className="text-6xl font-display text-white mb-2 relative z-10 text-shadow-purple">{world.眷族声望}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest relative z-10">Approval Rating</div>
                
                <div className="mt-4 h-1 bg-zinc-900 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600" style={{ width: `${Math.min(100, world.眷族声望 / 100)}%` }} />
                </div>
            </div>

            {/* Flavor Text */}
            <div className="bg-[#020617] p-6 border border-zinc-800">
                <h4 className="text-zinc-400 font-bold uppercase mb-4 text-sm">神言神语</h4>
                <div className="space-y-3 font-serif text-sm italic text-zinc-400">
                    <p>“那孩子的称号决定了吗？”</p>
                    <p>“赫斯缇雅还在为了名字吵架呢。”</p>
                    <p>“下一次神会要有好酒才行啊。”</p>
                </div>
            </div>
        </div>
    </div>
);

const RumorsPanel = ({ world }: { world: WorldState }) => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="border-b border-green-900 pb-2 mb-6">
            <h3 className="text-green-400 font-display text-2xl uppercase tracking-widest">街头传闻 (Rumors)</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
             {world.街头传闻.length > 0 ? (
                 world.街头传闻.map((rumor, i) => (
                     <div key={i} className="flex gap-4 items-center bg-[#020617] p-4 border border-zinc-800 hover:border-green-600 transition-colors group">
                         <div className="bg-green-900/20 w-12 h-12 flex items-center justify-center shrink-0 rounded-full group-hover:bg-green-600 group-hover:text-black transition-colors text-green-600">
                             <Mic2 size={20} />
                         </div>
                         <div className="flex-1">
                             <p className="text-zinc-200 text-sm mb-1 font-bold">"{rumor.主题}"</p>
                             <div className="flex items-center gap-2">
                                 <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden">
                                     <div className="h-full bg-green-600" style={{ width: `${rumor.传播度}%` }} />
                                 </div>
                                 <span className="text-xs text-green-500 font-mono">{rumor.传播度}% 传播度</span>
                             </div>
                         </div>
                     </div>
                 ))
             ) : (
                 <div className="text-center py-10 text-zinc-600 border border-dashed border-zinc-800">
                     <p>最近风平浪静，没有什么特别的流言。</p>
                 </div>
             )}
        </div>
    </div>
);