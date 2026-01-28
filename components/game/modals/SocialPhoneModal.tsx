
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, MessageCircle, Users, Send, BookUser, Camera, ChevronRight, Heart, MessageSquare, ArrowLeft, Plus, Check, Image as ImageIcon, Clock, Lock, Battery, Signal, Edit2, Trash2, Globe, Loader2 } from 'lucide-react';
import { PhoneState, PhoneThread, PhoneMessage, PhonePost, Confidant, NpcBackgroundTracking } from '../../../types';
import { getAvatarColor } from '../../../utils/uiUtils';

interface SocialPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneState?: PhoneState;
  contacts: Confidant[];
  npcTracking?: NpcBackgroundTracking[];
  playerName: string;
  hasPhone?: boolean;
  initialTab?: 'CHAT' | 'CONTACTS' | 'MOMENTS' | 'FORUM';
  onSendMessage: (text: string, thread: PhoneThread) => void;
  onEditMessage?: (id: string, content: string) => void;
  onDeleteMessage?: (id: string) => void;
  onCreateThread?: (payload: { type: 'private' | 'group' | 'public'; title: string; members: string[] }) => void;
  onCreateMoment?: (content: string, imageDesc?: string) => void;
  onCreatePublicPost?: (content: string, imageDesc?: string, topic?: string) => void;
  onReadThread?: (threadId: string) => void;
  onWaitReply?: (thread: PhoneThread) => void;
  isPhoneProcessing?: boolean;
  phoneProcessingThreadId?: string | null;
  phoneProcessingScope?: 'chat' | 'moment' | 'forum' | 'sync' | null;
}

type PhoneTab = 'CHAT' | 'CONTACTS' | 'MOMENTS' | 'FORUM';
type ChatType = 'private' | 'group' | 'public';

const DEFAULT_PHONE: PhoneState = {
  设备: { 电量: 0, 当前信号: 0, 状态: 'offline' },
  联系人: { 好友: [], 黑名单: [], 最近: [] },
  对话: { 私聊: [], 群聊: [], 公共频道: [] },
  朋友圈: { 仅好友可见: true, 帖子: [] },
  公共帖子: { 板块: [], 帖子: [] },
  待发送: []
};

