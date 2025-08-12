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

import { Rule, Tree } from "@angular-devkit/schematics";

export interface Options {
  path: string; // e.g., 'plugin-x'
}

type ConfigJson = {
  import?: string; // e.g., "import { provideX } from './x';"
  providePluginsTransloco?: string; // e.g., 'providerX'
  providePlugins?: string; // e.g., '...provideX()'
};

export function addPlugins(options: Options): Rule {
  return (tree: Tree) => {
    const featurePath = options.path
      ?.replace(/^\/?src\//, "")
      .replace(/^\//, "")
      .replace(/\/$/, "");
    if (!featurePath) {
      throw new Error('Option "path" is required.');
    }

    const configPath = `src/plugins/${featurePath}/config.json`;
    if (!tree.exists(configPath)) {
      throw new Error(`Config file not found at ${configPath}`);
    }

    const configRaw = (tree.read(configPath) || Buffer.from("")).toString("utf-8");
    /** @type {{ import?: string; providePluginsTransloco?: string; providePlugins?: string; }} */
    let config: ConfigJson;
    try {
      config = JSON.parse(configRaw);
    } catch (e) {
      throw new Error(`Invalid JSON in ${configPath}: ${(e as Error).message}`);
    }

    const targetPath = "src/app/providers-plugins.ts";
    if (!tree.exists(targetPath)) {
      throw new Error(`Target file not found: ${targetPath}`);
    }

    let content = tree.read(targetPath)!.toString("utf-8");

    // Insert import line from config.import if provided and not already present
    if (config.import && !content.includes(config.import)) {
      // Place after header comment if present, otherwise at top.
      const headerMatch = content.match(/\*\/[\r\n]+/); // end of block comment
      if (headerMatch?.index) {
        const idx = headerMatch.index + headerMatch[0].length;
        content = content.slice(0, idx) + config.import + "\n" + content.slice(idx);
      } else {
        content = config.import + "\n" + content;
      }
    }

    // Helper to append entry inside an arrow function returning an array: () => [ ... ]
    function addToArrayFunction(src: string, fnName: string, toAdd?: string): string {
      if (!toAdd) return src;

      const fnStart = src.indexOf(`export const ${fnName} = () =>`);
      if (fnStart === -1) {
        // If function doesn't exist, append a new one.
        const insertion = `\nexport const ${fnName} = () => [${toAdd}];\n`;
        return src + insertion;
      }
      const openBracket = src.indexOf("[", fnStart);
      const closeBracket = src.indexOf("]", openBracket + 1);
      if (openBracket === -1 || closeBracket === -1) {
        // Fallback: do nothing if the structure isn't as expected.
        return src;
      }

      const inside = src.slice(openBracket + 1, closeBracket).trim();
      if (inside.includes(toAdd)) return src; // idempotent

      const newInside = inside.length === 0 ? toAdd : `${inside.replace(/,\s*$/, "")}, ${toAdd}`;
      return src.slice(0, openBracket + 1) + newInside + src.slice(closeBracket);
    }

    content = addToArrayFunction(content, "providePluginsTransloco", config.providePluginsTransloco);
    content = addToArrayFunction(content, "providePlugins", config.providePlugins);

    // Cleanup potential stray tokens accidentally placed on their own lines (idempotency and recovery)
    function escapeRegExp(str: string) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    if (config.providePluginsTransloco) {
      const re = new RegExp(`\n\\s*${escapeRegExp(config.providePluginsTransloco)}\\s*`, "g");
      content = content.replace(re, "\n");
    }
    if (config.providePlugins) {
      const re2 = new RegExp(`\n\\s*${escapeRegExp(config.providePlugins)}\\s*`, "g");
      content = content.replace(re2, "\n");
    }

    tree.overwrite(targetPath, content);

    return tree;
  };
}
