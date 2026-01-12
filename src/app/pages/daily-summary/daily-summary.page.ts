import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActivityService } from '../../services/activity';
import { LanguageService } from '../../services/language';
import { Activity } from '../../models/activity.model';

@Component({
  selector: 'app-daily-summary',
  templateUrl: './daily-summary.page.html',
  styleUrls: ['./daily-summary.page.scss'],
  standalone: false
})
export class DailySummaryPage implements OnInit {

  // Variáveis para o HTML
  date: string = '';
  summary: any = { calories: 0, distance: 0, duration: 0, count: 0 };
  activities: Activity[] = [];
  t: any = {}; // Objeto de Traduções

  constructor(
    private route: ActivatedRoute,
    private activityService: ActivityService,
    public langService: LanguageService // Injetado como Public para o HTML usar
  ) { }

  ngOnInit() {
    // 1. Carregar as traduções
    this.langService.translations$.subscribe(trans => {
      this.t = trans;
    });

    // 2. Ler a data que vem no URL (ex: ?date=2024-01-11)
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.date = params['date'];
      } else {
        // Se não vier data, assume hoje
        this.date = new Date().toISOString().split('T')[0];
      }
      this.loadData();
    });
  }

  loadData() {
    // Vamos buscar TODAS as atividades e filtrar apenas as deste dia
    this.activityService.getActivities().subscribe(all => {
      
      // Filtrar pela data selecionada
      this.activities = all.filter(a => a.date && a.date.startsWith(this.date));
      
      // Ordenar por hora
      this.activities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calcular os totais (Resumo)
      this.summary = { calories: 0, distance: 0, duration: 0, count: 0 };
      this.summary.count = this.activities.length;

      this.activities.forEach(act => {
        this.summary.calories += (act.calories || 0);
        this.summary.duration += (act.duration || 0);
        
        // Se tiver distância (corrida/ciclismo), soma. Se não, estima (opcional)
        if (act.distance) {
          this.summary.distance += act.distance;
        } else if (act.type === 'Caminhada' || act.type === 'Corrida') {
          // Estimativa simples se não houver dados: 1km a cada 10min (apenas exemplo)
          this.summary.distance += (act.duration || 0) / 10;
        }
      });
    });
  }

  // --- FUNÇÕES AUXILIARES PARA O HTML ---

  // Converte minutos (ex: 90) em texto formatado (ex: "01h 30m")
  formatDuration(mins: number): string {
    if (!mins) return '00h 00m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const hStr = h < 10 ? '0' + h : h;
    const mStr = m < 10 ? '0' + m : m;
    return `${hStr}h ${mStr}m`;
  }

  // Define a cor da "bolinha" na cronologia dependendo do desporto
  getActivityColor(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('futebol')) return '#28ba62'; // Verde
    if (t.includes('corrida')) return '#ffc409'; // Amarelo
    if (t.includes('ginásio')) return '#eb445a'; // Vermelho
    if (t.includes('natação')) return '#3dc2ff'; // Azul
    if (t.includes('caminhada')) return '#2dd36f'; // Verde Claro
    if (t.includes('ciclismo')) return '#ff9f0a'; // Laranja
    return '#92949c'; // Cinza por defeito
  }
}