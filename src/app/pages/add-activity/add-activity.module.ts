import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AddActivityPageRoutingModule } from './add-activity-routing.module';
import { AddActivityPage } from './add-activity.page';
import { MapModalComponent } from '../../components/map-modal/map-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddActivityPageRoutingModule
  ],
  declarations: [
    AddActivityPage,
    MapModalComponent 
  ]
})
export class AddActivityPageModule {}
