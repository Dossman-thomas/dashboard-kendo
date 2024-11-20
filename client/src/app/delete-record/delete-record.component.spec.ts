import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteRecordComponent } from './delete-record.component';

describe('DeleteRecordComponent', () => {
  let component: DeleteRecordComponent;
  let fixture: ComponentFixture<DeleteRecordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteRecordComponent]
    });
    fixture = TestBed.createComponent(DeleteRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
