import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTranslateService } from '@ngx-translate/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { AsmsModalComponent, ModalStep } from './modal.component';

const TWO_STEPS: ModalStep[] = [
  { label: 'USERS.STEP_1', icon: 'person' },
  { label: 'USERS.STEP_2', icon: 'key' }
];

const THREE_STEPS: ModalStep[] = [
  { label: 'USERS.STEP_1', icon: 'person' },
  { label: 'USERS.STEP_2', icon: 'key' },
  { label: 'USERS.STEP_3', icon: 'business' }
];

describe('AsmsModalComponent', () => {
  let component: AsmsModalComponent;
  let fixture: ComponentFixture<AsmsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsmsModalComponent],
      providers: [
        provideAnimationsAsync(),
        provideTranslateService({ defaultLanguage: 'en' })
      ]
    })
    // Override OnPush to Default so tests can detect changes easily
    .overrideComponent(AsmsModalComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
    .compileComponents();

    fixture = TestBed.createComponent(AsmsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit cancelled when close button clicked', () => {
    const spy = jest.spyOn(component.cancelled, 'emit');
    const closeBtn = fixture.nativeElement.querySelector('.asms-modal-close');
    closeBtn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit cancelled when Cancel button clicked', () => {
    const spy = jest.spyOn(component.cancelled, 'emit');
    const cancelBtn = fixture.nativeElement.querySelector('.asms-modal-cancel-btn');
    cancelBtn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should not show step indicator when steps is empty', () => {
    component.steps = [];
    fixture.detectChanges();
    const stepsEl = fixture.nativeElement.querySelector('.asms-modal-steps');
    expect(stepsEl).toBeNull();
  });

  it('should show step indicator when steps provided', () => {
    component.steps = TWO_STEPS;
    component.currentStep = 0;
    component.isFirstStep = true;
    component.isLastStep = false;
    fixture.detectChanges();
    const stepsEl = fixture.nativeElement.querySelector('.asms-modal-steps');
    expect(stepsEl).toBeTruthy();
  });

  it('should show step counter when steps provided', () => {
    component.steps = TWO_STEPS;
    component.currentStep = 0;
    fixture.detectChanges();
    const counter = fixture.nativeElement.querySelector('.asms-modal-step-counter');
    expect(counter).toBeTruthy();
  });

  it('should not show step counter when steps is empty', () => {
    component.steps = [];
    fixture.detectChanges();
    const counter = fixture.nativeElement.querySelector('.asms-modal-step-counter');
    expect(counter).toBeNull();
  });

  it('should show Next button when not last step and steps provided', () => {
    component.steps = TWO_STEPS;
    component.isLastStep = false;
    fixture.detectChanges();
    const nextBtn = fixture.nativeElement.querySelector('.asms-modal-next-btn');
    expect(nextBtn).toBeTruthy();
  });

  it('should show Submit button when steps empty (simple dialog)', () => {
    component.steps = [];
    component.isLastStep = true;
    fixture.detectChanges();
    const submitBtn = fixture.nativeElement.querySelector('.asms-modal-submit-btn');
    expect(submitBtn).toBeTruthy();
  });

  it('should show Submit button on last step of wizard', () => {
    component.steps = TWO_STEPS;
    component.isLastStep = true;
    fixture.detectChanges();
    const submitBtn = fixture.nativeElement.querySelector('.asms-modal-submit-btn');
    expect(submitBtn).toBeTruthy();
  });

  it('should emit nexted when Next button clicked', () => {
    const spy = jest.spyOn(component.nexted, 'emit');
    component.steps = TWO_STEPS;
    component.isLastStep = false;
    component.canProceed = true;
    fixture.detectChanges();
    const nextBtn = fixture.nativeElement.querySelector('.asms-modal-next-btn');
    nextBtn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit submitted when Submit button clicked', () => {
    const spy = jest.spyOn(component.submitted, 'emit');
    component.steps = [];
    component.isLastStep = true;
    component.canProceed = true;
    fixture.detectChanges();
    const submitBtn = fixture.nativeElement.querySelector('.asms-modal-submit-btn');
    submitBtn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should disable Next button when canProceed is false', () => {
    component.steps = TWO_STEPS;
    component.isLastStep = false;
    component.canProceed = false;
    fixture.detectChanges();
    const nextBtn = fixture.nativeElement.querySelector('.asms-modal-next-btn');
    expect(nextBtn.disabled).toBe(true);
  });

  it('should show Back button when not first step and steps provided', () => {
    component.steps = TWO_STEPS;
    component.isFirstStep = false;
    component.isLastStep = false;
    component.currentStep = 1;
    fixture.detectChanges();
    const backBtn = fixture.nativeElement.querySelector('.asms-modal-back-btn');
    expect(backBtn).toBeTruthy();
  });

  it('should emit backed when Back button clicked', () => {
    const spy = jest.spyOn(component.backed, 'emit');
    component.steps = TWO_STEPS;
    component.isFirstStep = false;
    component.isLastStep = false;
    component.currentStep = 1;
    fixture.detectChanges();
    const backBtn = fixture.nativeElement.querySelector('.asms-modal-back-btn');
    backBtn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should mark step as done when index < currentStep', () => {
    component.steps = THREE_STEPS;
    component.currentStep = 2;
    fixture.detectChanges();
    const stepEls = fixture.nativeElement.querySelectorAll('.asms-modal-step--done');
    expect(stepEls.length).toBe(2);
  });

  it('should not show Back button on first step', () => {
    component.steps = TWO_STEPS;
    component.isFirstStep = true;
    component.currentStep = 0;
    fixture.detectChanges();
    const backBtn = fixture.nativeElement.querySelector('.asms-modal-back-btn');
    expect(backBtn).toBeNull();
  });
});
