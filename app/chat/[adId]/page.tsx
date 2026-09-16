'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const adId = params.adId as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ad, setAd] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initChat() {
      // 1. Проверяем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      // 2. Получаем данные объявления
      const { data: adData, error: adError } = await supabase
        .from('ads')
        .select('*')
        .eq('id', adId)
        .single();

      if (adError || !adData) {
        alert('Объявление не найдено');
        router.push('/');
        return;
      }
      setAd(adData);

      // 3. Загружаем историю сообщений
      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .eq('ad_id', adId)
        .order('created_at', { ascending: true });

      if (msgData) {
        setMessages(msgData);
      }

      setLoading(false);
    }

    initChat();

    // 4. Подписка Realtime на стандартный канал
    const channel = supabase
      .channel(`public:messages:ad_id=eq.${adId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ad_id=eq.${adId}`,
        },
        (payload) => {
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
  }, [adId, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !ad) return;

    const textToSend = newMessage.trim();
    setNewMessage('');

    // Определение получателя:
    // Если пишет покупатель -> получатель продавец (ad.user_id)
    // Если пишет продавец -> получатель автор первого/последнего входящего сообщения
    let targetReceiverId = ad.user_id;

    if (currentUser.id === ad.user_id) {
      const incomingMsg = messages.find((m) => m.sender_id !== currentUser.id);
      if (incomingMsg) {
        targetReceiverId = incomingMsg.sender_id;
      }
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          ad_id: adId,
          sender_id: currentUser.id,
          receiver_id: targetReceiverId,
          text: textToSend,
        },
      ])
      .select()
      .single();

    if (error) {
      alert('Ошибка при отправке: ' + error.message);
      setNewMessage(textToSend);
    } else if (data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] text-white flex items-center justify-center">
        <p className="text-gray-400">Загрузка чата...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white py-6 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl bg-[#121621] border border-gray-800 rounded-2xl flex flex-col h-[80vh] shadow-2xl overflow-hidden">
        
        {/* Шапка */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#1a202c]/50">
          <div className="flex items-center gap-3">
            <Link href={`/ad/${ad.id}`} className="text-gray-400 hover:text-white text-sm">
              ←
            </Link>
            <img
              src={ad.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'}
              alt={ad.title}
              className="w-10 h-10 object-cover rounded-lg"
            />
            <div>
              <h1 className="font-semibold text-sm line-clamp-1">{ad.title}</h1>
              <p className="text-xs text-purple-400 font-bold">{ad.price?.toLocaleString()} ₸</p>
            </div>
          </div>
        </div>

        {/* Сообщения */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-10">
              Напишите первое сообщение...
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      isMine
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-[#1a202c] border border-gray-800 text-gray-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Форма */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-800 flex gap-2 bg-[#0a0d14]/50">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Напишите сообщение..."
            className="flex-1 bg-[#1a202c] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-sm font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20"
          >
            Отправить
          </button>
        </form>

      </div>
    </div>
  );
}