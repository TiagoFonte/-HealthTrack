import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, ModalController } from '@ionic/angular';
import { ActivityService } from '../../services/activity';
import { LanguageService } from '../../services/language';
import { MapModalComponent } from '../../components/map-modal/map-modal.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-activity',
  templateUrl: './add-activity.page.html',
  styleUrls: ['./add-activity.page.scss'],
  standalone: false
})
export class AddActivityPage implements OnInit {

  // --- MODELO DE DADOS ---
  type: string = '';
  duration: number | null = null;
  intensity: 'Baixa' | 'Moderada' | 'Alta' = 'Moderada';
  date: string = new Date().toISOString();
  location: string = '';
  notes: string = '';
  lat?: number;
  lng?: number;

  // --- MÉTRICAS ESPECÍFICAS ---
  distance: number | null = null;
  laps: number | null = null;
  gymFocus: string = '';
  steps: number | null = null;
  elevation: number | null = null;
  outcome: string = '';
  feeling: string = 'Bem';

  sports = ['Futebol', 'Corrida', 'Ginásio', 'Caminhada', 'Ciclismo', 'Natação', 'Basquetebol', 'Ténis', 'Padel', 'Outro'];
  t: any = {};

  constructor(
    private activityService: ActivityService,
    public langService: LanguageService,
    private router: Router,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.langService.translations$.subscribe(trans => this.t = trans);
  }

  // --- AUXILIARES DE INTERFACE ---
  isCardio() { return ['Corrida', 'Ciclismo'].includes(this.type); }
  isSteps() { return this.type === 'Caminhada'; }
  isGame() { return ['Futebol', 'Basquetebol', 'Ténis', 'Padel'].includes(this.type); }

  // --- LÓGICA PRINCIPAL DE GRAVAÇÃO ---
  async save() {
    if (!this.type || !this.duration) {
      this.showToast('Preencha os campos obrigatórios', 'warning');
      return;
    }

    // Geração de Frequência Cardíaca Estimada
    const bpmBase = this.intensity === 'Alta' ? 152 : (this.intensity === 'Moderada' ? 128 : 105);
    const avgBpm = bpmBase + Math.floor(Math.random() * 12);

    const newActivity: any = {
      id: Date.now().toString(),
      type: this.type,
      duration: this.duration,
      intensity: this.intensity,
      calories: this.calculateCalories(),
      date: this.date,
      location: this.location,
      notes: this.notes,
      lat: this.lat,
      lng: this.lng,
      isFavorite: false,
      feeling: this.feeling,
      avgBpm: avgBpm
    };

    // Processamento de Métricas Automáticas (Distância, Passos, Resultados)
    let healthMetrics = '';

    if (this.isCardio()) {
      if (!this.distance) {
        this.distance = Number(((this.duration / 60) * (this.type === 'Corrida' ? 10.2 : 21.5)).toFixed(2));
      }
      newActivity.distance = this.distance;
      healthMetrics = `${this.distance}km • ❤️${avgBpm}bpm`;
    }

    if (this.isSteps()) {
      if (!this.steps) this.steps = (this.duration * 112);
      newActivity.steps = this.steps;
      healthMetrics = `👣${this.steps} passos • ❤️${avgBpm}bpm`;
    }

    if (this.isGame() && this.outcome) {
      newActivity.outcome = this.outcome;
      const emoji = this.outcome === 'Vitória' ? '🏆' : (this.outcome === 'Derrota' ? '❌' : '🤝');
      healthMetrics = `${emoji} ${this.outcome} • ❤️${avgBpm}bpm`;
    }

    if (!healthMetrics) healthMetrics = `❤️${avgBpm}bpm`;

    // Formatação final das Notas com a tag [SAÚDE] para o Feed
    newActivity.notes = `[SAÚDE: ${healthMetrics}]` + (this.notes ? ' • ' + this.notes : '');

    if (this.type === 'Natação' && this.laps) newActivity.laps = this.laps;
    if (this.type === 'Ginásio' && this.gymFocus) newActivity.focus = this.gymFocus;

    await this.activityService.addActivity(newActivity);
    await this.checkBadges(newActivity);

    this.showToast('Atividade guardada com métricas de saúde!', 'success');
    this.router.navigate(['/tabs/tab2']);
  }

  // --- SISTEMA DE CONQUISTAS EM TEMPO REAL ---
  async checkBadges(activity: any) {
    const activities = await firstValueFrom(this.activityService.getActivities());
    
    // Medalha: Iniciante (Primeiro registo)
    if (activities.length === 1) {
      await this.showBadgeNotification('Iniciante', '🏅 Bem-vindo ao time!');
    }

    // Medalha: Fogo (Gasto calórico elevado)
    if (activity.calories > 400) {
      await this.showBadgeNotification('Fogo', '🔥 Estás imparável!');
    }
  }

  async showBadgeNotification(name: string, msg: string) {
    const toast = await this.toastCtrl.create({
      message: `🏆 CONQUISTA LIBERTADA: ${name}\n${msg}`,
      duration: 3000,
      color: 'success',
      position: 'top',
      buttons: [{ text: 'Ver', handler: () => this.router.navigate(['/tabs/tab3']) }]
    });
    await toast.present();
  }

  // --- CÁLCULOS MATEMÁTICOS (MET) ---
  calculateCalories(): number {
    const metValues: any = { 
      'Futebol': 7, 'Corrida': 9, 'Ginásio': 5, 'Caminhada': 3.5, 
      'Ciclismo': 7.5, 'Natação': 8, 'Basquetebol': 6.5, 'Ténis': 7, 'Padel': 6, 'Outro': 4 
    };
    
    let met = metValues[this.type] || 4;
    if (this.intensity === 'Baixa') met *= 0.8;
    if (this.intensity === 'Alta') met *= 1.2;
    
    return Math.round(met * 70 * (this.duration || 0) / 60);
  }

  // --- GEOLOCALIZAÇÃO E MAPAS ---
  async openMap() {
    const modal = await this.modalCtrl.create({ component: MapModalComponent });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.lat) {
      this.lat = data.lat; this.lng = data.lng;
      this.location = `Lat: ${data.lat.toFixed(4)}, Lng: ${data.lng.toFixed(4)}`;
      this.getAddress(data.lat, data.lng);
    }
  }

  async getAddress(lat: number, lng: number) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const json = await res.json();
      if (json && json.display_name) {
        const parts = json.display_name.split(',');
        this.location = parts.slice(0, 2).join(',');
      }
    } catch (e) { }
  }

  async showToast(msg: string, color: string = 'primary') {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color: color, position: 'top' });
    t.present();
  }
}