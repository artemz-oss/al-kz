'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AdDetailPage() {
  const { id } = useParams();
  const [ad, setAd] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    async function loadAdData() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (!id) return;

      // Загрузка объявления
      const { data: adData } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .single();

      if (adData) {
        setAd(adData);
        if (adData.images && adData.images.length > 0) {
          setActiveImage(adData.images[0]);
        }

        // Загрузка данных продавца
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', adData.user_id)
          .maybeSingle();

        setSeller(profileData);
      }
      setLoading(false);
    }

    loadAdData();
  }, [id]);

  const handleOpenChat = () => {
    if (!currentUser) {
      alert('Пожалуйста, авторизуйтесь, чтобы написать продавцу.');
      return;
    }
    window.dispatchEvent(
      new CustomEvent('open-chat-ad', { detail: { adId: ad.id } })
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400 text-sm">
        Загрузка объявления...
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-white mb-2">Объявление не найдено</h2>
        <Link href="/" className="text-purple-400 hover:underline text-sm">
          ← Вернуться на главную
        </Link>
      </div>
    );
  }

  const isOwner = currentUser?.id === ad.user_id;

  return (
    <div className="space-y-6">
      {/* Крошки / Хлебные крошки */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/" className="hover:text-white transition-colors">Главная</Link>
        <span>/</span>
        <span className="text-gray-200 truncate">{ad.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Левая колонка: Фото и Описание */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Галерея изображений */}
          <div className="bg-[#121621] border border-gray-800 rounded-2xl p-4 overflow-hidden">
            <div className="w-full h-80 md:h-[420px] bg-[#0a0d14] rounded-xl overflow-hidden flex items-center justify-center mb-4">
              <img
                src={activeImage || ad.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'}
                alt={ad.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Превью дополнительных фото */}
            {ad.images && ad.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {ad.images.map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImage === imgUrl ? 'border-purple-500 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Блок описания и характеристик */}
          <div className="bg-[#121621] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3">
              Описание
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {ad.description || 'Продавец не предоставил подробного описания.'}
            </p>

            <div className="pt-4 border-t border-gray-800/60 grid grid-cols-2 gap-4 text-xs text-gray-400">
              <div>
                <span className="block text-gray-500">Опубликовано</span>
                <span className="text-gray-200 font-medium">
                  {new Date(ad.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div>
                <span className="block text-gray-500">Местоположение</span>
                <span className="text-gray-200 font-medium">{ad.city || 'Казахстан'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Правая колонка: Цена, Контакты и Продавец */}
        <div className="space-y-6">
          
          <div className="bg-[#121621] border border-gray-800 rounded-2xl p-6 space-y-5 sticky top-20">
            <div>
              <h1 className="text-xl font-bold text-white mb-2">{ad.title}</h1>
              <div className="text-3xl font-black text-purple-400">
                {Number(ad.price).toLocaleString()} ₸
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="space-y-3 pt-2">
              {isOwner ? (
                <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-center text-xs text-gray-400 font-medium">
                  Это ваше объявление
                </div>
              ) : (
                <>
                  <button
                    onClick={handleOpenChat}
                    className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    💬 Написать продавцу
                  </button>

                  <button
                    onClick={() => setShowPhone(!showPhone)}
                    className="w-full py-3.5 bg-[#1a202c] hover:bg-[#252d3d] border border-gray-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    📞 {showPhone ? (seller?.phone || '+7 (708) xxx-xx-xx') : 'Показать телефон'}
                  </button>
                </>
              )}
            </div>

            {/* Карточка продавца */}
            <div className="pt-5 border-t border-gray-800 space-y-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Продавец</span>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-purple-600/20 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-400 font-bold text-base">
                  {(seller?.full_name || seller?.email || 'П')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white truncate">
                    {seller?.full_name || seller?.email || 'Частное лицо'}
                  </div>
                  <div className="text-xs text-gray-400">
                    На AL.KZ с {seller?.created_at ? new Date(seller.created_at).getFullYear() : '2026'} г.
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}