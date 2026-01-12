import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { Activity } from '../models/activity.model';
import { ToastController } from '@ionic/angular';

const STORAGE_KEY = 'user_activities';
const GOAL_KEY = 'user_daily_goal';
const WEIGHT_KEY = 'user_weight';
const WATER_KEY = 'user_water_level';
const BADGES_KEY = 'user_badges_status';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  
  private _activities = new BehaviorSubject<Activity[]>([]);
  private _waterLevel = new BehaviorSubject<number>(0);
  private _streak = new BehaviorSubject<number>(0); // BehaviorSubject para o Streak

  constructor(private toastCtrl: ToastController) {
    this.initService();
  }

  private async initService() {
    await this.loadActivities();
    await this.loadWater();
  }

  // --- ATIVIDADES E STREAK ---

  private async loadActivities() {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    if (value) {
      const activities = JSON.parse(value);
      this._activities.next(activities);
      this.calculateStreak(activities); // Calcula o streak ao carregar
    }
  }

  getActivities(): Observable<Activity[]> {
    return this._activities.asObservable();
  }
  getActivity(id: string): Observable<Activity | undefined> {
  return this._activities.pipe(
    map(activities => activities.find(a => a.id === id))
  );
}
  getStreak(): Observable<number> {
    return this._streak.asObservable();
  }

  async addActivity(activity: Activity) {
    const current = this._activities.value;
    const updated = [activity, ...current];
    this._activities.next(updated);
    await this.saveToStorage(updated);
    
    this.calculateStreak(updated); // Atualiza streak
    await this.checkActivityBadges(updated); // Verifica medalhas
  }

  calculateStreak(activities: Activity[]) {
    if (!activities || activities.length === 0) {
      this._streak.next(0);
      return 0;
    }

    let streak = 0;
    let lastDate = new Date();
    lastDate.setHours(0, 0, 0, 0);

    // Ordenar atividades por data decrescente para análise cronológica
    const sorted = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (let act of sorted) {
      const actDate = new Date(act.date);
      actDate.setHours(0, 0, 0, 0);

      const diff = (lastDate.getTime() - actDate.getTime()) / (1000 * 3600 * 24);

      if (diff === 0) continue; // Mesma data, ignora para o streak
      if (diff === 1) {
        streak++;
        lastDate = actDate;
      } else {
        break; // Quebra de sequência
      }
    }
    this._streak.next(streak);
    return streak;
  }

  // --- GESTÃO DE CONQUISTAS (BADGES) ---

  private async checkActivityBadges(activities: Activity[]) {
    const { value } = await Preferences.get({ key: BADGES_KEY });
    let status = value ? JSON.parse(value) : { iniciante: false, fogo: false, maratona: false, fiel: false };

    // 1. Badge Iniciante: 1º treino registado
    if (activities.length >= 1 && !status.iniciante) {
      status.iniciante = true;
      await this.unlockBadge('iniciante', 'Iniciante', '🎖️ Bem-vindo ao time!');
    }

    // 2. Badge Fogo: Baseado no Streak (ex: 3 dias) ou Intensidade
    const currentStreak = this._streak.value;
    const highIntensity = activities.some(a => (a.calories >= 400 || a.intensity === 'Alta'));
    
    if ((highIntensity || currentStreak >= 3) && !status.fogo) {
      status.fogo = true;
      await this.unlockBadge('fogo', 'Fogo', '🔥 Estás imparável!');
    }

    // 3. Badge Maratona: Acumular mais de 42km
    const totalKm = activities.reduce((acc, a) => acc + (a.distance || 0), 0);
    if (totalKm >= 42 && !status.maratona) {
      status.maratona = true;
      await this.unlockBadge('maratona', 'Maratona', '🏆 Completaste a distância de uma maratona!');
    }

    await Preferences.set({ key: BADGES_KEY, value: JSON.stringify(status) });
  }

  private async unlockBadge(id: string, name: string, message: string) {
    const toast = await this.toastCtrl.create({
      header: `Conquista: ${name}`,
      message: message,
      duration: 3000,
      color: 'success',
      position: 'top',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }

  // --- MÉTODOS AUXILIARES ---

  async updateActivity(updatedActivity: Activity) {
    const current = this._activities.value;
    const index = current.findIndex(a => a.id === updatedActivity.id);
    if (index > -1) {
      const updated = [...current];
      updated[index] = updatedActivity;
      this._activities.next(updated);
      await this.saveToStorage(updated);
      this.calculateStreak(updated);
    }
  }

  async deleteActivity(id: string) {
    const current = this._activities.value;
    const updated = current.filter(a => a.id !== id);
    this._activities.next(updated);
    await this.saveToStorage(updated);
    this.calculateStreak(updated);
  }

  private async saveToStorage(activities: Activity[]) {
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(activities) });
  }

  // --- ÁGUA E METAS ---

  getWaterLevel(): Observable<number> { return this._waterLevel.asObservable(); }

  async addWater(amount: number) {
    const current = this._waterLevel.value;
    const newVal = current + amount;
    this._waterLevel.next(newVal);
    await Preferences.set({ key: WATER_KEY, value: newVal.toString() });

    if (newVal >= 2000 && current < 2000) {
      await this.showSimpleToast('💧 Meta de água atingida!');
    }
  }

  private async loadWater() {
    const { value } = await Preferences.get({ key: WATER_KEY });
    if (value) this._waterLevel.next(parseInt(value));
  }

  async getGoal(): Promise<number> {
    const { value } = await Preferences.get({ key: GOAL_KEY });
    return value ? parseInt(value) : 500;
  }

  async setGoal(goal: number) {
    await Preferences.set({ key: GOAL_KEY, value: goal.toString() });
  }

  async getWeight(): Promise<number | null> {
    const { value } = await Preferences.get({ key: WEIGHT_KEY });
    return value ? parseFloat(value) : null;
  }

  async saveWeight(weight: number) {
    await Preferences.set({ key: WEIGHT_KEY, value: weight.toString() });
  }

  private async showSimpleToast(msg: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, position: 'bottom' });
    await t.present();
  }
}