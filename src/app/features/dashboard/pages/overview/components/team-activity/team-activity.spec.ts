import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamActivity } from './team-activity';

describe('TeamActivity', () => {
  let component: TeamActivity;
  let fixture: ComponentFixture<TeamActivity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamActivity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamActivity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
