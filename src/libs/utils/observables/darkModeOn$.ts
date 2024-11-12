import { fromEvent, startWith } from "rxjs";
import { map } from "rxjs/operators";

export const darkModeOn$ = fromEvent<MediaQueryList>(window.matchMedia("(prefers-color-scheme: dark)"), "change").pipe(
  startWith(window.matchMedia("(prefers-color-scheme: dark)")),
  map((list) => list.matches),
);