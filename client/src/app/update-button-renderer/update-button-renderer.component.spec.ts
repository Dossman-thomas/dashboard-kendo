import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateButtonRendererComponent } from './update-button-renderer.component';

describe('UpdateButtonRendererComponent', () => {
  let component: UpdateButtonRendererComponent;
  let fixture: ComponentFixture<UpdateButtonRendererComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateButtonRendererComponent]
    });
    fixture = TestBed.createComponent(UpdateButtonRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
