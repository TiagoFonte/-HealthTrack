import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '', 
    redirectTo: 'landing', 
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadChildren: () => import('./pages/landing/landing.module').then( m => m.LandingPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'intro',
    loadChildren: () => import('./pages/intro/intro.module').then( m => m.IntroPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'add-activity',
    loadChildren: () => import('./pages/add-activity/add-activity.module').then( m => m.AddActivityPageModule)
  },
  {
    path: 'edit-activity/:id',
    loadChildren: () => import('./pages/edit-activity/edit-activity.module').then( m => m.EditActivityPageModule)
  },
  {
    path: 'health-stats',
    loadChildren: () => import('./pages/health-stats/health-stats.module').then( m => m.HealthStatsPageModule)
  },
  {
    path: 'achievements',
    loadChildren: () => import('./pages/achievements/achievements.module').then( m => m.AchievementsPageModule)
  },
  {
    path: 'daily-summary',
    loadChildren: () => import('./pages/daily-summary/daily-summary.module').then( m => m.DailySummaryPageModule)
  },
  // --- AQUI ESTÁ A CORREÇÃO: ADICIONAR A ROTA DE PRIVACIDADE ---
  {
    path: 'privacy',
    loadChildren: () => import('./pages/privacy/privacy.module').then( m => m.PrivacyPageModule)
  }
  // -------------------------------------------------------------
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}