/*
 * Copyright (C) 2025 BIRU
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

type Primitive = string | number | boolean | null | undefined;

// Use an interface instead of a type to enable for recursion
export interface JsonObject {
  [key: string]: JsonValue | undefined;
}

type JsonArray = Array<JsonValue>;

type JsonValue = Primitive | JsonObject | JsonArray;

export type MembershipRole = {
  name: string;
  slug: string;
  isAdmin: true;
  permissions: string[];
};
