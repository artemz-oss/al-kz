'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { KZ_LOCATIONS } from '@/constants/locations';

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Состояния фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Управление модальным окном выбора региона в стиле OLX
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [activeRegionTab, setActiveRegionTab] = useState<string | null>(null);
  const [citySearchInput, setCitySearchInput] = useState('');

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

  const filteredAds = ads.filter((ad) =>
    ad.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Сбор всех городов для текстового поиска в модалке
  const allCitiesWithRegions: { region: string; city: string }[] = [];
  Object.entries(KZ_LOCATIONS).forEach(([reg, cities]) => {
    cities.forEach((city) => {
      allCitiesWithRegions.push({ region: reg, city });
    });
  });

  const matchingCities = citySearchInput.trim()
    ? allCitiesWithRegions.filter(item => 
        item.city.toLowerCase().includes(citySearchInput.toLowerCase()) ||
        item.region.toLowerCase().includes(citySearchInput.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">
      
      {/* Верхняя панель фильтров (без дублирования логотипа) */}
      <div className="bg-[#121621] border-b border-[#241a36] py-5 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Текстовый поиск */}
          <input
            type="text"
            placeholder="Что ищете?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#1a142b] border border-[#2e2148] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7b2cbf]"
          />

          {/* Выбор категории */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#1a142b] text-gray-300 border border-[#2e2148] rounded-xl px-4 py-3 text-sm outline-none cursor-pointer focus:border-[#7b2cbf]"
          >
            <option value="" className="bg-[#151022]">Все категории</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#151022]">{cat}</option>
            ))}
          </select>

          {/* Кнопка открытия выбора города/области в стиле OLX */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="bg-[#1a142b] border border-[#2e2148] hover:border-[#7b2cbf] rounded-xl px-4 py-3 text-sm text-left text-gray-300 flex justify-between items-center transition-colors"
          >
            <span className="truncate">
              {selectedCity ? selectedCity : selectedRegion ? selectedRegion : 'Вся страна (Казахстан)'}
            </span>
            <span className="text-purple-400 text-xs">Изменить ▼</span>
          </button>

        </div>
      </div>

      {/* Список объявлений */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {selectedCity ? `Объявления: ${selectedCity}` : selectedRegion ? `Объявления: ${selectedRegion}` : 'Все объявления Казахстана'}
          </h2>
          {(selectedRegion || selectedCity) && (
            <button
              onClick={() => { setSelectedRegion(''); setSelectedCity(''); }}
              className="text-xs text-purple-400 hover:text-purple-300 underline"
            >
              Сбросить регион
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="text-center text-gray-500 py-10">Загрузка...</div>
        ) : filteredAds.length === 0 ? (
          <div className="text-center text-gray-500 py-10 bg-[#121621] rounded-2xl border border-[#241a36]">
            В выбранном регионе пока нет объявлений.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAds.map((ad) => (
              <Link key={ad.id} href={`/ad/${ad.id}`}>
                <div className="bg-[#121621] border border-[#241a36] rounded-2xl overflow-hidden hover:border-[#7b2cbf] transition-colors group cursor-pointer h-full flex flex-col">
                  
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
                  
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-purple-400 transition-colors">
                      {ad.title}
                    </h3>
                    <div className="mt-auto">
                      <p className="font-bold text-lg text-white mb-1">
                        {ad.price?.toLocaleString()} ₸
                      </p>
                      <p className="text-xs text-gray-400 truncate">
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

      {/* МОДАЛЬНОЕ ОКНО ВЫБОРА РЕГИОНА / ГОРОДА (В стиле OLX) */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121621] border border-[#2e2148] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Шапка модалки */}
            <div className="p-4 border-b border-[#241a36] flex justify-between items-center">
              <h3 className="font-bold text-base">Выберите город или область</h3>
              <button 
                onClick={() => setIsLocationModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Инпут быстрого поиска города */}
            <div className="p-4 border-b border-[#241a36] bg-[#171b29]">
              <input
                type="text"
                placeholder="Введите название города или области..."
                value={citySearchInput}
                onChange={(e) => setCitySearchInput(e.target.value)}
                className="w-full bg-[#1a142b] border border-[#2e2148] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7b2cbf]"
              />
            </div>

            {/* Контент выбора */}
            <div className="p-4 overflow-y-auto flex-1">
              
              {/* Кнопка "Вся страна" */}
              <button
                onClick={() => {
                  setSelectedRegion('');
                  setSelectedCity('');
                  setIsLocationModalOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl mb-2 bg-[#1a142b] hover:bg-[#7b2cbf]/30 text-purple-300 font-semibold text-sm transition-colors"
              >
                🌐 Вся страна (Казахстан)
              </button>

              {/* Если пользователь вводит текст в поиск — выводим подсказки */}
              {citySearchInput.trim() ? (
                <div className="space-y-1 mt-2">
                  <p className="text-xs text-gray-400 px-2 mb-1">Результаты поиска:</p>
                  {matchingCities.length === 0 ? (
                    <div className="text-center text-gray-500 py-6 text-sm">Ничего не найдено</div>
                  ) : (
                    matchingCities.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedRegion(item.region);
                          setSelectedCity(item.city);
                          setIsLocationModalOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-[#1a142b] flex justify-between items-center text-sm transition-colors"
                      >
                        <span>{item.city}</span>
                        <span className="text-xs text-gray-500">{item.region}</span>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                /* Двухуровневый выбор: Сначала области, по клику — города */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  
                  {/* Список областей */}
                  <div className="space-y-1 border-r border-[#241a36] pr-2">
                    <p className="text-xs text-gray-400 px-2 mb-1">Области и города респ. значения:</p>
                    {Object.keys(KZ_LOCATIONS).map((region) => {
                      const isSelectedTab = activeRegionTab === region;
                      return (
                        <button
                          key={region}
                          onClick={() => setActiveRegionTab(region)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between items-center transition-colors ${
                            isSelectedTab ? 'bg-[#7b2cbf] text-white font-semibold' : 'hover:bg-[#1a142b] text-gray-300'
                          }`}
                        >
                          <span className="truncate">{region}</span>
                          <span className="text-[10px]">▶</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Список городов выбранной области */}
                  <div className="space-y-1 pl-1">
                    <p className="text-xs text-gray-400 px-2 mb-1">
                      {activeRegionTab ? `Города (${activeRegionTab}):` : 'Выберите область слева'}
                    </p>
                    
                    {activeRegionTab && (
                      <button
                        onClick={() => {
                          setSelectedRegion(activeRegionTab);
                          setSelectedCity('');
                          setIsLocationModalOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs bg-[#1a142b] hover:bg-[#7b2cbf]/20 text-purple-400 font-semibold mb-1"
                      >
                        Все города региона
                      </button>
                    )}

                    {activeRegionTab && KZ_LOCATIONS[activeRegionTab]?.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedRegion(activeRegionTab);
                          setSelectedCity(city);
                          setIsLocationModalOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[#1a142b] text-gray-300 transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>

                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}