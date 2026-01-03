import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false // <--- Previne o erro NG6008
})
export class RegisterPage implements OnInit {

  // Modelo de dados simples
  user = {
    name: '',
    email: '',
    password: ''
  };

  constructor(
    private router: Router,
    private toastController: ToastController
  ) { }

  ngOnInit() {
  }

  async register() {
    // Validação básica
    if(!this.user.name || !this.user.email || !this.user.password) {
      const toast = await this.toastController.create({
        message: 'Por favor preencha todos os campos!',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    // Simulação de sucesso
    const toast = await this.toastController.create({
      message: 'Conta criada com sucesso!',
      duration: 2000,
      color: 'success'
    });
    toast.present();

    // Redireciona para a Dashboard
    this.router.navigate(['/tabs/tab1']);
  }

}