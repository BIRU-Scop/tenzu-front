/*
 * Copyright (C) 2026 BIRU
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

import { MOCK_DOMAINS } from "./mock-handlers";

import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from "@ngrx/signals";
import { withStorageSync } from "@angular-architects/ngrx-toolkit";
import { debug } from "@tenzu/utils/functions/logging";
import { computed } from "@angular/core";

function buildInitialDomains(): Record<string, boolean> {
  return MOCK_DOMAINS.reduce(
    (acc, { name }) => {
      acc[name] = false;
      return acc;
    },
    {} as Record<string, boolean>,
  );
}

export const DomainMockStore = signalStore(
  { providedIn: "root" },
  withState(() => ({
    domains: buildInitialDomains(),
    global: false,
  })),
  withStorageSync("domainMock"),
  withComputed((store) => {
    const domaineNames = computed(() => Object.keys(store.domains()));

    const domainMock = computed(() => {
      return domaineNames().map((name) => {
        const domainEnabled = store.domains()[name];
        const enabled = domainEnabled || store.global();
        let source = "default";
        if (store.global()) {
          source = "global";
        } else if (domainEnabled) {
          source = "domain";
        }
        return { name, enabled, source };
      });
    });
    const anyDomainMocked = computed(() => domainMock().some((domaine) => domaine.enabled));
    return {
      domaineNames,
      anyDomainMocked,
      domainMock,
    };
  }),
  withMethods((store) => ({
    enableDomainMock(name: string, enabled: boolean) {
      if (!/^[a-z0-9-]+$/.test(name)) {
        debug("MOCK", `malformed domain name: "${name}"`);
        return;
      }
      if (!(name in store.domains())) {
        debug("MOCK", `unknown domain: "${name}"`);
        return;
      }
      patchState(store, {
        domains: {
          ...store.domains(),
          [name]: enabled,
        },
      });
    },
    enableGlobal(value: boolean) {
      patchState(store, {
        global: value,
      });
    },
    reset() {
      patchState(store, {
        domains: buildInitialDomains(),
        global: false,
      });
      store.clearStorage();
    },
    isDomainMocked(name: string) {
      return store.domains()[name] || store.global();
    },
    logMockState(): void {
      for (const domain of store.domainMock()) {
        debug("MOCK", `${domain.name} : mock ${domain.enabled ? "on" : "off"}`);
      }
      debug("MOCK", "global - ?mock=on | ?mock=off | ?mock=reset");
    },
  })),
  withHooks({
    onInit(store) {
      const mockParam = new URLSearchParams(location.search).get("mock");
      if (!mockParam) {
        return;
      }
      for (const token of mockParam.split(",")) {
        if (token === "reset") {
          store.reset();
          return;
        }
        if (token.includes(":")) {
          const [domainName, value] = token.split(":");
          store.enableDomainMock(domainName, value === "on");
        } else {
          store.enableGlobal(token === "on");
        }
      }
    },
  }),
);
