import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { MatFormField, MatInput, MatLabel } from "@angular/material/input";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { injectNgControl } from "@tenzu/utils";
import { ReactiveFormsModule } from "@angular/forms";
import { TranslocoDirective } from "@jsverse/transloco";
import { NoopValueAccessorDirective } from "@tenzu/directives/noop-value-accessor-directive.directive";

export type DescriptionOptions = {
  autoSize: boolean;
  minRows: number;
  maxRows: number;
  resizeType: "none" | "both" | "horizontal" | "vertical" | "block" | "inline";
  descriptionMaxLength: number;
};

@Component({
  selector: "app-description-field",
  standalone: true,
  imports: [MatFormField, MatInput, ReactiveFormsModule, CdkTextareaAutosize, MatLabel, TranslocoDirective],
  hostDirectives: [NoopValueAccessorDirective],
  template: `
    <mat-form-field class="mat-form-field" *transloco="let t; prefix: 'component.description'">
      <mat-label>{{ t("label") }}</mat-label>
      <textarea
        [style.resize]="options().resizeType"
        matInput
        id="description"
        type="text"
        [maxlength]="options().descriptionMaxLength"
        [formControl]="ngControl.control"
        [cdkTextareaAutosize]="options().autoSize"
        [cdkAutosizeMinRows]="options().minRows"
        [cdkAutosizeMaxRows]="options().maxRows"
        [placeholder]="t('placeholder')"
      ></textarea>
    </mat-form-field>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionFieldComponent {
  ngControl = injectNgControl();
  defaultValue: DescriptionOptions = {
    autoSize: true,
    minRows: 5,
    resizeType: "none",
    descriptionMaxLength: 200,
    maxRows: 5,
  };
  options = input(this.defaultValue, {
    transform: (options: Partial<DescriptionOptions>) => this.validateOptions(options),
  });

  validateOptions(input: Partial<DescriptionOptions>) {
    const options = { ...this.defaultValue, ...input };
    if ((options.minRows || options.maxRows) && !options.autoSize) {
      throw Error("[DESCRIPTION][OPTION] You need to have autoSize option enabled for minRows or maxRows to work.");
    }
    if (options.autoSize) {
      if (options.minRows && options.maxRows) {
        if (options.minRows > options.maxRows) {
          throw Error("[DESCRIPTION][OPTION] Cannot have bigger maxRows than minRows");
        }
      }
    }
    return options;
  }
}
