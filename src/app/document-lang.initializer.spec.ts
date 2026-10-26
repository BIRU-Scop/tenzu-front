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

import { beforeEach, describe, expect, it } from "vitest";
import { TestBed } from "@angular/core/testing";
import { TranslocoService } from "@jsverse/transloco";

import { provideDocumentLang } from "./document-lang.initializer";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

describe("provideDocumentLang", () => {
  beforeEach(() => {
    document.documentElement.lang = "";
    TestBed.configureTestingModule({ providers: [testingProviders, provideDocumentLang()] });
  });

  it("provideDocumentLang sets document.documentElement.lang to the active lang", () => {
    TestBed.inject(TranslocoService);

    expect(document.documentElement.lang).toBe("en");
  });

  it("provideDocumentLang sets document.documentElement.lang to the new lang when the active lang changes", () => {
    const translocoService = TestBed.inject(TranslocoService);

    translocoService.setActiveLang("fr");

    expect(document.documentElement.lang).toBe("fr");
  });
});
