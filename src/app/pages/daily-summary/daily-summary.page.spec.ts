import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailySummaryPage } from './daily-summary.page';

describe('DailySummaryPage', () => {
  let component: DailySummaryPage;
  let fixture: ComponentFixture<DailySummaryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DailySummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
