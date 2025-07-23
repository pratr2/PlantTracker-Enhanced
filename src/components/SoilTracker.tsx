import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plant, SoilHealth } from '../types/Plant'
import { Droplets, Plus, Calendar, Thermometer, Zap } from 'lucide-react'

interface SoilTrackerProps {
  plants: Plant[]
  soilRecords: SoilHealth[]
  userId: string
  onDataChange: () => void
}

export const SoilTracker: React.FC<SoilTrackerProps> = ({
  plants,
  soilRecords,
  userId,
  onDataChange
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    plant_name: '',
    tds_ppm: '',
    ph: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.plant_name || !formData.ph) return

    try {
      const soilData = {
        user_id: userId,
        plant_name: formData.plant_name,
        date: new Date().toISOString().split('T')[0],
        tds_ppm: formData.tds_ppm ? parseInt(formData.tds_ppm) : null,
        ph: parseFloat(formData.ph),
        notes: formData.notes || null
      }

      const { error } = await supabase
        .from('soil_health')
        .insert([soilData])

      if (error) throw error

      setFormData({
        plant_name: '',
        tds_ppm: '',
        ph: '',
        notes: ''
      })
      setShowAddForm(false)
      onDataChange()
    } catch (error) {
      console.error('Error saving soil record:', error)
    }
  }

  const getRecordsForPlant = (plantName: string) => {
    return soilRecords.filter(record => record.plant_name === plantName)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPHStatus = (ph: number) => {
    if (ph < 5.5) return { status: 'Too Acidic', color: 'text-red-600 bg-red-100' }
    if (ph <= 6.5) return { status: 'Optimal', color: 'text-green-600 bg-green-100' }
    if (ph <= 7.5) return { status: 'Slightly Alkaline', color: 'text-yellow-600 bg-yellow-100' }
    return { status: 'Too Alkaline', color: 'text-red-600 bg-red-100' }
  }

  const getTDSStatus = (tds: number) => {
    if (tds < 500) return { status: 'Low', color: 'text-blue-600 bg-blue-100' }
    if (tds <= 1000) return { status: 'Optimal', color: 'text-green-600 bg-green-100' }
    if (tds <= 1500) return { status: 'High', color: 'text-yellow-600 bg-yellow-100' }
    return { status: 'Very High', color: 'text-red-600 bg-red-100' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Droplets className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Soil Health History</h1>
            <p className="text-gray-600">Track pH and TDS measurements over time</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Measurement
        </button>
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Soil Measurement</h2>
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 6.2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TDS (ppm)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  step="1"
                  value={formData.tds_ppm}
                  onChange={(e) => setFormData(prev => ({ ...prev, tds_ppm: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 850"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Measurement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plants List with Soil History */}
      <div className="space-y-6">
        {plants.map(plant => {
          const plantRecords = getRecordsForPlant(plant.plant_name)
          
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

              {/* Soil Records */}
              <div className="p-6">
                {plantRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <Droplets className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No soil measurements recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Soil Health History ({plantRecords.length} records)
                    </h4>
                    <div className="grid gap-3">
                      {plantRecords.map(record => (
                        <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(record.date)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Droplets className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-gray-700">pH: {record.ph}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPHStatus(record.ph!).color}`}>
                                {getPHStatus(record.ph!).status}
                              </span>
                            </div>
                            {record.tds_ppm && (
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm text-gray-700">TDS: {record.tds_ppm} ppm</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTDSStatus(record.tds_ppm).color}`}>
                                  {getTDSStatus(record.tds_ppm).status}
                                </span>
                              </div>
                            )}
                          </div>
                          {record.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">{record.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {plants.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Droplets className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No plants yet</h3>
          <p className="text-gray-600">Add plants in the Overview tab to start tracking soil health</p>
        </div>
      )}
    </div>
  )
}