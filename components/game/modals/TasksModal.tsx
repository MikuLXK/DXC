
import React, { useState } from 'react';
import { X, ListTodo, CheckCircle2, Circle, AlertCircle, Clock, ScrollText, History, Trash2 } from 'lucide-react';
import { Task } from '../../../types';

interface TasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onDeleteTask?: (id: string) => void;
}

type TaskFilter = 'ACTIVE' | 'COMPLETED' | 'FAILED';

export const TasksModal: React.FC<TasksModalProps> = ({ isOpen, onClose, tasks = [], onDeleteTask }) => {
  const [filter, setFilter] = useState<TaskFilter>('ACTIVE');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (!isOpen) return null;

  const filteredTasks = tasks.filter(t => {
      if (filter === 'ACTIVE') return t.状态 === 'active';
      if (filter === 'COMPLETED') return t.状态 === 'completed';
      if (filter === 'FAILED') return t.状态 === 'failed';
      return true;
  });

  const getGradeColor = (grade: string) => {
      switch(grade) {
          case 'SSS':
          case 'SS':
          case 'S': return 'text-yellow-400 border-yellow-400 bg-yellow-900/30';
          case 'A': return 'text-red-400 border-red-400 bg-red-900/30';
          case 'B': return 'text-blue-400 border-blue-400 bg-blue-900/30';
          default: return 'text-zinc-400 border-zinc-600 bg-zinc-900';
      }
  };

  const handleDelete = () => {
      if (selectedTask && onDeleteTask && (selectedTask.状态 === 'completed' || selectedTask.状态 === 'failed')) {
          if (confirm("确定要删除这个任务记录吗？")) {
              onDeleteTask(selectedTask.id);
              setSelectedTask(null);
          }
      }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-zinc-900 border-t-8 border-yellow-500 relative shadow-[0_0_50px_rgba(234,179,8,0.3)] max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-yellow-500 p-4 flex justify-between items-center text-black shrink-0">
            <div className="flex items-center gap-3 font-display">
                <ListTodo className="w-8 h-8" />
                <h2 className="text-3xl uppercase tracking-widest">Guild Requests</h2>
            </div>
            <button onClick={onClose} className="hover:bg-black hover:text-yellow-500 transition-colors p-1 border-2 border-black">
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Content Container */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cork-board.png')] bg-zinc-800">
            
            {/* Left: List & Filter */}
            <div className="w-full md:w-1/3 border-r-4 border-zinc-900 flex flex-col bg-zinc-900/50 backdrop-blur-sm">
                <div className="flex border-b-2 border-zinc-900">
                    {['ACTIVE', 'COMPLETED', 'FAILED'].map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f as TaskFilter); setSelectedTask(null); }}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors
                                ${filter === f 
                                    ? 'bg-yellow-500 text-black' 
                                    : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                                }
                            `}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {filteredTasks.length > 0 ? filteredTasks.map(task => (
                        <div 
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={`p-3 border-l-4 cursor-pointer transition-all hover:translate-x-1 group
                                ${selectedTask?.id === task.id 
                                    ? 'bg-yellow-900/40 border-yellow-500' 
                                    : 'bg-zinc-900 border-zinc-700 hover:border-zinc-500'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-display uppercase truncate ${selectedTask?.id === task.id ? 'text-white' : 'text-zinc-300'}`}>
                                    {task.标题}
                                </h4>
                                <span className={`text-[10px] font-mono px-1.5 border ${getGradeColor(task.评级)}`}>
                                    {task.评级}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                {task.状态 === 'completed' && <CheckCircle2 size={12} className="text-green-500"/>}
                                {task.状态 === 'failed' && <AlertCircle size={12} className="text-red-500"/>}
                                {task.状态 === 'active' && <Circle size={12} className="text-yellow-500 animate-pulse"/>}
                                <span>{task.奖励}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 text-zinc-600 font-mono text-xs">
                            NO RECORDS FOUND
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Details (Paper Style) */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar relative">
                {selectedTask ? (
                    <div className="bg-[#f0e6d2] text-[#4a3b32] p-8 shadow-xl min-h-full relative transform rotate-1 transition-transform">
                        {/* Paper Texture & Pin */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3 w-4 h-4 rounded-full bg-red-800 shadow-md border border-white z-20" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] opacity-30 pointer-events-none" />
                        
                        {/* Stamp */}
                        <div className={`absolute top-8 right-8 border-4 rounded px-4 py-2 transform rotate-[-15deg] opacity-70 font-display font-black text-2xl uppercase tracking-widest mix-blend-multiply
                            ${selectedTask.状态 === 'active' ? 'border-blue-800 text-blue-800' : 
                              selectedTask.状态 === 'completed' ? 'border-red-800 text-red-800' : 'border-black text-black'}
                        `}>
                            {selectedTask.状态}
                        </div>

                        <div className="relative z-10 font-serif">
                            <h2 className="text-4xl font-display uppercase tracking-tighter border-b-2 border-[#8b7e66] pb-2 mb-4">
                                {selectedTask.标题}
                            </h2>
                            
                            <div className="flex gap-6 text-xs font-mono text-[#786c5e] mb-6">
                                <span className="flex items-center gap-1">
                                    <AlertCircle size={14} /> GRADE: {selectedTask.评级}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={14} /> DEADLINE: {selectedTask.截止时间 || "None"}
                                </span>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-[#8b7e66] mb-2 flex items-center gap-2">
                                    <ScrollText size={16}/> Description
                                </h4>
                                <p className="leading-relaxed whitespace-pre-wrap">
                                    {selectedTask.描述}
                                </p>
                            </div>

                            <div className="bg-[#e6dbc4] p-4 border border-[#cfc4ad] mb-8">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#8b7e66] mb-1">Rewards</h4>
                                <p className="font-bold text-lg">{selectedTask.奖励}</p>
                            </div>

                            {/* History Logs */}
                            {selectedTask.日志 && selectedTask.日志.length > 0 && (
                                <div className="border-t-2 border-[#8b7e66] pt-4">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-[#8b7e66] mb-3 flex items-center gap-2">
                                        <History size={16}/> Update History
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedTask.日志.map((log, idx) => (
                                            <div key={idx} className="flex gap-3 text-xs">
                                                <span className="font-mono text-[#8b7e66] bg-[#ded3be] px-1 h-fit whitespace-nowrap">{log.时间戳}</span>
                                                <span>{log.内容}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-between items-end mt-8">
                                <div className="text-[10px] uppercase text-[#8b7e66] font-mono tracking-widest">
                                    ID: #{selectedTask.id.substring(0,8).toUpperCase()}
                                </div>
                                {onDeleteTask && selectedTask.状态 !== 'active' && (
                                    <button 
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 text-red-800 border-2 border-red-800 px-3 py-1 font-bold hover:bg-red-800 hover:text-white transition-colors"
                                    >
                                        <Trash2 size={16} /> 删除记录
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 opacity-50">
                        <ScrollText size={64} className="mb-4" />
                        <span className="font-display text-2xl uppercase tracking-widest">Select a Request</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};