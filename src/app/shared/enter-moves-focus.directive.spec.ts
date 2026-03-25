import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnterMovesFocusDirective } from './enter-moves-focus.directive';

@Component({
  standalone: true,
  imports: [EnterMovesFocusDirective],
  template: `
    <form appEnterMovesFocus>
      <input id="first" />
      <input id="second" />
      <textarea id="notes"></textarea>
      <input id="final" />
      <button type="submit" id="submit-btn">Guardar</button>
    </form>
  `
})
class TestHostComponent {}

describe('EnterMovesFocusDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
  });

  afterEach(() => {
    fixture.nativeElement.remove();
  });

  it('moves focus to the next field when pressing Enter in an input', () => {
    const firstInput = fixture.nativeElement.querySelector('#first') as HTMLInputElement;
    const secondInput = fixture.nativeElement.querySelector('#second') as HTMLInputElement;
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });

    firstInput.focus();
    firstInput.dispatchEvent(event);

    expect(document.activeElement).toBe(secondInput);
  });

  it('moves focus to the submit button from the last single-line field', () => {
    const finalInput = fixture.nativeElement.querySelector('#final') as HTMLInputElement;
    const submitButton = fixture.nativeElement.querySelector('#submit-btn') as HTMLButtonElement;
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });

    finalInput.focus();
    finalInput.dispatchEvent(event);

    expect(document.activeElement).toBe(submitButton);
  });

  it('does not hijack Enter inside textareas', () => {
    const textarea = fixture.nativeElement.querySelector('#notes') as HTMLTextAreaElement;
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });

    textarea.focus();
    textarea.dispatchEvent(event);

    expect(document.activeElement).toBe(textarea);
  });
});
