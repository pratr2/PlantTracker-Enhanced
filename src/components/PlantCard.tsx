import React from 'react';
import { Plant } from '../types/Plant';
import { getHealthStatusColor, getHealthStatusBgColor, formatDate, getDaysUntil, calculateNextWateringDate } from '../utils/plantUtils';
import { Droplets, Sprout, Calendar, MapPin } from 'lucide-react';

interface PlantCardProps {
  plant: Plant;
  onWater: (id: string) => void;
  onSelect: (plant: Plant) => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({ plant, onWater, onSelect }) => {
  const nextWateringDate = calculateNextWateringDate(plant);
  const daysUntilWatering = getDaysUntil(nextWateringDate);
  const isWateringOverdue = daysUntilWatering < 0;

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer group"
      onClick={() => onSelect(plant)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={plant.imageUrl} 
          alt={plant.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusBgColor(plant.healthStatus)} ${getHealthStatusColor(plant.healthStatus)}`}>
          {plant.healthStatus}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
              {plant.name}
            </h3>
            <p className="text-sm text-gray-600 italic">{plant.species}</p>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          {plant.location}
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Droplets className={`w-4 h-4 mr-2 ${isWateringOverdue ? 'text-red-500' : 'text-blue-500'}`} />
              <span className="text-gray-700">Next watering</span>
            </div>
            <span className={`font-medium ${isWateringOverdue ? 'text-red-600' : 'text-gray-900'}`}>
              {isWateringOverdue ? `${Math.abs(daysUntilWatering)} days overdue` : 
               daysUntilWatering === 0 ? 'Today' : 
               `in ${daysUntilWatering} days`}
            </span>
          </div>
          
          {plant.lastWatered && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Last watered</span>
              </div>
              <span className="text-gray-700">{formatDate(plant.lastWatered)}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWater(plant.id);
            }}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <Droplets className="w-4 h-4" />
            Water
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(plant);
            }}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <Sprout className="w-4 h-4" />
            Details
          </button>
        </div>
      </div>
    </div>
  );
};