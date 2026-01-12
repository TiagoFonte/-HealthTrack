import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivityService } from '../services/activity';
import { Activity } from '../models/activity.model';
import { LanguageService } from '../services/language';
import { Share } from '@capacitor/share'; 
import { ActionSheetController, ToastController } from '@ionic/angular';
import * as L from 'leaflet';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page implements OnInit {

  t: any = {};
  
  allActivities: Activity[] = [];
  filteredActivities: Activity[] = [];
  searchTerm: string = '';
  currentFilter: string = 'all'; 
  viewMode: string = 'list'; 
  calendarHighlights: any[] = [];
  selectedDate: string = '';
  
  // Lista de desportos para os chips de filtro
  sportsList = ['Futebol', 'Corrida', 'Ginásio', 'Caminhada', 'Ciclismo', 'Natação', 'Basquetebol', 'Ténis', 'Padel', 'Outro'];
  
  isGlobalMapOpen = false;
  globalMap: L.Map | undefined;

  constructor(
    public langService: LanguageService,
    private activityService: ActivityService,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController
  ) {
    this.activityService.getActivities().subscribe(list => {
      // Ordenar por data (mais recente primeiro)
      this.allActivities = list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.updateCalendarHighlights();
      this.applyFilters();
    });
  }

  ngOnInit() {
    this.langService.translations$.subscribe(trans => { this.t = trans; });
  }
  
  segmentChanged(event: any) {
    this.viewMode = event.detail.value;
    if (this.viewMode === 'list') {
      this.selectedDate = '';
      this.applyFilters();
    }
  }

  updateCalendarHighlights() {
    this.calendarHighlights = this.allActivities.map(act => {
      const dateStr = act.date.split('T')[0];
      return { date: dateStr, textColor: '#ffffff', backgroundColor: '#2dd36f' };
    });
  }

  onDateSelected(event: any) {
    this.selectedDate = event.detail.value.split('T')[0];
    this.applyFilters();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  // Define o filtro por categoria ou favoritos
  setFilter(category: string) {
    this.currentFilter = category;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredActivities = this.allActivities.filter(activity => {
      // Pesquisa por texto (Tipo, Localização ou Métricas de Saúde)
      const matchesSearch = (
        activity.type.toLowerCase().includes(this.searchTerm) || 
        (activity.location && activity.location.toLowerCase().includes(this.searchTerm)) ||
        (activity.notes && activity.notes.toLowerCase().includes(this.searchTerm))
      );

      // Filtro por categoria (Chips)
      let matchesCategory = true;
      if (this.currentFilter === 'favorites') matchesCategory = activity.isFavorite === true;
      else if (this.currentFilter !== 'all') matchesCategory = activity.type === this.currentFilter;

      // Filtro por data no modo calendário
      let matchesDate = true;
      if (this.viewMode === 'calendar' && this.selectedDate) {
        matchesDate = activity.date.startsWith(this.selectedDate);
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }

  getIconName(type: any): string {
    const s = String(type || '').toLowerCase();
    if (s.includes('corrida')) return 'walk';
    if (s.includes('caminh')) return 'footsteps';
    if (s.includes('cicli') || s.includes('bicic')) return 'bicycle';
    if (s.includes('fut')) return 'football';
    if (s.includes('gin') || s.includes('fit')) return 'barbell';
    if (s.includes('nat') || s.includes('swim')) return 'water';
    if (s.includes('basq')) return 'basketball';
    if (s.includes('ténis') || s.includes('padel')) return 'pints';
    return 'fitness'; 
  }

  editActivity(id: string) { this.router.navigate(['/edit-activity', id]); }

  toggleFavorito(activity: any, event: Event) {
    event.stopPropagation();
    activity.isFavorite = !activity.isFavorite;
    this.activityService.updateActivity(activity);
  }

  async shareActivity(activity: Activity, event: Event) {
    event.stopPropagation(); 
    let msg = `Treinei ${activity.type}: ${activity.duration}min, ${activity.calories}kcal.`;
    if (activity.notes && activity.notes.includes('[SAÚDE:')) {
      const healthPart = activity.notes.split(']')[0].replace('[SAÚDE:', '').trim();
      msg += ` Métricas: ${healthPart}`;
    }
    await Share.share({ title: 'HealthTrack', text: msg, dialogTitle: 'Partilhar Treino' });
  }

  // --- EXPORTAÇÃO DE DADOS ---
  async openExportOptions() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.t.exportData || 'Exportar Dados',
      buttons: [
        { text: 'CSV (Excel)', icon: 'document-text-outline', handler: () => this.exportToCSV() },
        { text: 'JSON', icon: 'code-working-outline', handler: () => this.exportToJSON() },
        { text: this.t.cancel || 'Cancelar', role: 'cancel', icon: 'close' }
      ]
    });
    await actionSheet.present();
  }

  private exportToCSV() {
    const headers = 'ID,Data,Tipo,Duração,Calorias,Localização\n';
    const rows = this.allActivities.map(a => 
      `${a.id},${a.date},${a.type},${a.duration},${a.calories},"${a.location || ''}"`
    ).join('\n');
    
    this.downloadFile(headers + rows, 'atividades_healthtrack.csv', 'text/csv');
  }

  private exportToJSON() {
    const data = JSON.stringify(this.allActivities, null, 2);
    this.downloadFile(data, 'atividades_healthtrack.json', 'application/json');
  }

  private async downloadFile(content: string, fileName: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
    
    const toast = await this.toastCtrl.create({ message: 'Ficheiro gerado com sucesso!', duration: 2000, color: 'success' });
    toast.present();
  }

  // --- MAPA GLOBAL ---
  openGlobalMap() { this.isGlobalMapOpen = true; setTimeout(() => this.initGlobalMap(), 400); }
  closeGlobalMap() { this.isGlobalMapOpen = false; if (this.globalMap) { this.globalMap.remove(); this.globalMap = undefined; } }

  initGlobalMap() {
    if (this.globalMap) this.globalMap.remove();
    this.globalMap = L.map('globalMapId').setView([39.5, -8.0], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(this.globalMap);
    this.allActivities.forEach(act => {
      if (act.lat && act.lng) {
        const customIcon = this.getMarkerIcon(act.type);
        const healthPopup = act.notes ? `<br><i style="font-size:12px; color:#2dd36f;">${act.notes.split('•')[0]}</i>` : '';
        L.marker([act.lat, act.lng], { icon: customIcon }).addTo(this.globalMap!).bindPopup(
          `<div style="text-align:center;"><b style="font-size:16px;">${act.type}</b><br>` +
          `<span style="color:#666;">${act.date.split('T')[0]}</span>${healthPopup}<br>${act.location || ''}</div>`
        );
      }
    });
    setTimeout(() => { this.globalMap?.invalidateSize(); }, 100);
  }

  getMarkerIcon(type: string) {
    let emoji = '📍'; 
    const t = (type || '').toLowerCase();
    if (t.includes('futebol')) emoji = '⚽';
    else if (t.includes('corrida')) emoji = '🏃';
    else if (t.includes('caminhada')) emoji = '🚶';
    else if (t.includes('ginásio')) emoji = '💪';
    else if (t.includes('ciclismo')) emoji = '🚴';
    else if (t.includes('natação')) emoji = '🏊';
    return L.divIcon({ className: 'custom-emoji-marker', html: `<div style="font-size: 30px; line-height: 1;">${emoji}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] });
  }
}