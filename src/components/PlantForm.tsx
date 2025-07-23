import React, { useState } from 'react';
import { Plant } from '../types/Plant';
import { ArrowLeft, Upload, X } from 'lucide-react';

interface PlantFormProps {
  plant?: Plant;
  onSave: (plant: Omit<Plant, 'id'> | Plant) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

const sampleImages = [
  'https://images.pexels.com/photos/6208086/pexels-photo-6208086.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6912775/pexels-photo-6912775.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4751269/pexels-photo-4751269.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6208087/pexels-photo-6208087.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4503271/pexels-photo-4503271.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6167321/pexels-photo-6167321.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6208083/pexels-photo-6208083.jpeg?auto=compress&cs=tinysrgb&w=800'
];

export const PlantForm: React.FC<PlantFormProps> = ({ plant, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({
    name: plant?.name || '',
    species: plant?.species || '',
    location: plant?.location || '',
    imageUrl: plant?.imageUrl || sampleImages[0],
    dateAcquired: plant?.dateAcquired || new Date().toISOString().split('T')[0],
    wateringFrequency: plant?.wateringFrequency || 7,
    fertilizingFrequency: plant?.fertilizingFrequency || 30,
    repottingFrequency: plant?.repottingFrequency || 24,
    notes: plant?.notes || '',
    healthStatus: plant?.healthStatus || 'good' as Plant['healthStatus'],
    careInstructions: {
      light: plant?.careInstructions.light || '',
      humidity: plant?.careInstructions.humidity || '',
      temperature: plant?.careInstructions.temperature || '',
      soil: plant?.careInstructions.soil || ''
    }
  });

  const [showImageSelector, setShowImageSelector] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const plantData = {
      ...formData,
      lastWatered: plant?.lastWatered,
      lastFertilized: plant?.lastFertilized,
      lastRepotted: plant?.lastRepotted,
      ...(plant && { id: plant.id })
    };

    onSave(plantData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCareInstructionChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      careInstructions: {
        ...prev.careInstructions,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {plant ? 'Edit Plant' : 'Add New Plant'}
        </h1>
        <div className="w-20"> {/* Spacer for center alignment */}</div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., My Monstera"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Species *
              </label>
              <input
                type="text"
                required
                value={formData.species}
                onChange={(e) => handleInputChange('species', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., Monstera deliciosa"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., Living Room"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Acquired
              </label>
              <input
                type="date"
                value={formData.dateAcquired}
                onChange={(e) => handleInputChange('dateAcquired', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Health Status
              </label>
              <select
                value={formData.healthStatus}
                onChange={(e) => handleInputChange('healthStatus', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Plant Image */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Plant Image</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img 
                src={formData.imageUrl} 
                alt="Plant preview"
                className="w-24 h-24 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => setShowImageSelector(!showImageSelector)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Choose Image
              </button>
            </div>
            
            {showImageSelector && (
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2 p-4 bg-gray-50 rounded-lg">
                {sampleImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      handleInputChange('imageUrl', imageUrl);
                      setShowImageSelector(false);
                    }}
                    className={`relative w-full h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      formData.imageUrl === imageUrl 
                        ? 'border-emerald-500 ring-2 ring-emerald-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={imageUrl} 
                      alt={`Option ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Care Schedule */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Care Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Watering Frequency (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.wateringFrequency}
                onChange={(e) => handleInputChange('wateringFrequency', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fertilizing Frequency (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.fertilizingFrequency}
                onChange={(e) => handleInputChange('fertilizingFrequency', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repotting Frequency (months)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={formData.repottingFrequency}
                onChange={(e) => handleInputChange('repottingFrequency', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Care Instructions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Care Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Light Requirements
              </label>
              <input
                type="text"
                value={formData.careInstructions.light}
                onChange={(e) => handleCareInstructionChange('light', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., Bright, indirect light"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Humidity
              </label>
              <input
                type="text"
                value={formData.careInstructions.humidity}
                onChange={(e) => handleCareInstructionChange('humidity', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., 60-70%"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature
              </label>
              <input
                type="text"
                value={formData.careInstructions.temperature}
                onChange={(e) => handleCareInstructionChange('temperature', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., 65-80°F"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soil Type
              </label>
              <input
                type="text"
                value={formData.careInstructions.soil}
                onChange={(e) => handleCareInstructionChange('soil', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., Well-draining potting mix"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Any additional notes about this plant..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            {plant && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(plant.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Delete Plant
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {plant ? 'Update Plant' : 'Add Plant'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};