'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = ['Электроника', 'Авто', 'Недвижимость', 'Услуги', 'Одежда', 'Работа'];
const CITIES = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Талдыкорган'];

export default function CreateAdPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [city, setCity] = useState(CITIES[0]);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    }
    checkUser();
  }, [router]);

  // Загрузка файла в Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 1. Загружаем файл в Storage
      const { error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Получаем публичную ссылку на загруженный файл
      const { data: publicUrlData } = supabase.storage
        .from('ad-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrlData.publicUrl);
    } catch (error: any) {
      alert('Ошибка при загрузке изображения: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const defaultImage = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';

    const { error } = await supabase.from('ads').insert([
      {
        title,
        category,
        city,
        price: Number(price),
        description,
        images: [imageUrl || defaultImage],
        user_id: user.id,
      },
    ]);

    setLoading(false);

    if (error) {
      alert('Ошибка при создании: ' + error.message);
    } else {
      router.push('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
          ← На главную
        </Link>

        <div className="bg-[#121621] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h1 className="text-2xl font-bold">Новое объявление</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Название объявления
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Игровой ноутбук Asus ROG"
                className="w-full bg-[#1a202c] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Категория
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#1a202c] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Город
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#1a202c] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Цена (₸)
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50000"
                className="w-full bg-[#1a202c] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Загрузка фото */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Фотография товара
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 file:cursor-pointer cursor-pointer border border-gray-800 rounded-xl p-1 bg-[#1a202c]"
              />
              {uploading && <p className="text-xs text-purple-400 mt-2">Загрузка картинки...</p>}
              {imageUrl && (
                <div className="mt-3 w-32 h-32 rounded-xl overflow-hidden border border-gray-800 relative">
                  <img src={imageUrl} alt="Превью" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Описание
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Подробно опишите ваш товар..."
                className="w-full bg-[#1a202c] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50"
            >
              {loading ? 'Публикация...' : 'Опубликовать объявление'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}