export const SocialPhoneModal: React.FC<SocialPhoneModalProps> = ({
  isOpen,
  onClose,
  phoneState,
  contacts = [],
  npcTracking = [],
  playerName,
  hasPhone = true,
  initialTab = 'CHAT',
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onCreateThread,
  onCreateMoment,
  onCreatePublicPost,
  onReadThread,
  onWaitReply,
  isPhoneProcessing = false,
  phoneProcessingThreadId = null,
  phoneProcessingScope = null
}) => {
  const phone = phoneState || DEFAULT_PHONE;
  const [activeTab, setActiveTab] = useState<PhoneTab>(initialTab);
  const [chatType, setChatType] = useState<ChatType>('private');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [pendingThreadTitle, setPendingThreadTitle] = useState<string | null>(null);
  const [viewingContact, setViewingContact] = useState<Confidant | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isStartingPrivate, setIsStartingPrivate] = useState(false);
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [inputText, setInputText] = useState('');
  const [momentText, setMomentText] = useState('');
  const [momentImage, setMomentImage] = useState('');
  const [forumText, setForumText] = useState('');
  const [forumImage, setForumImage] = useState('');
  const [forumBoard, setForumBoard] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyPing, setReplyPing] = useState(false);
  const lastActiveMsgId = useRef<string | null>(null);
  const buildTrackingSummary = (entry?: NpcBackgroundTracking | null) => {
    if (!entry) return '暂无跟踪';
    const parts = [entry.当前行动];
    if (entry.进度) parts.push(`进度:${entry.进度}`);
    if (entry.预计完成) parts.push(`预计:${entry.预计完成}`);
    if (entry.位置) parts.push(`地点:${entry.位置}`);
    return parts.filter(Boolean).join(' · ');
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const totalUnread = useMemo(() => {
    const allThreads = [
      ...(phone.对话?.私聊 || []),
      ...(phone.对话?.群聊 || []),
      ...(phone.对话?.公共频道 || [])
    ];
    return allThreads.reduce((sum, t) => sum + (t.未读 || 0), 0);
  }, [phoneState]);

  const getThreadList = (type: ChatType) => {
    if (type === 'private') return phone.对话?.私聊 || [];
    if (type === 'group') return phone.对话?.群聊 || [];
    return phone.对话?.公共频道 || [];
  };

  const getThreadSortValue = (thread: PhoneThread) => {
    const messages = Array.isArray(thread.消息) ? thread.消息 : [];
    if (messages.length === 0) return 0;
    const last = messages[messages.length - 1];
    return typeof last.timestampValue === 'number' ? last.timestampValue : 0;
  };

  const sortedThreads = useMemo(() => {
    const list = getThreadList(chatType);
    return [...list].sort((a, b) => getThreadSortValue(b) - getThreadSortValue(a));
  }, [phoneState, chatType]);

  const activeThread = useMemo(() => {
    if (!activeThreadId) return null;
    return getThreadList(chatType).find(t => t.id === activeThreadId) || null;
  }, [activeThreadId, chatType, phoneState]);

  const showPhoneProcessing = !!isPhoneProcessing;
  const isActiveThreadProcessing = showPhoneProcessing
    && phoneProcessingScope === 'chat'
    && !!activeThread
    && activeThread.id === phoneProcessingThreadId;
  const processingLabel = useMemo(() => {
    if (!showPhoneProcessing) return '';
    if (phoneProcessingScope === 'moment') return '动态已提交，AI处理中…';
    if (phoneProcessingScope === 'forum') return '帖子已提交，AI处理中…';
    if (phoneProcessingScope === 'sync') return '剧情联动处理中…';
    if (phoneProcessingScope === 'chat') {
      return isActiveThreadProcessing ? '已提交消息，等待AI回复…' : 'AI正在处理手机消息…';
    }
    return 'AI处理中…';
  }, [showPhoneProcessing, phoneProcessingScope, isActiveThreadProcessing]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setChatType('private');
      setActiveThreadId(null);
      setViewingContact(null);
      setIsCreatingGroup(false);
      setIsStartingPrivate(false);
      setEditingMessageId(null);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (activeThreadId && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThreadId, phoneState]);

  useEffect(() => {
    if (!activeThread) return;
    const msgs = Array.isArray(activeThread.消息) ? activeThread.消息 : [];
    const lastMsg = msgs[msgs.length - 1];
    const isMe = lastMsg?.发送者 === playerName || lastMsg?.发送者 === '玩家' || lastMsg?.发送者 === 'Player';
    if (lastMsg?.id && lastActiveMsgId.current && lastMsg.id !== lastActiveMsgId.current && !isMe) {
      setReplyPing(true);
      setTimeout(() => setReplyPing(false), 2200);
    }
    if (lastMsg?.id && lastMsg.id !== lastActiveMsgId.current) {
      lastActiveMsgId.current = lastMsg.id;
    }
    onReadThread?.(activeThread.id);
  }, [activeThread?.id, activeThread?.消息?.length, playerName, onReadThread]);

  const phoneLocked = !hasPhone;
  const batteryValue = typeof phone.设备?.电量 === 'number' ? Math.max(0, Math.min(100, phone.设备.电量)) : null;
  const signalValue = typeof phone.设备?.当前信号 === 'number' ? Math.max(0, Math.min(4, phone.设备.当前信号)) : null;
  const batteryColor = batteryValue === null ? 'text-zinc-300' : batteryValue <= 10 ? 'text-red-300' : batteryValue <= 30 ? 'text-yellow-300' : 'text-emerald-300';
  const signalColor = signalValue === null ? 'text-zinc-300' : signalValue <= 1 ? 'text-red-300' : signalValue <= 2 ? 'text-yellow-300' : 'text-emerald-300';

  const validContacts = contacts.filter(c => c.已交换联系方式);
  const friends = Array.isArray(phone.联系人?.好友) ? phone.联系人.好友 : [];
  const friendSet = new Set(friends);

  useEffect(() => {
    if (!pendingThreadTitle) return;
    const list = getThreadList(chatType);
    const found = list.find(t => t.标题 === pendingThreadTitle);
    if (found) {
      setActiveThreadId(found.id);
      setPendingThreadTitle(null);
    }
  }, [phoneState, pendingThreadTitle, chatType]);

  const formatDay = (timestamp?: string) => {
    if (!timestamp) return '';
    const match = timestamp.match(/第\d+日/);
    return match ? match[0] : '';
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '??:??';
    const match = timestamp.match(/(\d{1,2}:\d{2})/);
    return match ? match[1] : timestamp;
  };

  const handleTabChange = (tab: PhoneTab) => {
    if (phoneLocked) return;
    setActiveTab(tab);
    setActiveThreadId(null);
    setViewingContact(null);
    setIsCreatingGroup(false);
    setIsStartingPrivate(false);
  };

  const openThreadByTitle = (type: ChatType, title: string, members: string[]) => {
    const existing = getThreadList(type).find(t => t.标题 === title);
    if (existing) {
      setChatType(type);
      setActiveThreadId(existing.id);
      return;
    }
    if (onCreateThread) {
      onCreateThread({ type, title, members });
      setChatType(type);
      setPendingThreadTitle(title);
    }
  };

  const handleSend = () => {
    if (!activeThread || !inputText.trim()) return;
    if (editingMessageId && onEditMessage) {
      onEditMessage(editingMessageId, inputText.trim());
      setEditingMessageId(null);
      setInputText('');
      return;
    }
    onSendMessage(inputText.trim(), activeThread);
    setInputText('');
  };

  const handleStartEdit = (msg: PhoneMessage) => {
    if (!onEditMessage) return;
    setEditingMessageId(msg.id);
    setInputText(msg.内容 || '');
  };

  const handleDelete = (msg: PhoneMessage) => {
    if (!onDeleteMessage) return;
    if (window.confirm('确定要删除这条消息吗？')) onDeleteMessage(msg.id);
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
      alert('需要群组名称且至少2名成员。');
      return;
    }
    const members = [playerName, ...newGroupMembers];
    openThreadByTitle('group', newGroupName.trim(), members);
    setIsCreatingGroup(false);
    setNewGroupMembers([]);
    setNewGroupName('');
  };

  const handleCreateMoment = () => {
    if (!momentText.trim()) return;
    onCreateMoment?.(momentText.trim(), momentImage.trim() || undefined);
    setMomentText('');
    setMomentImage('');
  };

  const handleCreateForumPost = () => {
    if (!forumText.trim()) return;
    onCreatePublicPost?.(forumText.trim(), forumImage.trim() || undefined, forumBoard || undefined);
    setForumText('');
    setForumImage('');
  };

  const messages = useMemo(() => {
    if (!activeThread) return [] as PhoneMessage[];
    const list = Array.isArray(activeThread.消息) ? activeThread.消息 : [];
    return [...list].sort((a, b) => {
      if (typeof a.timestampValue === 'number' && typeof b.timestampValue === 'number') return a.timestampValue - b.timestampValue;
      return 0;
    });
  }, [activeThread]);

  const visibleMoments = useMemo(() => {
    const posts = Array.isArray(phone.朋友圈?.帖子) ? phone.朋友圈.帖子 : [];
    if (!phone.朋友圈?.仅好友可见) return posts;
    return posts.filter(p => p.发布者 === playerName || friendSet.has(p.发布者));
  }, [phoneState, playerName]);

  const publicPosts = useMemo(() => {
    const posts = Array.isArray(phone.公共帖子?.帖子) ? phone.公共帖子.帖子 : [];
    return [...posts].sort((a, b) => (b.timestampValue || 0) - (a.timestampValue || 0));
  }, [phoneState]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 animate-in slide-in-from-bottom-10 duration-300">
      <div className="w-full h-full md:w-[380px] md:h-[750px] bg-black md:rounded-[3rem] border-0 md:border-8 border-zinc-800 relative shadow-2xl flex flex-col overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-900 rounded-b-xl z-50 border-b border-zinc-800 hidden md:block"></div>

        <div className="bg-blue-600 pt-safe-top md:pt-12 pb-4 px-4 flex justify-between items-center text-white shrink-0 shadow-md z-20">
          {activeThread ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveThreadId(null)} className="hover:opacity-80">
                <ArrowLeft size={20} />
              </button>
              <span className="truncate max-w-[150px] font-bold text-sm">{activeThread.标题}</span>
            </div>
          ) : viewingContact ? (
            <button onClick={() => setViewingContact(null)} className="flex items-center gap-1 font-bold hover:opacity-80">
              <ArrowLeft size={20} /> 详情
            </button>
          ) : isCreatingGroup ? (
            <button onClick={() => setIsCreatingGroup(false)} className="flex items-center gap-1 font-bold hover:opacity-80">
              <ArrowLeft size={20} /> 创建群聊
            </button>
          ) : isStartingPrivate ? (
            <button onClick={() => setIsStartingPrivate(false)} className="flex items-center gap-1 font-bold hover:opacity-80">
              <ArrowLeft size={20} /> 选择联系人
            </button>
          ) : (
            <h2 className="text-lg font-display font-bold italic tracking-wide">
              {activeTab === 'CHAT' ? 'MESSAGES' : activeTab === 'CONTACTS' ? 'CONTACTS' : activeTab === 'MOMENTS' ? 'FRIENDS' : 'FORUM'}
            </h2>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-mono text-white/80">
              <div className={`flex items-center gap-1 ${batteryColor}`}>
                <Battery size={14} />
                <span>{batteryValue === null ? '??' : `${batteryValue}%`}</span>
              </div>
              <div className={`flex items-center gap-1 ${signalColor}`}>
                <Signal size={14} />
                <span>{signalValue === null ? '??' : `${signalValue}/4`}</span>
              </div>
            </div>
            {activeThread && onWaitReply && (
              <button onClick={() => onWaitReply(activeThread)} title="等待回复">
                <Clock size={20} />
              </button>
            )}
            <button onClick={onClose} className="hover:text-black transition-colors"><X size={24} /></button>
          </div>
        </div>

        {!activeThread && !viewingContact && !isCreatingGroup && !isStartingPrivate && (
          <div className="flex bg-zinc-900 border-b border-zinc-800 shrink-0">
            <PhoneTabBtn icon={<MessageCircle size={20} />} active={activeTab === 'CHAT'} onClick={() => handleTabChange('CHAT')} />
            <PhoneTabBtn icon={<BookUser size={20} />} active={activeTab === 'CONTACTS'} onClick={() => handleTabChange('CONTACTS')} />
            <PhoneTabBtn icon={<Camera size={20} />} active={activeTab === 'MOMENTS'} onClick={() => handleTabChange('MOMENTS')} />
            <PhoneTabBtn icon={<Globe size={20} />} active={activeTab === 'FORUM'} onClick={() => handleTabChange('FORUM')} />
          </div>
        )}

        <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
          {phoneLocked && (
            <div className="absolute inset-0 z-40 bg-black/90 text-white flex flex-col items-center justify-center gap-4 p-6 text-center">
              <Lock size={36} className="text-blue-400" />
              <div className="text-lg font-display uppercase tracking-widest">终端未接入</div>
              <div className="text-xs text-zinc-400 leading-relaxed">
                背包内未找到魔石通讯终端。请在物品中携带该设备以启用手机功能。
              </div>
            </div>
          )}

          {showPhoneProcessing && (
            <div className="px-3 py-2 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest border-b border-blue-100 flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" />
              <span className="truncate">{processingLabel}</span>
            </div>
          )}

          {activeTab === 'CHAT' && (
            isStartingPrivate ? (
              <div className="flex-1 overflow-y-auto p-4 bg-zinc-50">
                <div className="text-[10px] text-zinc-500 font-bold uppercase mb-2">选择联系人</div>
                <div className="space-y-2">
                  {validContacts.length > 0 ? validContacts.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setIsStartingPrivate(false);
                        openThreadByTitle('private', c.姓名, [playerName, c.姓名]);
                      }}
                      className="flex items-center gap-3 p-3 border rounded cursor-pointer transition-all bg-white border-zinc-200 hover:border-blue-500"
                    >
                      <div className={`w-8 h-8 flex items-center justify-center text-white text-xs font-bold rounded-full ${getAvatarColor(c.姓名)}`}>
                        {c.姓名[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{c.姓名}</div>
                        <div className="text-[10px] text-zinc-500">{c.眷族 || '无眷族'}</div>
                      </div>
                      {friendSet.has(c.姓名) && <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">好友</span>}
                    </div>
                  )) : <EmptyState icon={<MessageCircle size={40} />} text="暂无联系人" />}
                </div>
              </div>
            ) : isCreatingGroup ? (
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
            ) : activeThread ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-zinc-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                {replyPing && (
                  <div className="flex justify-center">
                    <div className="px-3 py-1 text-[10px] bg-blue-600 text-white rounded-full shadow">
                      收到新回复
                    </div>
                  </div>
                )}
                {messages.length === 0 ? (
                  <div className="text-center text-zinc-400 text-xs italic mt-10">暂无消息记录</div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.发送者 === playerName || msg.发送者 === '玩家' || msg.发送者 === 'Player';
                    const dayLabel = formatDay(msg.时间戳);
                    const timeLabel = formatTime(msg.时间戳);
                    const showDay = dayLabel && (idx === 0 || dayLabel !== formatDay(messages[idx - 1]?.时间戳));
                    const isSystem = msg.类型 === 'system' || msg.发送者 === '系统';
                    return (
                      <React.Fragment key={`${msg.id}_${idx}`}>
                        {showDay && (
                          <div className="text-center text-[10px] text-zinc-500 font-mono uppercase py-1">
                            {dayLabel}
                          </div>
                        )}
                        {isSystem ? (
                          <div className="text-center">
                            <div className="inline-block bg-zinc-200 text-zinc-600 text-[10px] px-3 py-1 rounded-full">
                              {msg.内容}
                            </div>
                          </div>
                        ) : (
                          <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[86%] px-3 py-2.5 text-[13px] leading-relaxed shadow-sm relative ${isMe ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-sm' : 'bg-white text-zinc-900 border border-zinc-200 rounded-2xl rounded-bl-sm'}`}>
                              {!isMe && activeThread.类型 !== 'private' && (
                                <div className="font-bold text-[9px] text-blue-600 mb-1 uppercase">{msg.发送者}</div>
                              )}
                              {msg.引用?.内容 && (
                                <div className="text-[10px] border-l-2 border-blue-400 pl-2 mb-1 text-zinc-500">
                                  {msg.引用.发送者 ? `${msg.引用.发送者}: ` : ''}{msg.引用.内容}
                                </div>
                              )}
                              <div className="whitespace-pre-wrap break-words">{msg.内容}</div>
                              {msg.图片描述 && (
                                <div className="mt-2 w-full h-20 bg-zinc-800/10 flex flex-col items-center justify-center text-zinc-500 border border-zinc-200 rounded-lg">
                                  <ImageIcon size={18} className="mb-1 text-blue-400" />
                                  <span className="text-[10px] px-2 text-center">{msg.图片描述}</span>
                                </div>
                              )}
                              <div className={`mt-1 text-[9px] ${isMe ? 'text-blue-100' : 'text-zinc-500'} font-mono text-right`}>
                                {isMe && msg.状态 === 'failed' && <span className="text-red-200 mr-2">发送失败</span>}
                                {isMe && msg.状态 === 'pending' && <span className="text-blue-100/80 mr-2">发送中</span>}
                                {isMe && msg.状态 === 'read' && <span className="text-blue-100/70 mr-2">已读</span>}
                                {timeLabel}
                              </div>
                              {isMe && (onEditMessage || onDeleteMessage) && (
                                <div className="mt-1 flex justify-end gap-2 text-[9px]">
                                  {onEditMessage && (
                                    <button type="button" onClick={() => handleStartEdit(msg)} className="flex items-center gap-1 text-blue-100/80 hover:text-white">
                                      <Edit2 size={10} /> 编辑
                                    </button>
                                  )}
                                  {onDeleteMessage && (
                                    <button type="button" onClick={() => handleDelete(msg)} className="flex items-center gap-1 text-blue-100/80 hover:text-white">
                                      <Trash2 size={10} /> 删除
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="flex border-b border-zinc-200">
                  <button
                    onClick={() => setChatType('private')}
                    className={`flex-1 py-2 text-xs font-bold uppercase ${chatType === 'private' ? 'bg-blue-500 text-white' : 'bg-zinc-100 text-zinc-500'}`}
                  >
                    私聊
                  </button>
                  <button
                    onClick={() => setChatType('group')}
                    className={`flex-1 py-2 text-xs font-bold uppercase ${chatType === 'group' ? 'bg-blue-500 text-white' : 'bg-zinc-100 text-zinc-500'}`}
                  >
                    群聊
                  </button>
                  <button
                    onClick={() => setChatType('public')}
                    className={`flex-1 py-2 text-xs font-bold uppercase ${chatType === 'public' ? 'bg-blue-500 text-white' : 'bg-zinc-100 text-zinc-500'}`}
                  >
                    公共
                  </button>
                </div>

                {totalUnread > 0 && (
                  <div className="px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest border-b border-blue-100">
                    有 {totalUnread} 条未读消息
                  </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                  {chatType === 'private' && (
                    <div className="space-y-1">
                      <div
                        onClick={() => setIsStartingPrivate(true)}
                        className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-center text-blue-600 font-bold gap-2 cursor-pointer hover:bg-blue-50 text-xs"
                      >
                        <Plus size={16} /> 发起私聊
                      </div>
                      {sortedThreads.length > 0 ? sortedThreads.map(thread => (
                        <ChatRow
                          key={thread.id}
                          name={thread.标题}
                          lastMsg={getThreadPreview(thread)}
                          avatar={thread.标题}
                          unread={thread.未读}
                          onClick={() => { setActiveThreadId(thread.id); setChatType('private'); onReadThread?.(thread.id); }}
                        />
                      )) : <EmptyState icon={<MessageCircle size={40} />} text="无私聊消息" />}
                    </div>
                  )}

                  {chatType === 'group' && (
                    <div className="space-y-1">
                      <div
                        onClick={() => setIsCreatingGroup(true)}
                        className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-center text-blue-600 font-bold gap-2 cursor-pointer hover:bg-blue-50 text-xs"
                      >
                        <Plus size={16} /> 创建新群聊
                      </div>
                      {sortedThreads.length > 0 ? sortedThreads.map(thread => (
                        <ChatRow
                          key={thread.id}
                          name={thread.标题}
                          lastMsg={getThreadPreview(thread)}
                          isGroup
                          unread={thread.未读}
                          onClick={() => { setActiveThreadId(thread.id); setChatType('group'); onReadThread?.(thread.id); }}
                        />
                      )) : <EmptyState icon={<Users size={40} />} text="暂无群组" />}
                    </div>
                  )}

                  {chatType === 'public' && (
                    <div className="space-y-1">
                      {sortedThreads.length > 0 ? sortedThreads.map(thread => (
                        <ChatRow
                          key={thread.id}
                          name={thread.标题}
                          lastMsg={getThreadPreview(thread)}
                          isGroup
                          unread={thread.未读}
                          onClick={() => { setActiveThreadId(thread.id); setChatType('public'); onReadThread?.(thread.id); }}
                        />
                      )) : <EmptyState icon={<Globe size={40} />} text="暂无公共频道" />}
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
                    <InfoBlock label="INFO" content={viewingContact.简介 || '暂无信息'} />
                    <div className="grid grid-cols-2 gap-4">
                      <InfoBlock label="RACE" content={viewingContact.种族} />
                      <InfoBlock label="RELATION" content={viewingContact.关系状态} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoBlock label="TITLE" content={viewingContact.称号 || '无'} />
                      <InfoBlock label="ROLE" content={`${viewingContact.身份 || '未知'} / ${viewingContact.眷族 || '无眷族'}`} />
                    </div>
                    <InfoBlock label="TRACK" content={buildTrackingSummary(npcTracking.find(t => t.NPC === viewingContact.姓名))} />
                    <InfoBlock label="LOCATION" content={viewingContact.位置详情 || (viewingContact.坐标 ? `坐标 ${Math.round(viewingContact.坐标.x)}, ${Math.round(viewingContact.坐标.y)}` : '未知')} />
                  </div>

                  <div className="mt-6 flex gap-2 pb-6">
                    <button
                      onClick={() => {
                        setViewingContact(null);
                        setActiveTab('CHAT');
                        openThreadByTitle('private', viewingContact.姓名, [playerName, viewingContact.姓名]);
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
                  <ContactRow key={npc.id} npc={npc} onClick={() => setViewingContact(npc)} isFriend={friendSet.has(npc.姓名)} />
                )) : <EmptyState icon={<Lock size={40} />} text="暂无好友 (需交换ID)" />}
              </div>
            )
          )}

          {activeTab === 'MOMENTS' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-zinc-100">
              <div className="bg-white border-b border-zinc-200 p-4">
                <div className="text-[10px] text-zinc-500 font-bold uppercase mb-2">发布动态 · 仅好友可见</div>
                <textarea
                  value={momentText}
                  onChange={(e) => setMomentText(e.target.value)}
                  placeholder="分享点什么..."
                  className="w-full h-20 border border-zinc-200 p-2 text-xs resize-none outline-none focus:border-blue-500 text-black placeholder:text-zinc-400"
                />
                <input
                  value={momentImage}
                  onChange={(e) => setMomentImage(e.target.value)}
                  placeholder="图片描述 (可选)"
                  className="w-full mt-2 border border-zinc-200 p-2 text-xs outline-none focus:border-blue-500 text-black placeholder:text-zinc-400"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleCreateMoment}
                    className="px-4 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-blue-600"
                  >
                    发布
                  </button>
                </div>
              </div>

              <div className="space-y-4 p-4">
                {visibleMoments.length > 0 ? visibleMoments.map((post) => (
                  <PostCard key={post.id} post={post} />
                )) : <EmptyState icon={<Lock size={40} />} text="暂无好友动态" />}
              </div>
            </div>
          )}

          {activeTab === 'FORUM' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-zinc-100">
              <div className="bg-white border-b border-zinc-200 p-4">
                <div className="text-[10px] text-zinc-500 font-bold uppercase mb-2">发布公共帖子</div>
                {Array.isArray(phone.公共帖子?.板块) && phone.公共帖子.板块.length > 0 && (
                  <select
                    value={forumBoard}
                    onChange={(e) => setForumBoard(e.target.value)}
                    className="w-full border border-zinc-200 p-2 text-xs outline-none focus:border-blue-500 mb-2 text-black"
                  >
                    <option value="">选择板块</option>
                    {phone.公共帖子.板块.map(board => (
                      <option key={board} value={board}>{board}</option>
                    ))}
                  </select>
                )}
                <textarea
                  value={forumText}
                  onChange={(e) => setForumText(e.target.value)}
                  placeholder="分享见闻 / 发布情报 / 交易信息..."
                  className="w-full h-20 border border-zinc-200 p-2 text-xs resize-none outline-none focus:border-blue-500 text-black placeholder:text-zinc-400"
                />
                <input
                  value={forumImage}
                  onChange={(e) => setForumImage(e.target.value)}
                  placeholder="图片描述 (可选)"
                  className="w-full mt-2 border border-zinc-200 p-2 text-xs outline-none focus:border-blue-500 text-black placeholder:text-zinc-400"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleCreateForumPost}
                    className="px-4 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-blue-600"
                  >
                    发布
                  </button>
                </div>
              </div>

              <div className="space-y-4 p-4">
                {publicPosts.length > 0 ? publicPosts.map(post => (
                  <PostCard key={post.id} post={post} isForum />
                )) : <EmptyState icon={<Globe size={40} />} text="暂无公共帖子" />}
              </div>
            </div>
          )}
        </div>

        {activeTab === 'CHAT' && activeThread && !isCreatingGroup && !isStartingPrivate && (
          <div className="p-3 bg-zinc-100 border-t border-zinc-300 shrink-0 pb-safe">
            {editingMessageId && (
              <div className="mb-2 flex items-center justify-between text-[10px] text-zinc-500">
                <span className="uppercase tracking-widest">正在编辑消息</span>
                <button
                  type="button"
                  onClick={() => { setEditingMessageId(null); setInputText(''); }}
                  className="text-blue-600 hover:text-blue-800 font-bold"
                >
                  取消
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={editingMessageId ? '编辑内容...' : `发送给 ${activeThread.标题}...`}
                className="flex-1 bg-white border border-zinc-300 px-3 py-2 text-xs text-black outline-none focus:border-blue-600 rounded"
              />
              <button
                onClick={handleSend}
                className="bg-black text-white px-3 py-2 font-bold uppercase hover:bg-blue-600 transition-colors rounded"
              >
                {editingMessageId ? '保存' : <Send size={16} />}
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

const getThreadPreview = (thread: PhoneThread) => {
  const msgs = Array.isArray(thread.消息) ? thread.消息 : [];
  if (msgs.length === 0) return '暂无消息';
  const last = msgs[msgs.length - 1];
  return last?.内容 ? last.内容.slice(0, 20) : '新消息';
};

const ChatRow = ({ name, lastMsg, avatar, onClick, isGroup, unread }: any) => {
  const unreadCount = Math.max(0, unread || 0);
  const unreadLabel = unreadCount > 99 ? '99+' : unreadCount.toString();
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 hover:bg-zinc-50 cursor-pointer border-b border-zinc-100 transition-colors group"
    >
      <div className={`w-10 h-10 flex items-center justify-center font-bold text-white shrink-0 text-xs rounded-full transition-all ${isGroup ? 'bg-zinc-800' : getAvatarColor(name)}`}>
        {isGroup ? <Users size={16} /> : name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-black text-xs truncate uppercase font-display tracking-wide">{name}</h4>
        <p className="text-[10px] text-zinc-500 truncate">{lastMsg}</p>
      </div>
      {unreadCount > 0 && (
        <span className="text-[10px] bg-blue-600 text-white rounded-full px-2 py-0.5">{unreadLabel}</span>
      )}
      <ChevronRight size={14} className="text-zinc-300 group-hover:text-blue-600" />
    </div>
  );
};

const ContactRow = ({ npc, onClick, isFriend }: any) => (
  <div
    onClick={onClick}
    className="flex items-center gap-3 p-3 bg-white border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"
  >
    <div className={`w-9 h-9 flex items-center justify-center font-bold text-white text-xs shrink-0 rounded-full ${getAvatarColor(npc.姓名)}`}>
      {npc.姓名[0]}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-black text-xs truncate">{npc.姓名}</h4>
      <p className="text-[9px] text-zinc-500 truncate uppercase tracking-wider">{npc.身份} | {npc.眷族}</p>
    </div>
    {isFriend && <span className="text-[9px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">好友</span>}
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
    className={`flex-1 py-3 flex justify-center items-center transition-all border-b-2 ${active ? 'text-blue-500 border-blue-500 bg-zinc-800' : 'text-zinc-600 border-transparent hover:text-white'}`}
  >
    {icon}
  </button>
);

const PostCard = ({ post, isForum }: { post: PhonePost; isForum?: boolean }) => (
  <div className="bg-white border border-zinc-300 p-4 shadow-sm">
    <div className="flex items-start gap-3 mb-3">
      <div className={`w-8 h-8 border border-black flex items-center justify-center font-bold text-white text-xs shrink-0 ${getAvatarColor(post.发布者 || 'Unknown')}`}>
        {(post.发布者 || 'U')[0]}
      </div>
      <div className="flex-1">
        <div className="font-bold text-sm leading-none text-zinc-900 flex items-center gap-2">
          {post.发布者}
          {Array.isArray(post.话题) && post.话题.length > 0 && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">{post.话题.join(' / ')}</span>
          )}
        </div>
        <div className="text-[10px] text-zinc-500 font-mono uppercase">{post.时间戳 || '未知'}</div>
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
      {isForum && post.来源 && (
        <span className="ml-auto text-[9px] text-zinc-400 uppercase tracking-widest">{post.来源}</span>
      )}
    </div>
  </div>
);
