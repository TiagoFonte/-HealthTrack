import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusDetailPage } from './status-detail.page';

describe('StatusDetailPage', () => {
  let component: StatusDetailPage;
  let fixture: ComponentFixture<StatusDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
