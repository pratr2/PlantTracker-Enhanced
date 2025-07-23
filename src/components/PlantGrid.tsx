import React, { useState } from 'react';
import { Plant } from '../types/Plant';
import { PlantCard } from './PlantCard';
import { Search, Filter, Plus, Grid, List } from 'lucide-react';

interface PlantGridProps {
  plants: Plant[];
  onWater: (id: string) => void;
  onSelect: (plant: Plant) => void;
  onAdd: () => void;
}

export const PlantGrid: React.FC<PlantGridProps> = ({ plants, onWater, onSelect, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterHealth, setFilterHealth] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const locations = [...new Set(plants.map(plant => plant.location))];
  const healthStatuses = ['excellent', 'good', 'fair', 'poor'];

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.species.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !filterLocation || plant.location === filterLocation;
    const matchesHealth = !filterHealth || plant.healthStatus === filterHealth;
    
    return matchesSearch && matchesLocation && matchesHealth;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Plants</h1>
          <p className="text-gray-600">
            {filteredPlants.length} of {plants.length} plants
          </p>
        </div>
        <button
          onClick={onAdd}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Plant
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <select
              value={filterHealth}
              onChange={(e) => setFilterHealth(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Health</option>
              {healthStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plants Grid/List */}
      {filteredPlants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Plus className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {plants.length === 0 ? 'No plants yet' : 'No plants match your filters'}
          </h3>
          <p className="text-gray-600 mb-6">
            {plants.length === 0 
              ? 'Start your plant collection by adding your first plant!'
              : 'Try adjusting your search terms or filters.'
            }
          </p>
          {plants.length === 0 && (
            <button
              onClick={onAdd}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add Your First Plant
            </button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredPlants.map(plant => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onWater={onWater}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};