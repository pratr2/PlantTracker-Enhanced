import React, { useState } from 'react';
import { Plant, PestRecord } from '../types/Plant';
import { QuickAddPlant } from './QuickAddPlant';
import { Bug, Plus, Calendar, Shield, AlertTriangle } from 'lucide-react';

interface PestTrackerProps {
  plants: Plant[];
  records: PestRecord[];
  onAddPlant: (plant: Omit<Plant, 'id'>) => void;
  onAddRecord: (record: Omit<PestRecord, 'id'>) => void;
  getLatestRecord: (plantId: string) => PestRecord | undefined;
  getRecordsForPlant: (plantId: string) => PestRecord[];
}

export const PestTracker: React.FC<PestTrackerProps> = ({
  plants,
  onAddPlant,
  onAddRecord,
  getLatestRecord,
  getRecordsForPlant
}) => {
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    pestType: '',
    severity: 'low' as PestRecord['severity'],
    treatmentUsed: '',
    treatmentMethod: '',
    effectiveness: 'pending' as PestRecord['effectiveness'],
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlant || !formData.pestType) return;

    onAddRecord({
      plantId: selectedPlant,
      date: new Date().toISOString().split('T')[0],
      ...formData
    });

    setFormData({
      pestType: '',
      severity: 'low',
      treatmentUsed: '',
      treatmentMethod: '',
      effectiveness: 'pending',
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

  const getSeverityColor = (severity: PestRecord['severity']) => {
    switch (severity) {
      case 'low': return 'text-yellow-600 bg-yellow-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEffectivenessColor = (effectiveness: PestRecord['effectiveness']) => {
    switch (effectiveness) {
      case 'excellent': return 'text-emerald-600 bg-emerald-100';
      case 'good': return 'text-green-600 bg-green-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Bug className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pest Status & Treatment Tracker</h1>
            <p className="text-gray-600">Monitor pest issues and track treatment effectiveness</p>
          </div>
        </div>
        <div className="flex gap-3">
          <QuickAddPlant onAdd={onAddPlant} />
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Pest Treatment Record</h2>
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                  Pest Type *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pestType}
                  onChange={(e) => setFormData(prev => ({ ...prev, pestType: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Spider Mites, Aphids, Scale"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity Level
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as PestRecord['severity'] }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Used
                </label>
                <input
                  type="text"
                  value={formData.treatmentUsed}
                  onChange={(e) => setFormData(prev => ({ ...prev, treatmentUsed: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Neem Oil, Insecticidal Soap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Method
                </label>
                <input
                  type="text"
                  value={formData.treatmentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, treatmentMethod: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Foliar spray, Soil drench"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Effectiveness
                </label>
                <select
                  value={formData.effectiveness}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveness: e.target.value as PestRecord['effectiveness'] }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="pending">Pending</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Observations, follow-up actions, etc..."
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
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
          <Bug className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No plants yet</h3>
          <p className="text-gray-600 mb-6">Add your first plant to start tracking pest status</p>
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
                  {/* Current Status */}
                  {latestRecord ? (
                    <div className="mb-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-orange-700">Latest Treatment</span>
                        <span className="text-xs text-orange-600">{formatDate(latestRecord.date)}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Bug className="w-4 h-4 text-orange-600" />
                          <span className="text-gray-700">{latestRecord.pestType}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(latestRecord.severity)}`}>
                            {latestRecord.severity}
                          </span>
                        </div>
                        {latestRecord.treatmentUsed && (
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-700">{latestRecord.treatmentUsed}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Effectiveness:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffectivenessColor(latestRecord.effectiveness)}`}>
                            {latestRecord.effectiveness}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">No pest issues recorded</span>
                      </div>
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
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-gray-700">{record.pestType}</span>
                              <span className="text-gray-500">{formatDate(record.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-1 py-0.5 rounded text-xs ${getSeverityColor(record.severity)}`}>
                                {record.severity}
                              </span>
                              <span className={`px-1 py-0.5 rounded text-xs ${getEffectivenessColor(record.effectiveness)}`}>
                                {record.effectiveness}
                              </span>
                            </div>
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