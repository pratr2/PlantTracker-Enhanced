import React from 'react';
import { Plant } from '../types/Plant';
import { getHealthStatusColor, getHealthStatusBgColor, formatDate, calculateNextWateringDate, calculateNextFertilizingDate, calculateNextRepottingDate, getDaysUntil } from '../utils/plantUtils';
import { ArrowLeft, Droplets, Sprout, RotateCcw, MapPin, Calendar, Thermometer, Sun, Droplet, Mountain } from 'lucide-react';

interface PlantDetailProps {
  plant: Plant;
  onBack: () => void;
  onWater: (id: string) => void;
  onFertilize: (id: string) => void;
  onRepot: (id: string) => void;
  onEdit: (plant: Plant) => void;
}

export const PlantDetail: React.FC<PlantDetailProps> = ({ 
  plant, 
  onBack, 
  onWater, 
  onFertilize, 
  onRepot, 
  onEdit 
}) => {
  const nextWateringDate = calculateNextWateringDate(plant);
  const nextFertilizingDate = calculateNextFertilizingDate(plant);
  const nextRepottingDate = calculateNextRepottingDate(plant);
  
  const wateringDays = getDaysUntil(nextWateringDate);
  const fertilizingDays = getDaysUntil(nextFertilizingDate);
  const repottingDays = getDaysUntil(nextRepottingDate);

  const careActions = [
    {
      icon: Droplets,
      label: 'Water Plant',
      action: () => onWater(plant.id),
      color: 'bg-blue-500 hover:bg-blue-600',
      nextDue: nextWateringDate,
      daysUntil: wateringDays,
      isOverdue: wateringDays < 0
    },
    {
      icon: Sprout,
      label: 'Fertilize',
      action: () => onFertilize(plant.id),
      color: 'bg-green-500 hover:bg-green-600',
      nextDue: nextFertilizingDate,
      daysUntil: fertilizingDays,
      isOverdue: fertilizingDays < 0
    },
    {
      icon: RotateCcw,
      label: 'Repot',
      action: () => onRepot(plant.id),
      color: 'bg-amber-500 hover:bg-amber-600',
      nextDue: nextRepottingDate,
      daysUntil: repottingDays,
      isOverdue: repottingDays < 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Plants
        </button>
        <button
          onClick={() => onEdit(plant)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Edit Plant
        </button>
      </div>

      {/* Plant Info Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Image */}
          <div className="md:w-1/2">
            <img 
              src={plant.imageUrl} 
              alt={plant.name}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
          
          {/* Info */}
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{plant.name}</h1>
                <p className="text-gray-600 italic text-lg">{plant.species}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthStatusBgColor(plant.healthStatus)} ${getHealthStatusColor(plant.healthStatus)}`}>
                {plant.healthStatus}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                <span>{plant.location}</span>
              </div>
              
              <div className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                <span>Acquired {formatDate(plant.dateAcquired)}</span>
              </div>
            </div>
            
            {plant.notes && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{plant.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Care Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Care Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {careActions.map((action, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <action.icon className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="font-medium text-gray-900">{action.label}</span>
                </div>
                {action.isOverdue && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    Overdue
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                <p>Next due: {formatDate(action.nextDue)}</p>
                <p className={action.isOverdue ? 'text-red-600 font-medium' : ''}>
                  {action.isOverdue 
                    ? `${Math.abs(action.daysUntil)} days overdue`
                    : action.daysUntil === 0 
                      ? 'Due today' 
                      : `In ${action.daysUntil} days`
                  }
                </p>
              </div>
              
              <button
                onClick={action.action}
                className={`w-full ${action.color} text-white py-2 px-4 rounded-lg font-medium transition-colors`}
              >
                {action.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Care Instructions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Care Instructions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <Sun className="w-5 h-5 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Light Requirements</h3>
                <p className="text-gray-700 text-sm">{plant.careInstructions.light}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Droplet className="w-5 h-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Humidity</h3>
                <p className="text-gray-700 text-sm">{plant.careInstructions.humidity}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <Thermometer className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Temperature</h3>
                <p className="text-gray-700 text-sm">{plant.careInstructions.temperature}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mountain className="w-5 h-5 text-amber-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Soil</h3>
                <p className="text-gray-700 text-sm">{plant.careInstructions.soil}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Care History */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Care History</h2>
        <div className="space-y-3">
          {plant.lastWatered && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Droplets className="w-5 h-5 text-blue-500 mr-3" />
                <span className="text-gray-900">Last watered</span>
              </div>
              <span className="text-gray-700 font-medium">{formatDate(plant.lastWatered)}</span>
            </div>
          )}
          
          {plant.lastFertilized && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Sprout className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-900">Last fertilized</span>
              </div>
              <span className="text-gray-700 font-medium">{formatDate(plant.lastFertilized)}</span>
            </div>
          )}
          
          {plant.lastRepotted && (
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center">
                <RotateCcw className="w-5 h-5 text-amber-500 mr-3" />
                <span className="text-gray-900">Last repotted</span>
              </div>
              <span className="text-gray-700 font-medium">{formatDate(plant.lastRepotted)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};