'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function MyAdsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'inactive'>('active');
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserAds() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setAds(data);
      setLoading(false);
    }

    fetchUserAds();
  }, []);

  // Фильтрация по статусам (по умолчанию все попадают в 'active', если нет поля status)
  const filteredAds = ads.filter(ad => {
    if (activeTab === 'active') return !ad.status || ad.status === 'active';
    if (activeTab === 'pending') return ad.status === 'pending';
    if (activeTab === 'inactive') return ad.status === 'inactive';
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-black text-white">Ваши объявления</h1>

      {/* Вкладки как на OLX */}
      <div className="flex border-b border-gray-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === 'active' 
              ? 'text-purple-400 border-b-2 border-purple-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Активные ({ads.filter(a => !a.status || a.status === 'active').length})
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === 'pending' 
              ? 'text-purple-400 border-b-2 border-purple-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Ожидающие (0)
        </button>

        <button
          onClick={() => setActiveTab('inactive')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === 'inactive' 
              ? 'text-purple-400 border-b-2 border-purple-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Неактивные (0)
        </button>
      </div>

      {/* Список объявлений */}
      {loading ? (
        <div className="text-gray-500 text-xs py-10 text-center">Загрузка ваших объявлений...</div>
      ) : filteredAds.length === 0 ? (
        <div className="bg-[#121621] border border-gray-800 rounded-2xl p-10 text-center space-y-3">
          <div className="text-4xl">📦</div>
          <p className="text-sm text-gray-400">У вас пока нет объявлений в этой категории</p>
          <Link
            href="/create"
            className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            + Подать объявление
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAds.map((ad) => (
            <div
              key={ad.id}
              className="bg-[#121621] border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gray-700 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#0a0d14] rounded-xl overflow-hidden flex-shrink-0 border border-gray-800">
                  <img
                    src={ad.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <Link href={`/ad/${ad.id}`} className="text-sm font-bold text-white hover:text-purple-400 transition-colors">
                    {ad.title}
                  </Link>
                  <div className="text-purple-400 font-black text-sm mt-0.5">
                    {Number(ad.price).toLocaleString()} ₸
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    Опубликовано: {new Date(ad.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>

              {/* Управление */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <Link
                  href={`/ad/${ad.id}`}
                  className="px-3 py-1.5 bg-[#1a202c] hover:bg-[#252d3d] border border-gray-700 rounded-lg text-xs font-medium text-gray-300"
                >
                  Просмотреть
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}