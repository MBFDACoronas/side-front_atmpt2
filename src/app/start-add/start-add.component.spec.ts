import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartAddComponent } from './start-add.component';

describe('StartAddComponent', () => {
  let component: StartAddComponent;
  let fixture: ComponentFixture<StartAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StartAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
