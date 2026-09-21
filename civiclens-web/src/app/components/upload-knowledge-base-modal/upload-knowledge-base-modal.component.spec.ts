import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadKnowledgeBaseModalComponent } from './upload-knowledge-base-modal.component';

describe('UploadKnowledgeBaseModalComponent', () => {
  let component: UploadKnowledgeBaseModalComponent;
  let fixture: ComponentFixture<UploadKnowledgeBaseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadKnowledgeBaseModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadKnowledgeBaseModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
