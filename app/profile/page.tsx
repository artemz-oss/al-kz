'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfileAndAds() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);

      const { data: userAds } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      setAds(userAds || []);
      setLoading(false);
    }

    getProfileAndAds();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) return;

    const { error } = await supabase.from('ads').delete().eq('id', adId);

    if (error) {
      alert('Ошибка при удалении: ' + error.message);
    } else {
      setAds((prev) => prev.filter((ad) => ad.id !== adId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] text-white flex items-center justify-center">
        <p className="text-gray-400">Загрузка профиля...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Шапка навигации */}
        <div className="flex justify-between items-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← На главную
          </Link>
          <div className="flex items-center gap-3">
            {/* Кнопка запуска всплывающего виджета */}
            <button
              onClick={() => window.dispatchEvent(new Event('toggle-chat-widget'))}
              className="relative flex items-center gap-2 px-4 py-2 bg-[#1a202c] border border-gray-800 rounded-xl text-xs font-semibold text-white hover:bg-[#252d3d] transition-all cursor-pointer"
            >
              💬 Сообщения
            </button>

            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors cursor-pointer"
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>

        {/* Карточка пользователя */}
        <div className="bg-[#121621] border border-gray-800 rounded-2xl p-6 flex items-center gap-5 shadow-xl">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center font-bold text-2xl uppercase shadow-lg shadow-purple-600/30">
            {user?.email?.[0] || 'A'}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">{user?.email?.split('@')[0]}</h1>
            <p className="text-xs text-gray-400">{user?.email}</p>
            <p className="text-[10px] text-gray-600 font-mono">ID: {user?.id}</p>
          </div>
        </div>

        {/* Секция «Мои объявления» */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Мои объявления ({ads.length})</h2>
            <Link
              href="/add"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 font-bold text-sm rounded-xl transition-all shadow-lg shadow-purple-600/20"
            >
              + Добавить
            </Link>
          </div>

          {ads.length === 0 ? (
            <div className="bg-[#121621] border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
              У вас пока нет опубликованных объявлений.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-[#121621] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-gray-700 transition-all"
                >
                  <div className="flex gap-4">
                    <img
                      src={ad.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'}
                      alt={ad.title}
                      className="w-24 h-24 object-cover rounded-xl bg-gray-900"
                    />
                    <div className="space-y-1 flex-1 min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">
                        {ad.category}
                      </span>
                      <h3 className="font-bold text-base truncate">{ad.title}</h3>
                      <div className="text-lg font-extrabold text-white">
                        {ad.price?.toLocaleString()} ₸
                      </div>
                      <p className="text-xs text-gray-500">{ad.city || 'Алматы'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800/60">
                    <Link
                      href={`/ad/${ad.id}`}
                      className="py-2 text-center bg-[#1a202c] hover:bg-gray-800 text-xs font-semibold rounded-lg transition-all"
                    >
                      Просмотр
                    </Link>
                    <Link
                      href={`/edit/${ad.id}`}
                      className="py-2 text-center bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 text-xs font-semibold rounded-lg border border-purple-800/40 transition-all"
                    >
                      Редактировать
                    </Link>
                    <button
                      onClick={() => handleDeleteAd(ad.id)}
                      className="py-2 text-center bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-semibold rounded-lg border border-red-800/40 transition-all cursor-pointer"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}