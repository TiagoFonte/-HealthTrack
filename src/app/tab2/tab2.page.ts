import { Component } from '@angular/core';
import { ActivityService } from '../services/activity';
import { Activity } from '../models/activity.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page {

  totalMinutes = 0;
  totalWorkouts = 0;
  caloriesBurned = 0; // Estimativa simples
  favoriteSport = '-';
  
  // Para o gráfico (Exemplo estático para visual, pode ser dinamizado depois)
  chartData = [
    { month: 'Jan', height: '40%' },
    { month: 'Fev', height: '60%' },
    { month: 'Mar', height: '80%' },
    { month: 'Abr', height: '100%' }
  ];

  constructor(private activityService: ActivityService) {
    this.activityService.getActivities().subscribe(activities => {
      this.calculateStats(activities);
    });
  }

  calculateStats(activities: Activity[]) {
    // 1. Totais
    this.totalWorkouts = activities.length;
    this.totalMinutes = activities.reduce((acc, curr) => acc + curr.duration, 0);
    this.caloriesBurned = this.totalMinutes * 5; // Estimativa: 5 cal/min

    // 2. Desporto Favorito
    if (activities.length > 0) {
      const counts: {[key: string]: number} = {};
      let maxCount = 0;
      let maxSport = '';

      activities.forEach(a => {
        counts[a.type] = (counts[a.type] || 0) + 1;
        if (counts[a.type] > maxCount) {
          maxCount = counts[a.type];
          maxSport = a.type;
        }
      });
      this.favoriteSport = maxSport;
    } else {
      this.favoriteSport = '-';
    }
  }
}
