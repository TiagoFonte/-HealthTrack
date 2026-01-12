import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { ActivityService } from '../services/activity'; 
import { LanguageService } from '../services/language';
import { Activity } from '../models/activity.model';
import { Router } from '@angular/router';
import { ToastController, Platform } from '@ionic/angular';
import { firstValueFrom } from 'rxjs'; 
import { Pedometer } from '@ionic-native/pedometer/ngx';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page implements OnInit {

  // --- UI & PERFIL ---
  today = new Date();
  greetingMessage = '';
  dailyQuote = '';
  userName: string = 'Atleta';
  profilePhoto: string | null = null; 
  t: any = {}; 

  // --- ESTATÍSTICAS GERAIS ---
  stats = { totalCalories: 0, totalMinutes: 0, totalWorkouts: 0, caloriesToday: 0 };
  dailyGoal = 500;
  lastActivity: Activity | null = null;
  monthlyStats = { totalCount: 0, totalMinutes: 0, topSport: '-' };

  // --- SENSORES & DADOS EM TEMPO REAL ---
  streak$ = this.activityService.getStreak();
  lastBPM: number = 0;
  totalStepsToday: number = 0; // Atualizado via Hardware (Pedometer)

  // --- HIDRATAÇÃO ---
  waterCount = 0;
  waterGoal = 8; 

  // --- GRÁFICOS ---
  weeklyChart = [
    { day: 'Dom', value: 0, height: '0%' },
    { day: 'Seg', value: 0, height: '0%' },
    { day: 'Ter', value: 0, height: '0%' },
    { day: 'Qua', value: 0, height: '0%' },
    { day: 'Qui', value: 0, height: '0%' },
    { day: 'Sex', value: 0, height: '0%' },
    { day: 'Sáb', value: 0, height: '0%' },
  ];

  constructor(
    private activityService: ActivityService,
    public langService: LanguageService,
    private router: Router,
    private toastCtrl: ToastController,
    private pedometer: Pedometer, // Sensor nativo
    private platform: Platform    // Detetor de dispositivo
  ) {}

  // --- CICLO DE VIDA ---
  async ngOnInit() {
    this.langService.translations$.subscribe(trans => {
      this.t = trans;
      this.updateGreeting();
      this.selectRandomQuote();
    });

    // Subscrição para recálculo de estatísticas sempre que há novos treinos
    this.activityService.getActivities().subscribe(activities => {
      this.calculateStats(activities);
      this.calculateWeeklyChart(activities);
      this.calculateMonthlyStats(activities);
      
      const sorted = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.lastActivity = sorted.length > 0 ? sorted[0] : null;

      if (activities.length > 0) {
        this.lastBPM = (activities[0] as any).avgBpm || 0;
      }
    });

    // Inicialização do Sensor de Passos (Apenas em dispositivo real)
    this.platform.ready().then(() => {
      this.startPedometer();
    });
  }

  async ionViewWillEnter() {
    this.updateGreeting(); 
    this.dailyGoal = await this.activityService.getGoal();
    await this.loadWaterData();
    await this.loadUser();
    
    // Força atualização do relatório mensal ao entrar na página
    const activities = await firstValueFrom(this.activityService.getActivities());
    this.calculateMonthlyStats(activities);
  }

  // --- INTEGRAÇÃO DO SENSOR (REQUISITO 3) ---
  startPedometer() {
    this.pedometer.isStepCountingAvailable().then((available: boolean) => {
      if (available) {
        this.pedometer.startPedometerUpdates().subscribe((data) => {
          this.totalStepsToday = data.numberOfSteps; // Atualização ao vivo
        });
      } else {
        console.warn('Sensor de passos indisponível no simulador/browser.');
      }
    });
  }

  // --- CÁLCULOS DE ESTATÍSTICAS ---
  calculateMonthlyStats(activities: Activity[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthActivities = activities.filter(act => {
      const actDate = new Date(act.date);
      return actDate.getMonth() === currentMonth && actDate.getFullYear() === currentYear;
    });

    this.monthlyStats.totalMinutes = monthActivities.reduce((sum, act) => sum + (act.duration || 0), 0);
    this.monthlyStats.totalCount = monthActivities.length;

    if (monthActivities.length > 0) {
      const counts = monthActivities.reduce((acc: any, act) => {
        acc[act.type] = (acc[act.type] || 0) + 1;
        return acc;
      }, {});
      this.monthlyStats.topSport = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    } else {
      this.monthlyStats.topSport = '-';
    }
  }

  calculateWeeklyChart(activities: Activity[]) {
    this.weeklyChart.forEach(d => { d.value = 0; d.height = '0%'; });
    const today = new Date();
    
    activities.forEach(act => {
      const actDate = new Date(act.date);
      const diffDays = (today.getTime() - actDate.getTime()) / (1000 * 3600 * 24);
      if (diffDays <= 7) {
        const dayIndex = actDate.getDay();
        this.weeklyChart[dayIndex].value += act.duration || 0;
      }
    });

    const maxMinutes = Math.max(...this.weeklyChart.map(d => d.value));
    if (maxMinutes > 0) {
      this.weeklyChart.forEach(d => {
        const percentage = (d.value / maxMinutes) * 100;
        d.height = Math.max(percentage, 5) + '%'; 
      });
    }
  }

  calculateStats(activities: Activity[]) {
    const todayStr = new Date().toISOString().split('T')[0];
    this.stats = { totalCalories: 0, totalMinutes: 0, totalWorkouts: activities.length, caloriesToday: 0 };
    activities.forEach(act => {
      this.stats.totalCalories += (act.calories || 0);
      this.stats.totalMinutes += (act.duration || 0);
      if (act.date.split('T')[0] === todayStr) {
        this.stats.caloriesToday += (act.calories || 0);
      }
    });
  }

  // --- GESTÃO DE HIDRATAÇÃO ---
  async loadWaterData() {
    const { value } = await Preferences.get({ key: 'daily_water' });
    this.waterCount = value ? parseInt(value) : 0;
  }

  async updateWater(amount: number) {
    this.waterCount = Math.max(0, this.waterCount + amount);
    await Preferences.set({ key: 'daily_water', value: this.waterCount.toString() });

    if (this.waterCount === this.waterGoal && amount > 0) {
      const toast = await this.toastCtrl.create({
        message: `${this.t.waterGoalReached || 'Meta atingida!'} 💧`,
        duration: 2000, color: 'success', position: 'top'
      });
      toast.present();
    }
  }

  // --- DADOS DO UTILIZADOR ---
  async loadUser() {
    const { value } = await Preferences.get({ key: 'user_session' });
    if (value) {
      const user = JSON.parse(value);
      this.userName = user.name ? user.name.split(' ')[0] : 'Atleta';
    }
    const photoData = await Preferences.get({ key: 'user_profile_photo' });
    if (photoData.value) this.profilePhoto = photoData.value;
  }

  updateGreeting() {
    const hour = new Date().getHours();
    this.greetingMessage = hour < 12 ? this.t.goodMorning : (hour < 20 ? this.t.goodAfternoon : this.t.goodNight);
  }

  selectRandomQuote() {
    const quotes = this.t.quotes || ["Keep pushing!"];
    this.dailyQuote = quotes[Math.floor(Math.random() * quotes.length)];
  }

  // --- NAVEGAÇÃO ---
  goToAdd() { this.router.navigate(['/add-activity']); }
  goToTab2() { this.router.navigate(['/tabs/tab2']); }
}