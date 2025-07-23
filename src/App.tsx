import React, { useState, useEffect } from 'react'
import { Leaf, Eye, EyeOff, BarChart3, Droplets, Sprout, Bug } from 'lucide-react'
import { supabase } from './lib/supabase'
import { Plant, SoilHealth, Fertilization, PestControl } from './types/Plant'
import { ChatBot } from './components/ChatBot'
import { PlantsTable } from './components/PlantsTable'
import { SoilTracker } from './components/SoilTracker'
import { FertilizationTracker } from './components/FertilizationTracker'
import { PestTracker } from './components/PestTracker'

type TabType = 'overview' | 'soil' | 'fertilization' | 'pest'

function App() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Data states
  const [plants, setPlantsState] = useState<Plant[]>([])
  const [soilRecords, setSoilRecords] = useState<SoilHealth[]>([])
  const [fertilizationRecords, setFertilizationRecords] = useState<Fertilization[]>([])
  const [pestRecords, setPestRecords] = useState<PestControl[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load all data when user is authenticated
  useEffect(() => {
    if (user) {
      loadAllData()
    }
  }, [user])

  const loadAllData = async () => {
    if (!user) return
    
    setDataLoading(true)
    try {
      // Load plants
      const { data: plantsData, error: plantsError } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (plantsError) throw plantsError
      setPlantsState(plantsData || [])

      // Load soil health records
      const { data: soilData, error: soilError } = await supabase
        .from('soil_health')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (soilError) throw soilError
      setSoilRecords(soilData || [])

      // Load fertilization records
      const { data: fertData, error: fertError } = await supabase
        .from('fertilization')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (fertError) throw fertError
      setFertilizationRecords(fertData || [])

      // Load pest control records
      const { data: pestData, error: pestError } = await supabase
        .from('pest_control')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (pestError) throw pestError
      setPestRecords(pestData || [])

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error
      setUser(data.user)
    } catch (error: any) {
      console.error('Login error:', error.message)
      alert('Login failed: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPlantsState([])
    setSoilRecords([])
    setFertilizationRecords([])
    setPestRecords([])
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'soil', label: 'Soil Health', icon: Droplets },
    { id: 'fertilization', label: 'Fertilization', icon: Sprout },
    { id: 'pest', label: 'Pest Control', icon: Bug }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PlantTracker</h1>
            <p className="text-gray-600">Track your plant maintenance with ease</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Welcome Back</h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button 
                  onClick={() => alert('Sign up functionality would be implemented here')}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">PlantTracker</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dataLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <PlantsTable 
                userId={user.id} 
                plants={plants}
                soilRecords={soilRecords}
                fertilizationRecords={fertilizationRecords}
                pestRecords={pestRecords}
                onDataChange={loadAllData}
              />
            )}
            {activeTab === 'soil' && (
              <SoilTracker 
                plants={plants}
                soilRecords={soilRecords}
                userId={user.id}
                onDataChange={loadAllData}
              />
            )}
            {activeTab === 'fertilization' && (
              <FertilizationTracker 
                plants={plants}
                fertilizationRecords={fertilizationRecords}
                userId={user.id}
                onDataChange={loadAllData}
              />
            )}
            {activeTab === 'pest' && (
              <PestTracker 
                plants={plants}
                pestRecords={pestRecords}
                userId={user.id}
                onDataChange={loadAllData}
              />
            )}
          </>
        )}
      </main>

      {/* ChatBot - Fixed position, always visible */}
      <ChatBot userId={user.id} />
    </div>
  )
}

export default App