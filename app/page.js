'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FiSun,
  FiMoon,
  FiShoppingBag,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);

  // Load initial theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setDarkMode(true);
    } else if (storedTheme === 'light') {
      setDarkMode(false);
    } else {
      // Fallback to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Apply dark mode class to <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        {/* Header with theme toggle */}
        <header className="w-full flex justify-end mb-8">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition-shadow"
            aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            {darkMode ? (
              <FiSun className="text-yellow-400 text-xl" />
            ) : (
              <FiMoon className="text-gray-700 text-xl" />
            )}
          </button>
        </header>

        {/* Main content */}
        <div className="max-w-2xl w-full text-center space-y-10">
          {/* Hero section */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <FiShoppingBag className="text-4xl text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Welcome to Spargen
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              The future of e-commerce is here. Discover, compare, and purchase with unprecedented ease.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            {[
              { title: 'Smart Search', desc: 'Find exactly what you need with AI-powered search' },
              { title: 'Price Tracking', desc: 'Never overpay with our dynamic pricing alerts' },
              { title: 'Instant Checkout', desc: 'One-click purchasing across all vendors' },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <FiCheckCircle className="text-blue-500 dark:text-blue-400 text-2xl mb-3 mx-auto" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA section */}
          <div className="space-y-4">
            <Link href="/signup" className="block">
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2">
                Start Shopping Now <FiArrowRight />
              </button>
            </Link>

            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Spargen. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Contact Us
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
