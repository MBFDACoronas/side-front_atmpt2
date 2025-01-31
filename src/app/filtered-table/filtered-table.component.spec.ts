import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilteredTableComponent } from './filtered-table.component';

describe('FilteredTableComponent', () => {
  let component: FilteredTableComponent;
  let fixture: ComponentFixture<FilteredTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilteredTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FilteredTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
