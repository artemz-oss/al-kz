'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import KazakhstanMap from '@/components/KazakhstanMap'; // Импортируем нашу новую карту

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Состояния фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  // Категории для примера
  const categories = ['Услуги', 'Электроника', 'Транспорт', 'Недвижимость', 'Работа'];

  useEffect(() => {
    fetchAds();
  }, [selectedRegion, selectedCategory]); // Перезагружаем объявления при смене региона или категории

  async function fetchAds() {
    setLoading(true);
    let query = supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });

    // Если на карте выбрана область — фильтруем по ней
    if (selectedRegion) {
      query = query.ilike('location', `%${selectedRegion}%`);
    }

    // Если выбрана категория
    if (selectedCategory) {
      query = query.eq('category', selectedCategory);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Ошибка загрузки:', error);
    } else if (data) {
      setAds(data);
    }
    
    setLoading(false);
  }

  // Локальный фильтр по текстовому поиску
  const filteredAds = ads.filter((ad) =>
    ad.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">
      {/* Шапка/Поиск */}
      <div className="bg-[#121621] border-b border-[#241a36] py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Заголовок */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#9d4edd]">
              AL.KZ
            </h1>
            <Link 
              href="/create" 
              className="bg-[#7b2cbf] hover:bg-[#9d4edd] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-purple-900/20"
            >
              + Подать объявление
            </Link>
          </div>

          {/* Строка поиска и фильтр категорий */}
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Что ищете?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-[#1a142b] border border-[#2e2148] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7b2cbf] transition-colors"
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#1a142b] border border-[#2e2148] rounded-xl px-4 py-3 text-sm outline-none cursor-pointer focus:border-[#7b2cbf]"
            >
              <option value="">Все категории</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Блок с Интерактивной Картой */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-300">
              {selectedRegion ? `Регион: ${selectedRegion}` : 'Выберите регион на карте'}
            </h2>
            {selectedRegion && (
              <button 
                onClick={() => setSelectedRegion('')}
                className="text-xs text-purple-400 hover:text-purple-300 underline"
              >
                Сбросить регион
              </button>
            )}
          </div>
          
          {/* Вызов компонента карты */}
          <KazakhstanMap 
            selectedRegion={selectedRegion} 
            onSelectRegion={(regionName) => setSelectedRegion(regionName)} 
          />
        </section>

        {/* Сетка объявлений */}
        <section>
          <h2 className="text-xl font-bold mb-6">Новые объявления</h2>
          
          {loading ? (
            <div className="text-center text-gray-500 py-10">Загрузка...</div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-[#121621] rounded-2xl border border-[#241a36]">
              Ничего не найдено в этом регионе или по этому запросу.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAds.map((ad) => (
                <Link key={ad.id} href={`/ad/${ad.id}`}>
                  <div className="bg-[#121621] border border-[#241a36] rounded-2xl overflow-hidden hover:border-[#7b2cbf] transition-colors group cursor-pointer h-full flex flex-col">
                    
                    {/* Картинка (если есть) или заглушка */}
                    <div className="h-40 bg-[#1a142b] overflow-hidden relative">
                      {ad.images && ad.images.length > 0 ? (
                        <img 
                          src={ad.images[0]} 
                          alt={ad.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                          Нет фото
                        </div>
                      )}
                    </div>
                    
                    {/* Информация об объявлении */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-purple-400 transition-colors">
                        {ad.title}
                      </h3>
                      <div className="mt-auto">
                        <p className="font-bold text-lg text-white mb-1">
                          {ad.price?.toLocaleString()} ₸
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {ad.location || 'Весь Казахстан'}
                        </p>
                      </div>
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}