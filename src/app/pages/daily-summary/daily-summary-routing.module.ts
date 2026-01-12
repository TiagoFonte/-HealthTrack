import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DailySummaryPage } from './daily-summary.page';

const routes: Routes = [
  {
    path: '',
    component: DailySummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DailySummaryPageRoutingModule {}
