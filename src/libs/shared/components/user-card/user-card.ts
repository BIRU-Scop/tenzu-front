import { ChangeDetectionStrategy, Component, computed, inject, input, SecurityContext } from "@angular/core";
import { AvatarComponent } from "../avatar/avatar.component";
import { TranslocoDirective } from "@jsverse/transloco";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-user-card",
  standalone: true,
  imports: [AvatarComponent, TranslocoDirective],
  template: ` <div class="flex flex-row gap-2 items-center" *transloco="let t; prefix: 'component.user_card'">
    <app-avatar [rounded]="true" [name]="fullName()" [color]="color()" />
    <div class="flex flex-col min-h-9 justify-center">
      @if (fullName()) {
        <div class="flex flex-row gap-1">
          <span class="mat-label-large text-neutral-20" [innerHtml]="highlightedFullName()"> </span>
          @if (isSelf()) {
            <span class="mat-label-large@:wq neutral-0"> ({{ t("your_user") }}) </span>
          }
        </div>
      }
      @if (username()) {
        <span
          [class]="fullName() ? 'mat-label-medium text-neutral-40' : 'mat-label-large neutral-20'"
          [innerHtml]="highlightedUsername()"
        >
        </span>
      }
    </div>
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  domSanitizer = inject(DomSanitizer);
  fullName = input("");
  username = input<string | null>("");
  textToHighlight = input("");
  color = input(0);
  isSelf = input(false);

  highlightedFullName = computed(() => this.highlightString(this.fullName()) || "");
  highlightedUsername = computed(() => this.highlightString(this.username()));

  private highlightString(text: string | null) {
    if (!this.textToHighlight() || !text) {
      return text;
    }
    const rgx = new RegExp(`^${this.textToHighlight().toLowerCase()}`, "g");
    const finalText: string[] = [];
    text.split(" ").forEach((part) => {
      if (part.toLowerCase().match(rgx)) {
        finalText.push(
          `<span class="font-bold text-neutral-0">${part.substring(
            0,
            this.textToHighlight().length,
          )}</span>${part.substring(this.textToHighlight().length, part.length)}`,
        );
      } else {
        finalText.push(part);
      }
    });
    return this.domSanitizer.sanitize(SecurityContext.HTML, finalText.join(" "));
  }
}
