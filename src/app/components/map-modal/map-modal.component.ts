import { Component, AfterViewInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
  standalone: false
})
export class MapModalComponent implements AfterViewInit {
  // --- PROPRIEDADES DO MAPA ---
  map: L.Map | undefined;
  marker: L.Marker | undefined;
  selectedLat: number | null = null;
  selectedLng: number | null = null;

  constructor(private modalCtrl: ModalController) {}

  // --- CICLO DE VIDA ---
  ngAfterViewInit() {
    // Timeout para garantir que o container do mapa está renderizado antes da inicialização
    setTimeout(() => { this.initMap(); }, 400);
  }

  // --- LÓGICA DO MAPA (LEAFLET) ---
  initMap() {
    
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Inicialização do mapa focado em Portugal
    this.map = L.map('modal_map').setView([39.5, -8.0], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM'
    }).addTo(this.map);

    // Gestão de cliques e atualização do marcador no mapa
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.selectedLat = e.latlng.lat;
      this.selectedLng = e.latlng.lng;

      if (this.marker) this.map?.removeLayer(this.marker);
      this.marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(this.map!);
    });
  }

  // --- ACÇÕES DO MODAL ---
  confirmSelection() {
    this.modalCtrl.dismiss({
      lat: this.selectedLat,
      lng: this.selectedLng
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}