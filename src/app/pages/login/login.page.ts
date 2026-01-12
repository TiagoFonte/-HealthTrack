import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  // Objeto para armazenar os dados do formulário
  loginData = {
    email: '',
    password: ''
  };

  // Estado de validação
  isEmailValid = true;

  constructor(
    private router: Router,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
  }

  // Validação de email profissional
  validateEmail() {
    if (!this.loginData.email) {
      this.isEmailValid = true;
      return;
    }
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    this.isEmailValid = re.test(this.loginData.email);
  }

  // Verifica se o formulário está apto para submissão
  canLogin(): boolean {
    return (
      this.validateEmailFormat(this.loginData.email) && 
      this.loginData.password.length >= 6
    );
  }

  private validateEmailFormat(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(email);
  }

  // Função chamada pelo botão ENTRAR
  async onLogin() {
    if (!this.canLogin()) {
      this.showToast('Por favor, insere um email válido e a password.', 'warning');
      return;
    }

    try {
      // Simulação de login: procura o utilizador nos dados locais
      const { value } = await Preferences.get({ key: 'healthtrack_users' });
      const users = value ? JSON.parse(value) : [];
      
      const user = users.find((u: any) => 
        u.email === this.loginData.email && u.password === this.loginData.password
      );

      if (user) {
        // Guarda a sessão com os dados reais do registo
        await Preferences.set({
          key: 'user_session',
          value: JSON.stringify(user)
        });

        this.showToast(`Bem-vindo de volta, ${user.name}!`, 'success');
        this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
      } else {
        this.showToast('Email ou password incorretos.', 'danger');
      }
    } catch (error) {
      this.showToast('Erro ao efetuar login. Tenta novamente.', 'danger');
    }
  }

  async showToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2500,
      color: color,
      position: 'top'
    });
    toast.present();
  }

  // Função chamada pelo link "Criar conta nova"
  goToRegister() {
    this.router.navigate(['/register']); // Ou '/intro' conforme a tua rota
  }
}