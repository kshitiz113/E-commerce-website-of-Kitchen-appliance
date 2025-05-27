'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FiCheckCircle, FiPackage, FiClock, FiHome } from 'react-icons/fi';
import Link from 'next/link';

export default function OrderConfirmation() {
  const { transactionId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${transactionId}`);
        if (!response.ok) throw new Error('Failed to fetch order');
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [transactionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Order not found</h2>
          <Link href="/dashboard" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
              <FiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">Order Confirmed!</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Thank you for your purchase. Your order #{order.id} has been placed successfully.
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Transaction ID: {transactionId}
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 px-8 py-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                <span className="text-gray-900 dark:text-white">₹{order.total_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Shipping</span>
                <span className="text-gray-900 dark:text-white">FREE</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">₹{order.total_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 px-8 py-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivery Information</h2>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiHome className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">{order.delivery_address}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 px-8 py-6 bg-gray-50 dark:bg-gray-700/30">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What's Next?</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FiPackage className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Preparing your order</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">We'll notify you when your items ship.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FiClock className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Estimated delivery</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Within 3-5 business days</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700/30 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}