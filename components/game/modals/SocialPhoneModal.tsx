
import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Users, Send, BookUser, Camera, ChevronRight, Heart, MessageSquare, ArrowLeft, Plus, Check, Image as ImageIcon, RotateCcw, Lock } from 'lucide-react';
import { PhoneMessage, Confidant, MomentPost } from '../../../types';
import { getAvatarColor } from '../../../utils/uiUtils';

interface SocialPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: PhoneMessage[];
  contacts: Confidant[]; 
  moments: MomentPost[];
  initialTab?: 'CHAT' | 'CONTACTS' | 'MOMENTS';
  onSendMessage: (text: string, channel: 'private' | 'group', target?: string) => void;
  onCreateGroup: (name: string, members: string[]) => void;
  onReroll?: () => void;
}

type PhoneTab = 'CHAT' | 'CONTACTS' | 'MOMENTS';
type ChatType = 'PRIVATE' | 'GROUP';

export const SocialPhoneModal: React.FC<SocialPhoneModalProps> = ({ 
    isOpen, 
    onClose, 
    messages = [], 
    contacts = [], 
    moments = [],
    initialTab = 'CHAT',
    onSendMessage,
    onCreateGroup,
    onReroll
}) => {
  const [activeTab, setActiveTab] = useState<PhoneTab>(initialTab);
  
  // Chat State
  const [chatType, setChatType] = useState<ChatType>('PRIVATE');
  const [viewingChatTarget, setViewingChatTarget] = useState<string | null>(null); 
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');

  // Other States
  const [viewingContact, setViewingContact] = useState<Confidant | null>(null); 
  const [momentsFilter, setMomentsFilter] = useState<string | null>(null); 
  const [inputText, setInputText] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewingChatTarget && chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [viewingChatTarget, messages]);

  useEffect(() => {
    if (isOpen) {
        setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Filter contacts who have "hasContactInfo" true
  const validContacts = contacts.filter(c => c.已交换联系方式);

  const handleTabChange = (tab: PhoneTab) => {
      setActiveTab(tab);
      setViewingChatTarget(null);
      setViewingContact(null);
      setMomentsFilter(null);
      setIsCreatingGroup(false);
  };

  const handleSend = () => {
      if (!inputText.trim() || !viewingChatTarget) return;
      onSendMessage(inputText, chatType === 'PRIVATE' ? 'private' : 'group', viewingChatTarget);
      setInputText('');
  };

  const getFilteredMessages = () => {
      if (!viewingChatTarget) return [];

      const sorter = (a: PhoneMessage, b: PhoneMessage) => {
          if (a.timestampValue && b.timestampValue) {
              return a.timestampValue - b.timestampValue;
          }
          // Fallback to array index simulation if timestamp is missing
          return 0;
      };

      if (chatType === 'PRIVATE') {
          return messages.filter(m => 
            (m.频道 === 'private') &&
            (
                (m.发送者 === viewingChatTarget) || 
                (m.目标 === viewingChatTarget) ||
                (m.发送者 === viewingChatTarget && (!m.目标 || m.目标 === 'Player'))
            )
          ).sort(sorter); 
      } else {
          return messages.filter(m => 
              m.频道 === 'group' && m.群组名称 === viewingChatTarget
          ).sort(sorter);
      }
  };

  // Logic: Show anyone who has sent a message OR anyone in contacts list
  const getPrivateThreads = () => {
      const threads: Set<string> = new Set();
      // Add existing message senders
      messages.forEach(msg => {
          if (msg.频道 === 'private') {
              if (msg.发送者 && msg.发送者 !== 'Joker' && msg.发送者 !== 'Player') threads.add(msg.发送者);
              else if (msg.目标 && msg.目标 !== 'Player' && msg.目标 !== 'Joker') threads.add(msg.目标);
          }
      });
      // Add valid contacts (even if no messages yet)
      validContacts.forEach(c => threads.add(c.姓名));
      return Array.from(threads);
  };

  const getGroupThreads = () => {
      const groups: Set<string> = new Set();
      messages.forEach(msg => {
          if (msg.频道 === 'group' && msg.群组名称) {
              groups.add(msg.群组名称);
          }
      });
      return Array.from(groups);
  };

  // Moment Visibility: Only show if poster is in validContacts (Friend) or is Public/System
  const getFilteredMoments = () => {
      let visible = moments.filter(m => {
          const isFriend = validContacts.some(c => c.姓名 === m.发布者);
          const isSystem = m.发布者 === '公会公告' || m.发布者 === '王国新闻';
          const isMe = m.发布者 === 'Player';
          return isFriend || isSystem || isMe;
      });

      if (momentsFilter) {
          return visible.filter(m => m.发布者 === momentsFilter);
      }
      return visible;
  };

  const toggleGroupMember = (name: string) => {
      if (newGroupMembers.includes(name)) {
          setNewGroupMembers(newGroupMembers.filter(n => n !== name));
      } else {
          setNewGroupMembers([...newGroupMembers, name]);
      }
  };

  const submitNewGroup = () => {
      if (!newGroupName.trim() || newGroupMembers.length < 2) {
          alert("需要群组名称且至少2名成员。");
          return;
      }
      onCreateGroup(newGroupName, newGroupMembers);
      setIsCreatingGroup(false);
      setChatType('GROUP');
      setViewingChatTarget(newGroupName);
      setNewGroupMembers([]);
      setNewGroupName('');
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 animate-in slide-in-from-bottom-10 duration-300">
      <div className="w-full h-full md:w-[380px] md:h-[750px] bg-black md:rounded-[3rem] border-0 md:border-8 border-zinc-800 relative shadow-2xl flex flex-col overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-900 rounded-b-xl z-50 border-b border-zinc-800 hidden md:block"></div>

        {/* Top Header Bar */}
        <div className="bg-blue-600 pt-safe-top md:pt-12 pb-4 px-4 flex justify-between items-center text-white shrink-0 shadow-md z-20">
            {viewingChatTarget ? (
                <div className="flex items-center gap-2">
                    <button onClick={() => setViewingChatTarget(null)} className="hover:opacity-80">
                        <ArrowLeft size={20} />
                    </button>
                    <span className="truncate max-w-[150px] font-bold text-sm">{viewingChatTarget}</span>
                </div>
            ) : viewingContact ? (
                <button onClick={() => setViewingContact(null)} className="flex items-center gap-1 font-bold hover:opacity-80">
                     <ArrowLeft size={20} /> 详情
                </button>
            ) : activeTab === 'MOMENTS' && momentsFilter ? (
                <button onClick={() => setMomentsFilter(null)} className="flex items-center gap-1 font-bold hover:opacity-80">
                     <ArrowLeft size={20} /> 动态
                </button>
            ) : isCreatingGroup ? (
                <button onClick={() => setIsCreatingGroup(false)} className="flex items-center gap-1 font-bold hover:opacity-80">
                     <ArrowLeft size={20} /> 创建群组
                </button>
            ) : (
                <h2 className="text-lg font-display font-bold italic tracking-wide">
                    {activeTab === 'CHAT' ? 'MESSAGES' : activeTab === 'CONTACTS' ? 'CONTACTS' : 'SNS'}
                </h2>
            )}
            
            <div className="flex gap-4">
                {viewingChatTarget && onReroll && (
                    <button onClick={onReroll} title="Reroll Response">
                        <RotateCcw size={20} />
                    </button>
                )}
                <button onClick={onClose} className="hover:text-black transition-colors"><X size={24} /></button>
            </div>
        </div>

        {/* Tab Bar (Only when on root views) */}
        {!viewingChatTarget && !viewingContact && !momentsFilter && !isCreatingGroup && (
            <div className="flex bg-zinc-900 border-b border-zinc-800 shrink-0">
                <PhoneTabBtn icon={<MessageCircle size={20} />} active={activeTab === 'CHAT'} onClick={() => handleTabChange('CHAT')} />
                <PhoneTabBtn icon={<BookUser size={20} />} active={activeTab === 'CONTACTS'} onClick={() => handleTabChange('CONTACTS')} />
                <PhoneTabBtn icon={<Camera size={20} />} active={activeTab === 'MOMENTS'} onClick={() => handleTabChange('MOMENTS')} />
            </div>
        )}

        <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
             
             {activeTab === 'CHAT' && (
                 isCreatingGroup ? (
                    <div className="flex-1 overflow-y-auto p-4 bg-zinc-50">
                        <input 
                            type="text"
                            placeholder="群组名称..."
                            className="w-full p-2 mb-4 border-b-2 border-blue-500 bg-transparent text-xl font-bold outline-none"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                        />
                        <p className="text-xs text-zinc-500 mb-2 uppercase font-bold">选择成员 ({newGroupMembers.length})</p>
                        <div className="space-y-2">
                            {validContacts.map(c => (
                                <div 
                                    key={c.id} 
                                    onClick={() => toggleGroupMember(c.姓名)}
                                    className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-all ${newGroupMembers.includes(c.姓名) ? 'bg-blue-50 border-blue-500' : 'bg-white border-zinc-200'}`}
                                >
                                    <div className={`w-8 h-8 flex items-center justify-center text-white text-xs font-bold rounded-full ${newGroupMembers.includes(c.姓名) ? 'bg-blue-600' : 'bg-zinc-400'}`}>
                                        {c.姓名[0]}
                                    </div>
                                    <span className="font-bold text-sm">{c.姓名}</span>
                                    {newGroupMembers.includes(c.姓名) && <Check size={16} className="ml-auto text-blue-600" />}
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={submitNewGroup}
                            className="mt-6 w-full bg-black text-white py-3 font-bold uppercase hover:bg-blue-600 transition-colors text-sm"
                        >
                            创建群聊
                        </button>
                    </div>
                 ) : viewingChatTarget ? (
                     <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-zinc-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                         {getFilteredMessages().length > 0 ? getFilteredMessages().map(msg => {
                             const isMe = msg.发送者 === 'Joker' || msg.发送者 === 'Player';
                             return (
                                 <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                     <div className={`max-w-[85%] p-2.5 text-xs shadow-sm relative
                                         ${isMe 
                                             ? 'bg-black text-white rounded-l-xl rounded-br-sm' 
                                             : 'bg-white text-black border border-zinc-300 rounded-r-xl rounded-bl-sm'
                                         }
                                     `}>
                                         {!isMe && chatType === 'GROUP' && (
                                             <div className="font-bold text-[9px] text-blue-600 mb-0.5 uppercase">{msg.发送者}</div>
                                         )}
                                         {msg.内容}
                                     </div>
                                 </div>
                             );
                         }) : <div className="text-center text-zinc-400 text-xs italic mt-10">暂无消息记录</div>}
                         <div ref={chatEndRef} />
                     </div>
                 ) : (
                     <div className="flex-1 flex flex-col">
                         <div className="flex border-b border-zinc-200">
                             <button 
                                onClick={() => setChatType('PRIVATE')}
                                className={`flex-1 py-2 text-xs font-bold uppercase ${chatType === 'PRIVATE' ? 'bg-blue-500 text-white' : 'bg-zinc-100 text-zinc-500'}`}
                             >
                                 私信
                             </button>
                             <button 
                                onClick={() => setChatType('GROUP')}
                                className={`flex-1 py-2 text-xs font-bold uppercase ${chatType === 'GROUP' ? 'bg-blue-500 text-white' : 'bg-zinc-100 text-zinc-500'}`}
                             >
                                 群聊
                             </button>
                         </div>

                         <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                             {chatType === 'PRIVATE' ? (
                                getPrivateThreads().length > 0 ? getPrivateThreads().map(sender => (
                                    <ChatRow 
                                        key={sender} 
                                        name={sender} 
                                        lastMsg="点击查看消息..." 
                                        avatar={sender}
                                        onClick={() => setViewingChatTarget(sender)}
                                    />
                                )) : <EmptyState icon={<MessageCircle size={40} />} text="无私聊消息" />
                             ) : (
                                <div className="space-y-1">
                                    <div 
                                        onClick={() => setIsCreatingGroup(true)}
                                        className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-center text-blue-600 font-bold gap-2 cursor-pointer hover:bg-blue-50 text-xs"
                                    >
                                        <Plus size={16} /> 创建新群聊
                                    </div>
                                    
                                    {getGroupThreads().length > 0 ? getGroupThreads().map(group => (
                                        <ChatRow 
                                            key={group} 
                                            name={group} 
                                            lastMsg="点击进入群聊..." 
                                            isGroup
                                            onClick={() => setViewingChatTarget(group)}
                                        />
                                    )) : (
                                        <EmptyState icon={<Users size={40} />} text="暂无群组" />
                                    )}
                                </div>
                             )}
                         </div>
                     </div>
                 )
             )}

             {activeTab === 'CONTACTS' && (
                 viewingContact ? (
                     <div className="flex-1 overflow-y-auto bg-white">
                        <div className="h-40 bg-zinc-900 relative">
                             <div className="absolute inset-0 bg-halftone opacity-10" />
                             <div className={`absolute -bottom-10 left-6 w-24 h-24 border-4 border-white shadow-xl flex items-center justify-center text-4xl font-bold text-white ${getAvatarColor(viewingContact.姓名)}`}>
                                 {viewingContact.姓名[0]}
                             </div>
                        </div>
                        <div className="mt-12 px-6">
                             <h3 className="text-3xl font-display uppercase italic tracking-tighter text-black mb-1">{viewingContact.姓名}</h3>
                             <span className="bg-black text-white px-2 py-1 text-[10px] font-mono uppercase">{viewingContact.眷族}</span>
                             
                             <div className="mt-6 space-y-4">
                                 <InfoBlock label="INFO" content={viewingContact.简介 || "暂无信息"} />
                                 <div className="grid grid-cols-2 gap-4">
                                     <InfoBlock label="RACE" content={viewingContact.种族} />
                                     <InfoBlock label="RELATION" content={viewingContact.关系状态} />
                                 </div>
                             </div>
                             
                             <div className="mt-6 flex gap-2 pb-6">
                                <button 
                                    onClick={() => {
                                        setViewingContact(null);
                                        setActiveTab('CHAT');
                                        setChatType('PRIVATE');
                                        setViewingChatTarget(viewingContact.姓名);
                                    }}
                                    className="flex-1 bg-black text-white py-3 font-display uppercase hover:bg-blue-600 transition-colors text-sm"
                                >
                                    发送信息
                                </button>
                             </div>
                        </div>
                     </div>
                 ) : (
                     <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                         <div className="sticky top-0 bg-zinc-100 px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-200 z-10">
                             All Contacts
                         </div>
                         {validContacts.length > 0 ? validContacts.map(npc => (
                             <ContactRow key={npc.id} npc={npc} onClick={() => setViewingContact(npc)} />
                         )) : <EmptyState icon={<Lock size={40} />} text="暂无好友 (需交换ID)" />}
                     </div>
                 )
             )}

             {activeTab === 'MOMENTS' && (
                 <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-zinc-100">
                     {momentsFilter && (
                         <div className="bg-black text-white p-2 text-center text-xs border-b border-zinc-200">
                             FILTER: <span className="font-bold text-blue-500">{momentsFilter}</span>
                         </div>
                     )}

                     <div className="space-y-4 p-4">
                         {getFilteredMoments().length > 0 ? getFilteredMoments().map((post) => (
                             <div key={post.id} className="bg-white border border-zinc-300 p-4 shadow-sm">
                                 <div className="flex items-start gap-3 mb-3">
                                     <div className={`w-8 h-8 border border-black flex items-center justify-center font-bold text-white text-xs shrink-0 ${getAvatarColor(post.发布者 || 'Unknown')}`}>
                                         {(post.发布者 || 'U')[0]}
                                     </div>
                                     <div>
                                         <div className="font-bold text-sm leading-none">{post.发布者}</div>
                                         <div className="text-[10px] text-zinc-400 font-mono uppercase">{post.时间戳}</div>
                                     </div>
                                 </div>
                                 
                                 <p className="text-xs text-zinc-800 font-sans leading-relaxed mb-3">
                                     {post.内容}
                                 </p>

                                 {post.图片描述 && (
                                    <div className="w-full h-24 bg-zinc-100 flex flex-col items-center justify-center text-zinc-500 border border-zinc-200 mb-3">
                                        <ImageIcon size={20} className="mb-1 text-blue-400" />
                                        <span className="text-[10px] px-4 text-center">{post.图片描述}</span>
                                    </div>
                                 )}

                                 <div className="flex items-center gap-4 border-t border-zinc-100 pt-2">
                                     <button className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-red-500">
                                         <Heart size={12} /> Like ({post.点赞数 || 0})
                                     </button>
                                     <button className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-blue-500">
                                         <MessageSquare size={12} /> Comment
                                     </button>
                                 </div>
                             </div>
                         )) : <EmptyState icon={<Lock size={40} />} text="朋友圈为空或无权限" />}
                     </div>
                 </div>
             )}
        </div>

        {activeTab === 'CHAT' && viewingChatTarget && !isCreatingGroup && (
             <div className="p-3 bg-zinc-100 border-t border-zinc-300 shrink-0 pb-safe">
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={`Message ${chatType === 'GROUP' ? 'Group' : viewingChatTarget}...`}
                        className="flex-1 bg-white border border-zinc-300 px-3 py-2 text-xs text-black outline-none focus:border-blue-600 rounded"
                    />
                    <button 
                        onClick={handleSend}
                        className="bg-black text-white px-3 py-2 font-bold uppercase hover:bg-blue-600 transition-colors rounded"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ icon, text }: any) => (
    <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-60">
        <div className="mb-2">{icon}</div>
        <p className="font-display uppercase tracking-widest text-xs">{text}</p>
    </div>
);

const ChatRow = ({ name, lastMsg, avatar, onClick, isGroup }: any) => (
    <div 
        onClick={onClick}
        className="flex items-center gap-3 p-3 hover:bg-zinc-50 cursor-pointer border-b border-zinc-100 transition-colors group"
    >
        <div className={`w-10 h-10 flex items-center justify-center font-bold text-white shrink-0 text-xs rounded-full transition-all
            ${isGroup ? 'bg-zinc-800' : getAvatarColor(name)}
        `}>
            {isGroup ? <Users size={16} /> : name[0]}
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-black text-xs truncate uppercase font-display tracking-wide">{name}</h4>
            <p className="text-[10px] text-zinc-500 truncate">{lastMsg}</p>
        </div>
        <ChevronRight size={14} className="text-zinc-300 group-hover:text-blue-600" />
    </div>
);

const ContactRow = ({ npc, onClick }: any) => (
    <div 
       onClick={onClick}
       className="flex items-center gap-3 p-3 bg-white border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"
    >
        <div className={`w-9 h-9 flex items-center justify-center font-bold text-white text-xs shrink-0 rounded-full ${getAvatarColor(npc.姓名)}`}>
            {npc.姓名[0]}
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-black text-xs truncate">{npc.姓名}</h4>
            <p className="text-[9px] text-zinc-500 truncate uppercase tracking-wider">
                {npc.身份} | {npc.眷族}
            </p>
        </div>
    </div>
);

const InfoBlock = ({ label, content }: any) => (
    <div>
        <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{label}</h4>
        <p className="text-xs text-black font-medium border-l-2 border-blue-500 pl-2">{content}</p>
    </div>
);

const PhoneTabBtn = ({ icon, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex-1 py-3 flex justify-center items-center transition-all border-b-2 
            ${active ? 'text-blue-500 border-blue-500 bg-zinc-800' : 'text-zinc-600 border-transparent hover:text-white'}
        `}
    >
        {icon}
    </button>
);
