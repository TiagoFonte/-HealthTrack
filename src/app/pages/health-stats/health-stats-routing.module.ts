import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HealthStatsPage } from './health-stats.page';

const routes: Routes = [
  {
    path: '',
    component: HealthStatsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HealthStatsPageRoutingModule {}
