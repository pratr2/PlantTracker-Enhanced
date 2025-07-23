import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plant, Fertilization } from '../types/Plant'
import { Sprout, Plus, Calendar, Beaker, Table, Grid } from 'lucide-react'

interface FertilizationTrackerProps {
  plants: Plant[]
  fertilizationRecords: Fertilization[]
  userId: string
  onDataChange: () => void
}

export const FertilizationTracker: React.FC<FertilizationTrackerProps> = ({
  plants,
  fertilizationRecords,
  userId,
  onDataChange
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [formData, setFormData] = useState({
    plant_name: '',
    fertilizer_type: '',
    dosage: '',
    method: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.plant_name || !formData.fertilizer_type) return

    try {
      const fertData = {
        user_id: userId,
        plant_name: formData.plant_name,
        date: new Date().toISOString().split('T')[0],
        fertilizer_type: formData.fertilizer_type,
        dosage: formData.dosage || null,
        method: formData.method || null,
        notes: formData.notes || null
      }

      const { error } = await supabase
        .from('fertilization')
        .insert([fertData])

      if (error) throw error

      setFormData({
        plant_name: '',
        fertilizer_type: '',
        dosage: '',
        method: '',
        notes: ''
      })
      setShowAddForm(false)
      onDataChange()
    } catch (error) {
      console.error('Error saving fertilization record:', error)
    }
  }

  const getRecordsForPlant = (plantName: string) => {
    return fertilizationRecords.filter(record => record.plant_name === plantName)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Sprout className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fertilization History</h1>
            <p className="text-gray-600">Track fertilization records and feeding schedules</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 ${viewMode === 'table' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Table className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 ${viewMode === 'card' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Grid className="w-5 h-5" />
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
                  value={formData.plant_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, plant_name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Choose a plant...</option>
                  {plants.map(plant => (
                    <option key={plant.id} value={plant.plant_name}>
                      {plant.plant_name} ({plant.plant_type})
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
                  value={formData.fertilizer_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, fertilizer_type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., NPK 20-20-20, Organic Compost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage
                </label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 1:1000, 2ml/L"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method
                </label>
                <input
                  type="text"
                  value={formData.method}
                  onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Soil application, Foliar spray"
                />
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

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Latest Fertilizer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Records
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plants.map((plant) => {
                  const plantRecords = getRecordsForPlant(plant.plant_name)
                  const latestRecord = plantRecords[0]

                  return (
                    <tr key={plant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{plant.plant_name}</div>
                          <div className="text-sm text-gray-500">{plant.plant_type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {plant.pot_size || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {plant.location || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {latestRecord?.fertilizer_type || 'No data'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {latestRecord?.dosage || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {latestRecord ? formatDate(latestRecord.date) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {plantRecords.length} records
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plants.map(plant => {
            const plantRecords = getRecordsForPlant(plant.plant_name)
            const latestRecord = plantRecords[0]
            
            return (
              <div key={plant.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Plant Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{plant.plant_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        {plant.plant_type && <span>Type: {plant.plant_type}</span>}
                        {plant.pot_size && <span>Size: {plant.pot_size}</span>}
                        {plant.location && <span>Location: {plant.location}</span>}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Latest Fertilization Data */}
                <div className="p-6">
                  {latestRecord ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Latest Fertilization</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Beaker className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-700">{latestRecord.fertilizer_type}</span>
                        </div>
                        {latestRecord.dosage && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Dosage:</span> {latestRecord.dosage}
                          </div>
                        )}
                        {latestRecord.method && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Method:</span> {latestRecord.method}
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          Last applied: {formatDate(latestRecord.date)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total records: {plantRecords.length}
                        </div>
                        {latestRecord.notes && (
                          <p className="text-sm text-gray-600 italic">{latestRecord.notes}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Sprout className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No fertilization records</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {plants.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Sprout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No plants yet</h3>
          <p className="text-gray-600">Add plants in the Overview tab to start tracking fertilization</p>
        </div>
      )}
    </div>
  )
}