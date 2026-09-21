import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWorkspaceModalComponent } from './create-workspace-modal.component';

describe('CreateWorkspaceModalComponent', () => {
  let component: CreateWorkspaceModalComponent;
  let fixture: ComponentFixture<CreateWorkspaceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateWorkspaceModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateWorkspaceModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
