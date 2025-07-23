import React, { useState } from 'react';
import { useTracking } from './hooks/useTracking';
import { FertilizationTracker } from './components/FertilizationTracker';
import { PestTracker } from './components/PestTracker';
import { SoilTracker } from './components/SoilTracker';
import { Leaf, Sprout, Bug, Mountain, Menu, X } from 'lucide-react';

type ViewMode = 'fertilization' | 'pest' | 'soil';

function App() {
  const { 
    plants, 
    trackingData,
    isLoading, 
    addPlant,
    addFertilizationRecord,
    addPestRecord,
    addSoilRecord,
    getLatestRecordForPlant,
    getRecordsForPlant
  } = useTracking();

  const [currentView, setCurrentView] = useState<ViewMode>('fertilization');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'fertilization', label: 'Fertilization', icon: Sprout, color: 'text-green-600' },
    { id: 'pest', label: 'Pest Control', icon: Bug, color: 'text-orange-600' },
    { id: 'soil', label: 'Soil Analysis', icon: Mountain, color: 'text-amber-600' },
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'fertilization':
        return (
          <FertilizationTracker
            plants={plants}
            records={trackingData.fertilization}
            onAddPlant={addPlant}
            onAddRecord={addFertilizationRecord}
            getLatestRecord={(plantId) => getLatestRecordForPlant(plantId, 'fertilization')}
            getRecordsForPlant={(plantId) => getRecordsForPlant(plantId, 'fertilization')}
          />
        );

      case 'pest':
        return (
          <PestTracker
            plants={plants}
            records={trackingData.pest}
            onAddPlant={addPlant}
            onAddRecord={addPestRecord}
            getLatestRecord={(plantId) => getLatestRecordForPlant(plantId, 'pest')}
            getRecordsForPlant={(plantId) => getRecordsForPlant(plantId, 'pest')}
          />
        );

      case 'soil':
        return (
          <SoilTracker
            plants={plants}
            records={trackingData.soil}
            onAddPlant={addPlant}
            onAddRecord={addSoilRecord}
            getLatestRecord={(plantId) => getLatestRecordForPlant(plantId, 'soil')}
            getRecordsForPlant={(plantId) => getRecordsForPlant(plantId, 'soil')}
          />
        );

      default:
        return null;
    }
  };

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
                    onClick={() => setCurrentView(item.id as ViewMode)}
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
                      setCurrentView(item.id as ViewMode);
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
        {renderContent()}
      </main>
    </div>
  );
}

export default App;