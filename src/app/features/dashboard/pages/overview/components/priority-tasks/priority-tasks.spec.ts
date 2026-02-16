import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorityTasks } from './priority-tasks';

describe('PriorityTasks', () => {
  let component: PriorityTasks;
  let fixture: ComponentFixture<PriorityTasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriorityTasks],
    }).compileComponents();

    fixture = TestBed.createComponent(PriorityTasks);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tasks', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
