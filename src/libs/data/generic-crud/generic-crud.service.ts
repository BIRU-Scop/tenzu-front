import { inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";

export const API_URL = `${environment.api.scheme}://${environment.api.baseDomain}/${environment.api.suffixDomain}/${environment.api.prefix}/`;

export type ListParams = Record<string, string | number | (string | number)[] | boolean | null>;
export const makeOptions = (params: ListParams) => {
  let options = new HttpParams();
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      if (Array.isArray(params[key])) {
        (params[key] as (string | number)[]).forEach((element) => {
          if (element !== null && element !== undefined) {
            options = options.append(key, element.toString());
          }
        });
      } else {
        if (params[key] !== undefined) {
          options = options.append(key, params[key]?.toString() || "null");
        }
      }
    }
  }
  return options;
};

export class GenericCrudService<Model, Filter> {
  http = inject(HttpClient);
  endPoint = "";
  url = API_URL;

  getUrl() {
    return `${this.url}${this.endPoint}`;
  }

  list(params: Filter = {} as Filter) {
    return this.http.get<Model[]>(this.getUrl(), {
      params: params ? makeOptions(params) : {},
    });
  }

  get(id: number | string) {
    return this.http.get<Model>(`${this.getUrl()}/${id}`);
  }

  create(item: Partial<Model>) {
    return this.http.post<Model>(`${this.getUrl()}`, item);
  }

  put(id: number, item: Model) {
    return this.http.put<Model>(`${this.getUrl()}/${id}`, item);
  }

  patch(id: string, item: Partial<Model>) {
    return this.http.patch<Model>(`${this.getUrl()}/${id}`, item);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.getUrl()}/${id}`);
  }
}
