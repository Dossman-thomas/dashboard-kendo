import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRecordsComponent } from './manage-records.component';

describe('ManageRecordsComponent', () => {
  let component: ManageRecordsComponent;
  let fixture: ComponentFixture<ManageRecordsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageRecordsComponent]
    });
    fixture = TestBed.createComponent(ManageRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
