import React, { useState } from 'react';
import { Plant, FertilizationRecord } from '../types/Plant';
import { QuickAddPlant } from './QuickAddPlant';
import { Sprout, Plus, Calendar, Beaker, Droplets } from 'lucide-react';

interface FertilizationTrackerProps {
  plants: Plant[];
  records: FertilizationRecord[];
  onAddPlant: (plant: Omit<Plant, 'id'>) => void;
  onAddRecord: (record: Omit<FertilizationRecord, 'id'>) => void;
  getLatestRecord: (plantId: string) => FertilizationRecord | undefined;
  getRecordsForPlant: (plantId: string) => FertilizationRecord[];
}

export const FertilizationTracker: React.FC<FertilizationTrackerProps> = ({
  plants,
  onAddPlant,
  onAddRecord,
  getLatestRecord,
  getRecordsForPlant
}) => {
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fertilizerType: '',
    concentration: '',
    method: 'soil' as FertilizationRecord['method'],
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlant || !formData.fertilizerType) return;

    onAddRecord({
      plantId: selectedPlant,
      date: new Date().toISOString().split('T')[0],
      ...formData
    });

    setFormData({
      fertilizerType: '',
      concentration: '',
      method: 'soil',
      notes: ''
    });
    setShowAddForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Sprout className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fertilization Tracker</h1>
            <p className="text-gray-600">Track weekly fertilization records for your plants</p>
          </div>
        </div>
        <div className="flex gap-3">
          <QuickAddPlant onAdd={onAddPlant} />
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Fertilization Record</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Plant *
                </label>
                <select
                  required
                  value={selectedPlant}
                  onChange={(e) => setSelectedPlant(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Choose a plant...</option>
                  {plants.map(plant => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name} ({plant.species})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fertilizer Type *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fertilizerType}
                  onChange={(e) => setFormData(prev => ({ ...prev, fertilizerType: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., NPK 20-20-20, Organic Compost"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Concentration
                </label>
                <input
                  type="text"
                  value={formData.concentration}
                  onChange={(e) => setFormData(prev => ({ ...prev, concentration: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 1:1000, 2ml/L"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Method
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as FertilizationRecord['method'] }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="soil">Soil Application</option>
                  <option value="foliar">Foliar Spray</option>
                  <option value="hydroponic">Hydroponic Solution</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Observations, plant response, etc..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plants Grid */}
      {plants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Sprout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No plants yet</h3>
          <p className="text-gray-600 mb-6">Add your first plant to start tracking fertilization</p>
          <QuickAddPlant onAdd={onAddPlant} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {plants.map(plant => {
            const latestRecord = getLatestRecord(plant.id);
            const allRecords = getRecordsForPlant(plant.id);
            
            return (
              <div key={plant.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-32">
                  <img 
                    src={plant.imageUrl} 
                    alt={plant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-3 text-white">
                    <h3 className="font-semibold">{plant.name}</h3>
                    <p className="text-sm opacity-90">{plant.species}</p>
                  </div>
                </div>

                <div className="p-4">
                  {/* Current Reading */}
                  {latestRecord ? (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700">Latest Fertilization</span>
                        <span className="text-xs text-green-600">{formatDate(latestRecord.date)}</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Beaker className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">{latestRecord.fertilizerType}</span>
                        </div>
                        {latestRecord.concentration && (
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-700">{latestRecord.concentration}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-600 capitalize">
                          Method: {latestRecord.method}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                      <span className="text-sm text-gray-600">No fertilization records yet</span>
                    </div>
                  )}

                  {/* Previous Records */}
                  {allRecords.length > 1 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Previous Records ({allRecords.length - 1})
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {allRecords.slice(1, 4).map(record => (
                          <div key={record.id} className="text-xs bg-gray-50 p-2 rounded">
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-gray-700">{record.fertilizerType}</span>
                              <span className="text-gray-500">{formatDate(record.date)}</span>
                            </div>
                            {record.concentration && (
                              <div className="text-gray-600 mt-1">{record.concentration}</div>
                            )}
                          </div>
                        ))}
                        {allRecords.length > 4 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            +{allRecords.length - 4} more records
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};