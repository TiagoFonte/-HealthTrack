import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ActivityService } from '../../services/activity';
import { Activity, SportType, IntensityLevel } from '../../models/activity.model';

@Component({
  selector: 'app-add-activity',
  templateUrl: './add-activity.page.html',
  styleUrls: ['./add-activity.page.scss'],
  standalone: false // <--- ESTA LINHA É A SOLUÇÃO DO ERRO
})
export class AddActivityPage implements OnInit {

  activity: Activity = {
    id: '',
    type: SportType.RUNNING,
    duration: 60,
    date: new Date().toISOString(),
    location: '',
    intensity: IntensityLevel.MODERATE,
    notes: '',
    isFavorite: false
  };

  constructor(
    private activityService: ActivityService,
    private router: Router,
    private toastController: ToastController
  ) { }

  ngOnInit() {
  }

  async saveActivity() {
    this.activity.id = Date.now().toString();
    this.activityService.addActivity(this.activity);

    const toast = await this.toastController.create({
      message: 'Atividade guardada com sucesso!',
      duration: 2000,
      color: 'success'
    });
    toast.present();

    this.router.navigate(['/tabs/tab1']);
  }
}