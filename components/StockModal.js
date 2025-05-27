'use client';
import { useState } from 'react';
import { FiX, FiPlus, FiMinus } from 'react-icons/fi';

export default function StockModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currentStock 
}) {
  const [quantity, setQuantity] = useState(1);
  const [operation, setOperation] = useState('add'); // 'add' or 'remove'
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      await onSave(operation, quantity);
      onClose();
    } catch (error) {
      console.error('Stock update failed:', error);
      alert('Failed to update stock');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Manage Stock</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <FiX size={24} />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Current Stock: <span className="font-bold">{currentStock}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setOperation('add')}
                  className={`px-4 py-2 rounded-lg ${operation === 'add' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <FiPlus className="inline mr-1" /> Add
                </button>
                <button
                  type="button"
                  onClick={() => setOperation('remove')}
                  className={`px-4 py-2 rounded-lg ${operation === 'remove' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <FiMinus className="inline mr-1" /> Remove
                </button>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity to {operation}:
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Update Stock`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}