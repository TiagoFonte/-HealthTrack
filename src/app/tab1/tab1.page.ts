import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityService } from '../services/activity';
import { Activity } from '../models/activity.model';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page {

  // Esta variável vai ter a lista de atividades sempre atualizada
  activities$: Observable<Activity[]>;

  constructor(private activityService: ActivityService) {
    // Liga a lista ao serviço
    this.activities$ = this.activityService.getActivities();
  }

}