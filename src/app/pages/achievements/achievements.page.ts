import { Component, OnInit } from '@angular/core';
import { ActivityService } from '../../services/activity';
import { LanguageService } from '../../services/language';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.page.html',
  styleUrls: ['./achievements.page.scss'],
  standalone: false
})
export class AchievementsPage implements OnInit {
  t: any = {};
  
  // --- CONFIGURAÇÃO DOS TROFÉUS (BADGES) ---
  // Define os IDs, ícones, cores e metas para cada conquista
  badgesData = [
    { id: 1, keyName: 'badge_beginner', keyDesc: 'badge_beginner_desc', icon: 'medal', color: 'tertiary', target: 1 },
    { id: 2, keyName: 'badge_burner', keyDesc: 'badge_burner_desc', icon: 'flame', color: 'warning', target: 500 },
    { id: 3, keyName: 'badge_loyal', keyDesc: 'badge_loyal_desc', icon: 'calendar', color: 'success', target: 3 },
    { id: 4, keyName: 'badge_master', keyDesc: 'badge_master_desc', icon: 'trophy', color: 'primary', target: 10 }
  ];

  displayBadges: any[] = [];

  constructor(private activityService: ActivityService, public langService: LanguageService) {
    // Inicializa a lista visual com valores padrão
    this.displayBadges = this.badgesData.map(b => ({ ...b, earned: false, progress: 0, name: '', desc: '' }));
  }

  // --- INICIALIZAÇÃO E SUBSCRICÕES ---
  ngOnInit() {
    // Escuta mudanças de idioma para atualizar nomes e descrições
    this.langService.translations$.subscribe(trans => {
      this.t = trans;
      this.updateTexts();
    });
    
    // Escuta a lista de atividades para calcular o progresso em tempo real
    this.activityService.getActivities().subscribe(acts => {
      this.calculateProgress(acts);
    });
  }

  // --- TRADUÇÃO DE CONTEÚDO ---
  updateTexts() {
    if (!this.t) return;
    this.displayBadges.forEach((b, i) => {
      const original = this.badgesData[i];
      b.name = this.t[original.keyName] || original.keyName;
      b.desc = this.t[original.keyDesc] || original.keyDesc;
    });
  }

  // --- LÓGICA DE CÁLCULO DE CONQUISTAS ---
  calculateProgress(acts: any[]) {
    const totalWorkouts = acts.length;
    const maxCals = Math.max(...acts.map((a: any) => a.calories || 0), 0);

    // Badge 0: Primeiro Treino (Iniciante)
    this.displayBadges[0].progress = Math.min(totalWorkouts, 1);
    this.displayBadges[0].earned = totalWorkouts >= 1;

    // Badge 1: Queimar 500 kcal num único treino
    this.displayBadges[1].progress = Math.min(maxCals, 500);
    this.displayBadges[1].earned = maxCals >= 500;

    // Badge 2: Lealdade (3 treinos realizados)
    this.displayBadges[2].progress = Math.min(totalWorkouts, 3);
    this.displayBadges[2].earned = totalWorkouts >= 3;

    // Badge 3: Mestre (10 treinos realizados)
    this.displayBadges[3].progress = Math.min(totalWorkouts, 10);
    this.displayBadges[3].earned = totalWorkouts >= 10;
  }
}