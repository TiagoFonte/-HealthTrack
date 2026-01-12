import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { ActivityService } from '../../services/activity';
import { LanguageService } from '../../services/language';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
  standalone: false
})
export class IntroPage implements OnInit {

  // Passo 0: Welcome, 1: Nome/Tel, 2: Verificação, 3: Corpo, 4: Meta
  step = 0; 
  
  userData = {
    name: '',
    email: '', 
    phone: '', 
    weight: null,
    height: null,
    gender: 'M'
  };
  
  verificationCode: string = '';
  dailyGoal = 500;
  t: any = {};

  constructor(
    private router: Router,
    private activityService: ActivityService,
    public langService: LanguageService,
    private toastCtrl: ToastController
  ) { }

  async ngOnInit() {
    this.langService.translations$.subscribe(trans => this.t = trans);

    // Recuperar o nome e email que o utilizador inseriu no ecrã de Registo
    const { value: name } = await Preferences.get({ key: 'temp_user_name' });
    const { value: session } = await Preferences.get({ key: 'user_session' });
    
    if (name) this.userData.name = name;
    if (session) {
      const parsed = JSON.parse(session);
      this.userData.email = parsed.email;
    }
  }

  async next() {
    // CORREÇÃO PASSO 1: Apenas Nome e Telemóvel
    if (this.step === 1) {
      if (!this.userData.name || !this.userData.phone || this.userData.phone.toString().length !== 9) {
        this.showToast('Insira um nome e um telemóvel com 9 dígitos.');
        return;
      }
      
      this.showToast('Código enviado! Introduz qualquer 4 dígitos para testar.');
    }
    
    // Passo 2: Verificação SMS simulada
    if (this.step === 2) {
      if (!this.verificationCode || this.verificationCode.toString().length !== 4) {
        this.showToast('Insira um código de 4 dígitos.');
        return;
      }
    }

    // Passo 3: Dados físicos (Peso e Altura)
    if (this.step === 3 && (!this.userData.weight || !this.userData.height)) {
      this.showToast('Preencha o seu peso e altura.');
      return;
    }
    
    // Passo 4: Meta Diária
    if (this.step === 4) {
       // Apenas avança para o finish
    }

    this.step++;
  }

  back() {
    if (this.step > 0) this.step--;
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: 'primary',
      position: 'bottom'
    });
    toast.present();
  }

  async finish() {
    await Preferences.set({ key: 'user_data_info', value: JSON.stringify(this.userData) });
    if (this.userData.weight) await this.activityService.saveWeight(this.userData.weight);
    await this.activityService.setGoal(this.dailyGoal);
    await Preferences.set({ key: 'intro_seen', value: 'true' });
    
    // Atualiza a sessão com os dados completos (incluindo tel e corpo)
    await Preferences.set({ key: 'user_session', value: JSON.stringify(this.userData) });
    
    this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
  }
}