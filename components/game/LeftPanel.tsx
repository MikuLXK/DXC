
import React, { useState } from 'react';
import { CharacterStats, InventoryItem, BodyPartStats, Difficulty, StatusEffect } from '../../types';
import { Sword, Shield, Shirt, Footprints, Battery, Activity, Star, AlertTriangle, Sparkles, Skull, Coins, Zap, Heart, Droplets, Utensils, Hand, User, Scan } from 'lucide-react';
import { VitalBar, StatRow } from './left/LeftPanelComponents';

interface LeftPanelProps {
  stats: CharacterStats;
  className?: string;
  inventory?: InventoryItem[]; 
  isHellMode?: boolean;
  difficulty?: Difficulty;
}

const BodyPartRow = ({ label, data }: { label: string, data: BodyPartStats }) => {
    // Determine color based on remaining % of THIS PART using its own max
    if (!data) return null;
    const { 当前, 最大 } = data;
    const percent = 最大 > 0 ? Math.min(100, Math.max(0, (当前 / 最大) * 100)) : 0;
    
    let colorClass = 'bg-blue-600';
    if (percent < 30) colorClass = 'bg-red-600';
    else if (percent < 60) colorClass = 'bg-yellow-500';
    else if (percent < 90) colorClass = 'bg-blue-500';
    else colorClass = 'bg-green-500';

    return (
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-zinc-400">
            <span className="w-8 text-right shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-zinc-900 border border-zinc-700 relative overflow-hidden">
                <div 
                    className={`h-full ${colorClass} transition-all duration-500`} 
                    style={{ width: `${percent}%` }} 
                />
            </div>
            <span className="w-6 font-mono text-white text-right">{Math.round(percent)}%</span>
        </div>
    );
};

const SimpleEquipSlot = ({ label, slotKey, stats, icon }: { label: string, slotKey: string, stats: CharacterStats, icon: React.ReactNode }) => {
    const itemName = stats.装备 ? stats.装备[slotKey] : null;
    
    return (
        <div className="flex items-center gap-2 p-1.5 border-b border-zinc-800 bg-black/20">
            <div className="text-zinc-600">{icon}</div>
            <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex justify-between items-center">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">{label}</span>
                </div>
                <div className={`text-xs truncate ${itemName ? 'text-white' : 'text-zinc-700 italic'}`}>
                    {itemName || "未装备"}
                </div>
            </div>
        </div>
    );
};

const normalizeStatus = (entry: StatusEffect | string): StatusEffect => {
    if (typeof entry === 'string') {
        return { 名称: entry, 类型: 'Buff', 效果: '', 持续时间: '' };
    }
    return entry;
};

