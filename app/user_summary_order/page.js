'use client';
import { useEffect, useState } from 'react';
import { FiPackage, FiCalendar, FiCreditCard, FiTruck, FiDollarSign, FiMoon, FiSun } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
    
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/user_summary');
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || 'Failed to fetch orders');
        
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          <p>{error}</p>
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Please login again
          </Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FiPackage className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No orders found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">You haven't placed any orders yet.</p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
          </button>
        </div>
        
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.order_id} className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg transition-all hover:shadow-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Order #{order.order_id}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Placed on {new Date(order.order_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.payment_status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {"Completed"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start">
                    <FiCreditCard className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</h4>
                      <p className="text-sm text-gray-900 dark:text-gray-200 capitalize">
                        {order.payment_method}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiDollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</h4>
                      <p className="text-sm text-gray-900 dark:text-gray-200">
                        ₹{parseFloat(order.total_amount).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiTruck className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Address</h4>
                      <p className="text-sm text-gray-900 dark:text-gray-200">
                        {order.delivery_address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiCalendar className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction ID</h4>
                      <p className="text-sm text-gray-900 dark:text-gray-200 font-mono">
                        {order.transaction_id}
                      </p>
                    </div>
                  </div>
                </div>
                
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Order Items</h4>
                <div className="border border-gray-200 dark:border-gray-700 rounded-md divide-y divide-gray-200 dark:divide-gray-700">
                  {order.items.map((item) => (
                    <div key={item.item_id} className="p-4 flex hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden relative">
                        {item.appliance_image ? (
                          <Image
                            src={item.appliance_image.startsWith('http') 
                              ? item.appliance_image 
                              : item.appliance_image.startsWith('/uploads') 
                                ? item.appliance_image 
                                : `/uploads${item.appliance_image}`}
                            alt={item.appliance_name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <FiPackage className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                              {item.appliance_name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {item.appliance_type}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            ₹{parseFloat(item.unit_price).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                        </div>
                        <div className="flex justify-between mt-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            ₹{(item.quantity * item.unit_price).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}