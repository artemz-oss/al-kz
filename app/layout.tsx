'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget';
import { supabase } from '@/lib/supabase';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      authListener.subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    window.location.href = '/';
  };

  return (
    <html lang="ru">
      <body className="bg-[#0d0b14] text-gray-100 min-h-screen flex flex-col antialiased">
        
        {/* Аметистовая шапка сайта */}
        <header className="w-full border-b border-[#241a36] bg-[#151022]/90 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-3.5 flex justify-between items-center shadow-lg shadow-[#0d0b14]/50">
          
          {/* Логотип AL.KZ */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#9d4edd] to-[#7b2cbf] text-white rounded-xl font-black text-sm flex items-center justify-center tracking-tight shadow-md shadow-[#9d4edd]/20 group-hover:scale-105 transition-all flex-shrink-0">
              AL
            </div>
            <span className="text-xl font-black tracking-wide text-white group-hover:text-[#c77dff] transition-colors">
              AL.KZ
            </span>
          </Link>

          {/* Навигация и профиль */}
          <div className="flex items-center gap-3 md:gap-4">
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 bg-[#1f1733] hover:bg-[#2a1f45] border border-[#342456] px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold text-gray-200 transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 bg-[#7b2cbf]/40 border border-[#9d4edd]/60 rounded-full flex items-center justify-center text-[#e0aaff] font-bold text-xs">
                    {(user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span>Ваш профиль</span>
                  <span className="text-gray-400 text-[10px]">{dropdownOpen ? '▲' : '▼'}</span>
                </button>

                {/* Выпадашка меню в стиле OLX */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-[#151022] border border-[#342456] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-[#241a36]">
                      <div className="text-[11px] text-gray-400">ID пользователя</div>
                      <div className="text-xs font-mono text-[#c77dff] truncate">{user.id}</div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-[#2a1f45] hover:text-[#e0aaff] transition-colors"
                      >
                        👤 Ваш профиль
                      </Link>
                      <Link
                        href="/profile/my-ads"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-[#2a1f45] hover:text-[#e0aaff] transition-colors"
                      >
                        📦 Объявления
                      </Link>
                      <Link
                        href="/profile/chats"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-[#2a1f45] hover:text-[#e0aaff] transition-colors"
                      >
                        💬 Чат
                      </Link>
                      <Link
                        href="/profile/favorites"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-[#2a1f45] hover:text-[#e0aaff] transition-colors"
                      >
                        ⭐ Избранные
                      </Link>
                    </div>

                    <div className="border-t border-[#241a36] pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        🚪 Выйти
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="text-xs md:text-sm font-semibold text-gray-300 hover:text-white transition-colors"
              >
                Войти
              </Link>
            )}

            <Link 
              href="/create" 
              className="px-4 py-2 bg-[#7b2cbf] hover:bg-[#9d4edd] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#7b2cbf]/30 active:scale-95"
            >
              + Подать объявление
            </Link>
          </div>
        </header>

        {/* Контент */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
          {children}
        </main>

        <ChatWidget />
      </body>
    </html>
  );
}