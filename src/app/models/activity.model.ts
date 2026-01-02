// src/app/models/activity.model.ts

// 1. Enum para a Intensidade (Requisito 1.1)
export enum IntensityLevel {
  LOW = 'Baixa',
  MODERATE = 'Moderada',
  HIGH = 'Alta'
}

// 2. Enum para o Tipo de Desporto
export enum SportType {
  RUNNING = 'Corrida',
  CYCLING = 'Ciclismo',
  GYM = 'Ginásio',
  FOOTBALL = 'Futebol',
  OTHER = 'Outro'
}

// 3. A Interface da Atividade
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