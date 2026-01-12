export interface Activity {
  id: string;
  type: string;
  duration: number;
  intensity: 'Baixa' | 'Moderada' | 'Alta';
  date: string;
  calories: number;
  location?: string;
  notes?: string;
  lat?: number;
  lng?: number;
  isFavorite?: boolean;
  feeling?: string;
  
  // CAMPOS ADICIONAIS PARA MÉTRICAS DE SAÚDE (Resolve os erros TS2339)
  distance?: number;   // Para o erro do daily-summary
  steps?: number;      // Para as métricas de caminhada
  avgBpm?: number;     // Para os batimentos cardíacos
  elevation?: number;  // Para desnível em cardio
  laps?: number;       // Para natação
  outcome?: string;    // Para vitórias/derrotas em jogos
}