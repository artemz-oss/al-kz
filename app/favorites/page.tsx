'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Trash2, ShoppingBag } from 'lucide-react';

// Те же моковые данные для сопоставления по ID
const ALL_ADS = [
  {
    id: 1,
    title: 'iPhone 13 128GB Black, состояние идеальное',
    price: 245000,
    currency: '₸',
    city: 'Алматы',
    category: 'electronics',
    isTop: true,
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&q=80',
    date: 'Сегодня, 14:20',
  },
  {
    id: 2,
    title: 'Toyota Camry 50 2014 г., 2.5л, европеец',
    price: 8900000,
    currency: '₸',
    city: 'Астана',
    category: 'auto',
    isTop: true,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80',
    date: 'Вчера, 18:45',
  },
  {
    id: 3,
    title: '2-комнатная квартира, 65 м², 4/9 этаж',
    price: 32000000,
    currency: '₸',
    city: 'Алматы',
    category: 'realty',
    isTop: false,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
    date: 'Сегодня, 09:15',
  },
  {
    id: 4,
    title: 'Ремонт бытовой техники и кондиционеров',
    price: 5000,
    currency: '₸',
    city: 'Алматы',
    category: 'services',
    isTop: false,
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=80',
    date: 'Сегодня, 11:30',
  },
];

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Считываем сохраненные закладки из localStorage при монтировании
  useEffect(() => {
    const saved = localStorage.getItem('alkz_favorites');
    if (saved) {
      try {
        setFavoriteIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Удаление из избранного
  const removeFavorite = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = favoriteIds.filter((favId) => favId !== id);
    setFavoriteIds(updated);
    localStorage.setItem('alkz_favorites', JSON.stringify(updated));
  };

  // Очистить все
  const clearAll = () => {
    setFavoriteIds([]);
    localStorage.removeItem('alkz_favorites');
  };

  // Фильтруем список объявлений по сохраненным ID
  const favoriteAds = ALL_ADS.filter((ad) => favoriteIds.includes(ad.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      {/* Шапка */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            <span>На главную</span>
          </Link>

          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-500 to-fuchsia-500 flex items-center justify-center font-black text-white text-lg">
              AL
            </div>
            <span className="text-xl font-black tracking-widest text-white">AL.KZ</span>
          </Link>

          <div className="w-20" /> {/* Заглушка для выравнивания по центру */}
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-6 pt-10 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
              <Heart className="w-6 h-6 fill-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Избранные объявления</h1>
              <p className="text-xs text-slate-400 mt-1">
                Сохранённые карточки хранятся в вашем браузере
              </p>
            </div>
          </div>

          {favoriteAds.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 transition px-3 py-2 rounded-xl bg-rose-950/30 border border-rose-500/20 hover:border-rose-500/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Очистить всё</span>
            </button>
          )}
        </div>

        {/* Проверка состояния */}
        {!isLoaded ? (
          <div className="py-20 text-center text-slate-500 text-sm">Загрузка...</div>
        ) : favoriteAds.length === 0 ? (
          /* Пустое состояние */
          <div className="py-20 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800/50">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">У вас пока нет сохранённых объявлений</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Нажмите на иконку сердечка на любом объявлении, чтобы добавить его в закладки и вернуться к нему позже.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl transition text-sm shadow-lg shadow-purple-600/30"
              >
                Перейти к объявлениям
              </Link>
            </div>
          </div>
        ) : (
          /* Сетка сохраненных товаров */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteAds.map((ad) => (
              <Link
                key={ad.id}
                href={`/ad/${ad.id}`}
                className="bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden hover:border-purple-500/50 transition duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 w-full bg-slate-950 relative overflow-hidden">
                    <img
                      src={ad.image}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <button
                      onClick={(e) => removeFavorite(e, ad.id)}
                      title="Удалить из закладок"
                      className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/70 backdrop-blur-md text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 transition border border-rose-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-lg font-black text-white">
                      {ad.price.toLocaleString('ru-RU')} <span className="text-purple-400 font-normal">{ad.currency}</span>
                    </div>
                    <h3 className="text-sm font-medium text-slate-200 line-clamp-2 group-hover:text-purple-300 transition">
                      {ad.title}
                    </h3>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/40 mt-3">
                  <span>{ad.city}</span>
                  <span>{ad.date}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}