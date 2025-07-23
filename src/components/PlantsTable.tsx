import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plant, SoilHealth, Fertilization, PestControl } from '../types/database'
import { Plus, Edit, Trash2, Leaf } from 'lucide-react'

interface PlantWithDetails extends Plant {
  latest_soil?: SoilHealth
  latest_fertilization?: Fertilization
  latest_pest_control?: PestControl
}

interface PlantsTableProps {
  userId: string
}

export const PlantsTable: React.FC<PlantsTableProps> = ({ userId }) => {
  const [plants, setPlantsState] = useState<PlantWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null)
  const [formData, setFormData] = useState({
    plant_name: '',
    plant_type: '',
    pot_size: '',
    location: '',
    notes: ''
  })

  useEffect(() => {
    loadPlants()
  }, [userId])

  const loadPlants = async () => {
    try {
      setIsLoading(true)
      
      // Get plants
      const { data: plantsData, error: plantsError } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (plantsError) throw plantsError

      // Get latest records for each plant
      const plantsWithDetails: PlantWithDetails[] = []
      
      for (const plant of plantsData || []) {
        // Latest soil health
        const { data: soilData } = await supabase
          .from('soil_health')
          .select('*')
          .eq('user_id', userId)
          .eq('plant_name', plant.plant_name)
          .order('date', { ascending: false })
          .limit(1)

        // Latest fertilization
        const { data: fertData } = await supabase
          .from('fertilization')
          .select('*')
          .eq('user_id', userId)
          .eq('plant_name', plant.plant_name)
          .order('date', { ascending: false })
          .limit(1)

        // Latest pest control
        const { data: pestData } = await supabase
          .from('pest_control')
          .select('*')
          .eq('user_id', userId)
          .eq('plant_name', plant.plant_name)
          .order('date', { ascending: false })
          .limit(1)

        plantsWithDetails.push({
          ...plant,
          latest_soil: soilData?.[0],
          latest_fertilization: fertData?.[0],
          latest_pest_control: pestData?.[0]
        })
      }

      setPlantsState(plantsWithDetails)
    } catch (error) {
      console.error('Error loading plants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.plant_name.trim()) return

    try {
      const plantData = {
        user_id: userId,
        ...formData
      }

      if (editingPlant) {
        const { error } = await supabase
          .from('plants')
          .update(plantData)
          .eq('id', editingPlant.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('plants')
          .insert([plantData])
        if (error) throw error
      }

      setFormData({
        plant_name: '',
        plant_type: '',
        pot_size: '',
        location: '',
        notes: ''
      })
      setShowAddForm(false)
      setEditingPlant(null)
      loadPlants()
    } catch (error) {
      console.error('Error saving plant:', error)
    }
  }

  const handleEdit = (plant: Plant) => {
    setEditingPlant(plant)
    setFormData({
      plant_name: plant.plant_name,
      plant_type: plant.plant_type || '',
      pot_size: plant.pot_size || '',
      location: plant.location || '',
      notes: plant.notes || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (plantId: string) => {
    if (!confirm('Are you sure you want to delete this plant?')) return

    try {
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', plantId)
      
      if (error) throw error
      loadPlants()
    } catch (error) {
      console.error('Error deleting plant:', error)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Leaf className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Plants</h1>
            <p className="text-gray-600">Manage your plant collection and track their health</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingPlant(null)
            setFormData({
              plant_name: '',
              plant_type: '',
              pot_size: '',
              location: '',
              notes: ''
            })
          }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Plant
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingPlant ? 'Edit Plant' : 'Add New Plant'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plant Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.plant_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, plant_name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Monstera Deliciosa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plant Type
                </label>
                <input
                  type="text"
                  value={formData.plant_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, plant_type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Houseplant, Succulent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pot Size
                </label>
                <input
                  type="text"
                  value={formData.pot_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, pot_size: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., 6 inch, Large"
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
                  placeholder="e.g., Living Room, Balcony"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Any additional notes..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingPlant(null)
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {editingPlant ? 'Update Plant' : 'Add Plant'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plants Table */}
      {plants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Leaf className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No plants yet</h3>
          <p className="text-gray-600 mb-6">Add your first plant to start tracking its health</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soil pH
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TDS (ppm)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Fertilized
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Treatment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plants.map((plant) => (
                  <tr key={plant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{plant.plant_name}</div>
                        <div className="text-sm text-gray-500">{plant.plant_type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plant.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plant.latest_soil?.ph ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          plant.latest_soil.ph >= 6.0 && plant.latest_soil.ph <= 7.0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {plant.latest_soil.ph}
                        </span>
                      ) : (
                        <span className="text-gray-400">No data</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plant.latest_soil?.tds_ppm ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          plant.latest_soil.tds_ppm >= 500 && plant.latest_soil.tds_ppm <= 1000
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {plant.latest_soil.tds_ppm}
                        </span>
                      ) : (
                        <span className="text-gray-400">No data</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(plant.latest_fertilization?.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(plant.latest_pest_control?.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(plant)}
                          className="text-emerald-600 hover:text-emerald-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plant.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}