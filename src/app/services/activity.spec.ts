// src/app/services/activity.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Activity } from '../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private STORAGE_KEY = 'healthtrack_activities';
  private activitiesSubject = new BehaviorSubject<Activity[]>([]);

  constructor() {
    this.loadActivities();
  }

  // Obter atividades (para listar)
  getActivities(): Observable<Activity[]> {
    return this.activitiesSubject.asObservable();
  }

  // Carregar do LocalStorage
  private loadActivities() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      this.activitiesSubject.next(JSON.parse(data));
    }
  }

  // Adicionar nova atividade
  addActivity(activity: Activity) {
    const currentActivities = this.activitiesSubject.value;
    const updatedActivities = [...currentActivities, activity];
    this.updateState(updatedActivities);
  }

  // Editar atividade existente
  updateActivity(updatedActivity: Activity) {
    const activities = this.activitiesSubject.value;
    const index = activities.findIndex(a => a.id === updatedActivity.id);
    if (index > -1) {
      activities[index] = updatedActivity;
      this.updateState(activities);
    }
  }

  // Eliminar atividade
  deleteActivity(id: string) {
    const activities = this.activitiesSubject.value;
    const updatedActivities = activities.filter(a => a.id !== id);
    this.updateState(updatedActivities);
  }

  // Guardar no LocalStorage
  private updateState(activities: Activity[]) {
    this.activitiesSubject.next(activities);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(activities));
  }
  
  // Buscar uma atividade pelo ID
  getActivityById(id: string): Activity | undefined {
    return this.activitiesSubject.value.find(a => a.id === id);
  }
}