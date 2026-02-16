import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentActivities } from './recent-activities';
import { TeamActivityItem } from '../../models/team-activity.model';

const MOCK_ACTIVITIES: readonly TeamActivityItem[] = [
  {
    id: 'ta-1',
    actorName: 'Sarah Connor',
    actorInitials: 'SC',
    actionType: 'task-moved',
    actionDescription: 'moved',
    targetName: 'UI Component Library',
    targetStatus: 'DONE',
    timestamp: new Date(),
    relativeTime: '2 minutes ago',
  },
  {
    id: 'ta-2',
    actorName: 'John Doe',
    actorInitials: 'JD',
    actionType: 'comment-added',
    actionDescription: 'commented on',
    targetName: 'Security Audit R104',
    comment: 'The encryption keys need rotating...',
    timestamp: new Date(),
    relativeTime: '14 minutes ago',
  },
];

describe('RecentActivities', () => {
  let component: RecentActivities;
  let fixture: ComponentFixture<RecentActivities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentActivities],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentActivities);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('activities', MOCK_ACTIVITIES);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render activity items', () => {
    const items = fixture.nativeElement.querySelectorAll('.recent-activities__item');
    expect(items.length).toBe(2);
  });

  it('should display actor names', () => {
    const actors = fixture.nativeElement.querySelectorAll('.recent-activities__actor');
    expect(actors[0].textContent.trim()).toBe('Sarah Connor');
    expect(actors[1].textContent.trim()).toBe('John Doe');
  });

  it('should display target names', () => {
    const targets = fixture.nativeElement.querySelectorAll('.recent-activities__target');
    expect(targets[0].textContent.trim()).toBe('UI Component Library');
  });

  it('should display comments when present', () => {
    const comments = fixture.nativeElement.querySelectorAll('.recent-activities__comment');
    expect(comments.length).toBe(1);
    expect(comments[0].textContent).toContain('encryption keys need rotating');
  });

  it('should show live updates indicator by default', () => {
    const live = fixture.nativeElement.querySelector('.recent-activities__live');
    expect(live).toBeTruthy();
    expect(live.textContent.trim()).toContain('LIVE UPDATES');
  });

  it('should hide live updates indicator when disabled', () => {
    fixture.componentRef.setInput('hasLiveUpdates', false);
    fixture.detectChanges();
    const live = fixture.nativeElement.querySelector('.recent-activities__live');
    expect(live).toBeFalsy();
  });

  it('should display relative time for each activity', () => {
    const times = fixture.nativeElement.querySelectorAll('.recent-activities__time');
    expect(times[0].textContent.trim()).toBe('2 minutes ago');
    expect(times[1].textContent.trim()).toBe('14 minutes ago');
  });

  it('should return correct icon for activity type', () => {
    const iconFn = component.activityIcon();
    expect(iconFn('task-moved')).toBe('check_circle');
    expect(iconFn('comment-added')).toBe('chat_bubble');
    expect(iconFn('alert')).toBe('error');
  });
});