const StatusBadge = ({ entry, variant }: { entry: StatusEffect | string; variant: 'buff' | 'curse' }) => {
    const status = normalizeStatus(entry);
    const isBuff = status.类型 === 'Buff';
    const badgeColor = variant === 'curse'
        ? 'bg-red-900/30 text-red-300 border-red-800'
        : isBuff
            ? 'bg-emerald-900/30 text-emerald-300 border-emerald-800'
            : 'bg-amber-900/30 text-amber-300 border-amber-800';
    const tooltipBorder = variant === 'curse' ? 'border-red-800' : isBuff ? 'border-emerald-700' : 'border-amber-700';
    const icon = variant === 'curse' ? <Skull size={10} /> : <Sparkles size={10} />;

    return (
        <div className="relative group">
            <div className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 border ${badgeColor}`}>
                {icon} {status.名称}
            </div>
            <div className={`absolute left-0 top-full mt-2 w-56 bg-black/95 border ${tooltipBorder} p-2 text-[10px] text-zinc-300 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity`}>
                <div className="text-white font-bold text-[11px] mb-1">{status.名称}</div>
                <div className="flex justify-between text-[9px] text-zinc-400 mb-1">
                    <span>类型</span>
                    <span className={isBuff ? 'text-emerald-300' : 'text-amber-300'}>{status.类型}</span>
                </div>
                {status.效果 && (
                    <div className="text-[10px] text-zinc-200 mb-1">
                        <span className="text-zinc-500">效果: </span>{status.效果}
                    </div>
                )}
                {status.持续时间 && (
                    <div className="text-[10px] text-zinc-200">
                        <span className="text-zinc-500">持续: </span>{status.持续时间}
                    </div>
                )}
            </div>
        </div>
    );
};

export const LeftPanel: React.FC<LeftPanelProps> = ({ stats, className = '', isHellMode, difficulty }) => {
  // Theme Variables
  const borderColor = isHellMode ? 'border-red-600' : 'border-blue-600';
  const subBorderColor = isHellMode ? 'border-red-900' : 'border-blue-900';
  const textColor = isHellMode ? 'text-red-500' : 'text-blue-500';
  const textSubColor = isHellMode ? 'text-red-300' : 'text-blue-300';
  const bgColor = isHellMode ? 'bg-red-900/50' : 'bg-blue-900/50';
  const gradientOverlay = isHellMode ? 'from-red-900/20' : 'from-blue-900/20';
  const isNormalPlus = difficulty ? difficulty !== Difficulty.EASY : false;
  const showPhysiology = isNormalPlus && !!stats.身体部位;

  return (
    <div className={`w-full lg:w-[22%] h-full bg-zinc-950 border-r-4 border-zinc-800 relative flex flex-col p-0 overflow-hidden shadow-2xl ${className}`}>
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
      <div className={`absolute top-0 right-0 w-32 h-full bg-gradient-to-l ${gradientOverlay} to-transparent pointer-events-none`} />

      {/* --- Top Card: Avatar & Familia --- */}
      <div className={`relative p-4 pb-6 bg-gradient-to-b from-zinc-900 to-black border-b-2 ${subBorderColor}`}>
         <div className="flex gap-4">
             {/* Portrait Frame */}
             <div className="w-24 h-24 shrink-0 relative group">
                 <div className="absolute inset-0 border-2 border-white transform rotate-3 transition-transform group-hover:rotate-0" />
                 <div className={`absolute inset-0 border-2 ${borderColor} transform -rotate-3 transition-transform group-hover:rotate-0`} />
                 <img 
                   src={stats.头像 || "https://picsum.photos/200/200"} 
                   alt="Avatar"
                   className="w-full h-full object-cover relative z-10 transition-all duration-500"
                 />
                 <div className="absolute -bottom-2 -right-2 bg-black border border-white text-white text-[10px] font-bold px-2 py-0.5 z-20">
                     {stats.种族}
                 </div>
             </div>
             
             {/* Name & Title */}
             <div className="flex-1 min-w-0 flex flex-col justify-end">
                <div className={`${bgColor} border-l-2 ${borderColor} px-2 py-0.5 mb-1`}>
                    <span className={`text-[10px] ${textSubColor} font-bold uppercase tracking-widest block`}>FAMILIA</span>
                    <span className="text-xs text-white font-serif truncate block">{stats.所属眷族}</span>
                </div>
                <h2 className="text-2xl font-display uppercase text-white italic tracking-tighter leading-none truncate">
                    {stats.姓名}
                </h2>
                <div className="text-xs font-serif text-zinc-400 italic truncate mt-1">
                    "{stats.称号 || '未完新人'}"
                </div>
             </div>
         </div>

         {/* Level Badge */}
         <div className="absolute top-4 right-4 flex flex-col items-center">
             <div className="text-[10px] font-bold text-zinc-500 uppercase">LV.</div>
             <div className="text-4xl font-display text-yellow-500 text-shadow-gold leading-none">{stats.等级}</div>
         </div>
      </div>

      {/* --- Scrollable Content --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          
          {/* Vitals - Localized */}
          <div className="space-y-3">
              {!showPhysiology && (
                  <VitalBar label="HP 生命" current={stats.生命值} max={stats.最大生命值} color="bg-green-600" icon={<Heart size={10} />} />
              )}
              <VitalBar label="MP 精神" current={stats.精神力} max={stats.最大精神力} color="bg-purple-600" icon={<Zap size={10} />} />
              <VitalBar label="SP 体力" current={stats.体力} max={stats.最大体力} color="bg-yellow-600" icon={<Battery size={10} />} />
              
              {/* Physiology (Normal+) */}
              {showPhysiology && (
                  <div className="mt-2 bg-black/60 p-2 border border-zinc-800 relative">
                      <div className={`text-[9px] ${textColor} font-bold uppercase mb-2 flex items-center gap-1 border-b border-zinc-800 pb-1`}>
                          <Scan size={10} /> 生理监测 (PHYSIOLOGY)
                      </div>
                      <div className="space-y-1.5">
                          <BodyPartRow label="HEAD" data={stats.身体部位.头部} />
                          <BodyPartRow label="CHEST" data={stats.身体部位.胸部} />
                          <div className="flex gap-2">
                              <div className="flex-1 space-y-1">
                                  <BodyPartRow label="L.ARM" data={stats.身体部位.左臂} />
                                  <BodyPartRow label="L.LEG" data={stats.身体部位.左腿} />
                              </div>
                              <div className="flex-1 space-y-1">
                                  <BodyPartRow label="R.ARM" data={stats.身体部位.右臂} />
                                  <BodyPartRow label="R.LEG" data={stats.身体部位.右腿} />
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* Survival Stats */}
              {stats.生存状态 && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="flex items-center gap-2 bg-zinc-900 p-1 border border-zinc-700">
                          <Utensils size={10} className="text-orange-500" />
                          <div className="flex-1 h-1 bg-zinc-800">
                              <div className="h-full bg-orange-500" style={{ width: `${(stats.生存状态.饱腹度 / stats.生存状态.最大饱腹度) * 100}%` }} />
                          </div>
                      </div>
                      <div className="flex items-center gap-2 bg-zinc-900 p-1 border border-zinc-700">
                          <Droplets size={10} className="text-cyan-500" />
                          <div className="flex-1 h-1 bg-zinc-800">
                              <div className="h-full bg-cyan-500" style={{ width: `${(stats.生存状态.水分 / stats.生存状态.最大水分) * 100}%` }} />
                          </div>
                      </div>
                  </div>
              )}

              {/* Body Parts (Easy Mode only) */}
              {!showPhysiology && stats.身体部位 && (
                  <div className="mt-2 bg-black/60 p-2 border border-zinc-800 relative">
                      <div className={`text-[9px] ${textColor} font-bold uppercase mb-2 flex items-center gap-1 border-b border-zinc-800 pb-1`}>
                          <Scan size={10} /> 生理监测 (PHYSIOLOGY)
                      </div>
                      <div className="space-y-1.5">
                          <BodyPartRow label="HEAD" data={stats.身体部位.头部} />
                          <BodyPartRow label="CHEST" data={stats.身体部位.胸部} />
                          <div className="flex gap-2">
                              <div className="flex-1 space-y-1">
                                  <BodyPartRow label="L.ARM" data={stats.身体部位.左臂} />
                                  <BodyPartRow label="L.LEG" data={stats.身体部位.左腿} />
                              </div>
                              <div className="flex-1 space-y-1">
                                  <BodyPartRow label="R.ARM" data={stats.身体部位.右臂} />
                                  <BodyPartRow label="R.LEG" data={stats.身体部位.右腿} />
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* Fatigue Bar */}
              <div className="relative pt-1">
                  <div className="flex justify-between text-[9px] font-bold text-zinc-500 mb-0.5 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><AlertTriangle size={10} /> 疲劳度 (FATIGUE)</span>
                      <span className="font-mono text-zinc-400">{stats.疲劳度 || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 border border-zinc-700">
                      <div 
                          className={`h-full transition-all duration-500 ${stats.疲劳度 > 50 ? 'bg-orange-600' : 'bg-zinc-600'}`}
                          style={{ width: `${Math.min(100, stats.疲劳度 || 0)}%` }}
                      />
                  </div>
              </div>
          </div>

          {/* Valis & Excelia */}
          <div className="grid grid-cols-2 gap-2">
              <div className="bg-black border border-zinc-800 p-2 flex flex-col items-center justify-center relative overflow-hidden group">
                  <span className="text-[10px] text-zinc-500 uppercase mb-1 flex items-center gap-1 z-10"><Coins size={10} className="text-yellow-600"/> 法利</span>
                  <span className="text-yellow-500 font-mono font-bold text-sm md:text-lg z-10">{stats.法利?.toLocaleString() || 0}</span>
                  <div className="absolute inset-0 bg-yellow-900/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"/>
              </div>
              <div className="bg-black border border-zinc-800 p-2 flex flex-col items-center justify-center relative overflow-hidden group">
                  <span className="text-[10px] text-zinc-500 uppercase mb-1 flex items-center gap-1 z-10"><Star size={10} className="text-purple-500"/> 经验值</span>
                  <span className="text-white font-mono font-bold text-sm md:text-lg z-10">{stats.经验值?.toLocaleString() || 0}</span>
                  <div className="absolute inset-0 bg-purple-900/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"/>
              </div>
          </div>
          
          {/* Feats */}
          <div className="flex justify-between items-center text-[10px] bg-zinc-900 px-2 py-1 border border-zinc-800">
              <span className="text-zinc-500 uppercase">伟业点数</span>
              <span className="text-white font-mono">{stats.伟业} / {stats.升级所需伟业}</span>
          </div>

          {/* Status (Falna) - Bilingual Restore */}
          <div className="bg-zinc-900 border border-zinc-700 p-1 relative mt-2">
              <div className="absolute -top-3 left-2 bg-black px-2 text-xs font-bold text-zinc-500 uppercase tracking-widest border border-zinc-800">
                  基础能力 (STATUS)
              </div>
              {stats.能力值 && (
                  <div className="pt-2 grid gap-1">
                      <StatRow label="STR 力量" val={stats.能力值.力量} />
                      <StatRow label="END 耐久" val={stats.能力值.耐久} />
                      <StatRow label="DEX 灵巧" val={stats.能力值.灵巧} />
                      <StatRow label="AGI 敏捷" val={stats.能力值.敏捷} />
                      <StatRow label="MAG 魔力" val={stats.能力值.魔力} />
                  </div>
              )}
          </div>

          {/* Development Abilities */}
          <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-1">发展能力</h3>
              {stats.发展能力 && stats.发展能力.length > 0 ? (
                  <div className="grid grid-cols-1 gap-1">
                      {stats.发展能力.map((da, i) => (
                          <div key={i} className="text-xs bg-zinc-900 border border-zinc-700 px-2 py-1 text-zinc-300 truncate flex justify-between items-center group hover:border-purple-500 transition-colors">
                              <span>{da.名称 || "Unknown"}</span>
                              <span className="font-mono text-yellow-600 font-bold">{da.等级 || 'I'}</span>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-[10px] text-zinc-600 italic px-2 py-1 bg-zinc-900 border border-zinc-800 border-dashed">
                      暂无发展能力
                  </div>
              )}
          </div>

          {/* Buffs & Curses */}
          {(stats.状态?.length > 0 || stats.诅咒?.length > 0) && (
              <div className="flex gap-2 flex-wrap">
                  {stats.状态?.map((b, i) => (
                      <StatusBadge key={`b-${i}`} entry={b} variant="buff" />
                  ))}
                  {stats.诅咒?.map((c, i) => (
                      <StatusBadge key={`c-${i}`} entry={c} variant="curse" />
                  ))}
              </div>
          )}

          {/* Equipment - Simplified List */}
          <div className="space-y-2 pb-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-1">装备</h3>
              {stats.装备 && (
                  <div className="flex flex-col gap-1">
                      <SimpleEquipSlot label="主手" slotKey="主手" stats={stats} icon={<Sword size={12}/>} />
                      <SimpleEquipSlot label="副手" slotKey="副手" stats={stats} icon={<Shield size={12}/>} />
                      <SimpleEquipSlot label="头部" slotKey="头部" stats={stats} icon={<User size={12}/>} />
                      <SimpleEquipSlot label="身体" slotKey="身体" stats={stats} icon={<Shirt size={12}/>} />
                      <SimpleEquipSlot label="手部" slotKey="手部" stats={stats} icon={<Hand size={12}/>} />
                      <SimpleEquipSlot label="腿部" slotKey="腿部" stats={stats} icon={<User size={12}/>} />
                      <SimpleEquipSlot label="足部" slotKey="足部" stats={stats} icon={<Footprints size={12}/>} />
                      <SimpleEquipSlot label="饰品1" slotKey="饰品1" stats={stats} icon={<Star size={12}/>} />
                      <SimpleEquipSlot label="饰品2" slotKey="饰品2" stats={stats} icon={<Star size={12}/>} />
                      <SimpleEquipSlot label="饰品3" slotKey="饰品3" stats={stats} icon={<Star size={12}/>} />
                  </div>
              )}
          </div>

      </div>
    </div>
  );
};
