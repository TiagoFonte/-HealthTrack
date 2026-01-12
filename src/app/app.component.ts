import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences'; //

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {

  constructor(private router: Router) {
    this.checkSession();
  }

  // --- 1. Adicionar o ngOnInit ---
  async ngOnInit() {
    await this.checkTheme();
  }

  // --- 2. Nova função que aplica o tema globalmente ---
  async checkTheme() {
    const { value } = await Preferences.get({ key: 'theme' });
    
    // Se a preferência for 'dark', adiciona a classe ao corpo da página imediatamente
    if (value === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  async checkSession() {
    const { value } = await Preferences.get({ key: 'user_session' });
    if (value) {
      this.router.navigate(['/tabs/tab1']);
    } else {
      this.router.navigate(['/landing']);
    }
  }
}