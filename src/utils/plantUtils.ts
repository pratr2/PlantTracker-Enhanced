import { Plant, CareTask } from '../types/Plant';

export const calculateNextWateringDate = (plant: Plant): string => {
  const lastWatered = plant.lastWatered || plant.dateAcquired;
  const nextDate = new Date(lastWatered);
  nextDate.setDate(nextDate.getDate() + plant.wateringFrequency);
  return nextDate.toISOString().split('T')[0];
};

export const calculateNextFertilizingDate = (plant: Plant): string => {
  const lastFertilized = plant.lastFertilized || plant.dateAcquired;
  const nextDate = new Date(lastFertilized);
  nextDate.setDate(nextDate.getDate() + plant.fertilizingFrequency);
  return nextDate.toISOString().split('T')[0];
};

export const calculateNextRepottingDate = (plant: Plant): string => {
  const lastRepotted = plant.lastRepotted || plant.dateAcquired;
  const nextDate = new Date(lastRepotted);
  nextDate.setMonth(nextDate.getMonth() + plant.repottingFrequency);
  return nextDate.toISOString().split('T')[0];
};

export const generateCareTasks = (plants: Plant[]): CareTask[] => {
  const tasks: CareTask[] = [];
  const today = new Date().toISOString().split('T')[0];

  plants.forEach(plant => {
    const wateringDate = calculateNextWateringDate(plant);
    const fertilizingDate = calculateNextFertilizingDate(plant);
    const repottingDate = calculateNextRepottingDate(plant);

    tasks.push({
      id: `${plant.id}-watering`,
      plantId: plant.id,
      plantName: plant.name,
      type: 'watering',
      dueDate: wateringDate,
      isOverdue: wateringDate < today,
      isCompleted: false
    });

    tasks.push({
      id: `${plant.id}-fertilizing`,
      plantId: plant.id,
      plantName: plant.name,
      type: 'fertilizing',
      dueDate: fertilizingDate,
      isOverdue: fertilizingDate < today,
      isCompleted: false
    });

    tasks.push({
      id: `${plant.id}-repotting`,
      plantId: plant.id,
      plantName: plant.name,
      type: 'repotting',
      dueDate: repottingDate,
      isOverdue: repottingDate < today,
      isCompleted: false
    });
  });

  return tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
};

export const getHealthStatusColor = (status: Plant['healthStatus']): string => {
  switch (status) {
    case 'excellent': return 'text-emerald-600';
    case 'good': return 'text-green-600';
    case 'fair': return 'text-yellow-600';
    case 'poor': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const getHealthStatusBgColor = (status: Plant['healthStatus']): string => {
  switch (status) {
    case 'excellent': return 'bg-emerald-100';
    case 'good': return 'bg-green-100';
    case 'fair': return 'bg-yellow-100';
    case 'poor': return 'bg-red-100';
    default: return 'bg-gray-100';
  }
};

export const getCareTypeIcon = (type: CareTask['type']): string => {
  switch (type) {
    case 'watering': return '💧';
    case 'fertilizing': return '🌱';
    case 'repotting': return '🪴';
    default: return '🌿';
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export const getDaysUntil = (dateString: string): number => {
  const today = new Date();
  const targetDate = new Date(dateString);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};