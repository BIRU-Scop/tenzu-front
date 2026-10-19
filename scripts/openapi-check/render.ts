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

import { SchemaResult } from "./types";

const USE_COLOR = !process.env["NO_COLOR"] && process.stdout.isTTY;
const code = (code: string) => (s: string) => (USE_COLOR ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = code("32");
const red = code("31");
const yellow = code("33");
const dimmed = code("2");
const bold = code("1");

const OK = USE_COLOR ? "✓ PASS" : "PASS";
const KO = USE_COLOR ? "✗ FAIL" : "FAIL";

export type Rendered = {
  schemaName: string;
  componentName: string;
  file: string;
  result: SchemaResult;
  numberUntyped: number;
};

export function progress(step: string): void {
  process.stderr.write(dimmed(`→ ${step}\n`));
}

export function renderReport(rendered: Rendered[], unmatched: string[], options: { verbose?: boolean } = {}): void {
  const out = (line = "") => process.stdout.write(line + "\n");

  let highTotal = 0;
  let mediumTotal = 0;
  let driftCount = 0;
  let conformCount = 0;
  let unionCount = 0;
  let ignoredTotal = 0;

  for (const r of rendered) {
    ignoredTotal += r.numberUntyped;
    const where = dimmed(`(${r.file} › ${r.schemaName})`);
    if (r.result.kind === "conform") {
      conformCount++;
      if (options.verbose) {
        out(`${green(OK)} ${r.componentName}  ${where}`);
      }
    } else if (r.result.kind === "union") {
      unionCount++;
      if (options.verbose) {
        out(`${yellow("~ UNION")} ${r.componentName} — manual review  ${where}`);
      }
    } else if (r.result.kind === "error") {
      out(`${red(KO)} ${r.componentName} — tool error: ${r.result.error}  ${where}`);
      driftCount++;
    } else if (r.result.kind === "drift") {
      driftCount++;
      out(`${red(KO)} ${bold(r.componentName)}  ${where}`);
      for (const d of r.result.drifts) {
        if (d.severity === "HIGH") {
          highTotal++;
        } else {
          mediumTotal++;
        }
        const tag = d.severity === "HIGH" ? red("[HIGH]  ") : yellow("[MEDIUM]");
        out(`    ${tag} ${d.field} : ${d.message}`);
      }
    }
  }

  if (unmatched.length) {
    out();
    out(dimmed(`~ ${unmatched.length} unmatched schema(s) (no OpenAPI component) — they do not fail the check.`));
    if (options.verbose) out(dimmed(`  ${unmatched.join(", ")}`));
    else out(dimmed(`  (details with --verbose)`));
  }

  out();
  if (driftCount === 0) {
    out(green(`${OK}  No drift — ${conformCount} schema(s) compared, all conform.`));
  }
  out(
    bold("Summary: ") +
      `${rendered.length} compared · ${green(String(conformCount) + " conform")} · ` +
      `${driftCount ? red(String(driftCount) + " drifting") : "0 drifting"} ` +
      `(${highTotal} HIGH, ${mediumTotal} MEDIUM) · ` +
      `${unionCount} union(s) · ${unmatched.length} unmatched · ${ignoredTotal} untyped field(s) ignored`,
  );
}
