import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HealthStatsPageRoutingModule } from './health-stats-routing.module';
import { HealthStatsPage } from './health-stats.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HealthStatsPageRoutingModule
  ],
  declarations: [HealthStatsPage]
})
export class HealthStatsPageModule {}
