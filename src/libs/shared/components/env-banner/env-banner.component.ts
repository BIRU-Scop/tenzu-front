import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { ConfigAppService } from "../../../../app/config-app/config-app.service";

@Component({
  selector: "app-env-banner",
  imports: [TranslocoDirective],
  template: `
    @let env = configAppService.config().env;
    @if (env !== "production") {
      <div class="flex items-center" [class]="env" *transloco="let t">
        <p class="w-full text-sm text-wrap text-center p-3">
          {{ t("environment." + env) }}
        </p>
      </div>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnvBannerComponent {
  configAppService = inject(ConfigAppService);
}
