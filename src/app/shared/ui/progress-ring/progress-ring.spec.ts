import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressRing } from './progress-ring';

describe('ProgressRing', () => {
  let component: ProgressRing;
  let fixture: ComponentFixture<ProgressRing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressRing],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressRing);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('percentage', 72);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate radius from size and strokeWidth', () => {
    fixture.componentRef.setInput('size', 200);
    fixture.componentRef.setInput('strokeWidth', 14);
    fixture.detectChanges();
    expect(component.radius()).toBe(93);
  });

  it('should calculate circumference from radius', () => {
    fixture.componentRef.setInput('size', 200);
    fixture.componentRef.setInput('strokeWidth', 14);
    fixture.detectChanges();
    expect(component.circumference()).toBeCloseTo(2 * Math.PI * 93);
  });

  it('should calculate strokeDashoffset based on percentage', () => {
    fixture.componentRef.setInput('percentage', 50);
    fixture.detectChanges();
    const expected = component.circumference() * 0.5;
    expect(component.strokeDashoffset()).toBeCloseTo(expected);
  });

  it('should clamp percentage between 0 and 100', () => {
    fixture.componentRef.setInput('percentage', 150);
    fixture.detectChanges();
    expect(component.strokeDashoffset()).toBe(0);

    fixture.componentRef.setInput('percentage', -10);
    fixture.detectChanges();
    expect(component.strokeDashoffset()).toBe(component.circumference());
  });

  it('should render SVG with correct viewBox', () => {
    fixture.componentRef.setInput('size', 200);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 200 200');
  });

  it('should render aria label with percentage', () => {
    fixture.componentRef.setInput('percentage', 72);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('aria-label')).toBe('Progress: 72%');
  });
});
