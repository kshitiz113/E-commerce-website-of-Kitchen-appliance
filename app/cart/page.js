'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiTrash2, FiMinus,FiSun,FiMoon, FiPlus, FiShoppingCart, FiArrowLeft } from 'react-icons/fi';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for saved dark mode preference
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
    if (savedMode) {
      document.documentElement.classList.add('dark');
    }

    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch session');
        
        const data = await response.json();
        setUser(data.user);
        
        if (data.user) {
          fetchCartItems(data.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark', newMode);
  };

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
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to update quantity');
      const data = await response.json();
      setCartItems(data);
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to remove item');
      const data = await response.json();
      setCartItems(data);
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md text-center p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
          <FiShoppingCart className="mx-auto text-5xl text-gray-400 dark:text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Your Cart is Empty</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">Please login to view your cart items</p>
          <Link href="/login" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md text-center p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
          <FiShoppingCart className="mx-auto text-5xl text-gray-400 dark:text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Your Cart is Empty</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">Looks like you haven't added any items yet</p>
          <Link href="/" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2">
            <FiArrowLeft /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Your Shopping Cart</h1>
        <button 
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'} hover:opacity-80 transition-opacity`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-xl shadow-sm overflow-hidden bg-white dark:bg-gray-800">
            {cartItems.map(item => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="relative w-full sm:w-40 h-40 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={item.photo_path || '/default-appliance.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">{item.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400">{item.type}</p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                    >
                      <FiTrash2 className="text-xl" />
                    </button>
                  </div>
                  
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                  
                  <div className="mt-4 flex items-center">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className={`p-2 rounded-full ${item.quantity <= 1 ? 'text-gray-300 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'} transition-colors`}
                      disabled={item.quantity <= 1}
                    >
                      <FiMinus />
                    </button>
                    
                    <span className="mx-4 w-8 text-center text-lg font-medium text-gray-800 dark:text-white">
                      {item.quantity}
                    </span>
                    
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="rounded-xl shadow-sm overflow-hidden bg-white dark:bg-gray-800 p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                <span className="text-gray-800 dark:text-white font-medium">
                  ₹{calculateTotal().toLocaleString('en-IN')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Shipping</span>
                <span className="text-green-600 dark:text-green-400 font-medium">FREE</span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between">
                <span className="text-lg font-bold text-gray-800 dark:text-white">Total</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ₹{calculateTotal().toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              Proceed to Checkout
            </button>
            
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              or{' '}
              <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}