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

import { Tree } from "@angular-devkit/schematics";

export function resetPlugins() {
  return (tree: Tree) => {
    const targetPath = "src/app/providers-plugins.ts";
    if (!tree.exists(targetPath)) {
      throw new Error(`Target file not found: ${targetPath}`);
    }

    const current = (tree.read(targetPath) || Buffer.from("")).toString("utf-8");

    // Capture a leading block comment (license header) if present
    const headerMatch = current.match(/^\/\*[\s\S]*?\*\/\s*/);
    const header = headerMatch ? headerMatch[0] : "";

    const body = [
      "export const providePluginsTransloco = () => [];",
      "export const providePlugins = () => [];",
      "",
    ].join("\n");

    const nextContent = `${header}${body}`;

    tree.overwrite(targetPath, nextContent);
    return tree;
  };
}
