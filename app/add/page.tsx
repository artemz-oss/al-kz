'use client';

import React, { useState } from 'react';
import { Camera, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';

const CITIES = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Тараз', 'Павлодар'];
const CATEGORIES = ['Автотранспорт', 'Недвижимость', 'Электроника', 'Услуги и сервис', 'Интерьер и дом', 'Стиль и гардероб'];

export default function AddListingPage() {
  const [images, setImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    price: '',
    city: CITIES[0],
    description: '',
    phone: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 font-sans">
        <div className="bg-slate-900/90 border border-purple-500/30 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 text-purple-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Объявление опубликовано!</h2>
          <p className="text-slate-400 text-sm mb-6">
            Ваш лот «{formData.title}» успешно размещен на AL.KZ.
          </p>
          <Link
            href="/"
            className="block w-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-purple-600/30"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-purple-500 selection:text-white">
      {/* Шапка */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium">
            <ArrowLeft className="w-4 h-4 text-purple-400" />
            <span>На главную</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/25 font-black text-white text-lg">
              AL
            </div>
            <span className="text-xl font-black tracking-widest text-white">AL.KZ</span>
          </div>
        </div>
      </header>

      {/* Форма */}
      <main className="max-w-3xl mx-auto px-6 pt-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>Новый лот</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-8">Создание объявления</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Фотографии */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/80">
            <label className="block font-semibold text-white mb-1">Фотографии (до 8 штук)</label>
            <p className="text-xs text-slate-500 mb-4">Первое фото станет обложкой карточки</p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {images.map((src, index) => (
                <div key={index} className="h-28 rounded-xl overflow-hidden border border-slate-700 relative">
                  <img src={src} alt="Upload" className="w-full h-full object-cover" />
                </div>
              ))}

              {images.length < 8 && (
                <label className="h-28 rounded-xl border border-dashed border-slate-700 hover:border-purple-500 bg-slate-900/40 hover:bg-slate-900 transition cursor-pointer flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-purple-300 group">
                  <Camera className="w-5 h-5 group-hover:scale-110 transition duration-200" />
                  <span className="text-xs font-medium">Добавить</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Основные детали */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/80 space-y-5">
            <div>
              <label className="block font-semibold text-xs text-slate-300 mb-2 uppercase tracking-wider">Название лота*</label>
              <input
                type="text"
                required
                placeholder="Например: Игровой ноутбук ASUS ROG Strix"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500 transition text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-xs text-slate-300 mb-2 uppercase tracking-wider">Категория*</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 outline-none focus:border-purple-500 transition text-sm cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-slate-200">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-xs text-slate-300 mb-2 uppercase tracking-wider">Цена (₸)*</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500 transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-xs text-slate-300 mb-2 uppercase tracking-wider">Город*</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 outline-none focus:border-purple-500 transition text-sm cursor-pointer"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city} className="bg-slate-900 text-slate-200">{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-xs text-slate-300 mb-2 uppercase tracking-wider">Описание*</label>
              <textarea
                rows={5}
                required
                placeholder="Подробно опишите состояние, характеристики и особенности..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500 transition text-sm resize-none"
              />
            </div>
          </div>

          {/* Контакты */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/80">
            <label className="block font-semibold text-xs text-slate-300 mb-2 uppercase tracking-wider">Контактный телефон*</label>
            <input
              type="tel"
              required
              placeholder="+7 (707) 000-00-00"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500 transition text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-purple-600/30 text-base active:scale-[0.99]"
          >
            Опубликовать объявление
          </button>
        </form>
      </main>
    </div>
  );
}