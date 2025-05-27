'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiHome, FiPlus, FiMinus, FiTrash2, FiUser, FiUsers, 
  FiSettings, FiMoon, FiSun, FiShoppingCart, FiCreditCard, 
  FiStar, FiChevronLeft, FiX, FiTruck, FiSearch 
} from 'react-icons/fi';
import { FaBoxOpen } from 'react-icons/fa';

function StockManager({ applianceId, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleStockUpdate = async (operation) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`/api/appliance-details/${applianceId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          quantity: Number(quantity)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update stock');
      }

      setMessage(`Stock ${operation === 'add' ? 'increased' : 'decreased'} successfully!`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Manage Stock</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FiX size={24} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => handleStockUpdate('add')}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                <FiPlus className="mr-1" /> Add
              </button>
              
              <button
                onClick={() => handleStockUpdate('remove')}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                <FiMinus className="mr-1" /> Remove
              </button>
            </div>

            <div>
              <label className="block mb-2 text-gray-700 dark:text-gray-300">Quantity:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {message && (
              <div className={`p-3 rounded ${
                message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Initialize dark mode
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
    if (savedMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Fetch products
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/appliance', {
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        
        const uniqueProducts = data.reduce((acc, product) => {
          if (!acc.find(p => p.id === product.id)) {
            acc.push(product);
          }
          return acc;
        }, []);
        
        setProducts(uniqueProducts);
        setAvailableTypes(['All', ...new Set(uniqueProducts.map(p => p.type))]);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Fetch error:', err);
          setError('Failed to load products. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => filter === 'All' || product.type === filter)
      .filter(product => {
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          (product.type && product.type.toLowerCase().includes(query))
        );
      });
  }, [products, filter, searchQuery]);

  const handleRemoveProduct = async (productId) => {
    if (!confirm('Are you sure you want to remove this product?')) return;

    setDeletingId(productId);
    setError(null);

    try {
      const response = await fetch(`/api/appliance/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to remove product');
      }

      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to remove product');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <nav className="bg-gray-800 dark:bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <FiHome className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">KitchenHub</span>
              </Link>
            </div>

            <div className="hidden md:flex flex-1 mx-4 max-w-md">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FiX className="text-gray-400 hover:text-gray-200" />
                  </button>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/add_product" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors">
                <FiPlus className="mr-2" /> Add Product
              </Link>
              <Link href="/order_management_admin" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors">
                <FiTruck className="mr-2" /> Order Summary
              </Link>
              <Link href="/add_user" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors">
                <FiUsers className="mr-2" /> Manage Users
              </Link>
             
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md hover:bg-gray-700 focus:outline-none transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-700 dark:bg-gray-800">
            <div className="px-4 py-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FiX className="text-gray-400 hover:text-gray-200" />
                  </button>
                )}
              </div>
            </div>

            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                href="/add_product"
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium hover:bg-gray-600 transition-colors"
              >
                <FiPlus className="mr-2" /> Add Product
              </Link>
              <Link 
                href="/order_management_admin"
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium hover:bg-gray-600 transition-colors"
              >
                <FiTruck className="mr-2" /> Order Summary
              </Link>
              <Link 
                href="/add_user"
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium hover:bg-gray-600 transition-colors"
              >
                <FiUsers className="mr-2" /> Manage Users
              </Link>
             
              <button
                onClick={toggleDarkMode}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium hover:bg-gray-600 transition-colors"
              >
                {darkMode ? (
                  <>
                    <FiSun className="mr-2" /> Light Mode
                  </>
                ) : (
                  <>
                    <FiMoon className="mr-2" /> Dark Mode
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Premium Kitchen Appliances
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover the perfect tools for your culinary creations
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="md:hidden w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FiX className="text-gray-400 hover:text-gray-200" />
                  </button>
                )}
              </div>
            </div>

            {availableTypes.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {availableTypes.map(type => (
                  <button
                    key={type}
                    className={`px-4 py-2 rounded-full transition-all duration-200 ${
                      filter === type
                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                    }`}
                    onClick={() => setFilter(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-8 rounded">
              <p>{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                Dismiss
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-600 h-48 w-full"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mt-2"></div>
                    <div className="h-9 bg-gray-200 dark:bg-gray-600 rounded w-full mt-3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col relative group">
                  <div className="absolute top-2 right-2 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveProduct(product.id);
                      }}
                      disabled={deletingId === product.id}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                      title="Remove product"
                    >
                      {deletingId === product.id ? (
                        <span className="animate-spin block w-4 h-4">↻</span>
                      ) : (
                        <FiTrash2 className="h-4 w-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentProductId(product.id);
                        setShowStockModal(true);
                      }}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                      title="Manage stock"
                    >
                      <FaBoxOpen className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <Link href={`/product/${product.id}`} className="flex-grow">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={product.photo_path || '/default-appliance.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false}
                      />
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h2 className="font-semibold text-gray-800 dark:text-white mb-1 line-clamp-1">
                        {product.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">{product.type}</p>
                      <div className="mt-auto">
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ₹{product.price?.toLocaleString('en-IN') || 'N/A'}
                        </p>
                        <button className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 dark:text-white">No products found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Try changing your search or filter criteria</p>
              <div className="mt-4 flex justify-center gap-3">
                <button 
                  onClick={() => setFilter('All')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Show All Products
                </button>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showStockModal && (
        <StockManager 
          applianceId={currentProductId} 
          onClose={() => {
            setShowStockModal(false);
            setCurrentProductId(null);
          }} 
        />
      )}
    </div>
  );
}