import React, { useState } from 'react';
import { Plant, SoilRecord } from '../types/Plant';
import { QuickAddPlant } from './QuickAddPlant';
import { Mountain, Plus, Calendar, Thermometer, Zap, Droplets } from 'lucide-react';

interface SoilTrackerProps {
  plants: Plant[];
  records: SoilRecord[];
  onAddPlant: (plant: Omit<Plant, 'id'>) => void;
  onAddRecord: (record: Omit<SoilRecord, 'id'>) => void;
  getLatestRecord: (plantId: string) => SoilRecord | undefined;
  getRecordsForPlant: (plantId: string) => SoilRecord[];
}

export const SoilTracker: React.FC<SoilTrackerProps> = ({
  plants,
  onAddPlant,
  onAddRecord,
  getLatestRecord,
  getRecordsForPlant
}) => {
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    tds: '',
    ph: '',
    temperature: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlant || !formData.tds || !formData.ph) return;

    onAddRecord({
      plantId: selectedPlant,
      date: new Date().toISOString().split('T')[0],
      tds: parseFloat(formData.tds),
      ph: parseFloat(formData.ph),
      temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
      notes: formData.notes
    });

    setFormData({
      tds: '',
      ph: '',
      temperature: '',
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

  const getTDSStatus = (tds: number) => {
    if (tds < 500) return { status: 'Low', color: 'text-blue-600 bg-blue-100' };
    if (tds <= 1000) return { status: 'Optimal', color: 'text-green-600 bg-green-100' };
    if (tds <= 1500) return { status: 'High', color: 'text-yellow-600 bg-yellow-100' };
    return { status: 'Very High', color: 'text-red-600 bg-red-100' };
  };

  const getPHStatus = (ph: number) => {
    if (ph < 5.5) return { status: 'Too Acidic', color: 'text-red-600 bg-red-100' };
    if (ph <= 6.5) return { status: 'Optimal', color: 'text-green-600 bg-green-100' };
    if (ph <= 7.5) return { status: 'Slightly Alkaline', color: 'text-yellow-600 bg-yellow-100' };
    return { status: 'Too Alkaline', color: 'text-red-600 bg-red-100' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Mountain className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Soil TDS & pH Tracker</h1>
            <p className="text-gray-600">Monitor soil conditions and nutrient levels</p>
          </div>
        </div>
        <div className="flex gap-3">
          <QuickAddPlant onAdd={onAddPlant} />
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Measurement
          </button>
        </div>
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Soil Measurement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Plant *
                </label>
                <select
                  required
                  value={selectedPlant}
                  onChange={(e) => setSelectedPlant(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
                  TDS (ppm) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="5000"
                  step="1"
                  value={formData.tds}
                  onChange={(e) => setFormData(prev => ({ ...prev, tds: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g., 850"
                />
                <p className="text-xs text-gray-500 mt-1">Total Dissolved Solids in parts per million</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  pH Level *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="14"
                  step="0.1"
                  value={formData.ph}
                  onChange={(e) => setFormData(prev => ({ ...prev, ph: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g., 6.2"
                />
                <p className="text-xs text-gray-500 mt-1">Soil acidity/alkalinity level</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Soil Temperature (°C)
                </label>
                <input
                  type="number"
                  min="-10"
                  max="50"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g., 22.5"
                />
                <p className="text-xs text-gray-500 mt-1">Optional soil temperature reading</p>
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Observations, soil condition, etc..."
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
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Measurement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plants Grid */}
      {plants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Mountain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No plants yet</h3>
          <p className="text-gray-600 mb-6">Add your first plant to start tracking soil measurements</p>
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
                  {/* Current Readings */}
                  {latestRecord ? (
                    <div className="mb-4 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-amber-700">Latest Measurements</span>
                        <span className="text-xs text-amber-600">{formatDate(latestRecord.date)}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white p-2 rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <Zap className="w-3 h-3 text-blue-500" />
                            <span className="text-xs text-gray-600">TDS</span>
                          </div>
                          <div className="font-semibold text-gray-900">{latestRecord.tds} ppm</div>
                          <div className={`text-xs px-1 py-0.5 rounded mt-1 ${getTDSStatus(latestRecord.tds).color}`}>
                            {getTDSStatus(latestRecord.tds).status}
                          </div>
                        </div>
                        
                        <div className="bg-white p-2 rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <Droplets className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-gray-600">pH</span>
                          </div>
                          <div className="font-semibold text-gray-900">{latestRecord.ph}</div>
                          <div className={`text-xs px-1 py-0.5 rounded mt-1 ${getPHStatus(latestRecord.ph).color}`}>
                            {getPHStatus(latestRecord.ph).status}
                          </div>
                        </div>
                      </div>
                      
                      {latestRecord.temperature && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Thermometer className="w-4 h-4 text-red-500" />
                          <span className="text-gray-700">{latestRecord.temperature}°C</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                      <span className="text-sm text-gray-600">No soil measurements yet</span>
                    </div>
                  )}

                  {/* Previous Records */}
                  {allRecords.length > 1 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Previous Measurements ({allRecords.length - 1})
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {allRecords.slice(1, 4).map(record => (
                          <div key={record.id} className="text-xs bg-gray-50 p-2 rounded">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-gray-500">{formatDate(record.date)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-700">TDS: {record.tds} ppm</span>
                              <span className="text-gray-700">pH: {record.ph}</span>
                              {record.temperature && (
                                <span className="text-gray-700">{record.temperature}°C</span>
                              )}
                            </div>
                          </div>
                        ))}
                        {allRecords.length > 4 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            +{allRecords.length - 4} more measurements
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