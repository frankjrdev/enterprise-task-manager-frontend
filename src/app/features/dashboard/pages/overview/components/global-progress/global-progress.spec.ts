import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalProgress } from './global-progress';

describe('GlobalProgress', () => {
  let component: GlobalProgress;
  let fixture: ComponentFixture<GlobalProgress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalProgress]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalProgress);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
