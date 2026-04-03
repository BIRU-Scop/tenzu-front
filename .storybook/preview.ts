import { applicationConfig, moduleMetadata, Preview } from "@storybook/angular";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { MatIconRegistryConfig } from "./mat-icon-registry-config";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    applicationConfig({
      providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: "outline" } }],
    }),
    moduleMetadata({
      imports: [MatIconRegistryConfig],
    }),
  ],
  tags: ["autodocs"],
};

export default preview;
