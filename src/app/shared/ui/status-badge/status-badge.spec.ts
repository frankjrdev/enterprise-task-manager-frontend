import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  let component: StatusBadge;
  let fixture: ComponentFixture<StatusBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadge);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('status', 'in-progress');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct label for in-progress status', () => {
    expect(component.label()).toBe('IN PROGRESS');
  });

  it('should display correct label for done status', () => {
    fixture.componentRef.setInput('status', 'done');
    fixture.detectChanges();
    expect(component.label()).toBe('DONE');
  });

  it('should display correct label for blocked status', () => {
    fixture.componentRef.setInput('status', 'blocked');
    fixture.detectChanges();
    expect(component.label()).toBe('BLOCKED');
  });

  it('should generate correct CSS class', () => {
    expect(component.cssClass()).toBe('badge--in-progress');

    fixture.componentRef.setInput('status', 'done');
    fixture.detectChanges();
    expect(component.cssClass()).toBe('badge--done');
  });

  it('should render badge with aria-label', () => {
    const badge = fixture.nativeElement.querySelector('.badge--in-progress');
    expect(badge.getAttribute('aria-label')).toBe('Status: IN PROGRESS');
  });
});
