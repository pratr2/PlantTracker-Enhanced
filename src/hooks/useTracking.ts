import { useState, useEffect } from 'react';
import { Plant, TrackingData, FertilizationRecord, PestRecord, SoilRecord } from '../types/Plant';

const samplePlants: Plant[] = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    species: 'Monstera deliciosa',
    location: 'Living Room',
    imageUrl: 'https://images.pexels.com/photos/6912775/pexels-photo-6912775.jpeg?auto=compress&cs=tinysrgb&w=800',
    dateAcquired: '2024-01-15',
    notes: 'Loves bright, indirect light. Watch for spider mites.',
    healthStatus: 'excellent'
  },
  {
    id: '2',
    name: 'Snake Plant',
    species: 'Sansevieria trifasciata',
    location: 'Bedroom',
    imageUrl: 'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg?auto=compress&cs=tinysrgb&w=800',
    dateAcquired: '2024-03-10',
    notes: 'Very low maintenance. Perfect for beginners.',
    healthStatus: 'good'
  },
  {
    id: '3',
    name: 'Fiddle Leaf Fig',
    species: 'Ficus lyrata',
    location: 'Office',
    imageUrl: 'https://images.pexels.com/photos/6208086/pexels-photo-6208086.jpeg?auto=compress&cs=tinysrgb&w=800',
    dateAcquired: '2024-02-20',
    notes: 'Needs consistent care schedule. Sensitive to overwatering.',
    healthStatus: 'fair'
  }
];

const sampleTrackingData: TrackingData = {
  fertilization: [
    {
      id: '1',
      plantId: '1',
      date: '2024-12-15',
      fertilizerType: 'Liquid NPK 20-20-20',
      concentration: '1:1000',
      method: 'soil',
      notes: 'Good response, new growth visible'
    },
    {
      id: '2',
      plantId: '1',
      date: '2024-12-08',
      fertilizerType: 'Organic Compost Tea',
      concentration: '1:500',
      method: 'soil',
      notes: 'Weekly feeding routine'
    }
  ],
  pest: [
    {
      id: '1',
      plantId: '2',
      date: '2024-12-18',
      pestType: 'Spider Mites',
      severity: 'low',
      treatmentUsed: 'Neem Oil',
      treatmentMethod: 'Foliar spray',
      effectiveness: 'good',
      notes: 'Applied in evening, will monitor'
    }
  ],
  soil: [
    {
      id: '1',
      plantId: '1',
      date: '2024-12-20',
      tds: 850,
      ph: 6.2,
      temperature: 22,
      notes: 'Optimal range for growth'
    },
    {
      id: '2',
      plantId: '1',
      date: '2024-12-13',
      tds: 920,
      ph: 6.5,
      temperature: 21,
      notes: 'Slightly high TDS, will dilute next feeding'
    }
  ]
};

export const useTracking = () => {
  const [plants, setPlantsState] = useState<Plant[]>([]);
  const [trackingData, setTrackingDataState] = useState<TrackingData>({
    fertilization: [],
    pest: [],
    soil: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedPlants = localStorage.getItem('plants');
    const savedTracking = localStorage.getItem('trackingData');
    
    if (savedPlants) {
      setPlantsState(JSON.parse(savedPlants));
    } else {
      setPlantsState(samplePlants);
      localStorage.setItem('plants', JSON.stringify(samplePlants));
    }

    if (savedTracking) {
      setTrackingDataState(JSON.parse(savedTracking));
    } else {
      setTrackingDataState(sampleTrackingData);
      localStorage.setItem('trackingData', JSON.stringify(sampleTrackingData));
    }
    
    setIsLoading(false);
  }, []);

  const setPlants = (newPlants: Plant[]) => {
    setPlantsState(newPlants);
    localStorage.setItem('plants', JSON.stringify(newPlants));
  };

  const setTrackingData = (newData: TrackingData) => {
    setTrackingDataState(newData);
    localStorage.setItem('trackingData', JSON.stringify(newData));
  };

  const addPlant = (plant: Omit<Plant, 'id'>) => {
    const newPlant = {
      ...plant,
      id: Date.now().toString()
    };
    const updatedPlants = [...plants, newPlant];
    setPlants(updatedPlants);
    return newPlant;
  };

  const updatePlant = (id: string, updates: Partial<Plant>) => {
    const updatedPlants = plants.map(plant => 
      plant.id === id ? { ...plant, ...updates } : plant
    );
    setPlants(updatedPlants);
  };

  const deletePlant = (id: string) => {
    const updatedPlants = plants.filter(plant => plant.id !== id);
    setPlants(updatedPlants);
    
    // Also remove all tracking data for this plant
    const updatedTracking = {
      fertilization: trackingData.fertilization.filter(record => record.plantId !== id),
      pest: trackingData.pest.filter(record => record.plantId !== id),
      soil: trackingData.soil.filter(record => record.plantId !== id)
    };
    setTrackingData(updatedTracking);
  };

  const addFertilizationRecord = (record: Omit<FertilizationRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString() };
    const updatedData = {
      ...trackingData,
      fertilization: [newRecord, ...trackingData.fertilization]
    };
    setTrackingData(updatedData);
  };

  const addPestRecord = (record: Omit<PestRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString() };
    const updatedData = {
      ...trackingData,
      pest: [newRecord, ...trackingData.pest]
    };
    setTrackingData(updatedData);
  };

  const addSoilRecord = (record: Omit<SoilRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString() };
    const updatedData = {
      ...trackingData,
      soil: [newRecord, ...trackingData.soil]
    };
    setTrackingData(updatedData);
  };

  const getLatestRecordForPlant = (plantId: string, type: keyof TrackingData) => {
    return trackingData[type]
      .filter(record => record.plantId === plantId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const getRecordsForPlant = (plantId: string, type: keyof TrackingData) => {
    return trackingData[type]
      .filter(record => record.plantId === plantId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return {
    plants,
    trackingData,
    isLoading,
    addPlant,
    updatePlant,
    deletePlant,
    addFertilizationRecord,
    addPestRecord,
    addSoilRecord,
    getLatestRecordForPlant,
    getRecordsForPlant
  };
};