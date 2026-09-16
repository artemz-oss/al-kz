'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// Генерация звуков через Web Audio API
const playSound = (type: 'send' | 'receive') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    console.error('Audio play error:', e);
  }
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [activeAdId, setActiveAdId] = useState<string | null>(null);
  const [activeAd, setActiveAd] = useState<any>(null);
  const [partnerEmail, setPartnerEmail] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeAdId && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, activeAdId]);

  const fetchChats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    setIsLoaded(true);

    if (!user) return;

    const { data } = await supabase
      .from('messages')
      .select('*, ads(id, title, images, price, user_id)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (data) {
      const uniqueChatsMap = new Map();
      data.forEach((msg: any) => {
        if (!uniqueChatsMap.has(msg.ad_id) && msg.ads) {
          uniqueChatsMap.set(msg.ad_id, msg);
        }
      });
      setChats(Array.from(uniqueChatsMap.values()));
    }
  };

  useEffect(() => {
    fetchChats();

    const handleToggle = () => setIsOpen((prev) => !prev);

    const handleOpenAdChat = (e: any) => {
      setIsOpen(true);
      if (e.detail?.adId) {
        setActiveAdId(e.detail.adId);
      }
    };

    window.addEventListener('toggle-chat-widget', handleToggle);
    window.addEventListener('open-chat-ad', handleOpenAdChat);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        fetchChats();
      }
    });

    return () => {
      window.removeEventListener('toggle-chat-widget', handleToggle);
      window.removeEventListener('open-chat-ad', handleOpenAdChat);
      subscription.unsubscribe();
    };
  }, []);

  // Realtime-уведомления
  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = supabase
      .channel(`widget_notifications_${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        () => {
          setHasUnread(true);
          playSound('receive');
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  // Загрузка сообщений и собеседника
  useEffect(() => {
    if (!activeAdId || !currentUser) return;

    async function loadChatMessages() {
      const { data: adData } = await supabase
        .from('ads')
        .select('*')
        .eq('id', activeAdId)
        .single();
      setActiveAd(adData);

      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .eq('ad_id', activeAdId)
        .order('created_at', { ascending: true });

      const loadedMessages = msgData || [];
      setMessages(loadedMessages);

      let partnerId = adData?.user_id;
      if (currentUser.id === adData?.user_id) {
        const incomingMsg = loadedMessages.find((m) => m.sender_id !== currentUser.id);
        if (incomingMsg) {
          partnerId = incomingMsg.sender_id;
        }
      }

      if (partnerId) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', partnerId)
          .single();

        if (profileData) {
          setPartnerEmail(profileData.full_name || profileData.email || 'Пользователь');
        } else {
          setPartnerEmail('Собеседник');
        }
      }
    }

    loadChatMessages();

    const channel = supabase
      .channel(`widget_chat_${activeAdId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ad_id=eq.${activeAdId}`,
        },
        (payload) => {
          if (payload.new.sender_id !== currentUser?.id) {
            playSound('receive');
          }
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeAdId, currentUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !activeAd) return;

    const textToSend = newMessage.trim();
    setNewMessage('');

    let targetReceiverId = activeAd.user_id;
    if (currentUser.id === activeAd.user_id) {
      const incomingMsg = messages.find((m) => m.sender_id !== currentUser.id);
      if (incomingMsg) {
        targetReceiverId = incomingMsg.sender_id;
      }
    }

    const { data } = await supabase
      .from('messages')
      .insert([
        {
          ad_id: activeAdId,
          sender_id: currentUser.id,
          receiver_id: targetReceiverId,
          text: textToSend,
        },
      ])
      .select()
      .single();

    if (data) {
      playSound('send');
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }
  };

  if (!isLoaded || !currentUser) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end">
      {isOpen && (
        <div className="w-80 md:w-96 h-[480px] bg-[#121621] border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-3">
          
          <div className="p-3 bg-[#1a202c] border-b border-gray-800 flex justify-between items-center">
            {activeAdId ? (
              <div className="flex items-center justify-between w-full pr-2">
                <button
                  onClick={() => {
                    setActiveAdId(null);
                    setPartnerEmail('');
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  ← Назад
                </button>
                <div className="text-right min-w-0 pl-2">
                  <h4 className="text-xs font-bold text-white truncate">
                    {partnerEmail || 'Чат'}
                  </h4>
                  <p className="text-[10px] text-gray-400 truncate">
                    {activeAd?.title}
                  </p>
                </div>
              </div>
            ) : (
              <h3 className="text-sm font-bold text-white">Сообщения</h3>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-lg leading-none p-1 cursor-pointer flex-shrink-0"
            >
              ✕
            </button>
          </div>

          {!activeAdId ? (
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {chats.length === 0 ? (
                <div className="text-center text-xs text-gray-500 mt-12">
                  У вас пока нет активных диалогов
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.ad_id}
                    onClick={() => setActiveAdId(chat.ad_id)}
                    className="p-2.5 bg-[#1a202c]/50 hover:bg-[#1a202c] border border-gray-800 rounded-xl cursor-pointer transition-all flex items-center gap-3"
                  >
                    <img
                      src={chat.ads?.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'}
                      alt={chat.ads?.title}
                      className="w-10 h-10 object-cover rounded-lg bg-gray-900 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold truncate text-white">{chat.ads?.title}</h4>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{chat.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                {messages.map((msg) => {
                  const isMine = msg.sender_id === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-xl break-words ${
                          isMine
                            ? 'bg-purple-600 text-white rounded-br-none'
                            : 'bg-[#1a202c] text-gray-200 border border-gray-800 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-2 border-t border-gray-800 bg-[#0a0d14]/50 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Напишите сообщение..."
                  className="flex-1 bg-[#1a202c] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  ➤
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasUnread(false);
        }}
        className="relative w-14 h-14 bg-purple-600 hover:bg-purple-500 text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        💬
        {hasUnread && (
          <span className="w-3.5 h-3.5 bg-red-500 border-2 border-[#0a0d14] rounded-full absolute top-0 right-0 animate-pulse" />
        )}
      </button>
    </div>
  );
}