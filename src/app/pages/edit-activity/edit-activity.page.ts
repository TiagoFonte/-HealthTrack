import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '../../services/activity';
import { Activity } from '../../models/activity.model';
import { LanguageService } from '../../services/language'; 
import { ToastController, ModalController, AlertController } from '@ionic/angular';
import { MapModalComponent } from '../../components/map-modal/map-modal.component';

@Component({
  selector: 'app-edit-activity',
  templateUrl: './edit-activity.page.html',
  styleUrls: ['./edit-activity.page.scss'],
  standalone: false
})
export class EditActivityPage implements OnInit {

  activity: Activity | undefined;
  
  // Dados do formulário
  type: string = '';
  duration: number | null = null;
  intensity: 'Baixa' | 'Moderada' | 'Alta' = 'Moderada';
  date: string = new Date().toISOString();
  location: string = '';
  notes: string = '';
  feeling: string = ''; // <--- Adicionado para suportar os emojis
  lat?: number;
  lng?: number;

  sports = ['Futebol', 'Corrida', 'Ginásio', 'Caminhada', 'Ciclismo', 'Natação', 'Basquetebol', 'Ténis', 'Padel', 'Outro'];
  
  t: any = {}; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService,
    public langService: LanguageService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    // 1. Subscrever às traduções
    this.langService.translations$.subscribe(trans => this.t = trans);

    // 2. Carregar atividade existente
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.activityService.getActivity(id).subscribe(act => {
        if (act) {
          this.activity = act;
          this.type = act.type;
          this.duration = act.duration;
          this.intensity = act.intensity as any;
          this.date = act.date;
          this.location = act.location || '';
          this.notes = act.notes || '';
          this.feeling = (act as any).feeling || ''; // Carrega o sentimento guardado
          this.lat = act.lat;
          this.lng = act.lng;
        }
      });
    }
  }

  async updateActivity() {
    if (!this.activity || !this.duration) return;

    // Criar o objeto atualizado incluindo o novo campo 'feeling'
    const updatedActivity: Activity = {
      ...this.activity,
      type: this.type,
      duration: this.duration,
      intensity: this.intensity,
      calories: this.calculateCalories(),
      date: this.date,
      location: this.location,
      notes: this.notes,
      lat: this.lat,
      lng: this.lng,
      feeling: this.feeling // <--- Guarda o sentimento selecionado
    } as any;

    await this.activityService.updateActivity(updatedActivity);
    this.showToast(this.t.activityUpdated || 'Atividade atualizada!', 'success');
    this.router.navigate(['/tabs/tab2']);
  }

  async deleteActivity() {
    const alert = await this.alertCtrl.create({
      header: this.t.editActivityTitle || 'Eliminar',
      message: this.t.deleteConfirm || 'Tem a certeza que deseja eliminar esta atividade?', // Tradução dinâmica
      buttons: [
        { text: this.t.cancel || 'Cancelar', role: 'cancel' },
        { 
          text: this.t.delete || 'Eliminar', 
          role: 'destructive',
          handler: async () => {
            if (this.activity) {
              await this.activityService.deleteActivity(this.activity.id);
              this.router.navigate(['/tabs/tab2']);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  calculateCalories(): number {
    const metValues: any = { 
      'Futebol': 7, 'Corrida': 9, 'Ginásio': 5, 'Caminhada': 3.5, 
      'Ciclismo': 7.5, 'Natação': 8, 'Basquetebol': 6.5, 'Ténis': 7, 'Padel': 6, 'Outro': 4 
    };
    let met = metValues[this.type] || 4;
    if (this.intensity === 'Baixa') met *= 0.8;
    if (this.intensity === 'Alta') met *= 1.2;
    const weight = 70; 
    return Math.round(met * weight * (this.duration || 0) / 60);
  }

  async openMap() {
    const modal = await this.modalCtrl.create({ component: MapModalComponent });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.lat) {
      this.lat = data.lat;
      this.lng = data.lng;
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
    } catch (e) {}
  }

  async showToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color: color, position: 'top' });
    t.present();
  }
}