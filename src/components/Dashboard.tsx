import React from 'react';
import { Plant, CareTask } from '../types/Plant';
import { generateCareTasks, getCareTypeIcon, formatDate, getDaysUntil } from '../utils/plantUtils';
import { Calendar, AlertCircle, CheckCircle, Sprout, Droplets, Home } from 'lucide-react';

interface DashboardProps {
  plants: Plant[];
  onWater: (id: string) => void;
  onFertilize: (id: string) => void;
  onRepot: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ plants, onWater, onFertilize, onRepot }) => {
  const careTasks = generateCareTasks(plants);
  const upcomingTasks = careTasks.filter(task => getDaysUntil(task.dueDate) <= 7 && getDaysUntil(task.dueDate) >= 0);
  const overdueTasks = careTasks.filter(task => task.isOverdue);
  const totalPlants = plants.length;
  const healthyPlants = plants.filter(plant => plant.healthStatus === 'excellent' || plant.healthStatus === 'good').length;

  const handleTaskComplete = (task: CareTask) => {
    switch (task.type) {
      case 'watering':
        onWater(task.plantId);
        break;
      case 'fertilizing':
        onFertilize(task.plantId);
        break;
      case 'repotting':
        onRepot(task.plantId);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Plant Care Dashboard</h1>
        <p className="text-gray-600">Keep track of your green friends and their care schedule</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 rounded-full">
              <Home className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Plants</p>
              <p className="text-2xl font-bold text-gray-900">{totalPlants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Healthy Plants</p>
              <p className="text-2xl font-bold text-gray-900">{healthyPlants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${overdueTasks.length > 0 ? 'bg-red-100' : 'bg-blue-100'}`}>
              <AlertCircle className={`w-6 h-6 ${overdueTasks.length > 0 ? 'text-red-600' : 'text-blue-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasks Due</p>
              <p className="text-2xl font-bold text-gray-900">{overdueTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Overdue Tasks</h2>
          </div>
          <div className="space-y-3">
            {overdueTasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                <div className="flex items-center">
                  <span className="text-lg mr-3">{getCareTypeIcon(task.type)}</span>
                  <div>
                    <p className="font-medium text-gray-900">{task.plantName}</p>
                    <p className="text-sm text-gray-600 capitalize">{task.type} • {Math.abs(getDaysUntil(task.dueDate))} days overdue</p>
                  </div>
                </div>
                <button
                  onClick={() => handleTaskComplete(task)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Complete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Tasks */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-emerald-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Tasks (Next 7 Days)</h2>
        </div>
        
        {upcomingTasks.length === 0 ? (
          <div className="text-center py-8">
            <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No tasks scheduled for the next 7 days</p>
            <p className="text-sm text-gray-500 mt-1">Your plants are all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingTasks.slice(0, 8).map(task => {
              const daysUntil = getDaysUntil(task.dueDate);
              return (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{getCareTypeIcon(task.type)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{task.plantName}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {task.type} • {daysUntil === 0 ? 'Today' : `in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{formatDate(task.dueDate)}</span>
                    <button
                      onClick={() => handleTaskComplete(task)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Mark Done
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Plant Health Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plants.slice(0, 6).map(plant => (
            <div key={plant.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <img 
                src={plant.imageUrl} 
                alt={plant.name}
                className="w-12 h-12 rounded-full object-cover mr-3"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{plant.name}</p>
                <p className="text-xs text-gray-600">{plant.location}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                plant.healthStatus === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                plant.healthStatus === 'good' ? 'bg-green-100 text-green-700' :
                plant.healthStatus === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {plant.healthStatus}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};