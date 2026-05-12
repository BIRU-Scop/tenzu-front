/*
 * Copyright (C) 2024-2026 BIRU
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

import { applicationConfig, Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogConfig,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatFormField, MatLabel, MatError, MatHint } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatSelect } from "@angular/material/select";
import { MatOption } from "@angular/material/core";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { ButtonAddComponent } from "@tenzu/shared/components/ui/button/button-add.component";
import {
  FormFooterComponent,
  FormFooterSecondaryActionDirective,
} from "@tenzu/shared/components/ui/form-footer/form-footer.component";
import { withTransloco } from "../storybook-providers";
import { matDialogConfig } from "@tenzu/utils/mat-config";

const description =
  "A dialog is a type of modal window that appears in front of an app content to provide critical information, or ask for a decision.";

// ─────────────── Dialog content components ───────────────

@Component({
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatInput,
    FormFooterComponent,
    ButtonAddComponent,
  ],
  template: `
    <mat-dialog-content>
      <mat-form-field subscriptSizing="dynamic" class="w-full">
        <mat-label>Label Text</mat-label>
        <input matInput />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <app-form-footer>
        <app-button-add translocoKey="Create" [level]="'primary'" mat-dialog-close />
      </app-form-footer>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DialogCreationComponent {}

@Component({
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ButtonComponent,
    ButtonAddComponent,
    FormFooterComponent,
    FormFooterSecondaryActionDirective,
  ],
  template: `
    <mat-dialog-content>
      <p class="mat-body-medium">{{ description }}</p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <app-form-footer>
        <app-button
          appFormFooterSecondaryAction
          [level]="'secondary'"
          translocoKey="Secondary Button"
          mat-dialog-close
        />
        <app-button-add [level]="'primary'" translocoKey="Primary Button" mat-dialog-close />
      </app-form-footer>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DialogMessageComponent {
  readonly description = description;
}

@Component({
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ButtonComponent,
    ButtonAddComponent,
    FormFooterComponent,
    FormFooterSecondaryActionDirective,
  ],
  template: `
    <h2 mat-dialog-title>Headline</h2>
    <mat-dialog-content>
      <p class="mat-body-medium">{{ description }}</p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <app-form-footer>
        <app-button
          appFormFooterSecondaryAction
          [level]="'secondary'"
          translocoKey="Secondary Button"
          mat-dialog-close
        />
        <app-button-add [level]="'primary'" translocoKey="Primary Button" mat-dialog-close />
      </app-form-footer>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DialogHeadlineBodyComponent {
  readonly description = description;
}

@Component({
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatSelect,
    MatOption,
    ButtonComponent,
    ButtonAddComponent,
    FormFooterComponent,
    FormFooterSecondaryActionDirective,
  ],
  template: `
    <h2 mat-dialog-title>Headline</h2>
    <mat-dialog-content>
      <div class="flex flex-col gap-4">
        <mat-form-field subscriptSizing="dynamic">
          <mat-select placeholder="Item 1">
            <mat-option value="1">Item 1</mat-option>
            <mat-option value="2">Item 2</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field subscriptSizing="dynamic">
          <mat-select placeholder="Item 1">
            <mat-option value="1">Item 1</mat-option>
            <mat-option value="2">Item 2</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <app-form-footer>
        <app-button
          appFormFooterSecondaryAction
          [level]="'secondary'"
          translocoKey="Secondary Button"
          mat-dialog-close
        />
        <app-button-add [level]="'primary'" translocoKey="Primary Button" mat-dialog-close />
      </app-form-footer>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DialogSelectsComponent {}

@Component({
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatSelect,
    MatOption,
    ButtonComponent,
    ButtonAddComponent,
    FormFooterComponent,
    FormFooterSecondaryActionDirective,
  ],
  template: `
    <h2 mat-dialog-title>Headline</h2>
    <mat-dialog-content>
      <p class="mat-body-medium">{{ description }}</p>
      <div class="flex flex-col gap-4 mt-4">
        <mat-form-field subscriptSizing="dynamic">
          <mat-select placeholder="Item 1">
            <mat-option value="1">Item 1</mat-option>
            <mat-option value="2">Item 2</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field subscriptSizing="dynamic">
          <mat-select placeholder="Item 1">
            <mat-option value="1">Item 1</mat-option>
            <mat-option value="2">Item 2</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <app-form-footer>
        <app-button
          appFormFooterSecondaryAction
          [level]="'secondary'"
          translocoKey="Secondary Button"
          mat-dialog-close
        />
        <app-button-add [level]="'primary'" translocoKey="Primary Button" mat-dialog-close />
      </app-form-footer>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DialogBodySelectsComponent {
  readonly description = description;
}

@Component({
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatIconButton,
    ButtonComponent,
    ButtonAddComponent,
    FormFooterComponent,
    FormFooterSecondaryActionDirective,
  ],
  template: `
    <h2 mat-dialog-title>Headline</h2>
    <mat-dialog-content>
      <p class="mat-body-medium">{{ description }}</p>
      <div class="flex flex-row gap-2 items-start mt-4">
        <mat-form-field subscriptSizing="dynamic" class="grow">
          <mat-icon matPrefix>person_add</mat-icon>
          <mat-label>Label Text</mat-label>
          <input matInput value="Eli" />
          <button mat-icon-button matSuffix type="button" aria-label="Clear">
            <mat-icon>cancel</mat-icon>
          </button>
        </mat-form-field>
        <app-button [level]="'tertiary'" translocoKey="Tertiary Button" />
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <app-form-footer>
        <app-button
          appFormFooterSecondaryAction
          [level]="'secondary'"
          translocoKey="Secondary Button"
          mat-dialog-close
        />
        <app-button-add [level]="'primary'" translocoKey="Primary Button" mat-dialog-close />
      </app-form-footer>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DialogInlinePickerComponent {
  readonly description = description;
}

@Component({
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatInput,
    MatSelect,
    MatOption,
    MatIcon,
    MatIconButton,
    ReactiveFormsModule,
    ButtonComponent,
    ButtonAddComponent,
    FormFooterComponent,
    FormFooterSecondaryActionDirective,
  ],
  template: `
    <h2 mat-dialog-title>Headline</h2>
    <mat-dialog-content>
      <p class="mat-body-medium">{{ description }}</p>
      <div class="flex flex-row gap-2 items-start mt-4">
        <mat-form-field subscriptSizing="dynamic" class="grow">
          <mat-icon matPrefix>person_add</mat-icon>
          <mat-label>Label Text</mat-label>
          <input matInput value="Eli" />
          <button mat-icon-button matSuffix type="button" aria-label="Clear">
            <mat-icon>cancel</mat-icon>
          </button>
        </mat-form-field>
        <app-button [level]="'tertiary'" translocoKey="Tertiary Button" />
      </div>
      <div class="flex flex-row gap-2 items-start mt-4">
        <mat-form-field subscriptSizing="dynamic" class="grow">
          <mat-label>Label Text</mat-label>
          <input matInput [formControl]="invalidControl" />
          <mat-icon matSuffix class="text-error">error</mat-icon>
          <mat-hint>Supporting Text</mat-hint>
          <mat-error>This field is required</mat-error>
        </mat-form-field>
        <mat-form-field subscriptSizing="dynamic">
          <mat-select placeholder="Item 1">
            <mat-option value="1">Item 1</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-icon-button type="button" aria-label="Remove" class="mt-2">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <app-form-footer>
        <app-button
          appFormFooterSecondaryAction
          [level]="'secondary'"
          translocoKey="Secondary Button"
          mat-dialog-close
        />
        <app-button-add [level]="'primary'" translocoKey="Primary Button" mat-dialog-close />
      </app-form-footer>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DialogErrorComponent implements OnInit {
  readonly description = description;
  readonly invalidControl = new FormControl("", [Validators.required]);

  ngOnInit() {
    this.invalidControl.markAsTouched();
  }
}

// ─────────────── Story wrapper ───────────────

@Component({
  selector: "app-dialog-storybook",
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="flex flex-col gap-4 max-w-md">
      <h1>Click a button to open the corresponding mat-dialog</h1>
      @for (variant of variants; track variant.label) {
        <app-button [level]="'tertiary'" [translocoKey]="variant.label" (click)="open(variant)" />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StoryDialogStorybookComponent {
  private readonly dialog = inject(MatDialog);

  readonly variants = [
    { label: "Creation dialog (input + Cancel/Create)", component: DialogCreationComponent, config: {} },
    {
      label: "Message dialog (body + Secondary/Primary)",
      component: DialogMessageComponent,
      config: { maxWidth: 560 },
    },
    { label: "Headline + body (no inputs)", component: DialogHeadlineBodyComponent, config: { maxWidth: 560 } },
    { label: "Headline + selects", component: DialogSelectsComponent, config: { maxWidth: 560 } },
    { label: "Headline + body + selects", component: DialogBodySelectsComponent, config: { maxWidth: 560 } },
    { label: "Headline + body + inline picker", component: DialogInlinePickerComponent, config: { maxWidth: 560 } },
    { label: "Inline picker with error state", component: DialogErrorComponent, config: { maxWidth: 560 } },
  ];

  open(variant: { component: unknown; config: MatDialogConfig }) {
    this.dialog.open(variant.component as never, {
      ...matDialogConfig,
      ...variant.config,
    });
  }
}

type Story = StoryObj<StoryDialogStorybookComponent>;

const meta: Meta<StoryDialogStorybookComponent> = {
  component: StoryDialogStorybookComponent,
  title: "Components/Dialog",
  decorators: [
    withTransloco,
    moduleMetadata({}),
    applicationConfig({
      providers: [],
    }),
  ],
};

export default meta;

export const Compositions: Story = {
  render: (args) => ({
    props: args,
    template: `<app-dialog-storybook />`,
  }),
};
