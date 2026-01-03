import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false
})
export class Tab3Page implements OnInit {

  isDarkMode = true; // Começa ativo por defeito (baseado no teu design)

  constructor() {}

  ngOnInit() {
    // Verifica a preferência ao iniciar
    const prefersDark = document.body.classList.contains('dark');
    this.isDarkMode = prefersDark;
  }

  // Função para mudar o tema
  toggleTheme(event: any) {
    if (event.detail.checked) {
      document.body.setAttribute('color-theme', 'dark'); // Opcional dependendo da versão ionic
      document.body.classList.add('dark');
    } else {
      document.body.setAttribute('color-theme', 'light');
      document.body.classList.remove('dark');
    }
  }
}