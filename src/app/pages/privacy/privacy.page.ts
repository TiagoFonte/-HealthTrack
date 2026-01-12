import { Component, OnInit } from '@angular/core';
import { LanguageService } from 'src/app/services/language'; // Confirma o caminho do teu serviço

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
  standalone: false
})
export class PrivacyPage implements OnInit {

  currentLanguage = 'pt'; // Valor padrão

  constructor(private langService: LanguageService) { }

  ngOnInit() {
    // Subscreve ao idioma atual para mudar o texto dinamicamente
    this.currentLanguage = this.langService.getCurrentLang();
    
    // Opcional: Se quiseres que mude em tempo real se o user trocar noutra tab
    this.langService.translations$.subscribe(() => {
      this.currentLanguage = this.langService.getCurrentLang();
    });
  }
}