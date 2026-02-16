import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeFilter } from './time-filter';

describe('TimeFilter', () => {
  let component: TimeFilter;
  let fixture: ComponentFixture<TimeFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default selected value of 7d', () => {
    expect(component.selected()).toBe('7d');
  });

  it('should render default filter options', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.time-filter__btn');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent.trim()).toBe('Last 7 days');
    expect(buttons[1].textContent.trim()).toBe('Last 30 days');
  });

  it('should mark selected filter as active', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.time-filter__btn');
    expect(buttons[0].classList).toContain('time-filter__btn--active');
    expect(buttons[1].classList).not.toContain('time-filter__btn--active');
  });

  it('should change selected filter on click', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.time-filter__btn');
    buttons[1].click();
    fixture.detectChanges();

    expect(component.selected()).toBe('30d');
    expect(buttons[1].classList).toContain('time-filter__btn--active');
  });

  it('should set aria-pressed attribute on buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.time-filter__btn');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
  });
});
