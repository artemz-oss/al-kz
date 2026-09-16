'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    async function fetchAds() {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAds(data);
      }
      setLoading(false);
    }

    fetchAds();
  }, []);

  const categories = [
    { id: 'all', name: 'Все' },
    { id: 'electronics', name: 'Электроника' },
    { id: 'auto', name: 'Авто' },
    { id: 'realestate', name: 'Недвижимость' },
    { id: 'services', name: 'Услуги' },
    { id: 'clothes', name: 'Одежда' },
    { id: 'jobs', name: 'Работа' },
  ];

  const filteredAds = ads.filter((ad) => {
    const matchesSearch = ad.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ad.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full space-y-10 mt-2">
      {/* Баннер поиска */}
      <section className="text-center py-12 md:py-16 bg-[#151022] rounded-3xl border border-[#241a36] shadow-xl relative overflow-hidden px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#9d4edd] opacity-20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Находите нужное.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9d4edd] to-[#c77dff]">
              Продавайте быстрее.
            </span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Современная экосистема объявлений
          </p>

          {/* Поиск */}
          <div className="flex flex-col md:flex-row gap-2 bg-[#1f1733] p-2 rounded-2xl border border-[#342456] shadow-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск объявлений (например, Ноутбук, Авто)..."
              className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 text-sm placeholder-gray-500"
            />
            <div className="hidden md:block w-[1px] bg-[#342456] my-2"></div>
            <select className="bg-[#151022] md:bg-transparent border border-[#342456] md:border-none rounded-xl text-gray-300 px-4 py-3 text-sm cursor-pointer outline-none">
              <option value="all">Казахстан (Все)</option>
              <option value="almaty">Алматы</option>
              <option value="astana">Астана</option>
            </select>
            <button className="bg-[#7b2cbf] hover:bg-[#9d4edd] text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-[#7b2cbf]/30">
              Найти
            </button>
          </div>

          {/* Категории */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#7b2cbf] text-white shadow-md shadow-[#7b2cbf]/30'
                    : 'bg-[#1f1733] text-gray-400 hover:text-white border border-[#342456]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Сетка объявлений */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-white">Свежие объявления</h2>
          <span className="text-xs text-gray-400">Найдено: {filteredAds.length}</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            Загрузка объявлений...
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="bg-[#151022] border border-[#241a36] rounded-2xl p-12 text-center space-y-3">
            <div className="text-4xl">🔍</div>
            <p className="text-sm text-gray-400">Объявлений пока нет</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAds.map((ad) => (
              <Link
                key={ad.id}
                href={`/ad/${ad.id}`}
                className="group bg-[#151022] border border-[#241a36] hover:border-[#7b2cbf]/50 rounded-2xl p-3.5 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-lg"
              >
                <div className="space-y-3">
                  <div className="w-full h-44 bg-[#0d0b14] rounded-xl overflow-hidden border border-[#241a36] relative">
                    <img
                      src={
                        ad.images?.[0] ||
                        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80'
                      }
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {ad.category && (
                      <span className="absolute top-2 left-2 bg-[#151022]/80 backdrop-blur-md text-[10px] text-gray-300 px-2.5 py-1 rounded-lg border border-[#342456]">
                        {ad.category}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-200 line-clamp-2 group-hover:text-[#c77dff] transition-colors">
                      {ad.title}
                    </h3>
                    <div className="text-base font-black text-[#c77dff] mt-1">
                      {Number(ad.price).toLocaleString()} ₸
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 pt-3 border-t border-[#241a36] mt-3 flex justify-between items-center">
                  <span>{ad.location || 'Алматы'}</span>
                  <span>
                    {ad.created_at
                      ? new Date(ad.created_at).toLocaleDateString('ru-RU')
                      : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}