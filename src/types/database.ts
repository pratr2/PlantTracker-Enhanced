export interface Plant {
  id: string
  user_id: string
  plant_name: string
  plant_type?: string
  pot_size?: string
  location?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface SoilHealth {
  id: string
  user_id: string
  plant_name: string
  date: string
  tds_ppm?: number
  ph?: number
  notes?: string
  created_at?: string
}

export interface Fertilization {
  id: string
  user_id: string
  plant_name: string
  date: string
  fertilizer_type: string
  dosage?: string
  method?: string
  notes?: string
  created_at?: string
}

export interface PestControl {
  id: string
  user_id: string
  plant_name: string
  date: string
  pest_type?: string
  treatment: string
  method?: string
  notes?: string
  created_at?: string
}

export interface ChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  attachments?: any[]
  timestamp: string
  created_at?: string
}