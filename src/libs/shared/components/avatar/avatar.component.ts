import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

@Component({
  selector: "app-avatar",
  standalone: true,
  template: `<div [class]="class()">
    <span>{{ initials() }}</span>
  </div> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  name = input("");
  rounded = input(false);
  size = input<"sm" | "md" | "lg" | "xl">("md");
  color = input<number>(0);
  class = computed(() => [
    "avatar",
    "flex",
    "items-center",
    "justify-center",
    "uppercase",
    `color-${this.color()}`,
    `avatar-${this.size()}`,
    this.rounded() ? "rounded-full" : "rounded",
  ]);

  initials = computed(() => {
    const chunks = this.name().split(" ").slice(0, 2);
    const tempName: string[] = [];
    let firstIsEmoji = false;
    chunks.forEach((chunk, i) => {
      if (this.isItAnEmoji(chunk) && i === 0) {
        tempName.push(chunk);
        firstIsEmoji = true;
      } else if (!this.isItAnEmoji(chunk) && !firstIsEmoji) {
        tempName.push(chunk[0]);
      }
    });
    return tempName.join("");
  });

  private isItAnEmoji(chunk: string) {
    const regexExp =
      /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
    return regexExp.test(chunk);
  }
}
