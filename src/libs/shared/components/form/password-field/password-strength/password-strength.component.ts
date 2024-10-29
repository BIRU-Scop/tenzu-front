import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { PasswordSeverity } from "./_utils";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: "app-password-strength",
  standalone: true,
  imports: [TranslocoDirective],
  template: `@if (severity()) {
    <div
      class="flex flex-row items-center gap-x-2"
      [class]="severity()"
      aria-live="polite"
      *transloco="let t; prefix: 'component.password.password-strength'"
    >
      <div class="flex gap-x-2">
        <div class="bar-part one"></div>
        <div class="bar-part two"></div>
        <div class="bar-part three"></div>
      </div>
      @if (severity() !== "none") {
        <p class="mat-body-small">{{ t("security_level." + severity()) }}</p>
      }
    </div>
  }`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordStrengthComponent {
  severity = input<PasswordSeverity>();
}
