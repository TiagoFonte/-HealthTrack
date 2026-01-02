// src/app/models/activity.model.ts

export enum IntensityLevel {
  LOW = 'Baixa',
  MODERATE = 'Moderada',
  HIGH = 'Alta'
}

export enum SportType {
  RUNNING = 'Corrida',
  CYCLING = 'Ciclismo',
  GYM = 'Ginásio',
  FOOTBALL = 'Futebol',
  OTHER = 'Outro'
}

export interface Activity {
  id: string;
  type: SportType;
  duration: number;
  date: string;
  location: string;
  intensity: IntensityLevel;
  notes?: string;
  isFavorite: boolean;
}