import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { ActivityService } from '../services/activity'; 
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LanguageService } from '../services/language'; 
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; 
import { LocalNotifications } from '@capacitor/local-notifications';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false
})
export class Tab3Page implements OnInit {

  // Dados do Utilizador
  userData = {
    name: 'Utilizador',
    email: 'user@email.com',
    phone: '',
    weight: 0,
    height: 0
  };
  
  profilePhoto: string | null = null; 
  dailyGoal = 2000;
  imc = 0;
  imcStatus = '';
  bmiColor = 'medium'; 
  bmiMarkerPosition = 0; 
  
  // Variáveis de Controlo
  t: any = {};               
  currentLanguage = 'pt';
  isDarkMode = false;
  notificationsEnabled = false; 
  
  // Lista de Conquistas
  displayBadges = [
    { id: 1, key: 'badge_beginner', defaultName: 'Iniciante', icon: 'medal', color: 'tertiary', earned: false, target: 1 },
    { id: 2, key: 'badge_burner', defaultName: 'Fogo', icon: 'flame', color: 'warning', earned: false, target: 500 }, 
    { id: 3, key: 'badge_loyal', defaultName: 'Fiel', icon: 'calendar', color: 'success', earned: false, target: 3 },
    { id: 4, key: 'badge_master', defaultName: 'Mestre', icon: 'trophy', color: 'secondary', earned: false, target: 10 }
  ];

  constructor(
    private activityService: ActivityService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router,
    public langService: LanguageService 
  ) {}

  async ngOnInit() {
    this.langService.translations$.subscribe(trans => {
      this.t = trans;
    });
    
    this.currentLanguage = this.langService.getCurrentLang().toLowerCase();
    
    // --- LÓGICA DO TEMA (Apenas Sincronização) ---
    const theme = await Preferences.get({ key: 'theme' });
    // Define se o botão toggle está ligado ou desligado
    this.isDarkMode = theme.value === 'dark';
    // Garante que o CSS bate certo com o botão
    document.body.classList.toggle('dark', this.isDarkMode);

    const reminder = await Preferences.get({ key: 'reminder_enabled' });
    this.notificationsEnabled = reminder.value === 'true';
    
    await this.loadUserData();
  }

  async ionViewWillEnter() {
    await this.loadUserData();
    await this.calculateBadges();
  }

  // --- LÓGICA DE CONQUISTAS ---
  async calculateBadges() {
    const activities = await firstValueFrom(this.activityService.getActivities());
    const totalWorkouts = activities.length;
    const maxCals = Math.max(...activities.map((a: any) => a.calories || 0), 0);

    this.displayBadges[0].earned = totalWorkouts >= 1;
    this.displayBadges[1].earned = maxCals >= 500;
    this.displayBadges[2].earned = totalWorkouts >= 3;
    this.displayBadges[3].earned = totalWorkouts >= 10;
  }

  // --- CARREGAMENTO DE DADOS ---
  async loadUserData() {
    const { value } = await Preferences.get({ key: 'user_data_info' });
    if (value) {
      const data = JSON.parse(value);
      this.userData.name = data.name || 'Utilizador';
      this.userData.email = data.email || 'user@email.com';
      this.userData.phone = data.phone || '';
      
      let h = data.height || 0;
      if (h > 3) h = h / 100;
      this.userData.height = h;
    }

    const photoData = await Preferences.get({ key: 'user_profile_photo' });
    if (photoData.value) this.profilePhoto = photoData.value;

    const w = await Preferences.get({ key: 'user_weight' });
    if (w.value) this.userData.weight = parseFloat(w.value);

    const g = await Preferences.get({ key: 'daily_goal' });
    if (g.value) this.dailyGoal = parseInt(g.value);

    this.calculateBMI();
  }

