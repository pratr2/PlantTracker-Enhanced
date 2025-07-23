export interface Plant {
  id: string;
  name: string;
  species: string;
  location: string;
  imageUrl: string;
  dateAcquired: string;
  notes: string;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface FertilizationRecord {
  id: string;
  plantId: string;
  date: string;
  fertilizerType: string;
  concentration: string; // e.g., "1:1000", "2ml/L"
  method: 'foliar' | 'soil' | 'hydroponic';
  notes: string;
}

export interface PestRecord {
  id: string;
  plantId: string;
  date: string;
  pestType: string;
  severity: 'low' | 'medium' | 'high';
  treatmentUsed: string;
  treatmentMethod: string;
  effectiveness: 'excellent' | 'good' | 'fair' | 'poor' | 'pending';
  notes: string;
}

export interface SoilRecord {
  id: string;
  plantId: string;
  date: string;
  tds: number; // Total Dissolved Solids in ppm
  ph: number;
  temperature?: number; // Optional soil temperature
  notes: string;
}

export type TrackingData = {
  fertilization: FertilizationRecord[];
  pest: PestRecord[];
  soil: SoilRecord[];
};