
import React, { useState } from 'react';
import { CombatState, CharacterStats, Skill, InventoryItem } from '../../types';
import { Sword, Shield, Zap, Skull, MessageSquare, Crosshair, Package, Activity, AlertTriangle, X } from 'lucide-react';

interface CombatPanelProps {
  combatState: CombatState;
  playerStats: CharacterStats;
  skills: Skill[];
  inventory?: InventoryItem[];
  onPlayerAction: (action: 'attack' | 'skill' | 'guard' | 'escape' | 'talk' | 'item', payload?: any) => void;
}

export const CombatPanel: React.FC<CombatPanelProps> = ({ 
  combatState, 
  playerStats, 
  skills,
  inventory = [],
  onPlayerAction 
}) => {
  const [menuLevel, setMenuLevel] = useState<'MAIN' | 'SKILLS' | 'ITEMS' | 'TALK'>('MAIN');
  const [freeActionInput, setFreeActionInput] = useState('');

  if (!combatState.敌方) return <div className="p-10 text-white animate-pulse">扫描敌对目标中...</div>;

  const validConsumables = inventory.filter(i => i.类型 === 'consumable');

  const handleFreeActionSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(freeActionInput.trim()) {
          onPlayerAction('talk', freeActionInput);
          setFreeActionInput('');
      }
  };

  const enemy = combatState.敌方;

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden bg-black font-sans">
      
      {/* --- Dynamic Background --- */}
      <div className="absolute inset-0 z-0 bg-zinc-950 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
         <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,0,0,0.05)_10px,rgba(255,0,0,0.05)_11px)]" />
      </div>

      {/* --- Battlefield (Top 60%) --- */}
      <div className="flex-1 relative z-10 p-4 md:p-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
        
        {/* Enemy Unit Data Card */}
        <div className="relative group w-full max-w-sm">
            {/* Target Crosshair */}
            <div className="absolute -top-6 -right-6 text-red-500 animate-spin-slow opacity-50">
                <Crosshair size={60} />
            </div>

            <div className="bg-zinc-900/90 border-2 border-red-600 p-6 shadow-[0_0_30px_rgba(220,38,38,0.3)] relative overflow-hidden transform transition-transform hover:scale-105">
                <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1 uppercase">HOSTILE</div>
                
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-black border border-red-800 flex items-center justify-center text-red-500 rounded shadow-inner">
                        <Skull size={40} />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-display font-black italic text-white tracking-wider leading-none mb-1">
                            {enemy.名称}
                        </h2>
                        <div className="flex gap-2">
                            <span className="text-xs font-mono text-red-400 border border-red-900 px-1">LV.{enemy.等级 || '?'}</span>
                            {enemy.精神力 !== undefined && (
                                <span className="text-xs font-mono text-purple-400 border border-purple-900 px-1">MP.{enemy.精神力}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* HP Bar */}
                <div className="mb-2">
                    <div className="flex justify-between text-xs text-red-300 font-bold mb-1">
                        <span>HP</span>
                        <span>{((enemy.生命值 / enemy.最大生命值) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-4 bg-black border border-red-900 skew-x-[-15deg] overflow-hidden">
                        <div 
                            className="h-full bg-red-600 transition-all duration-300"
                            style={{ width: `${(enemy.生命值 / enemy.最大生命值) * 100}%` }}
                        />
                    </div>
                </div>

                <p className="text-xs text-zinc-400 italic font-serif leading-relaxed line-clamp-2">
                    "{enemy.描述 || '一个充满敌意的存在。'}"
                </p>
                
                {/* Skills Hint */}
                {enemy.技能 && enemy.技能.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-red-900/50 flex flex-wrap gap-1">
                        {enemy.技能.slice(0, 3).map((skill, i) => (
                            <span key={i} className="text-[10px] bg-red-950 text-red-300 px-1 rounded border border-red-900/50">{skill}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* --- Info Bar (Middle) --- */}
      <div className="h-10 bg-red-950/30 border-y border-red-900 flex items-center justify-between px-6 z-20 backdrop-blur-md shrink-0">
         <div className="text-red-500 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
             <Activity size={16} className="animate-pulse" />
             COMBAT ACTIVE
         </div>
         <div className="text-zinc-400 font-mono text-xs truncate max-w-[50%]">
             LOG: {combatState.战斗记录[combatState.战斗记录.length - 1] || "战斗开始"}
         </div>
      </div>

      {/* --- Action Menu (Bottom) --- */}
      <div className="h-[40%] max-h-[280px] bg-zinc-900 border-t-4 border-black relative z-30 flex shrink-0">
         
         {/* Left: Player Stats */}
         <div className="w-1/3 md:w-1/4 bg-black border-r border-zinc-800 p-4 md:p-6 flex flex-col justify-center gap-4">
             <div>
                 <h3 className="text-xl md:text-2xl font-display text-white font-bold tracking-wide uppercase truncate">
                     {playerStats.姓名}
                 </h3>
                 <span className="text-xs text-blue-500 font-bold">LV.{playerStats.等级}</span>
             </div>
             <div className="space-y-3">
                 <div className="relative">
                     <div className="flex justify-between text-[10px] text-green-500 font-bold mb-0.5"><span>HP</span><span>{playerStats.生命值}/{playerStats.最大生命值}</span></div>
                     <div className="h-2 bg-zinc-800"><div className="h-full bg-green-600" style={{ width: `${(playerStats.生命值/playerStats.最大生命值)*100}%`}} /></div>
                 </div>
                 <div className="relative">
                     <div className="flex justify-between text-[10px] text-purple-500 font-bold mb-0.5"><span>MP</span><span>{playerStats.精神力}/{playerStats.最大精神力}</span></div>
                     <div className="h-2 bg-zinc-800"><div className="h-full bg-purple-600" style={{ width: `${(playerStats.精神力/playerStats.最大精神力)*100}%`}} /></div>
                 </div>
             </div>
         </div>

         {/* Right: Command Grid */}
         <div className="flex-1 p-4 md:p-6 bg-zinc-900 overflow-y-auto custom-scrollbar">
             {menuLevel === 'MAIN' ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-full">
                    <CombatButton label="攻击 (Attack)" icon={<Sword/>} onClick={() => onPlayerAction('attack')} color="bg-red-700 hover:bg-red-600" />
                    <CombatButton label="技能 (Skill)" icon={<Zap/>} onClick={() => setMenuLevel('SKILLS')} color="bg-blue-700 hover:bg-blue-600" />
                    <CombatButton label="物品 (Item)" icon={<Package/>} onClick={() => setMenuLevel('ITEMS')} color="bg-green-700 hover:bg-green-600" />
                    <CombatButton label="防御 (Guard)" icon={<Shield/>} onClick={() => onPlayerAction('guard')} color="bg-yellow-700 hover:bg-yellow-600" />
                    <CombatButton label="自由行动 (Free)" icon={<MessageSquare/>} onClick={() => setMenuLevel('TALK')} color="bg-pink-700 hover:bg-pink-600" />
                    <CombatButton label="逃跑 (Escape)" icon={<AlertTriangle/>} onClick={() => onPlayerAction('escape')} color="bg-zinc-700 hover:bg-zinc-600" />
                 </div>
             ) : menuLevel === 'SKILLS' ? (
                 <div className="h-full flex flex-col">
                     <SubMenuHeader title="选择技能 / 魔法" onBack={() => setMenuLevel('MAIN')} />
                     <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                         {skills.length > 0 ? skills.map(skill => (
                             <button 
                                key={skill.id}
                                onClick={() => onPlayerAction('skill', skill)}
                                className="w-full flex justify-between items-center bg-zinc-800 p-3 border-l-4 border-blue-600 hover:bg-zinc-700 transition-colors text-left"
                             >
                                 <div>
                                     <div className="text-white font-bold text-sm">{skill.名称}</div>
                                     <div className="text-zinc-500 text-xs">{skill.属性}</div>
                                 </div>
                                 <span className="text-blue-400 font-mono text-xs">{skill.消耗}</span>
                             </button>
                         )) : <div className="text-zinc-500 text-center py-4">暂无可用技能</div>}
                     </div>
                 </div>
             ) : menuLevel === 'ITEMS' ? (
                <div className="h-full flex flex-col">
                    <SubMenuHeader title="选择消耗品" onBack={() => setMenuLevel('MAIN')} />
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {validConsumables.length > 0 ? validConsumables.map(item => (
                            <button 
                               key={item.id}
                               onClick={() => onPlayerAction('item', item)}
                               className="w-full flex justify-between items-center bg-zinc-800 p-3 border-l-4 border-green-600 hover:bg-zinc-700 transition-colors text-left"
                            >
                                <span className="text-white font-bold text-sm">{item.名称}</span>
                                <span className="text-zinc-400 font-mono text-xs">x{item.数量}</span>
                            </button>
                        )) : <div className="text-zinc-500 text-center py-4">背包中无消耗品</div>}
                    </div>
                </div>
            ) : menuLevel === 'TALK' ? (
                <div className="h-full flex flex-col">
                    <SubMenuHeader title="自由行动描述" onBack={() => setMenuLevel('MAIN')} />
                    <form onSubmit={handleFreeActionSubmit} className="flex-1 flex flex-col gap-4 pt-2">
                        <textarea 
                            value={freeActionInput}
                            onChange={(e) => setFreeActionInput(e.target.value)}
                            placeholder="描述你想做的特别行动（如：利用地形跳跃、投掷沙土干扰、尝试说服...）"
                            className="flex-1 bg-black border border-zinc-700 p-3 text-sm text-white resize-none focus:border-blue-500 outline-none"
                            autoFocus
                        />
                        <button type="submit" className="bg-pink-700 hover:bg-pink-600 text-white py-2 font-bold uppercase tracking-widest">
                            执行行动
                        </button>
                    </form>
                </div>
            ) : null}
         </div>
      </div>
    </div>
  );
};

const CombatButton = ({ label, icon, onClick, color }: any) => (
    <button 
        type="button"
        onClick={onClick}
        className={`${color} text-white flex flex-col items-center justify-center gap-2 border-2 border-transparent hover:border-white transition-all shadow-md active:scale-95 rounded-sm`}
    >
        <span className="text-2xl drop-shadow-md">{icon}</span>
        <span className="font-bold text-sm md:text-base uppercase tracking-wide">{label}</span>
    </button>
);

const SubMenuHeader = ({ title, onBack }: { title: string, onBack: () => void }) => (
    <div className="flex justify-between items-center mb-4 border-b border-zinc-700 pb-2">
        <h4 className="text-white font-bold uppercase tracking-wider">{title}</h4>
        <button type="button" onClick={onBack} className="text-zinc-400 hover:text-white flex items-center gap-1 text-xs uppercase font-bold">
            <X size={14}/> 返回
        </button>
    </div>
);
