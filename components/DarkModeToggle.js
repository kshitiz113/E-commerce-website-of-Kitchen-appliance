'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  // Initialize theme on first load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Update theme when toggled
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="flex items-center gap-2 p-2 px-4 transition-all duration-300 border-2 border-gray-400 rounded-full shadow-md hover:shadow-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:scale-105"
    >
      {dark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-500" />}
      <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}
