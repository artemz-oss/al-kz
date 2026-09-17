'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Send, ShieldCheck, 
  Search, Paperclip, CheckCheck 
} from 'lucide-react';

export default function ChatsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  const activeChatRef = useRef<any>(null);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // 1. Загрузка текущего пользователя и списка чатов
  useEffect(() => {
    async function initUserAndChats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setCurrentUser(user);
      await fetchConversations(user.id);
    }

    initUserAndChats();
  }, [router]);

  // Функция сбора уникальных диалогов
  async function fetchConversations(userId: string) {
    setLoading(true);

    // Достаем все сообщения, где пользователь либо отправитель, либо получатель
    const { data: msgs, error } = await supabase
      .from('messages')
      .select('*, ads(*)')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error || !msgs) {
      setLoading(false);
      return;
    }

    // Группируем сообщения по уникальным парам: (ad_id + собеседник)
    const map = new Map();

    for (const msg of msgs) {
      const ad = msg.ads;
      if (!ad) continue;

      // Определяем ID собеседника
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      const key = `${msg.ad_id}_${partnerId}`;

      if (!map.has(key)) {
        // Запрашиваем имя/профиль собеседника (если у вас есть таблица profiles, можно взять оттуда, либо используем заглушку/ID)
        map.set(key, {
          id: key,
          ad_id: msg.ad_id,
          partnerId: partnerId,
          ad: {
            id: ad.id,
            title: ad.title,
            price: ad.price ? `${ad.price.toLocaleString()} ₸` : '',
            image: ad.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&q=80',
          },
          partner: {
            name: partnerId === ad.user_id ? 'Продавец' : 'Покупатель',
            avatar: (partnerId === ad.user_id ? 'П' : 'К'),
            online: true,
          },
          lastMessage: msg.text,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    }

    const convsList = Array.from(map.values());
    setConversations(convsList);

    // Если чаты есть и активный еще не выбран — выбираем первый
    if (convsList.length > 0 && !activeChat) {
      setActiveChat(convsList[0]);
    }

    setLoading(false);
  }

  // 2. Загрузка сообщений для выбранного чата
  useEffect(() => {
    if (!activeChat || !currentUser) return;

    async function fetchMessagesForChat() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('ad_id', activeChat.ad_id)
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeChat.partnerId}),and(sender_id.eq.${activeChat.partnerId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    }

    fetchMessagesForChat();

    // Подписка на Realtime сообщения
    const channel = supabase
      .channel(`chat_${activeChat.ad_id}_${activeChat.partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ad_id=eq.${activeChat.ad_id}`,
        },
        (payload) => {
          const newMsg = payload.new;
          // Проверяем, относится ли сообщение к текущему диалогу
          if (
            (newMsg.sender_id === currentUser.id && newMsg.receiver_id === activeChat.partnerId) ||
            (newMsg.sender_id === activeChat.partnerId && newMsg.receiver_id === currentUser.id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat, currentUser]);

  // 3. Отправка сообщения
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser || !activeChat) return;

    const textToSend = inputText.trim();
    setInputText('');

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          ad_id: activeChat.ad_id,
          sender_id: currentUser.id,
          receiver_id: activeChat.partnerId,
          text: textToSend,
        },
      ])
      .select()
      .single();

    if (error) {
      alert('Ошибка отправки: ' + error.message);
      setInputText(textToSend);
    } else if (data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400">Загрузка чатов...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-purple-500 selection:text-white overflow-hidden">
      
      {/* Шапка */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl h-16 shrink-0 flex items-center justify-between px-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
          <span className="hidden sm:inline">На главную</span>
        </Link>

        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-500 to-fuchsia-500 flex items-center justify-center font-black text-white text-base">
            AL
          </div>
          <span className="text-lg font-black tracking-widest text-white">AL.KZ</span>
        </Link>

        <div className="w-20" />
      </header>

      {/* Основной интерфейс чата */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto p-4 gap-4">
        
        {/* Левая панель: Список диалогов */}
        <div className="w-full md:w-80 lg:w-96 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-800/80 space-y-3">
            <h1 className="text-lg font-bold text-white">Сообщения</h1>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Поиск по чатам..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {conversations.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-10 px-4">
                У вас пока нет активных диалогов. Напишите продавцу из любого объявления!
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveChat(conv)}
                  className={`w-full p-4 flex items-start gap-3 text-left transition ${
                    activeChat?.id === conv.id
                      ? 'bg-purple-950/30 border-l-4 border-purple-500'
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center font-bold text-white text-base">
                      {conv.partner.avatar}
                    </div>
                    {conv.partner.online && (
                      <span className="w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full absolute -bottom-0.5 -right-0.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white truncate">{conv.partner.name}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">{conv.time}</span>
                    </div>
                    <p className="text-xs text-purple-300 font-medium truncate mt-0.5">{conv.ad.title}</p>
                    <p className="text-xs text-slate-400 truncate mt-1">{conv.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Правая панель: Окно переписки */}
        <div className="hidden md:flex flex-1 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex-col overflow-hidden relative">
          
          {activeChat ? (
            <>
              {/* Шапка чата */}
              <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center font-bold text-white text-base">
                    {activeChat.partner.avatar}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">{activeChat.partner.name}</h2>
                    <span className="text-[11px] text-slate-400">В сети</span>
                  </div>
                </div>

                {/* Карточка товара в шапке */}
                <Link
                  href={`/ad/${activeChat.ad.id}`}
                  className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2 rounded-xl hover:border-purple-500/50 transition"
                >
                  <img src={activeChat.ad.image} alt="" className="w-9 h-9 rounded-lg object-cover" />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-medium text-white max-w-[180px] truncate">{activeChat.ad.title}</p>
                    <p className="text-xs font-bold text-purple-400">{activeChat.ad.price}</p>
                  </div>
                </Link>
              </div>

              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-purple-950/20 border border-purple-500/20 p-3 rounded-xl flex items-center gap-3 text-xs text-purple-300 max-w-md mx-auto my-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
                  <span>Не сообщайте личные данные и CVV-коды карт в чате во избежание мошенничества.</span>
                </div>

                {messages.length === 0 ? (
                  <div className="text-center text-slate-500 text-xs mt-10">
                    Здесь пока нет сообщений. Напишите первое!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === currentUser?.id;
                    const msgTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                            isMine
                              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-none shadow-lg shadow-purple-600/20'
                              : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <div className={`flex items-center justify-end gap-1 text-[10px] ${isMine ? 'text-purple-200' : 'text-slate-400'}`}>
                            <span>{msgTime}</span>
                            {isMine && <CheckCheck className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Форма ввода */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800/80 bg-slate-900/80 flex items-center gap-2">
                <button type="button" className="p-2 text-slate-400 hover:text-white transition">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Напишите сообщение..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white p-2.5 rounded-xl transition shadow-md shadow-purple-600/30 active:scale-95 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              Выберите чат слева, чтобы начать общение
            </div>
          )}

        </div>

      </div>
    </div>
  );
}