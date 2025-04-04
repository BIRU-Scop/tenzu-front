/*
 * Copyright (C) 2024 BIRU
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

import { EnvironmentConfig } from "./environment-type"; // Included with Angular CLI.
export const environment: EnvironmentConfig = {
  appVersion: "$RELEASE_VERSION",
  production: true,
  env: "staging",
  wsUrl: "wss://$BASE_DOMAIN/events/",
  api: {
    prefix: "v1",
    baseDomain: "$BASE_DOMAIN",
    suffixDomain: "api",
    scheme: "https",
  },
  sentry: {
    dsn: "$SENTRY_DSN",
    environment: "staging",
    release: "$RELEASE_VERSION",
  },
};
