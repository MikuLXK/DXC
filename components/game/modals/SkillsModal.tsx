import React from 'react';
import { X, Star, Zap } from 'lucide-react';
import { Skill } from '../../../types';

interface SkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: Skill[];
}

export const SkillsModal: React.FC<SkillsModalProps> = ({ isOpen, onClose, skills }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-900 border-t-8 border-blue-600 relative shadow-[0_20px_50px_rgba(37,99,235,0.3)] max-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 flex justify-between items-end border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-black">
            <div className="flex flex-col">
                <span className="text-blue-600 font-display text-lg uppercase tracking-widest">Persona Ability</span>
                <h2 className="text-5xl font-display uppercase tracking-wider text-white italic">技能</h2>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-10 h-10" />
            </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.length > 0 ? skills.map((skill) => (
                    <div key={skill.id} className="group relative bg-zinc-950 p-6 border border-zinc-800 hover:border-blue-600 transition-all overflow-hidden">
                        {/* Background Element Icon */}
                        <div className="absolute -right-4 -bottom-4 text-zinc-800 group-hover:text-blue-900/30 transition-colors transform rotate-12">
                             <Zap size={100} />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl text-white font-bold group-hover:text-blue-500 transition-colors">{skill.name}</h3>
                                <span className="text-xs font-mono text-cyan-400 border border-cyan-900 px-1">{skill.cost}</span>
                            </div>
                            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">{skill.element}</div>
                            <p className="text-zinc-400 text-sm leading-relaxed">{skill.description}</p>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full text-center text-zinc-500 font-display text-2xl py-20">
                        暂未习得技能
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};