import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestProjComponent } from './test-proj.component';

describe('TestProjComponent', () => {
  let component: TestProjComponent;
  let fixture: ComponentFixture<TestProjComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestProjComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestProjComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
