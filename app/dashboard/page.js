'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingBag, FiSearch, FiMoon, FiSun, FiUser, FiLock, FiHome } from 'react-icons/fi';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Check for saved dark mode preference
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
    
    // Apply dark mode class to body
    if (savedMode) {
      document.documentElement.classList.add('dark');
    }

    // Fetch user ID from cookies
    const fetchUserId = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.user?.id) {
          setUserId(data.user.id);
          fetchCartItems(data.user.id);
        }
      } catch (err) {
        console.error('Error fetching user session:', err);
      }
    };

    fetchUserId();

    const fetchProductsAndTypes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/appliance');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove duplicates by ID
        const uniqueProducts = data.reduce((acc, product) => {
          if (!acc.find(p => p.id === product.id)) {
            acc.push(product);
          }
          return acc;
        }, []);
        
        setProducts(uniqueProducts);

        const types = ['All', ...new Set(uniqueProducts.map(product => product.type))];
        setAvailableTypes(types);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsAndTypes();
  }, []);

  const fetchCartItems = async (userId) => {
    try {
      const response = await fetch(`/api/cart?userId=${userId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch cart items');
      const data = await response.json();
      setCartItems(data);
    } catch (err) {
      console.error('Error fetching cart items:', err);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark', newMode);
  };

  const addToCart = async (product) => {
    if (!userId) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applianceId: product.id,
          quantity: 1
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to cart');
      }

      const data = await response.json();
      setCartItems(data);
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert(err.message || 'Failed to add item to cart');
    }
  };

  // Memoized filtered products to prevent unnecessary recalculations
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => filter === 'All' || product.type === filter)
      .filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  }, [products, filter, searchQuery]);

  return (
    <main className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-gray-100'} p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Navigation Bar */}
        <nav className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <FiHome className="text-2xl text-blue-600" />
              <span className="text-xl font-bold text-gray-800 dark:text-white">KitchenHub</span>
            </Link>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search appliances..."
              className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* User Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'} hover:opacity-80 transition-opacity`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
            
            <div className="relative">
              <Link 
                href="/cart" 
                className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <FiShoppingBag className="text-xl" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.reduce((total, item) => total + (item.quantity || 1), 0)}
                  </span>
                )}
              </Link>
            </div>
            
            <div className="relative group">
              <button className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <FiUser className="text-xl" />
              </button>
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                <div className="py-1">
                  <Link href="/user_summary_order" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    My Orders
                  </Link>
                  <Link href="/change_password" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Change Password
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Premium Kitchen Appliances
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Discover the perfect tools for your culinary creations
          </p>
        </div>

        {/* Filter Controls */}
        {availableTypes.length > 0 && (
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-8">
            {availableTypes.map(type => (
              <button
                key={type}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  filter === type
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : darkMode 
                      ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`${darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-4 mb-8 rounded`}>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`rounded-xl shadow-sm overflow-hidden animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} h-48 w-full`}></div>
                <div className="p-4 space-y-3">
                  <div className={`h-5 rounded w-3/4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  <div className={`h-4 rounded w-1/2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  <div className={`h-6 rounded w-1/3 mt-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  <div className={`h-9 rounded w-full mt-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                className={`hover:scale-[1.02] transition-transform duration-300 rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} hover:shadow-md transition-shadow duration-300 h-full flex flex-col`}
              >
                <Link href={`/product/${product.id}`} passHref>
                  <div className="relative h-48 overflow-hidden cursor-pointer">
                    <Image
                      src={product.photo_path || '/default-appliance.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={false}
                    />
                  </div>
                </Link>
                <div className="p-4 flex-grow flex flex-col">
                  <Link href={`/product/${product.id}`} passHref>
                    <h2 className={`font-semibold mb-1 line-clamp-1 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {product.name}
                    </h2>
                  </Link>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{product.type}</p>
                  <div className="mt-auto">
                    <p className="text-lg font-bold text-blue-600">
                      ₹{product.price?.toLocaleString('en-IN') || 'N/A'}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Link 
                        href={`/product/${product.id}`}
                        className="flex-1 py-2 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm"
                      >
                        View Details
                      </Link>
                      <button 
                        onClick={() => addToCart(product)}
                        className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors duration-200 text-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className={`text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>No products found</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Try changing your search or filter criteria</p>
            <div className="mt-4 flex justify-center gap-3">
              <button 
                onClick={() => setFilter('All')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Show All Products
              </button>
              <button 
                onClick={() => setSearchQuery('')}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}