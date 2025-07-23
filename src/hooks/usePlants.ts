import { useState, useEffect } from 'react';
import { Plant } from '../types/Plant';

const samplePlants: Plant[] = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    species: 'Monstera deliciosa',
    location: 'Living Room',
    imageUrl: 'https://images.pexels.com/photos/6912775/pexels-photo-6912775.jpeg?auto=compress&cs=tinysrgb&w=800',
    dateAcquired: '2024-01-15',
    lastWatered: '2024-12-20',
    lastFertilized: '2024-12-01',
    lastRepotted: '2024-06-01',
    wateringFrequency: 7,
    fertilizingFrequency: 30,
    repottingFrequency: 24,
    notes: 'Loves bright, indirect light. Watch for spider mites.',
    healthStatus: 'excellent',
    careInstructions: {
      light: 'Bright, indirect light',
      humidity: '60-70%',
      temperature: '65-80°F',
      soil: 'Well-draining potting mix'
    }
  },
  {
    id: '2',
    name: 'Snake Plant',
    species: 'Sansevieria trifasciata',
    location: 'Bedroom',
    imageUrl: 'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg?auto=compress&cs=tinysrgb&w=800',
    dateAcquired: '2024-03-10',
    lastWatered: '2024-12-10',
    lastFertilized: '2024-11-15',
    wateringFrequency: 14,
    fertilizingFrequency: 60,
    repottingFrequency: 36,
    notes: 'Very low maintenance. Perfect for beginners.',
    healthStatus: 'good',
    careInstructions: {
      light: 'Low to bright light',
      humidity: '30-50%',
      temperature: '60-80°F',
      soil: 'Well-draining cactus mix'
    }
  },
  {
    id: '3',
    name: 'Fiddle Leaf Fig',
    species: 'Ficus lyrata',
    location: 'Office',
    imageUrl: 'https://images.pexels.com/photos/6208086/pexels-photo-6208086.jpeg?auto=compress&cs=tinysrgb&w=800',
    dateAcquired: '2024-02-20',
    lastWatered: '2024-12-18',
    lastFertilized: '2024-11-20',
    lastRepotted: '2024-02-20',
    wateringFrequency: 10,
    fertilizingFrequency: 45,
    repottingFrequency: 24,
    notes: 'Needs consistent watering schedule. Sensitive to overwatering.',
    healthStatus: 'fair',
    careInstructions: {
      light: 'Bright, indirect light',
      humidity: '50-60%',
      temperature: '65-75°F',
      soil: 'Well-draining potting mix'
    }
  },
  {
    id: '4',
    name: 'Pothos',
    species: 'Epipremnum aureum',
    location: 'Kitchen',
    imageUrl: 'https://images.pexels.com/photos/4751269/pexels-photo-4751269.jpeg?auto=compress&cs=tinysrgb&w=800',
    dateAcquired: '2024-04-05',
    lastWatered: '2024-12-19',
    lastFertilized: '2024-12-05',
    wateringFrequency: 5,
    fertilizingFrequency: 30,
    repottingFrequency: 18,
    notes: 'Trailing vine, great for hanging baskets. Very forgiving.',
    healthStatus: 'excellent',
    careInstructions: {
      light: 'Low to bright light',
      humidity: '40-60%',
      temperature: '65-85°F',
      soil: 'Standard potting mix'
    }
  },
  {
    id: '5',
    name: 'ZZ Plant',
    species: 'Zamioculcas zamiifolia',
    location: 'Bathroom',
    imageUrl: 'https://images.pexels.com/photos/6208087/pexels-photo-6208087.jpeg?auto=compress&cs=tinysrgb&w=800',
    dateAcquired: '2024-05-12',
    lastWatered: '2024-12-05',
    lastFertilized: '2024-10-15',
    wateringFrequency: 21,
    fertilizingFrequency: 90,
    repottingFrequency: 36,
    notes: 'Extremely drought tolerant. Perfect for low light areas.',
    healthStatus: 'good',
    careInstructions: {
      light: 'Low to moderate light',
      humidity: '40-50%',
      temperature: '65-75°F',
      soil: 'Well-draining potting mix'
    }
  }
];

export const usePlants = () => {
  const [plants, setPlantsState] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading from localStorage or API
    const savedPlants = localStorage.getItem('plants');
    if (savedPlants) {
      setPlantsState(JSON.parse(savedPlants));
    } else {
      setPlantsState(samplePlants);
      localStorage.setItem('plants', JSON.stringify(samplePlants));
    }
    setIsLoading(false);
  }, []);

  const setPlants = (newPlants: Plant[]) => {
    setPlantsState(newPlants);
    localStorage.setItem('plants', JSON.stringify(newPlants));
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
  };

  const waterPlant = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    updatePlant(id, { lastWatered: today });
  };

  const fertilizePlant = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    updatePlant(id, { lastFertilized: today });
  };

  const repotPlant = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    updatePlant(id, { lastRepotted: today });
  };

  return {
    plants,
    isLoading,
    addPlant,
    updatePlant,
    deletePlant,
    waterPlant,
    fertilizePlant,
    repotPlant
  };
};