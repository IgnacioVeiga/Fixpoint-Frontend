import { Directive, ElementRef, HostListener, inject } from '@angular/core';

const NAVIGABLE_FIELDS_SELECTOR = [
  'input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button[type="submit"]:not([disabled])'
].join(', ');

@Directive({
  selector: 'form[appEnterMovesFocus]',
  standalone: true
})
export class EnterMovesFocusDirective {
  private readonly host = inject<ElementRef<HTMLFormElement>>(ElementRef);

  @HostListener('keydown.enter', ['$event'])
  onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (
      keyboardEvent.defaultPrevented ||
      keyboardEvent.isComposing ||
      keyboardEvent.altKey ||
      keyboardEvent.ctrlKey ||
      keyboardEvent.metaKey ||
      keyboardEvent.shiftKey
    ) {
      return;
    }

    const target = keyboardEvent.target;
    if (!(target instanceof HTMLElement) || target instanceof HTMLTextAreaElement || this.isSubmitControl(target)) {
      return;
    }

    const controls = this.resolveNavigableControls();
    const currentIndex = controls.findIndex((control) => control === target);
    const nextControl = currentIndex >= 0 ? controls[currentIndex + 1] : null;

    if (!nextControl) {
      return;
    }

    keyboardEvent.preventDefault();
    nextControl.focus();
    this.selectIfNeeded(nextControl);
  }

  private resolveNavigableControls(): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(NAVIGABLE_FIELDS_SELECTOR)).filter(
      (control) =>
        !control.hasAttribute('readonly') &&
        !control.matches('[tabindex="-1"]') &&
        !control.matches('[hidden]') &&
        this.isVisible(control)
    );
  }

  private isVisible(control: HTMLElement): boolean {
    return control.offsetParent !== null || getComputedStyle(control).position === 'fixed';
  }

  private isSubmitControl(control: HTMLElement): boolean {
    return (
      control instanceof HTMLButtonElement ||
      (control instanceof HTMLInputElement && ['submit', 'button', 'reset'].includes(control.type))
    );
  }

  private selectIfNeeded(control: HTMLElement): void {
    if (!(control instanceof HTMLInputElement)) {
      return;
    }

    if (['date', 'datetime-local', 'month', 'time', 'week', 'color'].includes(control.type)) {
      return;
    }

    control.select();
  }
}
