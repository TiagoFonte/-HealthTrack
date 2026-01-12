import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HealthStatsPage } from './health-stats.page';

describe('HealthStatsPage', () => {
  let component: HealthStatsPage;
  let fixture: ComponentFixture<HealthStatsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthStatsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
