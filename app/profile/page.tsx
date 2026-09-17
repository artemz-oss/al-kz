'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Phone, Camera, Save, LogOut, Package, Trash2, Edit3, Eye } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'inactive'>('active');
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    async function initProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
        setPhone(profile.phone || '');
        setAvatarUrl(profile.avatar_url || '');
      } else {
        setFullName(user.email?.split('@')[0] || '');
      }

      const { data: userAds } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userAds) setAds(userAds);
      setLoading(false);
    }

    initProfile();
  }, [router]);

  // Сохранение изменений профиля с отладкой
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingProfile(true);

    const updates = {
      id: currentUser.id,
      full_name: fullName,
      phone: phone,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    console.log('Отправляем данные в Supabase:', updates);

    const { data, error } = await supabase
      .from('profiles')
      .upsert(updates)
      .select();

    if (error) {
      console.error('❌ ОШИБКА SUPABASE:', error.message, error.details, error.hint);
      alert('Ошибка при сохранении: ' + error.message);
    } else {
      console.log('✅ Успешно сохранено:', data);
      alert('Профиль успешно сохранен!');
    }
    setSavingProfile(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      setUploadingAvatar(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      alert('Ошибка загрузки фото: ' + error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) return;

    const { error } = await supabase.from('ads').delete().eq('id', adId);
    if (error) {
      alert('Ошибка при удалении: ' + error.message);
    } else {
      setAds((prev) => prev.filter((ad) => ad.id !== adId));
    }
  };

  const filteredAds = ads.filter(ad => {
    if (activeTab === 'active') return !ad.status || ad.status === 'active';
    if (activeTab === 'pending') return ad.status === 'pending';
    if (activeTab === 'inactive') return ad.status === 'inactive';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] text-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">Загрузка профиля...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← На главную
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.dispatchEvent(new Event('toggle-chat-widget'))}
              className="px-4 py-2 bg-[#1a202c] border border-gray-800 rounded-xl text-xs font-semibold text-white hover:bg-[#252d3d] transition-all cursor-pointer"
            >
              💬 Сообщения
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Выйти
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="bg-[#121621] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-lg font-bold">Настройки профиля</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-purple-600 overflow-hidden flex items-center justify-center font-bold text-3xl uppercase shadow-lg shadow-purple-600/30 border-2 border-purple-500/30">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{fullName?.[0] || currentUser?.email?.[0] || 'A'}</span>
                )}
              </div>
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center cursor-pointer text-xs text-white">
                <Camera className="w-6 h-6 mb-1" />
                <span>{uploadingAvatar ? 'Загрузка...' : 'Изменить'}</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>

            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Ваше имя</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Введите ваше имя"
                    className="w-full bg-[#0a0d14] border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Номер телефона</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (777) 000-00-00"
                    className="w-full bg-[#0a0d14] border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email (нельзя изменить)</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full bg-[#0a0d14]/50 border border-gray-800/60 rounded-xl px-4 py-2 text-xs text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-800/60">
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/20 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {savingProfile ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Мои объявления</h2>
            <Link
              href="/add"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 font-bold text-sm rounded-xl transition-all shadow-lg shadow-purple-600/20"
            >
              + Подать объявление
            </Link>
          </div>

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
              Ожидающие ({ads.filter(a => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                activeTab === 'inactive' 
                  ? 'text-purple-400 border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Неактивные ({ads.filter(a => a.status === 'inactive').length})
            </button>
          </div>

          {filteredAds.length === 0 ? (
            <div className="bg-[#121621] border border-gray-800 rounded-2xl p-10 text-center space-y-3">
              <Package className="w-10 h-10 mx-auto text-gray-600" />
              <p className="text-sm text-gray-400">У вас пока нет объявлений в этой категории</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAds.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-[#121621] border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gray-700 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#0a0d14] rounded-xl overflow-hidden shrink-0 border border-gray-800">
                      <img
                        src={ad.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">
                        {ad.category}
                      </span>
                      <Link href={`/ad/${ad.id}`} className="block text-sm font-bold text-white hover:text-purple-400 transition-colors truncate max-w-xs md:max-w-md">
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

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-800">
                    <Link
                      href={`/ad/${ad.id}`}
                      className="px-3 py-1.5 bg-[#1a202c] hover:bg-gray-800 text-xs font-semibold rounded-lg text-gray-300 flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Просмотр
                    </Link>
                    <Link
                      href={`/edit/${ad.id}`}
                      className="px-3 py-1.5 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 text-xs font-semibold rounded-lg border border-purple-800/40 flex items-center gap-1.5 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Изменить
                    </Link>
                    <button
                      onClick={() => handleDeleteAd(ad.id)}
                      className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-semibold rounded-lg border border-red-800/40 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}