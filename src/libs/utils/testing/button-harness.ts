/*
 * Copyright (C) 2024-2026 BIRU
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

import { HarnessLoader } from "@angular/cdk/testing";
import { MatButtonHarness } from "@angular/material/button/testing";

export function buttonFilterByAriaLabel(ariaLabel: string) {
  return MatButtonHarness.with({ selector: `[aria-label="${ariaLabel}"]` });
}

export function buttonFilterByText(label: string) {
  return MatButtonHarness.with({ text: new RegExp(`${label}$`) });
}

export async function getEnabledButtonNames(loader: HarnessLoader): Promise<string[]> {
  const buttons = await loader.getAllHarnesses(MatButtonHarness.with({ disabled: false }));
  return Promise.all(
    buttons.map(async (button) => {
      const host = await button.host();
      return (await host.getAttribute("aria-label")) ?? (await host.text({ exclude: "mat-icon" })).trim();
    }),
  );
}
