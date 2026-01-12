import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActivityService } from '../../services/activity';
import { LanguageService } from '../../services/language'; 
import { Activity } from '../../models/activity.model';

@Component({
  selector: 'app-status-detail',
  templateUrl: './status-detail.page.html',
  styleUrls: ['./status-detail.page.scss'],
  standalone: false
})
export class StatusDetailPage implements OnInit {

  t: any = {}; // Traduções
  type: string = '';
  pageTitle: string = 'Detalhes';
  
  waterLevel = 0; waterGoal = 2000;
  waterLog: { time: string, amount: number }[] = [];
  topActivities: Activity[] = [];
  totalValue = 0;

  constructor(
    private route: ActivatedRoute,
    private activityService: ActivityService,
    public langService: LanguageService // Injetar
  ) { }

  ngOnInit() {
    this.type = this.route.snapshot.paramMap.get('type') || '';
    
    // Subscrever traduções
    this.langService.translations$.subscribe(trans => {
      this.t = trans;
      this.setTitle();
    });

    this.setupPage();
  }

  setTitle() {
    if (this.type === 'hydration') this.pageTitle = this.t.hydration || 'Hidratação';
    else if (this.type === 'calories') this.pageTitle = this.t.calories || 'Calorias';
    else if (this.type === 'minutes') this.pageTitle = this.t.minutes || 'Minutos';
  }

  setupPage() {
    if (this.type === 'hydration') {
      this.activityService.getWaterLevel().subscribe(val => {
        this.waterLevel = val;
        this.generateWaterLog(val);
      });
    } else if (this.type === 'calories') {
      this.activityService.getActivities().subscribe(list => {
        this.topActivities = [...list].sort((a, b) => (b.calories || 0) - (a.calories || 0)).slice(0, 10);
        this.totalValue = list.reduce((acc, curr) => acc + (curr.calories || 0), 0);
      });
    } else if (this.type === 'minutes') {
      this.activityService.getActivities().subscribe(list => {
        this.topActivities = [...list].sort((a, b) => (b.duration || 0) - (a.duration || 0)).slice(0, 10);
        this.totalValue = list.reduce((acc, curr) => acc + (curr.duration || 0), 0);
      });
    }
  }

  addWater(amount: number) { this.activityService.addWater(amount); }
  resetWater() { this.activityService.resetWater(); }

  private generateWaterLog(total: number) {
    const count = Math.floor(total / 250);
    this.waterLog = [];
    for (let i = 0; i < count; i++) {
      this.waterLog.push({ time: `${9 + i}:30`, amount: 250 });
    }
  }
}