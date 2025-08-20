/*
 * Copyright (C) 2024-2025 BIRU
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

import { computed, inject, Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigModel, ConfigSchemaService } from "./config.model";
import { environment } from "../../environments/environment";
import { EnvironmentConfig } from "../../environments/environment-type";
import { v4 } from "uuid";

export const CORRELATION_ID = v4();

@Injectable({
  providedIn: "root",
})
export class ConfigAppService {
  http = inject(HttpClient);
  configSchemaService = inject(ConfigSchemaService);
  config = signal({} as EnvironmentConfig & ConfigModel);
  configApi = computed(() => this.config().api);
  configLegal = computed(() => this.config().legal);
  apiUrl = computed(() => {
    return `${this.configApi().scheme}://${this.configApi().baseDomain}/${this.configApi().suffixDomain}/${this.configApi().prefix}`;
  });
  wsUrl = computed(() => this.config().wsUrl);
  readonly correlationId = CORRELATION_ID;

  async loadAppConfig() {
    return await fetch("/assets/configs/config.json")
      .then((res) => {
        return res.json();
      })
      .catch(() => {
        throw new Error("Could not load config");
      })
      .then((config) => {
        const schema = this.configSchemaService.schema().parse(config);
        this.config.set({
          ...environment,
          ...schema,
        });
        // TODO: change when microSentry lib accept useFactory
        localStorage.setItem("sentry", JSON.stringify(this.config().sentry));
      });
  }
}
