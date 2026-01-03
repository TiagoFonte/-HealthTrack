import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { ActivityService } from '../../services/activity';
import { Activity, SportType, IntensityLevel } from '../../models/activity.model';

@Component({
  selector: 'app-edit-activity',
  templateUrl: './edit-activity.page.html',
  styleUrls: ['./edit-activity.page.scss'],
  standalone: false
})
export class EditActivityPage implements OnInit {

  activity: Activity = {
    id: '',
    type: SportType.RUNNING,
    duration: 0,
    date: new Date().toISOString(),
    location: '',
    intensity: IntensityLevel.MODERATE,
    notes: '',
    isFavorite: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    // Busca o ID que vem no link
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      const found = this.activityService.getActivityById(id);
      if (found) {
        this.activity = { ...found }; // Carrega os dados para o formulário
      }
    }
  }

  async saveChanges() {
    this.activityService.updateActivity(this.activity);
    const toast = await this.toastController.create({
      message: 'Atividade atualizada!',
      duration: 2000,
      color: 'success'
    });
    toast.present();
    this.router.navigate(['/tabs/tab1']);
  }

  async confirmDelete() {
    const alert = await this.alertController.create({
      header: 'Eliminar?',
      message: 'Tem a certeza que quer apagar este treino?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar', 
          cssClass: 'danger', 
          handler: () => {
            this.activityService.deleteActivity(this.activity.id);
            this.router.navigate(['/tabs/tab1']);
          }
        }
      ]
    });
    await alert.present();
  }
}