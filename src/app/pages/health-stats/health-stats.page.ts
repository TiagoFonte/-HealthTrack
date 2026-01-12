import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Chart, registerables } from 'chart.js';
import { LanguageService } from '../../services/language'; 
import { ToastController } from '@ionic/angular'; // Adicionado para suportar showToast

Chart.register(...registerables);

@Component({
  selector: 'app-health-stats',
  templateUrl: './health-stats.page.html',
  styleUrls: ['./health-stats.page.scss'],
  standalone: false
})
export class HealthStatsPage implements OnInit, AfterViewInit {
  
  @ViewChild('weightCanvas') private weightCanvas: ElementRef | undefined;
  chart: any;
  t: any = {}; 

  userData = {
    name: '',
    email: '', 
    phone: '',
    height: 0,
    weight: 0,
    goal: 0
  };

  weightHistory: { date: string, weight: number }[] = [];
  imc = 0;
  imcStatus = '';
  bmiColor = 'medium';

  constructor(
    public langService: LanguageService,
    private toastCtrl: ToastController
  ) { } 

  async ngOnInit() {
    
    this.langService.translations$.subscribe((trans: any) => { 
      this.t = trans; 
      this.calculateBMI(); 
    });
    
    await this.loadData();
  }

  async ionViewDidEnter() {
    if (this.weightHistory.length > 0) {
      this.createChart();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.weightHistory.length > 0) {
        this.createChart();
      }
    }, 300);
  }

  async loadData() {
    const { value } = await Preferences.get({ key: 'user_data_info' });
    if (value) {
      const data = JSON.parse(value);
      this.userData.name = data.name || '';
      this.userData.email = data.email || '';
      this.userData.phone = data.phone || '';
      
      let h = data.height || 0;
      if (h > 3) h = h / 100;
      this.userData.height = h;
    }

    const historyData = await Preferences.get({ key: 'weight_history' });
    if (historyData.value) {
      this.weightHistory = JSON.parse(historyData.value);
      if (this.weightHistory.length > 0) {
        this.userData.weight = this.weightHistory[this.weightHistory.length - 1].weight;
      }
    } else {
      const wService = await Preferences.get({ key: 'user_weight' });
      const initialWeight = wService.value ? parseFloat(wService.value) : (this.userData.weight || 70);
      this.userData.weight = initialWeight;
      this.weightHistory = [{ date: new Date().toLocaleDateString('pt-PT'), weight: initialWeight }];
      await this.saveWeightHistory();
    }

    const goalData = await Preferences.get({ key: 'daily_goal' });
    this.userData.goal = goalData.value ? parseInt(goalData.value) : 2000;

    this.calculateBMI();
    this.createChart(); 
  }

  
  async saveData(field?: string) {
    await Preferences.set({ 
      key: 'user_data_info', 
      value: JSON.stringify(this.userData)
    });

    if (field === 'goal') {
      await Preferences.set({ 
        key: 'daily_goal', 
        value: this.userData.goal.toString() 
      });
    }

    this.calculateBMI();
    this.showToast(this.t.saved || 'Guardado!'); 
  }

  async updateWeight() {
    const newWeight = this.userData.weight;
    const today = new Date().toLocaleDateString('pt-PT');
    const lastEntry = this.weightHistory[this.weightHistory.length - 1];
    
    if (lastEntry && lastEntry.date === today) {
      lastEntry.weight = newWeight;
    } else {
      this.weightHistory.push({ date: today, weight: newWeight });
      if (this.weightHistory.length > 10) this.weightHistory.shift();
    }

    await this.saveWeightHistory();
    this.calculateBMI();
    this.updateChartData();
  }

  async saveWeightHistory() {
    await Preferences.set({ key: 'weight_history', value: JSON.stringify(this.weightHistory) });
    await Preferences.set({ key: 'user_weight', value: this.userData.weight.toString() });
  }

  calculateBMI() {
    const h = this.userData.height;
    const w = this.userData.weight;
    if (h > 0 && w > 0) {
      this.imc = w / (h * h);
      if (this.imc < 18.5) { 
        this.imcStatus = this.t.underweight || 'Abaixo do Peso'; 
        this.bmiColor = 'primary'; 
      }
      else if (this.imc < 24.9) { 
        this.imcStatus = this.t.normal || 'Peso Normal'; 
        this.bmiColor = 'success'; 
      }
      else if (this.imc < 29.9) { 
        this.imcStatus = this.t.overweight || 'Sobrepeso'; 
        this.bmiColor = 'warning'; 
      }
      else { 
        this.imcStatus = this.t.obesity || 'Obesidade'; 
        this.bmiColor = 'danger'; 
      }
    }
  }

  createChart() {
    if (!this.weightCanvas || !this.weightCanvas.nativeElement) return;
    if (this.chart) { this.chart.destroy(); }

    const labels = this.weightHistory.map(item => item.date.slice(0, 5)); 
    const data = this.weightHistory.map(item => item.weight);

    this.chart = new Chart(this.weightCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: this.t.weight || 'Peso (kg)',
          data: data,
          backgroundColor: 'rgba(45, 211, 111, 0.2)',
          borderColor: '#2dd36f',
          borderWidth: 3,
          pointBackgroundColor: '#ffffff',
          pointRadius: 5,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  updateChartData() {
    if (this.chart) {
      this.chart.data.labels = this.weightHistory.map(item => item.date.slice(0, 5));
      this.chart.data.datasets[0].data = this.weightHistory.map(item => item.weight);
      this.chart.data.datasets[0].label = this.t.weight || 'Peso (kg)';
      this.chart.update();
    } else {
      this.createChart();
    }
  }

  // Função para mostrar mensagens toast
  async showToast(msg: string) {
    const t = await this.toastCtrl.create({ 
      message: msg, 
      duration: 2000,
      color: 'success'
    });
    t.present();
  }
}