'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiPlus, FiX } from 'react-icons/fi';

export default function AddProduct() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    price: '',
    description: '',
    specifications: '',
    wattage: '',
    dimensions: '',
    weight: '',
    warranty_months: '',
    stock_quantity: ''
  });
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMainImageChange = (e) => {
    setMainImage(e.target.files[0]);
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalImages(prev => [...prev, ...files.slice(0, 3 - prev.length)]);
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('Submission already in progress, ignoring...');
      return;
    }
    
    setIsSubmitting(true);
    setIsLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.type || !formData.price || !mainImage) {
        throw new Error('Please fill all required fields');
      }

      // Validate JSON format for specifications
      try {
        JSON.parse(formData.specifications);
      } catch (jsonError) {
        throw new Error('Specifications must be in valid JSON format');
      }

      console.log('Starting product creation process...');

      // First upload the main image
      const mainImageFormData = new FormData();
      mainImageFormData.append('image', mainImage);

      console.log('Uploading main image...');
      const mainImageResponse = await fetch('/api/upload', {
        method: 'POST',
        body: mainImageFormData,
      });

      if (!mainImageResponse.ok) {
        const errorText = await mainImageResponse.text();
        console.error('Main image upload failed:', errorText);
        throw new Error('Failed to upload main image');
      }

      const mainImageData = await mainImageResponse.json();
      const mainImagePath = mainImageData.path;
      console.log('Main image uploaded successfully:', mainImagePath);

      // Create the appliance with main image
      console.log('Creating appliance record...');
      const appliancePayload = {
        ...formData,
        photo_path: mainImagePath,
        price: parseFloat(formData.price),
        wattage: parseInt(formData.wattage),
        weight: parseFloat(formData.weight),
        warranty_months: parseInt(formData.warranty_months),
        stock_quantity: parseInt(formData.stock_quantity)
      };

      const applianceResponse = await fetch('/api/appliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appliancePayload),
      });

      if (!applianceResponse.ok) {
        const errorText = await applianceResponse.text();
        console.error('Appliance creation failed:', errorText);
        throw new Error('Failed to create appliance');
      }

      const applianceData = await applianceResponse.json();
      const applianceId = applianceData.id;
      console.log('Appliance created successfully with ID:', applianceId);

      // Upload additional images if any
      if (additionalImages.length > 0) {
        console.log('Uploading additional images...');
        const uploadPromises = additionalImages.map(async (image, index) => {
          const imageFormData = new FormData();
          imageFormData.append('image', image);
          imageFormData.append('appliance_id', applianceId);

          const response = await fetch('/api/appliance-images', {
            method: 'POST',
            body: imageFormData,
          });

          if (!response.ok) {
            console.error(`Failed to upload additional image ${index + 1}`);
            // Don't throw error for additional images, just log
          }
          return response;
        });

        await Promise.all(uploadPromises);
        console.log('Additional images upload completed');
      }

      // Create appliance details
      console.log('Creating appliance details...');
      const detailsPayload = {
        appliance_id: applianceId,
        description: formData.description,
        specifications: formData.specifications,
        wattage: parseInt(formData.wattage),
        dimensions: formData.dimensions,
        weight: parseFloat(formData.weight),
        warranty_months: parseInt(formData.warranty_months),
        stock_quantity: parseInt(formData.stock_quantity),
      };

      const detailsResponse = await fetch('/api/appliance-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(detailsPayload),
      });

      if (!detailsResponse.ok) {
        const errorText = await detailsResponse.text();
        console.error('Appliance details creation failed:', errorText);
        throw new Error('Failed to create product details');
      }

      console.log('Product created successfully, redirecting...');
      
      // Add a small delay before redirect to ensure all operations complete
      setTimeout(() => {
        router.push('/admin_dashboard');
      }, 500);

    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'Failed to add product');
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Add New Product</h1>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a type</option>
                  <option value="Mixer">Mixer</option>
                  <option value="Blender">Blender</option>
                  <option value="Toaster">Toaster</option>
                  <option value="Microwave">Microwave</option>
                  <option value="Oven">Oven</option>
                  <option value="Refrigerator">Refrigerator</option>
                  <option value="Stove">Stove</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  id="stock_quantity"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Specifications (JSON format) *
              </label>
              <textarea
                id="specifications"
                name="specifications"
                value={formData.specifications}
                onChange={handleChange}
                required
                rows="3"
                placeholder='{"Color": "Black", "Capacity": "2L", "Power": "1000W"}'
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="wattage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Wattage *
                </label>
                <input
                  type="number"
                  id="wattage"
                  name="wattage"
                  value={formData.wattage}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dimensions *
                </label>
                <input
                  type="text"
                  id="dimensions"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 35.5 x 30.2 x 45.7 cm"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="warranty_months" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Warranty (months) *
              </label>
              <input
                type="number"
                id="warranty_months"
                name="warranty_months"
                value={formData.warranty_months}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Main Product Image (required) *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {mainImage ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(mainImage)}
                        alt="Preview"
                        className="mx-auto h-32 w-auto object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setMainImage(null)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="main-image"
                          className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="main-image"
                            name="main-image"
                            type="file"
                            className="sr-only"
                            onChange={handleMainImageChange}
                            accept="image/*"
                            required
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Images (optional, max 3)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {additionalImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {additionalImages.map((image, index) => (
                        <div key={`additional-image-${index}`} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Additional ${index + 1}`}
                            className="h-24 w-auto object-cover mx-auto"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {additionalImages.length < 3 && (
                        <label
                          htmlFor="additional-images"
                          className="flex items-center justify-center h-24 w-full border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer"
                        >
                          <FiPlus className="h-5 w-5 text-gray-400" />
                          <input
                            id="additional-images"
                            name="additional-images"
                            type="file"
                            className="sr-only"
                            onChange={handleAdditionalImagesChange}
                            accept="image/*"
                            multiple
                          />
                        </label>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="additional-images"
                          className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none"
                        >
                          <span>Upload files</span>
                          <input
                            id="additional-images"
                            name="additional-images"
                            type="file"
                            className="sr-only"
                            onChange={handleAdditionalImagesChange}
                            accept="image/*"
                            multiple
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB each (max 3)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Adding Product...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}