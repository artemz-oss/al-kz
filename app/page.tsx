'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { KZ_LOCATIONS } from '@/constants/locations';

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Поисковые фильтры
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const categories = ['Услуги', 'Электроника', 'Транспорт', 'Недвижимость', 'Работа'];

  useEffect(() => {
    fetchAds();
  }, [selectedRegion, selectedCity, selectedCategory]);

  async function fetchAds() {
    setLoading(true);
    let query = supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });

    // Фильтрация по региону / городу в базе данных
    if (selectedCity) {
      query = query.ilike('location', `%${selectedCity}%`);
    } else if (selectedRegion) {
      query = query.ilike('location', `%${selectedRegion}%`);
    }

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

  // Дополнительная фильтрация по текстовому запросу
  const filteredAds = ads.filter((ad) =>
    ad.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Получаем список городов для выбранной области
  const availableCities = selectedRegion ? KZ_LOCATIONS[selectedRegion] || [] : [];

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">
      {/* Шапка сайта */}
      <div className="bg-[#121621] border-b border-[#241a36] py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-4">
          
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#9d4edd]">
              AL.KZ
            </h1>
            <Link 
              href="/create" 
              className="bg-[#7b2cbf] hover:bg-[#9d4edd] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-900/20"
            >
              + Подать объявление
            </Link>
          </div>

          {/* Панель поиска и фильтров в стиле OLX */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            
            {/* Текстовый поиск */}
            <input
              type="text"
              placeholder="Что ищете?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1a142b] border border-[#2e2148] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#7b2cbf]"
            />

            {/* Выбор категории */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#1a142b] text-gray-300 border border-[#2e2148] rounded-xl px-3 py-2.5 text-xs outline-none cursor-pointer focus:border-[#7b2cbf]"
            >
              <option value="" className="bg-[#151022]">Все категории</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#151022]">{cat}</option>
              ))}
            </select>

            {/* Выбор области */}
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedCity(''); // Сбрасываем город при смене области
              }}
              className="bg-[#1a142b] text-gray-300 border border-[#2e2148] rounded-xl px-3 py-2.5 text-xs outline-none cursor-pointer focus:border-[#7b2cbf]"
            >
              <ниже value="" className="bg-[#151022]">Вся страна (Казахстан)</option>
              {Object.keys(KZ_LOCATIONS).map((region) => (
                <option key={region} value={region} className="bg-[#151022]">{region}</option>
              ))}
            </select>

            {/* Выбор города (активен только если выбрана область) */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedRegion}
              className="bg-[#1a142b] text-gray-300 border border-[#2e2148] rounded-xl px-3 py-2.5 text-xs outline-none cursor-pointer focus:border-[#7b2cbf] disabled:opacity-50"
            >
              <option value="" className="bg-[#151022]">Все города</option>
              {availableCities.map((city) => (
                <option key={city} value={city} className="bg-[#151022]">{city}</option>
              ))}
            </select>

          </div>

        </div>
      </div>

      {/* Список объявлений */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-lg font-bold mb-4">
          {selectedCity ? `Объявления: ${selectedCity}` : selectedRegion ? `Объявления: ${selectedRegion}` : 'Все объявления Казахстана'}
        </h2>
        
        {loading ? (
          <div className="text-center text-gray-500 py-10 text-sm">Загрузка...</div>
        ) : filteredAds.length === 0 ? (
          <div className="text-center text-gray-500 py-10 bg-[#121621] rounded-2xl border border-[#241a36] text-xs">
            В выбранном регионе пока нет объявлений.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAds.map((ad) => (
              <Link key={ad.id} href={`/ad/${ad.id}`}>
                <div className="bg-[#121621] border border-[#241a36] rounded-2xl overflow-hidden hover:border-[#7b2cbf] transition-colors group cursor-pointer h-full flex flex-col">
                  
                  <div className="h-36 bg-[#1a142b] overflow-hidden relative">
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
                  
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-semibold text-xs line-clamp-2 mb-2 group-hover:text-purple-400 transition-colors">
                      {ad.title}
                    </h3>
                    <div className="mt-auto">
                      <p className="font-bold text-sm text-white mb-1">
                        {ad.price?.toLocaleString()} ₸
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {ad.location || 'Казахстан'}
                      </p>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}