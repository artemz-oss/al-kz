'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        alert('Регистрация прошла успешно! Теперь вы можете войти.');
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-[#151022] border border-[#241a36] rounded-3xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white">
          {isSignUp ? 'Регистрация в AL.KZ' : 'Вход в аккаунт'}
        </h1>
        <p className="text-xs text-gray-400">
          {isSignUp
            ? 'Создайте профиль, чтобы публиковать объявления'
            : 'Введите данные для входа в ваш личный кабинет'}
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            className="w-full bg-[#1f1733] border border-[#342456] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#7b2cbf] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Пароль
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-[#1f1733] border border-[#342456] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#7b2cbf] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#7b2cbf] hover:bg-[#9d4edd] text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-[#7b2cbf]/30 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Загрузка...' : isSignUp ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </form>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-xs text-gray-400 hover:text-[#c77dff] transition-colors cursor-pointer"
        >
          {isSignUp
            ? 'Уже есть аккаунт? Войти'
            : 'Нет аккаунта? Зарегистрироваться'}
        </button>
      </div>
    </div>
  );
}