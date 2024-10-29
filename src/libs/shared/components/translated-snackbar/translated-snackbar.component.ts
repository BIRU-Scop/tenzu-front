import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { MAT_SNACK_BAR_DATA } from "@angular/material/snack-bar";

@Component({
  selector: "app-translated-snackbar",
  standalone: true,
  imports: [TranslocoDirective],
  template: `
    <span *transloco="let t">
      {{ t(data.message, { var: data.var }) }}
    </span>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranslatedSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { message: string; var: string }) {}
}
