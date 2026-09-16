'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyChatsPage() {
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUserId(user.id);

      // Загружаем сообщения, где пользователь отправитель ИЛИ получатель
      const { data, error } = await supabase
        .from('messages')
        .select('*, ads(id, title, images, price)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Ошибка загрузки сообщений:', error);
      } else if (data) {
        // Группируем по ad_id (оставляем только самое последнее сообщение)
        const uniqueChatsMap = new Map();
        data.forEach((msg: any) => {
          if (!uniqueChatsMap.has(msg.ad_id) && msg.ads) {
            uniqueChatsMap.set(msg.ad_id, msg);
          }
        });
        setChats(Array.from(uniqueChatsMap.values()));
      }
      setLoading(false);
    }

    fetchChats();

    // Подписка на новые входящие сообщения в реальном времени
    const channel = supabase
      .channel('public:messages_chats_page')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          fetchChats(); // Перезагружаем список диалогов при новом сообщении
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] text-white flex items-center justify-center">
        <p className="text-gray-400">Загрузка диалогов...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Мои сообщения</h1>
          <Link href="/profile" className="text-sm text-gray-400 hover:text-white">
            ← В профиль
          </Link>
        </div>

        {chats.length === 0 ? (
          <div className="bg-[#121621] border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
            У вас пока нет активных диалогов
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => {
              const isIncoming = chat.receiver_id === currentUserId;
              return (
                <Link
                  key={chat.ad_id}
                  href={`/chat/${chat.ad_id}`}
                  className="block bg-[#121621] border border-gray-800 hover:border-purple-500 rounded-2xl p-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={chat.ads?.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'}
                      alt={chat.ads?.title}
                      className="w-12 h-12 object-cover rounded-xl bg-gray-900"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h2 className="font-semibold text-sm truncate">{chat.ads?.title}</h2>
                        <span className="text-xs text-purple-400 font-bold">
                          {chat.ads?.price?.toLocaleString()} ₸
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {isIncoming ? '📩 Входящее: ' : 'Вы: '}
                        {chat.text}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}