import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { v4 } from "uuid";

export const CORRELATION_ID = v4();

@Injectable({
  providedIn: "root",
})
export class ConfigServiceService {
  readonly correlationId = CORRELATION_ID;
  environment = environment;
}
