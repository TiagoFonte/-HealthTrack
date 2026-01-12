import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

const LANG_KEY = 'selected_lang';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  
  private _currentLang = 'pt';
  public get currentLang() { return this._currentLang; } 

  private _translations = new BehaviorSubject<any>({});
  translations$ = this._translations.asObservable();

  private dictionary: any = {
    'pt': {
      daySummaryTitle: 'Resumo do Dia',
      totalTime: 'TEMPO TOTAL',
      timeline: 'Cronologia',
      estimated: '(EST.)',
      locale: 'pt-PT',

      // --- MÉTRICAS DE SENSORES ---
      stepsLabel: 'Passos',
      daysLabel: 'Dias',
      bpmLabel: 'BPM',

      howFelt: 'Como te sentiste?',
      feltTired: 'Cansado', feltGood: 'Bem', feltEnergized: 'Energizado',
      distanceLabel: 'Distância (km)', elevationLabel: 'Elevação (m)',
      gameOutcomeLabel: 'Resultado',
      win: 'Vitória', draw: 'Empate', loss: 'Derrota',
      lapsLabel: 'Piscinas',
      gymFocusLabel: 'Foco do Treino',
      additionalNotes: 'Notas Adicionais',
      moreDetails: 'Mais detalhes...',

      tabHome: 'Início', tabDiary: 'Atividades', tabProfile: 'Perfil',
      goodMorning: 'Bom dia', goodAfternoon: 'Boa tarde', goodNight: 'Boa noite',
      todaysActivity: 'Atividade de Hoje', registerNew: 'Registar novo treino',
      weeklyStats: 'Semana', trainingMinutes: 'Minutos de treino', lastWorkout: 'Último Treino',
      tipDay: 'Dica do Dia', kcal: 'Kcal', minutes: 'Minutos', workouts: 'Treinos', totalKcal: 'Total Kcal',

      hydration: 'Hidratação',
      cups: 'copos',
      completed: 'Concluído',
      waterGoalReached: 'Meta de hidratação atingida!',

      quotes: ["O único treino mau é aquele que não aconteceu.", "A tua saúde é o teu maior investimento.", "Não pares quando estiveres cansado, para quando terminares.", "Cada passo conta. Continua!", "Hoje é um bom dia para superares os teus limites."],

      monthlyReport: 'Relatório Mensal',
      monthlyWorkouts: 'Treinos este mês',
      mostPracticed: 'Mais praticado',
      monthlyMinutes: 'Minutos totais',

      diaryTitle: 'Diário', newBtn: 'Novo', list: 'Lista', calendar: 'Calendário', searchPlaceholder: 'Pesquisar...',
      all: 'Todos', favorites: 'Fav', noActivities: 'Nenhum treino encontrado.', selectDay: 'Selecione um dia.', workoutsOf: 'Treinos do dia:',
      
      profileTitle: 'Perfil', personalData: 'Dados Pessoais', settings: 'Definições', name: 'Nome', phone: 'Telemóvel',
      language: 'Idioma', darkMode: 'Modo Escuro',"terms": "Termos e Condições", logout: 'Terminar Sessão',
      healthStats: 'Estatísticas de Saúde', weight: 'Peso', height: 'Altura', goal: 'Meta', dailyGoal: 'Meta Diária', bmi: 'IMC',
      bmiNote: 'O IMC é um indicador geral.', underweight: 'Abaixo do Peso', normalWeight: 'Peso Normal', overweight: 'Sobrepeso', obesity: 'Obesidade',
      achievements: 'Conquistas', seeDetails: 'Ver Detalhes', dailyReminder: 'Lembrete Diário',
      
      badge_beginner: 'Iniciante', badge_beginner_desc: 'Complete o seu primeiro treino.',
      badge_burner: 'Queimador', badge_burner_desc: 'Queime 500kcal num só dia.',
      badge_loyal: 'Fiel', badge_loyal_desc: 'Complete 3 treinos no total.',
      badge_master: 'Mestre', badge_master_desc: 'Alcance a marca de 10 treinos.',
      cancel: 'Cancelar', save: 'Guardar', edit: 'Editar',

      newActivityTitle: 'Nova Atividade',
      editActivityTitle: 'Editar Atividade',
      sportLabel: 'Desporto',
      selectPlaceholder: 'Selecionar',
      durationLabel: 'Duração (min)',
      intensityLabel: 'Intensidade',
      dateLabel: 'Data',
      locationLabel: 'Localização',
      mapPlaceholder: 'Toque para abrir mapa',
      notesLabel: 'Notas',
      notesPlaceholder: 'Escreve aqui...',
      createBtn: 'CRIAR ATIVIDADE',
      updateBtn: 'ATUALIZAR ATIVIDADE',
      activityCreated: 'Atividade criada!',
      activityUpdated: 'Atividade atualizada!',
      
      low: 'Baixa', moderate: 'Moderada', high: 'Alta',

      'Futebol': 'Futebol', 'Corrida': 'Corrida', 'Ginásio': 'Ginásio', 'Caminhada': 'Caminhada',
      'Ciclismo': 'Ciclismo', 'Natação': 'Natação', 'Basquetebol': 'Basquetebol', 'Ténis': 'Ténis',
      'Padel': 'Padel', 'Outro': 'Outro'
    },

    'en': {
      daySummaryTitle: 'Day Summary',
      totalTime: 'TOTAL TIME',
      timeline: 'Timeline',
      estimated: '(EST.)',
      locale: 'en-US',

      // --- SENSOR METRICS ---
      stepsLabel: 'Steps',
      daysLabel: 'Days',
      bpmLabel: 'BPM',

      howFelt: 'How did you feel?',
      feltTired: 'Tired', feltGood: 'Good', feltEnergized: 'Energized',
      distanceLabel: 'Distance (km)', elevationLabel: 'Elevation (m)',
      gameOutcomeLabel: 'Result',
      win: 'Win', draw: 'Draw', loss: 'Loss',
      lapsLabel: 'Laps',
      gymFocusLabel: 'Workout Focus',
      additionalNotes: 'Additional Notes',
      moreDetails: 'More details...',

      tabHome: 'Home', tabDiary: 'Activities', tabProfile: 'Profile',
      goodMorning: 'Good morning', goodAfternoon: 'Good afternoon', goodNight: 'Good night',
      todaysActivity: "Today's Activity", registerNew: 'Log new workout',
      weeklyStats: 'Weekly', trainingMinutes: 'Workout minutes', lastWorkout: 'Last Workout',
      tipDay: 'Tip of the Day', kcal: 'Kcal', minutes: 'Minutes', workouts: 'Workouts', totalKcal: 'Total Kcal',
      
      hydration: 'Hydration',
      cups: 'cups',
      completed: 'Completed',
      waterGoalReached: 'Hydration goal reached!',

      quotes: ["The only bad workout is the one that didn't happen.", "Your health is your best investment.", "Don't stop when you're tired, stop when you're done.", "Every step counts. Keep going!", "Today is a good day to break your limits."],

      monthlyReport: 'Monthly Report',
      monthlyWorkouts: 'Workouts this month',
      mostPracticed: 'Most practiced',
      monthlyMinutes: 'Total minutes',

      diaryTitle: 'Diary', newBtn: 'New', list: 'List', calendar: 'Calendar', searchPlaceholder: 'Search...',
      all: 'All', favorites: 'Fav', noActivities: 'No workouts found.', selectDay: 'Select a day.', workoutsOf: 'Workouts for:',
      
      profileTitle: 'Profile', personalData: 'Personal Data', settings: 'Settings', name: 'Name', phone: 'Phone',
      language: 'Language', darkMode: 'Dark Mode', terms: "Terms & Conditions", logout: 'Log Out',
      healthStats: 'Health Statistics', weight: 'Weight', height: 'Height', goal: 'Goal', dailyGoal: 'Daily Goal', bmi: 'BMI',
      bmiNote: 'BMI is a general indicator.', underweight: 'Underweight', normalWeight: 'Normal Weight', overweight: 'Overweight', obesity: 'Obesity',
      achievements: 'Achievements', seeDetails: 'See Details', dailyReminder: 'Daily Reminder',
      
      badge_beginner: 'Beginner', badge_beginner_desc: 'Complete your first workout.',
      badge_burner: 'Burner', badge_burner_desc: 'Burn 500kcal in a single day.',
      badge_loyal: 'Loyal', badge_loyal_desc: 'Complete 3 total workouts.',
      badge_master: 'Master', badge_master_desc: 'Reach 10 total workouts.',
      cancel: 'Cancel', save: 'Save', edit: 'Edit',

      newActivityTitle: 'New Activity',
      editActivityTitle: 'Edit Activity',
      sportLabel: 'Sport',
      selectPlaceholder: 'Select',
      durationLabel: 'Duration (min)',
      intensityLabel: 'Intensity',
      dateLabel: 'Date',
      locationLabel: 'Location',
      mapPlaceholder: 'Tap to open map',
      notesLabel: 'Notes',
      notesPlaceholder: 'Write here...',
      createBtn: 'CREATE ACTIVITY',
      updateBtn: 'UPDATE ACTIVITY',
      activityCreated: 'Activity created!',
      activityUpdated: 'Activity updated!',

      low: 'Low', moderate: 'Moderate', high: 'High',

      'Futebol': 'Football', 'Corrida': 'Running', 'Ginásio': 'Gym', 'Caminhada': 'Walking',
      'Ciclismo': 'Cycling', 'Natação': 'Swimming', 'Basquetebol': 'Basketball', 'Ténis': 'Tennis',
      'Padel': 'Padel', 'Outro': 'Other'
    },

    'es': {
      daySummaryTitle: 'Resumen del Día',
      totalTime: 'TIEMPO TOTAL',
      timeline: 'Cronología',
      estimated: '(EST.)',
      locale: 'es-ES',

      // --- MÉTRICAS ---
      stepsLabel: 'Pasos',
      daysLabel: 'Días',
      bpmLabel: 'BPM',

      howFelt: '¿Cómo te sentiste?',
      feltTired: 'Cansado', feltGood: 'Bien', feltEnergized: 'Energizado',
      distanceLabel: 'Distancia (km)', elevationLabel: 'Elevación (m)',
      gameOutcomeLabel: 'Resultado',
      win: 'Victoria', draw: 'Empate', loss: 'Derrota',
      lapsLabel: 'Piscinas',
      gymFocusLabel: 'Enfoque',
      additionalNotes: 'Notas Adicionales',
      moreDetails: 'Más detalles...',

      tabHome: 'Inicio', tabDiary: 'Actividades', tabProfile: 'Perfil',
      goodMorning: 'Buenos días', goodAfternoon: 'Buenas tardes', goodNight: 'Buenas noches',
      todaysActivity: 'Actividad de Hoy', registerNew: 'Registrar entreno',
      weeklyStats: 'Semana', trainingMinutes: 'Minutos de entreno', lastWorkout: 'Último Entreno',
      tipDay: 'Consejo del Día', kcal: 'Kcal', minutes: 'Minutos', workouts: 'Entrenos', totalKcal: 'Total Kcal',
      
      hydration: 'Hidratación',
      cups: 'vasos',
      completed: 'Completado',
      waterGoalReached: '¡Meta de hidratación alcanzada!',

      quotes: ["El único mal entrenamiento es el que no ocurrió.", "Tu salud es tu mejor inversión.", "No pares cuando estés cansado, para cuando termines.", "Cada paso cuenta. ¡Sigue así!", "Hoy es un buen día para superar tus límites."],

      monthlyReport: 'Informe Mensual',
      monthlyWorkouts: 'Entrenamientos este mes',
      mostPracticed: 'Más practicado',
      monthlyMinutes: 'Minutos totales',

      diaryTitle: 'Diario', newBtn: 'Nuevo', list: 'Lista', calendar: 'Calendar', searchPlaceholder: 'Buscar...',
      all: 'Todos', favorites: 'Fav', noActivities: 'No se encontraron entrenos.', selectDay: 'Selecciona un día.', workoutsOf: 'Entrenamientos del:',
      profileTitle: 'Perfil', personalData: 'Datos Personales', settings: 'Ajustes', name: 'Nombre', phone: 'Móvil',
      language: 'Idioma', darkMode: 'Modo Oscuro', terms: "Términos y Condiciones", logout: 'Cerrar Sesión',
      healthStats: 'Estadísticas de Salud', weight: 'Peso', height: 'Altura', goal: 'Meta', dailyGoal: 'Meta Diaria', bmi: 'IMC',
      bmiNote: 'El IMC es un indicador general.', underweight: 'Bajo Peso', normalWeight: 'Peso Normal', overweight: 'Sobrepeso', obesity: 'Obesidad',
      achievements: 'Logros', seeDetails: 'Ver Detalles', dailyReminder: 'Recordatorio Diario',
      
      badge_beginner: 'Principiante', badge_beginner_desc: 'Completa tu primer entreno.',
      badge_burner: 'Quemador', badge_burner_desc: 'Quema 500kcal en un solo día.',
      badge_loyal: 'Fiel', badge_loyal_desc: 'Completa 3 entrenos en total.',
      badge_master: 'Maestro', badge_master_desc: 'Alcanza la marca de 10 entrenos.',
      cancel: 'Cancelar', save: 'Guardar', edit: 'Editar',

      newActivityTitle: 'Nueva Actividad',
      editActivityTitle: 'Editar Atividade',
      sportLabel: 'Deporte',
      selectPlaceholder: 'Seleccionar',
      durationLabel: 'Duración (min)',
      intensityLabel: 'Intensidad',
      dateLabel: 'Fecha',
      locationLabel: 'Ubicación',
      mapPlaceholder: 'Toca para abrir mapa',
      notesLabel: 'Notas',
      notesPlaceholder: 'Escribe aquí...',
      createBtn: 'CREAR ACTIVIDAD',
      updateBtn: 'ACTUALIZAR ACTIVIDAD',
      activityCreated: '¡Actividad creada!',
      activityUpdated: '¡Actividade actualizada!',

      low: 'Baja', moderate: 'Moderada', high: 'Alta',

      'Futebol': 'Fútbol', 'Corrida': 'Correr', 'Ginásio': 'Gimnasio', 'Caminhada': 'Caminata',
      'Ciclismo': 'Ciclismo', 'Natação': 'Natación', 'Basquetebol': 'Baloncesto', 'Ténis': 'Tenis',
      'Padel': 'Pádel', 'Outro': 'Otro'
    }
  };

  constructor() {
    this.loadLanguage();
  }

  async setLanguage(lang: string) {
    if (this.dictionary[lang]) {
      this._currentLang = lang;
      this._translations.next(this.dictionary[lang]);
      await Preferences.set({ key: LANG_KEY, value: lang });
    }
  }

  async loadLanguage() {
    const { value } = await Preferences.get({ key: LANG_KEY });
    if (value && this.dictionary[value]) {
      this._currentLang = value;
      this._translations.next(this.dictionary[value]);
    } else {
      this._currentLang = 'pt';
      this._translations.next(this.dictionary['pt']);
    }
  }

  getCurrentLang() {
    return this._currentLang;
  }

  toggleLanguage() {
    const langs = ['pt', 'en', 'es'];
    let nextIndex = (langs.indexOf(this._currentLang) + 1) % langs.length;
    this.setLanguage(langs[nextIndex]);
  }
}