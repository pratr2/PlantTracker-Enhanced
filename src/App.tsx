import React, { useState } from 'react';
import { Leaf, Sprout, Bug, Mountain, Menu, X } from 'lucide-react';

// Simple working app first
const samplePlants = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    species: 'Monstera deliciosa',
    location: 'Living Room',
    imageUrl: 'https://images.pexels.com/photos/6912775/pexels-photo-6912775.jpeg?auto=compress&cs=tinysrgb&w=800',
    healthStatus: 'excellent'
  },
  {
    id: '2',
    name: 'Snake Plant',
    species: 'Sansevieria trifasciata',
    location: 'Bedroom',
    imageUrl: 'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg?auto=compress&cs=tinysrgb&w=800',
    healthStatus: 'good'
  }
];

function App() {
  const [currentView, setCurrentView] = useState('fertilization');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'fertilization', label: 'Fertilization', icon: Sprout, color: 'text-green-600' },
    { id: 'pest', label: 'Pest Control', icon: Bug, color: 'text-orange-600' },
    { id: 'soil', label: 'Soil Analysis', icon: Mountain, color: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">PlantTracker</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === item.id
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-2 ${currentView === item.id ? 'text-emerald-600' : item.color}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === item.id
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-2 ${currentView === item.id ? 'text-emerald-600' : item.color}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Sprout className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentView === 'fertilization' && 'Fertilization Tracker'}
                  {currentView === 'pest' && 'Pest Status & Treatment Tracker'}
                  {currentView === 'soil' && 'Soil TDS & pH Tracker'}
                </h1>
                <p className="text-gray-600">
                  {currentView === 'fertilization' && 'Track weekly fertilization records for your plants'}
                  {currentView === 'pest' && 'Monitor pest issues and track treatment effectiveness'}
                  {currentView === 'soil' && 'Monitor soil conditions and nutrient levels'}
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <span className="text-lg">+</span>
              Add Plant
            </button>
          </div>

          {/* Plants Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {samplePlants.map(plant => (
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
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700">
                        {currentView === 'fertilization' && 'Latest Fertilization'}
                        {currentView === 'pest' && 'Latest Treatment'}
                        {currentView === 'soil' && 'Latest Measurements'}
                      </span>
                      <span className="text-xs text-green-600">Dec 20, 2024</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      {currentView === 'fertilization' && 'NPK 20-20-20 • 1:1000 dilution'}
                      {currentView === 'pest' && 'No pest issues recorded'}
                      {currentView === 'soil' && 'TDS: 850 ppm • pH: 6.2'}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Records</h4>
                    <div className="text-xs text-gray-500 text-center py-2">
                      No previous records
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;