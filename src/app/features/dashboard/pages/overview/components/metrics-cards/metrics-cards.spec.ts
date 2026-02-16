import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricsCards } from './metrics-cards';

describe('MetricsCards', () => {
  let component: MetricsCards;
  let fixture: ComponentFixture<MetricsCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricsCards],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricsCards);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'TOTAL TASKS');
    fixture.componentRef.setInput('value', '1,284');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    const title = fixture.nativeElement.querySelector('.metric-card__title');
    expect(title.textContent.trim()).toBe('TOTAL TASKS');
  });

  it('should display the value', () => {
    const value = fixture.nativeElement.querySelector('.metric-card__value');
    expect(value.textContent.trim()).toBe('1,284');
  });

  it('should display icon with material-icons class when provided', () => {
    fixture.componentRef.setInput('icon', 'assignment');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.metric-card__icon');
    expect(icon).toBeTruthy();
    expect(icon.classList).toContain('material-icons');
    expect(icon.textContent.trim()).toBe('assignment');
  });

  it('should compute trend prefix for up direction', () => {
    fixture.componentRef.setInput('trend', { direction: 'up', value: 12, label: 'from last week' });
    fixture.detectChanges();
    expect(component.trendPrefix()).toBe('+');
  });

  it('should compute trend prefix for down direction', () => {
    fixture.componentRef.setInput('trend', { direction: 'down', value: 5, label: 'items' });
    fixture.detectChanges();
    expect(component.trendPrefix()).toBe('-');
  });

  it('should compute trend label as dash for stable', () => {
    fixture.componentRef.setInput('trend', { direction: 'stable', value: 0, label: 'Steady state' });
    fixture.componentRef.setInput('subtitle', 'Steady state');
    fixture.detectChanges();
    expect(component.trendLabel()).toBe('—');
  });

  it('should not show footer when no subtitle', () => {
    fixture.componentRef.setInput('subtitle', '');
    fixture.detectChanges();
    const footer = fixture.nativeElement.querySelector('.metric-card__footer');
    expect(footer).toBeFalsy();
  });
});
