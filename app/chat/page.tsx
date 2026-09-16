'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Send, CheckCheck, ShieldCheck, 
  Search, MoreVertical, Image, Paperclip 
} from 'lucide-react';

// Моковые диалоги
const INITIAL_CHATS = [
  {
    id: '1',
    user: {
      name: 'Арман',
      avatar: 'А',
      online: true,
    },
    ad: {
      title: 'iPhone 13 128GB Black',
      price: '245 000 ₸',
      image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=200&q=80',
    },
    lastMessage: 'Здравствуйте! Торг есть?',
    time: '14:32',
    unread: 0,
    messages: [
      { id: 1, text: 'Здравствуйте! Объявление ещё актуально?', time: '14:25', isMine: true },
      { id: 2, text: 'Добрый день! Да, продаётся.', time: '14:28', isMine: false },
      { id: 3, text: 'Здравствуйте! Торг есть?', time: '14:32', isMine: true },
    ],
  },
  {
    id: '2',
    user: {
      name: 'Нурлан',
      avatar: 'Н',
      online: false,
    },
    ad: {
      title: 'Toyota Camry 50 2014 г.',
      price: '8 900 000 ₸',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=200&q=80',
    },
    lastMessage: 'Где можно посмотреть машину?',
    time: 'Вчера',
    unread: 1,
    messages: [
      { id: 1, text: 'Здравствуйте! Где можно посмотреть машину?', time: '18:10', isMine: false },
    ],
  },
];

export default function ChatPage() {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState('1');
  const [inputText, setInputText] = useState('');

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  // Отправка нового сообщения
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            lastMessage: inputText,
            time: newMessage.time,
            messages: [...chat.messages, newMessage],
          };
        }
        return chat;
      })
    );

    setInputText('');
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-purple-500 selection:text-white overflow-hidden">
      
      {/* Шапка */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl h-16 shrink-0 flex items-center justify-between px-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
          <span className="hidden sm:inline">На главную</span>
        </Link>

        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-500 to-fuchsia-500 flex items-center justify-center font-black text-white text-base">
            AL
          </div>
          <span className="text-lg font-black tracking-widest text-white">AL.KZ</span>
        </Link>

        <div className="w-20" />
      </header>

      {/* Основной интерфейс чата */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto p-4 gap-4">
        
        {/* Левая панель: Список диалогов */}
        <div className="w-full md:w-80 lg:w-96 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-800/80 space-y-3">
            <h1 className="text-lg font-bold text-white">Сообщения</h1>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Поиск по чатам..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full p-4 flex items-start gap-3 text-left transition ${
                  activeChatId === chat.id
                    ? 'bg-purple-950/30 border-l-4 border-purple-500'
                    : 'hover:bg-slate-800/30'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center font-bold text-white text-base">
                    {chat.user.avatar}
                  </div>
                  {chat.user.online && (
                    <span className="w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full absolute -bottom-0.5 -right-0.5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white truncate">{chat.user.name}</span>
                    <span className="text-[10px] text-slate-500 shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-xs text-purple-300 font-medium truncate mt-0.5">{chat.ad.title}</p>
                  <p className="text-xs text-slate-400 truncate mt-1">{chat.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Правая панель: Окно переписки */}
        <div className="hidden md:flex flex-1 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex-col overflow-hidden relative">
          
          {/* Шапка чата */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center font-bold text-white text-base">
                {activeChat.user.avatar}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">{activeChat.user.name}</h2>
                <span className="text-[11px] text-slate-400">
                  {activeChat.user.online ? 'В сети' : 'Был недавно'}
                </span>
              </div>
            </div>

            {/* Карточка товара в шапке */}
            <Link
              href="/ad/1"
              className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2 rounded-xl hover:border-purple-500/50 transition"
            >
              <img src={activeChat.ad.image} alt="" className="w-9 h-9 rounded-lg object-cover" />
              <div className="text-left hidden lg:block">
                <p className="text-xs font-medium text-white max-w-[180px] truncate">{activeChat.ad.title}</p>
                <p className="text-xs font-bold text-purple-400">{activeChat.ad.price}</p>
              </div>
            </Link>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-purple-950/20 border border-purple-500/20 p-3 rounded-xl flex items-center gap-3 text-xs text-purple-300 max-w-md mx-auto my-2">
              <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
              <span>Не сообщайте личные данные и CVV-коды карт в чате во избежание мошенничества.</span>
            </div>

            {activeChat.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                    msg.isMine
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-none shadow-lg shadow-purple-600/20'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 text-[10px] ${msg.isMine ? 'text-purple-200' : 'text-slate-400'}`}>
                    <span>{msg.time}</span>
                    {msg.isMine && <CheckCheck className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Форма ввода */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800/80 bg-slate-900/80 flex items-center gap-2">
            <button type="button" className="p-2 text-slate-400 hover:text-white transition">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Напишите сообщение..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white p-2.5 rounded-xl transition shadow-md shadow-purple-600/30 active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}