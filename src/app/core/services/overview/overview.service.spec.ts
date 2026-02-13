import { TestBed } from '@angular/core/testing';

import { Overview } from './overview.service';

describe('Overview', () => {
  let service: Overview;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Overview);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
