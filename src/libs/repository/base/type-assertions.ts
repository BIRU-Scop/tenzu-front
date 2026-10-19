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

/**
 * Compile-time tripwires for keeping related schemas structurally in sync
 * (e.g. an entity schema and its payload schema): declare an exported type
 *
 *   export type _XStaysInSyncWithY = AssertTrue<MutuallyAssignable<X, Y>>;
 *
 * and any field renamed/added/retyped on one side without the other breaks
 * the build on that line. Zero runtime cost.
 */

/** `true` when A and B are assignable to each other, `never` otherwise. */
export type MutuallyAssignable<A, B> = A extends B ? (B extends A ? true : never) : never;

/** Fails to compile unless `T` is exactly `true`; pairs with the type above. */
export type AssertTrue<T extends true> = T;
