
import React, { useMemo, useState, useEffect } from 'react';
import { CombatState, CharacterStats, Skill, InventoryItem, Enemy } from '../../types';
import { Sword, Shield, Zap, Skull, MessageSquare, Crosshair, Package, Activity, AlertTriangle, X, Target, Swords } from 'lucide-react';

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
  const enemies = useMemo(() => {
      const raw = (combatState as any)?.敌方;
      if (!raw) return [] as Enemy[];
      return Array.isArray(raw) ? raw.filter(Boolean) : [raw];
  }, [combatState]);
  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(enemies[0]?.id ?? null);

  useEffect(() => {
      if (enemies.length === 0) {
          setSelectedEnemyId(null);
          return;
      }
      if (!selectedEnemyId || !enemies.some(e => e.id === selectedEnemyId)) {
          setSelectedEnemyId(enemies[0].id);
      }
  }, [enemies, selectedEnemyId]);

  if (enemies.length === 0) return <div className="p-10 text-white animate-pulse">扫描敌对目标中...</div>;

  const validConsumables = inventory.filter(i => i.类型 === 'consumable');

  const handleFreeActionSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(freeActionInput.trim()) {
          onPlayerAction('talk', freeActionInput);
          setFreeActionInput('');
      }
  };

  const selectedEnemy = enemies.find(e => e.id === selectedEnemyId) || enemies[0];

  const getEnemyHp = (enemy: Enemy) => {
      const current = typeof enemy.当前生命值 === 'number'
          ? enemy.当前生命值
          : (typeof enemy.生命值 === 'number' ? enemy.生命值 : 0);
      const max = typeof enemy.最大生命值 === 'number'
          ? enemy.最大生命值
          : Math.max(current, 1);
      return { current, max };
  };

  const getEnemyMp = (enemy: Enemy) => {
      const current = typeof enemy.当前精神MP === 'number'
          ? enemy.当前精神MP
          : (typeof enemy.精神力 === 'number' ? enemy.精神力 : null);
      const max = typeof enemy.最大精神MP === 'number'
          ? enemy.最大精神MP
          : (typeof enemy.最大精神力 === 'number' ? enemy.最大精神力 : null);
      if (current === null || max === null) return null;
      return { current, max };
  };

  const handleTargetedAction = (action: 'attack' | 'skill' | 'guard' | 'escape' | 'talk' | 'item', payload?: any) => {
      const targetPayload = selectedEnemy
          ? { ...(payload || {}), targetId: selectedEnemy.id, targetName: selectedEnemy.名称 }
          : payload;
      onPlayerAction(action, targetPayload);
  };

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden bg-black font-sans">
      
      {/* --- Dynamic Background --- */}
      <div className="absolute inset-0 z-0 bg-zinc-950 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-950/40 via-black to-black" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-15" />
         <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,0,0,0.08)_0%,transparent_40%,rgba(255,255,255,0.04)_60%,transparent_100%)]" />
      </div>

      {/* --- Battlefield --- */}
      <div className="flex-1 min-h-0 relative z-10 p-3 md:p-6 flex flex-col gap-4 md:gap-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-red-400 font-bold">
              <div className="flex items-center gap-2">
                  <Swords size={14} />
                  敌对单位
              </div>
              <span className="text-red-500/70">数量: {enemies.length}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 min-h-0">
              <div className="flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 max-h-[240px] md:max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                      {enemies.map(enemy => {
                          const hp = getEnemyHp(enemy);
                          const mp = getEnemyMp(enemy);
                          const hpPercent = Math.max(0, Math.min(100, (hp.current / hp.max) * 100));
                          const mpPercent = mp ? Math.max(0, Math.min(100, (mp.current / mp.max) * 100)) : 0;
                          const isSelected = enemy.id === selectedEnemy?.id;
                          return (
                              <button
                                  key={enemy.id}
                                  type="button"
                                  onClick={() => setSelectedEnemyId(enemy.id)}
                                  className={`group relative text-left border-2 p-4 bg-zinc-950/90 transition-all shadow-[0_0_20px_rgba(220,38,38,0.15)] ${
                                      isSelected ? 'border-red-500 ring-2 ring-red-500/50' : 'border-zinc-800 hover:border-red-700'
                                  }`}
                              >
                                  <div className="absolute top-2 right-2 text-red-500/40 group-hover:text-red-400">
                                      <Crosshair size={18} />
                                  </div>
                                  <div className="flex items-center gap-3 mb-3">
                                      <div className="w-12 h-12 bg-black border border-red-900 flex items-center justify-center text-red-500">
                                          <Skull size={26} />
                                      </div>
                                      <div>
                                          <div className="text-white font-display text-lg uppercase tracking-wider leading-none">
                                              {enemy.名称}
                                          </div>
                                          <div className="flex items-center gap-2 mt-1">
                                              <span className="text-[10px] font-mono text-red-300 border border-red-900 px-1">等级 {enemy.等级 || '?'}</span>
                                              <span className="text-[10px] font-mono text-zinc-500">攻击 {enemy.攻击力 ?? '??'}</span>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="space-y-2">
                                      <div>
                                          <div className="flex justify-between text-[10px] text-red-300 font-bold mb-1">
                                              <span>生命</span>
                                              <span>{Math.round(hpPercent)}%</span>
                                          </div>
                                          <div className="w-full h-3 bg-black border border-red-900 overflow-hidden">
                                              <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${hpPercent}%` }} />
                                          </div>
                                      </div>
                                      {mp && (
                                          <div>
                                              <div className="flex justify-between text-[10px] text-purple-300 font-bold mb-1">
                                                  <span>精神</span>
                                                  <span>{Math.round(mpPercent)}%</span>
                                              </div>
                                              <div className="w-full h-2 bg-black border border-purple-900 overflow-hidden">
                                                  <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: `${mpPercent}%` }} />
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              </button>
                          );
                      })}
                  </div>
              </div>

              <div className="w-full lg:w-[320px] bg-zinc-950/90 border-2 border-red-800 p-4 flex flex-col gap-4 relative overflow-hidden max-h-[240px] md:max-h-none overflow-y-auto custom-scrollbar">
                  <div className="absolute -top-6 -right-4 text-red-900/40">
                      <Target size={64} />
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-black border border-red-900 flex items-center justify-center text-red-500">
                          <Skull size={32} />
                      </div>
                      <div>
                          <div className="text-[10px] uppercase tracking-[0.4em] text-red-400">锁定目标</div>
                          <div className="text-white font-display text-2xl uppercase tracking-wider">{selectedEnemy?.名称}</div>
                      </div>
                  </div>
                  <div className="text-xs text-zinc-400 font-serif leading-relaxed border-t border-red-900/40 pt-3 min-h-[72px]">
                      "{selectedEnemy?.描述 || '敌意正在凝聚。'}"
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-zinc-300">
                      <span className="border border-red-900 px-2 py-0.5">攻击力: {selectedEnemy?.攻击力 ?? '??'}</span>
                      <span className="border border-red-900 px-2 py-0.5">等级: {selectedEnemy?.等级 ?? '?'}</span>
                  </div>
                  <div className="border-t border-red-900/40 pt-3">
                      <div className="text-[10px] uppercase tracking-[0.35em] text-red-400 mb-2">技能档案</div>
                      {selectedEnemy?.技能 && selectedEnemy.技能.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                              {selectedEnemy.技能.map((skill, i) => (
                                  <span key={i} className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 border border-red-900/60">
                                      {skill}
                                  </span>
                              ))}
                          </div>
                      ) : (
                          <div className="text-[10px] text-zinc-500 italic">暂无可识别技能</div>
                      )}
                  </div>
              </div>
          </div>
      </div>

      {/* --- Info Bar (Middle) --- */}
      <div className="h-10 bg-red-950/30 border-y border-red-900 flex items-center justify-between px-4 md:px-6 z-20 backdrop-blur-md shrink-0">
         <div className="text-red-500 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
             <Activity size={16} className="animate-pulse" />
             战斗进行中
         </div>
         <div className="text-zinc-400 font-mono text-xs truncate max-w-[50%]">
             记录: {combatState.战斗记录[combatState.战斗记录.length - 1] || "战斗开始"}
         </div>
      </div>

      {/* --- Action Menu (Bottom) --- */}
      <div className="h-[45%] md:h-[40%] max-h-[320px] md:max-h-[280px] bg-zinc-900 border-t-4 border-black relative z-30 flex shrink-0">
         
         {/* Left: Player Stats */}
         <div className="w-2/5 md:w-1/4 bg-black border-r border-zinc-800 p-3 md:p-6 flex flex-col justify-center gap-3">
             <div>
                 <h3 className="text-lg md:text-2xl font-display text-white font-bold tracking-wide uppercase truncate">
                     {playerStats.姓名}
                 </h3>
                 <span className="text-[10px] text-blue-500 font-bold">等级 {playerStats.等级}</span>
             </div>
             <div className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 flex items-center gap-2">
                 <Target size={12} className="text-red-500" />
                 目标: {selectedEnemy?.名称 || '无'}
             </div>
             <div className="space-y-3">
                 <div className="relative">
                     <div className="flex justify-between text-[10px] text-green-500 font-bold mb-0.5"><span>生命</span><span>{playerStats.生命值}/{playerStats.最大生命值}</span></div>
                     <div className="h-2 bg-zinc-800"><div className="h-full bg-green-600" style={{ width: `${(playerStats.生命值/playerStats.最大生命值)*100}%`}} /></div>
                 </div>
                 <div className="relative">
                     <div className="flex justify-between text-[10px] text-purple-500 font-bold mb-0.5"><span>精神</span><span>{playerStats.精神力}/{playerStats.最大精神力}</span></div>
                     <div className="h-2 bg-zinc-800"><div className="h-full bg-purple-600" style={{ width: `${(playerStats.精神力/playerStats.最大精神力)*100}%`}} /></div>
                 </div>
             </div>
         </div>

         {/* Right: Command Grid */}
         <div className="flex-1 p-4 md:p-6 bg-zinc-900 overflow-y-auto custom-scrollbar">
             {menuLevel === 'MAIN' ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-full">
                    <CombatButton label="攻击" icon={<Sword/>} onClick={() => handleTargetedAction('attack')} color="bg-red-700 hover:bg-red-600" />
                    <CombatButton label="技能" icon={<Zap/>} onClick={() => setMenuLevel('SKILLS')} color="bg-blue-700 hover:bg-blue-600" />
                    <CombatButton label="物品" icon={<Package/>} onClick={() => setMenuLevel('ITEMS')} color="bg-green-700 hover:bg-green-600" />
                    <CombatButton label="防御" icon={<Shield/>} onClick={() => handleTargetedAction('guard')} color="bg-yellow-700 hover:bg-yellow-600" />
                    <CombatButton label="自由行动" icon={<MessageSquare/>} onClick={() => setMenuLevel('TALK')} color="bg-pink-700 hover:bg-pink-600" />
                    <CombatButton label="逃跑" icon={<AlertTriangle/>} onClick={() => onPlayerAction('escape')} color="bg-zinc-700 hover:bg-zinc-600" />
                 </div>
             ) : menuLevel === 'SKILLS' ? (
                 <div className="h-full flex flex-col">
                     <SubMenuHeader title="选择技能 / 魔法" onBack={() => setMenuLevel('MAIN')} />
                     <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                         {skills.length > 0 ? skills.map(skill => (
                             <button 
                                key={skill.id}
                                onClick={() => handleTargetedAction('skill', skill)}
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
