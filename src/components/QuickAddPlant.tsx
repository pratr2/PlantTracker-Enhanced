import React, { useState } from 'react';
import { Plant } from '../types/Plant';
import { Plus, X } from 'lucide-react';

interface QuickAddPlantProps {
  onAdd: (plant: Omit<Plant, 'id'>) => void;
}

const sampleImages = [
  'https://images.pexels.com/photos/6208086/pexels-photo-6208086.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6912775/pexels-photo-6912775.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4751269/pexels-photo-4751269.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6208087/pexels-photo-6208087.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4503271/pexels-photo-4503271.jpeg?auto=compress&cs=tinysrgb&w=800'
];

export const QuickAddPlant: React.FC<QuickAddPlantProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    location: '',
    imageUrl: sampleImages[0],
    notes: '',
    healthStatus: 'good' as Plant['healthStatus']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.species.trim()) return;

    onAdd({
      ...formData,
      dateAcquired: new Date().toISOString().split('T')[0]
    });

    setFormData({
      name: '',
      species: '',
      location: '',
      imageUrl: sampleImages[0],
      notes: '',
      healthStatus: 'good'
    });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Plant
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Add New Plant</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plant Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., My Monstera"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Species *
              </label>
              <input
                type="text"
                required
                value={formData.species}
                onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., Monstera deliciosa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., Living Room"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant Image
              </label>
              <div className="grid grid-cols-3 gap-2">
                {sampleImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl }))}
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Health Status
              </label>
              <select
                value={formData.healthStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, healthStatus: e.target.value as Plant['healthStatus'] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Any notes about this plant..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Add Plant
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};