'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { KZ_LOCATIONS } from '@/constants/locations';
import { KZ_CATEGORIES } from '@/constants/categories';

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Состояния фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Состояния модалок
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [activeRegionTab, setActiveRegionTab] = useState<string | null>(null);
  const [citySearchInput, setCitySearchInput] = useState('');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string | null>(null);

  useEffect(() => {
    fetchAds();
  }, [selectedRegion, selectedCity, selectedCategory, selectedSubcategory]);

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

    if (selectedSubcategory) {
      query = query.eq('category', selectedSubcategory);
    } else if (selectedCategory) {
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

  // Поиск городов для модалки
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
      
      {/* Верхняя панель фильтров */}
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

          {/* Кнопка открытия выбора Категорий */}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-[#1a142b] border border-[#2e2148] hover:border-[#7b2cbf] rounded-xl px-4 py-3 text-sm text-left text-gray-300 flex justify-between items-center transition-colors"
          >
            <span className="truncate">
              {selectedSubcategory ? selectedSubcategory : selectedCategory ? selectedCategory : 'Все категории'}
            </span>
            <span className="text-purple-400 text-xs">Выбрать ▼</span>
          </button>

          {/* Кнопка открытия выбора Региона */}
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
            {selectedSubcategory || selectedCategory || 'Все объявления'} {selectedCity ? `(${selectedCity})` : selectedRegion ? `(${selectedRegion})` : ''}
          </h2>
          {(selectedRegion || selectedCity || selectedCategory || selectedSubcategory) && (
            <button
              onClick={() => { setSelectedRegion(''); setSelectedCity(''); setSelectedCategory(''); setSelectedSubcategory(''); }}
              className="text-xs text-purple-400 hover:text-purple-300 underline"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="text-center text-gray-500 py-10">Загрузка...</div>
        ) : filteredAds.length === 0 ? (
          <div className="text-center text-gray-500 py-10 bg-[#121621] rounded-2xl border border-[#241a36]">
            По вашему запросу ничего не найдено.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAds.map((ad) => (
              <Link key={ad.id} href={`/ad/${ad.id}`}>
                <div className="bg-[#121621] border border-[#241a36] rounded-2xl overflow-hidden hover:border-[#7b2cbf] transition-colors group cursor-pointer h-full flex flex-col">
                  <div className="h-40 bg-[#1a142b] overflow-hidden relative">
                    {ad.images && ad.images.length > 0 ? (
                      <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Нет фото</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-purple-400 transition-colors">{ad.title}</h3>
                    <div className="mt-auto">
                      <p className="font-bold text-lg text-white mb-1">{ad.price?.toLocaleString()} ₸</p>
                      <p className="text-xs text-gray-400 truncate">{ad.location || 'Казахстан'}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* МОДАЛЬНОЕ ОКНО КАТЕГОРИЙ (В стиле OLX) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121621] border border-[#2e2148] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#241a36] flex justify-between items-center">
              <h3 className="font-bold text-base">Выберите категорию</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-white text-lg font-bold px-2">✕</button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <button
                onClick={() => { setSelectedCategory(''); setSelectedSubcategory(''); setIsCategoryModalOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-xl mb-2 bg-[#1a142b] hover:bg-[#7b2cbf]/30 text-purple-300 font-semibold text-sm transition-colors"
              >
                📂 Все категории
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {/* Список главных категорий */}
                <div className="space-y-1 border-r border-[#241a36] pr-2">
                  <p className="text-xs text-gray-400 px-2 mb-1">Разделы:</p>
                  {KZ_CATEGORIES.map((cat) => {
                    const isSelectedTab = activeCategoryTab === cat.name;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategoryTab(cat.name)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between items-center transition-colors ${
                          isSelectedTab ? 'bg-[#7b2cbf] text-white font-semibold' : 'hover:bg-[#1a142b] text-gray-300'
                        }`}
                      >
                        <span className="truncate">{cat.icon} {cat.name}</span>
                        <span className="text-[10px]">▶</span>
                      </button>
                    );
                  })}
                </div>

                {/* Подкатегории выбранного раздела */}
                <div className="space-y-1 pl-1">
                  <p className="text-xs text-gray-400 px-2 mb-1">
                    {activeCategoryTab ? `Подкатегории (${activeCategoryTab}):` : 'Выберите раздел слева'}
                  </p>
                  
                  {activeCategoryTab && (
                    <button
                      onClick={() => {
                        setSelectedCategory(activeCategoryTab);
                        setSelectedSubcategory('');
                        setIsCategoryModalOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs bg-[#1a142b] hover:bg-[#7b2cbf]/20 text-purple-400 font-semibold mb-1"
                    >
                      Все в разделе «{activeCategoryTab}»
                    </button>
                  )}

                  {activeCategoryTab && KZ_CATEGORIES.find(c => c.name === activeCategoryTab)?.subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        setSelectedCategory(activeCategoryTab);
                        setSelectedSubcategory(sub);
                        setIsCategoryModalOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[#1a142b] text-gray-300 transition-colors"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО РЕГИОНОВ */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121621] border border-[#2e2148] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#241a36] flex justify-between items-center">
              <h3 className="font-bold text-base">Выберите город или область</h3>
              <button onClick={() => setIsLocationModalOpen(false)} className="text-gray-400 hover:text-white text-lg font-bold px-2">✕</button>
            </div>

            <div className="p-4 border-b border-[#241a36] bg-[#171b29]">
              <input
                type="text"
                placeholder="Введите название города или области..."
                value={citySearchInput}
                onChange={(e) => setCitySearchInput(e.target.value)}
                className="w-full bg-[#1a142b] border border-[#2e2148] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7b2cbf]"
              />
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <button
                onClick={() => { setSelectedRegion(''); setSelectedCity(''); setIsLocationModalOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-xl mb-2 bg-[#1a142b] hover:bg-[#7b2cbf]/30 text-purple-300 font-semibold text-sm transition-colors"
              >
                🌐 Вся страна (Казахстан)
              </button>

              {citySearchInput.trim() ? (
                <div className="space-y-1 mt-2">
                  <p className="text-xs text-gray-400 px-2 mb-1">Результаты поиска:</p>
                  {matchingCities.length === 0 ? (
                    <div className="text-center text-gray-500 py-6 text-sm">Ничего не найдено</div>
                  ) : (
                    matchingCities.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setSelectedRegion(item.region); setSelectedCity(item.city); setIsLocationModalOpen(false); }}
                        className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-[#1a142b] flex justify-between items-center text-sm transition-colors"
                      >
                        <span>{item.city}</span>
                        <span className="text-xs text-gray-500">{item.region}</span>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="space-y-1 border-r border-[#241a36] pr-2">
                    <p className="text-xs text-gray-400 px-2 mb-1">Области:</p>
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

                  <div className="space-y-1 pl-1">
                    <p className="text-xs text-gray-400 px-2 mb-1">
                      {activeRegionTab ? `Города (${activeRegionTab}):` : 'Выберите область слева'}
                    </p>
                    {activeRegionTab && (
                      <button
                        onClick={() => { setSelectedRegion(activeRegionTab); setSelectedCity(''); setIsLocationModalOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs bg-[#1a142b] hover:bg-[#7b2cbf]/20 text-purple-400 font-semibold mb-1"
                      >
                        Все города региона
                      </button>
                    )}
                    {activeRegionTab && KZ_LOCATIONS[activeRegionTab]?.map((city) => (
                      <button
                        key={city}
                        onClick={() => { setSelectedRegion(activeRegionTab); setSelectedCity(city); setIsLocationModalOpen(false); }}
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