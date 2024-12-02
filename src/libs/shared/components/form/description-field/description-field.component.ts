/*
 * Copyright (C) 2024 BIRU
 *
 * This file is part of Tenzu.
 *
 * Tenzu is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * You can contact BIRU at ask@biru.sh
 *
 */

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { MatFormField, MatInput, MatLabel } from "@angular/material/input";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { ReactiveFormsModule } from "@angular/forms";
import { TranslocoDirective } from "@jsverse/transloco";
import { NoopValueAccessorDirective } from "@tenzu/directives/noop-value-accessor-directive.directive";
import { injectNgControl } from "@tenzu/utils/injectors";

export type DescriptionOptions = {
  autoSize: boolean;
  minRows: number;
  maxRows: number;
  resizeType: "none" | "both" | "horizontal" | "vertical" | "block" | "inline";
  descriptionMaxLength: number;
};

@Component({
  selector: "app-description-field",
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
