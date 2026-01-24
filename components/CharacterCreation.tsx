
import React, { useState } from 'react';
import { P5Button } from './ui/P5Button';
import { GameState } from '../types';
import { createNewGameState } from '../utils/dataMapper';
import { User, ArrowRight, Dna, Shield, Calendar, Clock, Edit3, Skull, AlertTriangle } from 'lucide-react';
import { Difficulty } from '../types/enums';

interface CharacterCreationProps {
  onComplete: (initialState: GameState) => void;
  onBack: () => void;
}

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ onComplete, onBack }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [race, setRace] = useState('Human');
  const [age, setAge] = useState(14);
  const [birthMonth, setBirthMonth] = useState('01');
  const [birthDay, setBirthDay] = useState('01');
  const [appearance, setAppearance] = useState('');
  const [background, setBackground] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NORMAL);

  const races = [
      { id: 'Human', label: '人类 ' },
      { id: 'Elf', label: '精灵 ' },
      { id: 'Dwarf', label: '矮人 ' },
      { id: 'Pallum', label: '小人族 ' },
      { id: 'Amazon', label: '亚马逊 ' },
      { id: 'Beastman', label: '兽人 ' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      const birthday = `${birthMonth}-${birthDay}`;
      const newState = createNewGameState(name, gender, race, age, birthday, appearance, background, difficulty);
      onComplete(newState);
  };

  const isHell = difficulty === Difficulty.HELL;

  // Dynamic Theme Colors
  const theme = isHell ? {
      accentText: 'text-red-600',
      border: 'border-red-600',
      focusBorder: 'focus-within:border-red-600',
      bgLight: 'bg-red-900/20',
      caret: 'bg-red-600',
      btnActive: 'bg-red-600 border-red-600 text-white',
      shadow: 'shadow-[15px_15px_0_#b91c1c]', // red-700
      textStroke: 'text-stroke-red' // Assumes custom CSS exists or fallback
  } : {
      accentText: 'text-blue-500',
      border: 'border-blue-600',
      focusBorder: 'focus-within:border-blue-600',
      bgLight: 'bg-blue-900/20',
      caret: 'bg-blue-600',
      btnActive: 'bg-blue-600 border-blue-600 text-white',
      shadow: 'shadow-[15px_15px_0_#2563eb]', // blue-600
      textStroke: 'text-stroke-blue'
  };

  const getDifficultyColor = (d: Difficulty) => {
      switch(d) {
          case Difficulty.EASY: return 'text-green-500 border-green-500';
          case Difficulty.NORMAL: return 'text-blue-500 border-blue-500';
          case Difficulty.HARD: return 'text-orange-500 border-orange-500';
          case Difficulty.HELL: return 'text-red-600 border-red-600 animate-pulse';
          default: return 'text-zinc-500 border-zinc-500';
      }
  };

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Background Styles */}
        <div className="absolute inset-0 bg-halftone-blue opacity-20 pointer-events-none" />
        <div className={`absolute top-0 right-0 w-2/3 h-full ${theme.bgLight} transform skew-x-[-20deg] pointer-events-none transition-colors duration-500`} />
        
        <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .animate-caret {
            animation: blink 1s step-end infinite;
          }
        `}</style>

        <div className="w-full max-w-5xl relative z-10 p-4 md:p-8 flex flex-col md:flex-row gap-12 items-center h-full md:h-auto overflow-y-auto">
            
            {/* Left Decor */}
            <div className="hidden md:flex flex-col items-end text-right space-y-2 text-white shrink-0">
                <h1 className={`text-8xl font-display uppercase italic tracking-tighter ${isHell ? 'text-stroke-red' : 'text-stroke-blue'} text-transparent transition-colors duration-500`}>NEW</h1>
                <h1 className="text-8xl font-display uppercase italic tracking-tighter text-white">GAME</h1>
                <div className={`w-24 h-4 ${isHell ? 'bg-red-600' : 'bg-blue-600'} transform skew-x-12 mt-4 transition-colors duration-500`} />
                <p className="font-mono text-zinc-500 max-w-xs mt-4">
                    签下契约。在地下城铸造你的命运。
                    <br/>Sign the contract. Forge your destiny.
                </p>
                {isHell && (
                    <div className="mt-8 bg-red-950/50 p-4 border-l-4 border-red-600 animate-in slide-in-from-left duration-500">
                        <h3 className="text-red-500 font-bold uppercase flex items-center gap-2 mb-2"><Skull size={20}/> HELL MODE ACTIVE</h3>
                        <p className="text-xs text-red-200">
                            真实痛觉模拟 · 死亡即删档 · 极度匮乏<br/>
                            Prepare to die.
                        </p>
                    </div>
                )}
            </div>

            {/* Form Container */}
            <div className={`flex-1 w-full bg-zinc-900 border-2 border-white p-6 md:p-8 ${theme.shadow} transform -rotate-1 transition-all duration-500`}>
                <h2 className={`text-3xl font-display uppercase text-white mb-6 border-b-4 ${isHell ? 'border-red-600' : 'border-blue-600'} pb-2 inline-block transition-colors duration-500`}>
                    冒险者登录书
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div className="space-y-1">
                        <label className="text-zinc-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                            <User size={14} /> 冒险者姓名
                        </label>
                        <div className={`relative flex items-center bg-black border-b-2 border-zinc-500 ${theme.focusBorder} p-2 transition-colors`}>
                            <span className={`${theme.accentText} font-bold mr-2 animate-pulse`}>{`>`}</span>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 bg-transparent text-white font-display text-2xl outline-none placeholder-zinc-700"
                                placeholder="输入姓名..."
                                autoFocus
                            />
                            <div className={`w-3 h-6 ${theme.caret} animate-caret ml-1`} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         {/* Gender */}
                        <div className="space-y-1">
                             <label className="text-zinc-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                                <Dna size={14} /> 性别
                            </label>
                            <div className="flex gap-2">
                                {['Male', 'Female'].map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setGender(g as any)}
                                        className={`flex-1 py-2 font-display uppercase text-sm md:text-lg border-2 transition-all transform skew-x-[-10deg]
                                            ${gender === g ? theme.btnActive : 'bg-transparent border-zinc-600 text-zinc-500 hover:border-white hover:text-white'}
                                        `}
                                    >
                                        <span className="block transform skew-x-[10deg]">{g === 'Male' ? '男性' : '女性'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                         {/* Age */}
                        <div className="space-y-1">
                             <label className="text-zinc-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                                <Clock size={14} /> 年龄
                            </label>
                            <input 
                                type="number" 
                                min="12" 
                                max="100"
                                value={age}
                                onChange={(e) => setAge(parseInt(e.target.value))}
                                className={`w-full bg-black border border-zinc-600 p-2 text-white font-display text-lg text-center ${theme.focusBorder} outline-none transition-colors`}
                            />
                        </div>

                        {/* Birthday (NEW) */}
                        <div className="space-y-1">
                             <label className="text-zinc-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                                <Calendar size={14} /> 生日
                            </label>
                            <div className="flex gap-2">
                                <select 
                                    value={birthMonth} 
                                    onChange={(e) => setBirthMonth(e.target.value)}
                                    className={`flex-1 bg-black border border-zinc-600 p-2 text-white font-display text-lg text-center outline-none ${theme.focusBorder} transition-colors appearance-none`}
                                >
                                    {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => (
                                        <option key={m} value={m}>{m}月</option>
                                    ))}
                                </select>
                                <select 
                                    value={birthDay} 
                                    onChange={(e) => setBirthDay(e.target.value)}
                                    className={`flex-1 bg-black border border-zinc-600 p-2 text-white font-display text-lg text-center outline-none ${theme.focusBorder} transition-colors appearance-none`}
                                >
                                    {Array.from({length: 31}, (_, i) => (i + 1).toString().padStart(2, '0')).map(d => (
                                        <option key={d} value={d}>{d}日</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Difficulty Selection */}
                    <div className="space-y-2">
                        <label className="text-zinc-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                            <AlertTriangle size={14} /> 游戏难度
                        </label>
                        <div className="flex gap-2">
                            {[Difficulty.EASY, Difficulty.NORMAL, Difficulty.HARD, Difficulty.HELL].map(d => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setDifficulty(d)}
                                    className={`flex-1 py-2 font-bold uppercase text-xs border-2 transition-all
                                        ${difficulty === d ? getDifficultyColor(d) + ' bg-zinc-900' : 'bg-black border-zinc-800 text-zinc-600 hover:border-zinc-600'}
                                    `}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Appearance & Background */}
                    <div className="space-y-1">
                        <label className="text-zinc-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                            <Edit3 size={14} /> 外貌与背景
                        </label>
                        <textarea 
                            value={appearance}
                            onChange={(e) => setAppearance(e.target.value)}
                            className={`w-full bg-black border border-zinc-600 p-2 text-white text-xs font-mono outline-none ${theme.focusBorder} resize-none h-16 transition-colors`}
                            placeholder="描述你的外貌特征（如：黑发红瞳，身背巨剑...）"
                        />
                        <textarea 
                            value={background}
                            onChange={(e) => setBackground(e.target.value)}
                            className={`w-full bg-black border border-zinc-600 p-2 text-white text-xs font-mono outline-none ${theme.focusBorder} resize-none h-16 transition-colors`}
                            placeholder="描述你的出身背景（如：来自远东的流浪剑士，为了寻找...）"
                        />
                    </div>

                    {/* Race */}
                    <div className="space-y-1">
                         <label className="text-zinc-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                            <Shield size={14} /> 种族
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {races.map(r => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setRace(r.id)}
                                    className={`py-2 px-2 font-display uppercase text-sm border transition-all text-center truncate
                                        ${race === r.id ? (isHell ? 'bg-white text-red-900 border-white font-bold' : 'bg-white text-black border-white') : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-400'}
                                    `}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex gap-4">
                        <button 
                            type="button" 
                            onClick={onBack}
                            className="px-6 py-3 font-display uppercase text-zinc-500 hover:text-white transition-colors"
                        >
                            返回
                        </button>
                        <P5Button 
                            type="submit"
                            label="开始旅程"
                            variant={isHell ? 'red' : 'blue'}
                            icon={<ArrowRight />}
                            className="flex-1"
                        />
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};
