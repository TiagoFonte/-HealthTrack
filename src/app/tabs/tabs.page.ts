import { Component } from '@angular/core';
import { LanguageService } from '../services/language';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false
})
export class TabsPage {
  t: any = {};

  constructor(public langService: LanguageService) {
    this.langService.translations$.subscribe(trans => this.t = trans);
  }
}