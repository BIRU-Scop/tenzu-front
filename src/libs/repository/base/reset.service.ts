/*
 * Copyright (C) 2025-2026 BIRU
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

import { ErrorHandler, inject, Service } from "@angular/core";
import { debug } from "@tenzu/utils/functions/logging";

export interface CanReset {
  resetAll(): void;
  beforeReset?(): void;
  hasResidualState?(): boolean;
}

@Service()
export class ResetService {
  private readonly registeredServices = new Set<CanReset>();
  private readonly errorHandler = inject(ErrorHandler);

  register(service: CanReset) {
    this.registeredServices.add(service);
  }

  reset() {
    this.registeredServices.forEach((service) => {
      service.beforeReset?.();
    });
    this.registeredServices.forEach((service) => {
      service.resetAll();
    });
    this.reportResidualState();
  }

  private reportResidualState() {
    const leakingCount = [...this.registeredServices].filter((service) => service.hasResidualState?.() === true).length;
    if (leakingCount === 0) {
      return;
    }
    const error = new Error(`Session state survived the reset in ${leakingCount} registered service(s)`);
    debug("reset", error.message, undefined, true);
    this.errorHandler.handleError(error);
  }
}
