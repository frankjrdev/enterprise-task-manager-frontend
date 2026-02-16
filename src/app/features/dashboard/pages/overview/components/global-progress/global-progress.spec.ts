import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalProgress } from './global-progress';

describe('GlobalProgress', () => {
  let component: GlobalProgress;
  let fixture: ComponentFixture<GlobalProgress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalProgress],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalProgress);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('totalTasks', 100);
    fixture.componentRef.setInput('completedTasks', 72);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate percentage correctly', () => {
    expect(component.percentage()).toBe(72);
  });

  it('should calculate uncompleted tasks correctly', () => {
    expect(component.unCompletedTasks()).toBe(28);
  });

  it('should return 0 percentage when totalTasks is 0', () => {
    fixture.componentRef.setInput('totalTasks', 0);
    fixture.componentRef.setInput('completedTasks', 0);
    fixture.detectChanges();
    expect(component.percentage()).toBe(0);
  });

  it('should not return negative uncompleted tasks', () => {
    fixture.componentRef.setInput('totalTasks', 10);
    fixture.componentRef.setInput('completedTasks', 20);
    fixture.detectChanges();
    expect(component.unCompletedTasks()).toBe(0);
  });

  it('should render the progress ring component', () => {
    const ring = fixture.nativeElement.querySelector('progress-ring');
    expect(ring).toBeTruthy();
  });

  it('should display percentage in the center label', () => {
    const percentage = fixture.nativeElement.querySelector('.global-progress__percentage');
    expect(percentage.textContent.trim()).toBe('72%');
  });

  it('should display COMPLETE text', () => {
    const text = fixture.nativeElement.querySelector('.global-progress__complete-text');
    expect(text.textContent.trim()).toBe('COMPLETE');
  });

  it('should display on track and at risk stats', () => {
    fixture.componentRef.setInput('onTrack', 842);
    fixture.componentRef.setInput('atRisk', 24);
    fixture.detectChanges();

    const stats = fixture.nativeElement.querySelectorAll('.global-progress__stat-value');
    expect(stats[0].textContent.trim()).toBe('842');
    expect(stats[1].textContent.trim()).toBe('24');
  });
});