  // --- GESTÃO DE PESO ---
  async onWeightChange(event: any) {
    const newWeight = event.detail.value;
    this.userData.weight = newWeight;
    this.calculateBMI();
    this.dailyGoal = Math.round(newWeight * 32);

    await Preferences.set({ key: 'user_weight', value: newWeight.toString() });
    await Preferences.set({ key: 'daily_goal', value: this.dailyGoal.toString() });
    await Preferences.set({ key: 'user_data_info', value: JSON.stringify(this.userData) });
  }

  calculateBMI() {
    const w = this.userData.weight;
    const h = this.userData.height;

    if (w > 0 && h > 0.5 && h < 3.0) {
      this.imc = w / (h * h);
      
      if (this.imc < 18.5) { this.imcStatus = this.t.underweight || 'Abaixo'; this.bmiColor = 'primary'; }
      else if (this.imc < 24.9) { this.imcStatus = this.t.normalWeight || 'Normal'; this.bmiColor = 'success'; }
      else if (this.imc < 29.9) { this.imcStatus = this.t.overweight || 'Sobrepeso'; this.bmiColor = 'warning'; }
      else { this.imcStatus = this.t.obesity || 'Obesidade'; this.bmiColor = 'danger'; }

      const minVisual = 15;
      const maxVisual = 40;
      let percentage = ((this.imc - minVisual) / (maxVisual - minVisual)) * 100;
      this.bmiMarkerPosition = Math.min(Math.max(percentage, 0), 100);
    } else {
      this.imc = 0;
      this.imcStatus = '--';
      this.bmiMarkerPosition = 0;
    }
  }

  // --- OUTRAS FUNÇÕES ---

  changeLanguage(event: any) {
    const langCode = event.detail.value;
    this.currentLanguage = langCode;
    this.langService.setLanguage(langCode);
    this.showToast('Idioma alterado! 🌍');
  }

  async toggleNotifications(event: any) {
    this.notificationsEnabled = event.detail.checked;
    await Preferences.set({ key: 'reminder_enabled', value: this.notificationsEnabled ? 'true' : 'false' });
    
    if (this.notificationsEnabled) {
      try {
        const permissions = await LocalNotifications.requestPermissions();
        if (permissions.display === 'granted') {
          await LocalNotifications.schedule({
            notifications: [
              {
                title: this.t.dailyReminder || 'Lembrete HealthTrack',
                body: this.t.reminderBody || 'Hora de registar a tua atividade!',
                id: 1,
                schedule: { allowWhileIdle: true, every: 'hour', count: 4 }
              }
            ]
          });
          this.showToast('Lembrete ativado (4/4h)');
        }
      } catch (e) { console.error(e); }
    } else {
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
      this.showToast('Lembrete desativado.');
    }
  }

  async changePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt
      });
      if (image) {
        this.profilePhoto = 'data:image/jpeg;base64,' + image.base64String;
        await Preferences.set({ key: 'user_profile_photo', value: this.profilePhoto });
        this.showToast('Foto atualizada!');
      }
    } catch (error) { }
  }

  async editData(field: string, title: string) {
    const alert = await this.alertCtrl.create({
      header: `Editar ${title}`,
      inputs: [{ name: 'value', type: 'text', value: (this.userData as any)[field], placeholder: 'Novo valor' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Guardar', 
          handler: async (data) => {
            (this.userData as any)[field] = data.value;
            await Preferences.set({ key: 'user_data_info', value: JSON.stringify(this.userData) });
            if (field === 'height') { 
                let h = parseFloat(data.value);
                if (h > 3) h = h / 100;
                this.userData.height = h;
                this.calculateBMI(); 
            }
            this.showToast('Atualizado!');
          } 
        }
      ]
    });
    await alert.present();
  }

  toggleTheme(event: any) {
    this.isDarkMode = event.detail.checked;
    document.body.classList.toggle('dark', this.isDarkMode);
    Preferences.set({ key: 'theme', value: this.isDarkMode ? 'dark' : 'light' });
  }

  async logout() {
    await Preferences.remove({ key: 'user_session' });
    this.router.navigate(['/landing'], { replaceUrl: true });
  }

  async showToast(msg: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000 });
    t.present();
  }
}