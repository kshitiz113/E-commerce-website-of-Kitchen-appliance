'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FiPackage,
  FiUser,
  FiDollarSign,
  FiShoppingCart,
  FiCalendar,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiTruck,
  FiInfo
} from 'react-icons/fi';

export default function OrderDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/order_management_admin');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.message || 'Failed to fetch orders');
        }
        setOrders(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on search term
  const filteredOrders = orders.filter(order =>
    order.appliance_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-800 rounded w-1/3"></div>
          <div className="h-96 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-medium text-white mb-4">Error loading orders</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push('/admin_dashboard')}
            className="flex items-center text-blue-400 hover:text-blue-300 mr-4"
          >
            <FiChevronLeft className="mr-1" /> Back
          </button>
          <h1 className="text-2xl font-bold text-white">Order Management</h1>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-700 flex items-center">
            <div className="relative flex-grow max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product, user or transaction ID..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="ml-4 text-gray-300">
              {filteredOrders.length} orders found
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Order Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <FiPackage className="text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">#{order.order_id}</div>
                            <div className="text-sm text-gray-400 flex items-center">
                              <FiCalendar className="mr-1" /> {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-blue-400 mt-1">
                              TXN: {order.transaction_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {order.photo_path ? (
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              <Image
                                src={order.photo_path}
                                alt={order.appliance_name}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded flex items-center justify-center">
                              <FiPackage className="text-gray-400" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{order.appliance_name}</div>
                            <div className="text-sm text-gray-400">{order.appliance_type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-purple-500 rounded-full flex items-center justify-center">
                            <FiUser className="text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{order.user_email}</div>
                            <div className="text-sm text-gray-400">User ID: {order.user_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <FiShoppingCart className="mr-2 text-gray-400" />
                            <span className="text-white">Qty: {order.quantity}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <FiCreditCard className="mr-2 text-gray-400" />
                            <span className="text-white capitalize">{order.payment_method} ({order.payment_status})</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <FiTruck className="mr-2 text-gray-400" />
                            <span className="text-white">{order.delivery_address || 'No address'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {(order.quantity * order.unit_price).toLocaleString('en-IN', {
                              style: 'currency',
                              currency: 'INR'
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {order.unit_price.toLocaleString('en-IN', {
                              style: 'currency',
                              currency: 'INR'
                            })} each
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredOrders.length > ordersPerPage && (
            <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
              >
                <FiChevronLeft className="inline" /> Previous
              </button>
              <div className="text-gray-300">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
              >
                Next <FiChevronRight className="inline" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}