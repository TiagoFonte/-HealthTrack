import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Activity } from '../models/activity.model';

@Injectable({
  providedIn: 'root'
})
// AQUI ESTÁ O SEGREDO: A palavra 'export' tem de estar aqui!
export class ActivityService {
  private STORAGE_KEY = 'healthtrack_activities';
  private activitiesSubject = new BehaviorSubject<Activity[]>([]);

  constructor() {
    this.loadActivities();
  }

  getActivities(): Observable<Activity[]> {
    return this.activitiesSubject.asObservable();
  }

  private loadActivities() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      this.activitiesSubject.next(JSON.parse(data));
    }
  }

  addActivity(activity: Activity) {
    const currentActivities = this.activitiesSubject.value;
    const updatedActivities = [...currentActivities, activity];
    this.updateState(updatedActivities);
  }

  updateActivity(updatedActivity: Activity) {
    const activities = this.activitiesSubject.value;
    const index = activities.findIndex(a => a.id === updatedActivity.id);
    if (index > -1) {
      activities[index] = updatedActivity;
      this.updateState(activities);
    }
  }

  deleteActivity(id: string) {
    const activities = this.activitiesSubject.value;
    const updatedActivities = activities.filter(a => a.id !== id);
    this.updateState(updatedActivities);
  }

  getActivityById(id: string): Activity | undefined {
    return this.activitiesSubject.value.find(a => a.id === id);
  }

  private updateState(activities: Activity[]) {
    this.activitiesSubject.next(activities);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(activities));
  }
}