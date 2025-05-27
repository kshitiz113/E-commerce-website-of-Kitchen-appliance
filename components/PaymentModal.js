'use client';
import { useState } from 'react';
import { FiCreditCard, FiSmartphone, FiX } from 'react-icons/fi';

export default function PaymentModal({ isOpen, onClose, onSuccess, amount }) {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [formData, setFormData] = useState({
    upiId: '',
    cardDetails: {
      number: '',
      expiry: '',
      cvv: '',
      name: ''
    },
    deliveryAddress: ''
  });
  const [errors, setErrors] = useState({
    upiId: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
    deliveryAddress: '',
    general: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const validateUPI = (upiId) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(upiId);
  };

  const validateCardNumber = (number) => {
    const cleaned = number.replace(/\s+/g, '');
    return /^\d{16}$/.test(cleaned);
  };

  const validateExpiry = (expiry) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [month, year] = expiry.split('/');
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    return (
      parseInt(month) >= 1 && 
      parseInt(month) <= 12 && 
      (parseInt(year) > currentYear || 
      (parseInt(year) === currentYear && parseInt(month) >= currentMonth))
    );
  };

  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const validateForm = () => {
    const newErrors = {
      upiId: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      cardName: '',
      deliveryAddress: '',
      general: ''
    };

    let isValid = true;

    // Validate delivery address
    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Delivery address is required';
      isValid = false;
    } else if (formData.deliveryAddress.trim().length < 10) {
      newErrors.deliveryAddress = 'Address is too short';
      isValid = false;
    }

    // Validate payment method specific fields
    if (paymentMethod === 'upi') {
      if (!formData.upiId.trim()) {
        newErrors.upiId = 'UPI ID is required';
        isValid = false;
      } else if (!validateUPI(formData.upiId)) {
        newErrors.upiId = 'Please enter a valid UPI ID';
        isValid = false;
      }
    } else {
      if (!formData.cardDetails.number.trim()) {
        newErrors.cardNumber = 'Card number is required';
        isValid = false;
      } else if (!validateCardNumber(formData.cardDetails.number)) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
        isValid = false;
      }

      if (!formData.cardDetails.expiry.trim()) {
        newErrors.cardExpiry = 'Expiry date is required';
        isValid = false;
      } else if (!validateExpiry(formData.cardDetails.expiry)) {
        newErrors.cardExpiry = 'Please enter a valid expiry date (MM/YY)';
        isValid = false;
      }

      if (!formData.cardDetails.cvv.trim()) {
        newErrors.cardCvv = 'CVV is required';
        isValid = false;
      } else if (!validateCVV(formData.cardDetails.cvv)) {
        newErrors.cardCvv = 'Please enter a valid 3 or 4-digit CVV';
        isValid = false;
      }

      if (!formData.cardDetails.name.trim()) {
        newErrors.cardName = 'Cardholder name is required';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('card.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        cardDetails: {
          ...prev.cardDetails,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name] || errors[name.split('.')[1]]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        [name.split('.')[1]]: ''
      }));
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      cardDetails: {
        ...prev.cardDetails,
        number: formatted
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(prev => ({ ...prev, general: '' }));

    if (!validateForm()) return;

    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock transaction ID
      const transactionId = `TXN${Date.now()}`;
      
      onSuccess({
        method: paymentMethod,
        transactionId,
        deliveryAddress: formData.deliveryAddress
      });
    } catch (error) {
      console.error('Payment failed:', error);
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Payment failed. Please try again.'
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Complete Payment</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              disabled={isProcessing}
            >
              <FiX size={24} />
            </button>
          </div>
          
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
              {errors.general}
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Amount to Pay</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ₹{amount.toLocaleString('en-IN')}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('upi');
                    setErrors(prev => ({ ...prev, cardNumber: '', cardExpiry: '', cardCvv: '', cardName: '' }));
                  }}
                  className={`flex items-center justify-center p-3 rounded-lg border ${paymentMethod === 'upi' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'}`}
                  disabled={isProcessing}
                >
                  <FiSmartphone className="mr-2" />
                  UPI
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('card');
                    setErrors(prev => ({ ...prev, upiId: '' }));
                  }}
                  className={`flex items-center justify-center p-3 rounded-lg border ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'}`}
                  disabled={isProcessing}
                >
                  <FiCreditCard className="mr-2" />
                  Card
                </button>
              </div>
            </div>

            {paymentMethod === 'upi' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  UPI ID
                </label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  placeholder="yourname@upi"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.upiId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={isProcessing}
                />
                {errors.upiId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.upiId}</p>
                )}
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="card.number"
                    value={formData.cardDetails.number}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.cardNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    maxLength={19}
                    disabled={isProcessing}
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cardNumber}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="card.expiry"
                      value={formData.cardDetails.expiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                        errors.cardExpiry ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      maxLength={5}
                      disabled={isProcessing}
                    />
                    {errors.cardExpiry && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cardExpiry}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="card.cvv"
                      value={formData.cardDetails.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                        errors.cardCvv ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      maxLength={4}
                      disabled={isProcessing}
                    />
                    {errors.cardCvv && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cardCvv}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    name="card.name"
                    value={formData.cardDetails.name}
                    onChange={handleInputChange}
                    placeholder="Name on card"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.cardName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={isProcessing}
                  />
                  {errors.cardName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cardName}</p>
                  )}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Delivery Address
              </label>
              <textarea
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.deliveryAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                rows="3"
                disabled={isProcessing}
              />
              {errors.deliveryAddress && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.deliveryAddress}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Pay ₹${amount.toLocaleString('en-IN')}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}