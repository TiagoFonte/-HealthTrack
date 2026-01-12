import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {

  // Objeto atualizado: telemóvel removido
  user = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  // Variáveis para feedback de força da password
  passwordStrength = ''; 
  passwordStrengthColor = 'danger';
  passwordStrengthValue = 0;

  constructor(
    private router: Router,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {}

  // Validação de formato de email profissional
  validateEmail(email: string) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(email);
  }

  // Cálculo de força em tempo real
  checkPasswordStrength(password: string) {
    if (!password) {
      this.passwordStrength = '';
      this.passwordStrengthValue = 0;
      return;
    }

    let points = 0;
    if (password.length >= 8) points++;
    if (/[A-Z]/.test(password)) points++;
    if (/[0-9]/.test(password)) points++;
    if (/[^A-Za-z0-9]/.test(password)) points++;

    this.passwordStrengthValue = points / 4;

    switch (points) {
      case 1: this.passwordStrength = 'Fraca'; this.passwordStrengthColor = 'danger'; break;
      case 2: this.passwordStrength = 'Média'; this.passwordStrengthColor = 'warning'; break;
      case 3: this.passwordStrength = 'Forte'; this.passwordStrengthColor = 'success'; break;
      case 4: this.passwordStrength = 'Muito Forte'; this.passwordStrengthColor = 'primary'; break;
    }
  }

  async register() {
    // 1. Validações Rigorosas (Lógica de telemóvel removida)
    if (!this.user.name || !this.user.email || !this.user.password) {
      this.showToast('Preencha todos os campos!', 'warning');
      return;
    }

    if (!this.validateEmail(this.user.email)) {
      this.showToast('Formato de email inválido.', 'danger');
      return;
    }

    if (this.passwordStrengthValue < 0.5) {
      this.showToast('A palavra-passe deve ser pelo menos "Média".', 'warning');
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      this.showToast('As palavras-passe não coincidem.', 'danger');
      return;
    }

    // 2. Persistência
    const { value } = await Preferences.get({ key: 'healthtrack_users' });
    let users = value ? JSON.parse(value) : [];

    if (users.find((u: any) => u.email === this.user.email)) {
      this.showToast('Este email já está registado.', 'danger');
      return;
    }

    // 3. Salvar Utilizador
    users.push(this.user);
    await Preferences.set({ key: 'healthtrack_users', value: JSON.stringify(users) });
    await Preferences.set({ key: 'temp_user_name', value: this.user.name });

    this.showToast('Conta criada! Vamos configurar o teu perfil.', 'success');
    
    // Manda para a INTRO para completar os dados físicos
    this.router.navigate(['/intro']);
  }

  async showToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg, duration: 2500, color: color, position: 'top'
    });
    toast.present();
  }
}