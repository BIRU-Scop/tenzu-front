import { filter, Observable, OperatorFunction } from "rxjs";

export const filterNotNull =
  <T>(): OperatorFunction<T, Exclude<T, null | undefined>> =>
  (source$) =>
    source$.pipe(filter((value) => value != null)) as Observable<Exclude<T, null | undefined>>;
