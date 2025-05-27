'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { 
  FiShoppingCart, 
  FiCreditCard, 
  FiStar, 
  FiChevronLeft, 
  FiPlus, 
  FiMinus,
  FiX  // Added missing import
} from 'react-icons/fi';
import PaymentModal from '@/components/PaymentModal';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [details, setDetails] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [productRes, detailsRes, imagesRes] = await Promise.all([
          fetch(`/api/appliance/${id}`),
          fetch(`/api/appliance-details/${id}`),
          fetch(`/api/appliance-images/${id}`)
        ]);

        if (!productRes.ok || !detailsRes.ok) {
          throw new Error('Failed to fetch product data');
        }

        const productData = await productRes.json();
        const detailsData = await detailsRes.json();
        const imagesData = imagesRes.ok ? await imagesRes.json() : [];

        setProduct(productData);
        setDetails(detailsData);
        setImages([productData.photo_path, ...imagesData.map(img => img.image_path)].filter(Boolean));
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Failed to load product');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, router]);

  const handleAddToCart = () => {
    console.log('Added to cart:', product?.id, quantity);
    // Implement your cart logic here
  };

  const handleBuyNow = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      if (!product) throw new Error('Product not loaded');
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          paymentMethod: paymentData.method,
          transactionId: paymentData.transactionId,
          amount: product.price * quantity,
          deliveryAddress: paymentData.deliveryAddress
        }),
      });

      if (!response.ok) throw new Error('Failed to create order');

      router.push(`/order-confirmation/${paymentData.transactionId}`);
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Order creation failed. Please try again.');
    }
  };

  const handleUpdateStock = async (operation, quantity) => {
  try {
    const response = await fetch(`/api/appliance-details/${product.id}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation,
        quantity: parseInt(quantity)
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update stock');
    }

    // Update local state
    setDetails(prev => ({
      ...prev,
      stock_quantity: data.newStock
    }));

    alert('Stock updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating stock:', error);
    alert(error.message || 'Failed to update stock');
    return false;
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-gray-200 dark:bg-gray-700 h-96 rounded-lg"></div>
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 dark:bg-gray-700 h-20 w-20 rounded-md"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-200 dark:bg-gray-700 h-8 w-3/4 rounded"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-6 w-1/2 rounded"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-4 w-full rounded"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-4 w-2/3 rounded"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-12 w-1/3 rounded"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-10 w-full rounded"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-10 w-full rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="text-center py-16">
            <div className="text-red-500 dark:text-red-400 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-medium text-gray-800 dark:text-white">{error}</h3>
            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product || !details) {
    return null;
  }

  // Handle specifications - it might be a string or already an object
  let specifications = {};
  try {
    specifications = typeof details.specifications === 'string' 
      ? JSON.parse(details.specifications) 
      : details.specifications || {};
  } catch (e) {
    console.error('Error parsing specifications:', e);
    specifications = {};
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link href="/dashboard" className="flex items-center text-blue-600 dark:text-blue-400 mb-4 hover:underline">
          <FiChevronLeft className="mr-1" /> Back to products
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative h-96 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                {images.length > 0 ? (
                  <Image
                    src={images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    No image available
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 w-20 rounded-md overflow-hidden border-2 ${selectedImage === index ? 'border-blue-500' : 'border-transparent'}`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{product.name}</h1>
                <div className="flex items-center mt-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={`${i < 4 ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">(42 reviews)</span>
                </div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
                <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                  In Stock: {details.stock_quantity} available
                </p>
              </div>

              {/* Key Features */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Key Features</h2>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                  {details.description.split('. ').map((feature, i) => (
                    feature && <li key={i}>{feature.trim()}</li>
                  ))}
                </ul>
              </div>

              {/* Specifications */}
              {Object.keys(specifications).length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Specifications</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(specifications).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="text-gray-500 dark:text-gray-400 font-medium w-1/2">{key}:</span>
                        <span className="text-gray-700 dark:text-gray-300 w-1/2">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="text-gray-700 dark:text-gray-300">
                  Quantity:
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700"
                >
                  {[...Array(Math.min(10, details.stock_quantity)).keys()].map((num) => (
                    <option key={num + 1} value={num + 1}>
                      {num + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
              
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  <FiCreditCard /> Buy Now
                </button>
               
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Warranty</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {details.warranty_months} months
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Dimensions</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {details.dimensions}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Weight</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {details.weight} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Wattage</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {details.wattage}W
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        amount={product.price * quantity}
      />

      {/* Stock Management Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Manage Stock</h2>
                <button onClick={() => setShowStockModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <FiX size={24} />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const operation = form.operation.value;
                const quantity = parseInt(form.quantity.value);
                handleUpdateStock(operation, quantity).then(() => setShowStockModal(false));
              }}>
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <button
                      type="button"
                      name="operation"
                      value="add"
                      onClick={(e) => e.currentTarget.form.operation.value = 'add'}
                      className={`px-4 py-2 rounded-lg ${'add' === 'add' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                      <FiPlus className="inline mr-1" /> Add
                    </button>
                    <button
                      type="button"
                      name="operation"
                      value="remove"
                      onClick={(e) => e.currentTarget.form.operation.value = 'remove'}
                      className={`px-4 py-2 rounded-lg ${'remove' === 'remove' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                      <FiMinus className="inline mr-1" /> Remove
                    </button>
                    <input type="hidden" name="operation" value="add" />
                  </div>
                  
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity:
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    defaultValue="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Stock
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}