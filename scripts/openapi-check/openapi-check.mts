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

import { fetchOpenApi } from "./fetch-openapi";
import { loadZodSchemas } from "./load-zod-schemas";
import { pairZodAndSerializer } from "./pair-zod-and-serializer";
import { normalize } from "./normalize";
import { diff } from "./diff";
import { EXIT_CODE, toExitCode } from "./report";
import { progress, renderReport, Rendered } from "./render";
import { JsonNode, NormalizedSchema, SchemaResult } from "./types";

const DEFAULT_URL = "https://local-tenzu.biru.ovh/api/v1/openapi.json";

function countUntypedObject(normalized: NormalizedSchema): number {
  if (normalized.kind !== "object") return 0;
  return Object.values(normalized.fields).filter(
    (field) => field.types.length === 0,
  ).length;
}

async function main(): Promise<number> {
  const args = new Set(process.argv.slice(2));
  const verbose = args.has("--verbose");
  const url = process.env["OPENAPI_URL"] ?? DEFAULT_URL;
  const rootDir = process.cwd();

  let componentsOpenApi: Record<string, JsonNode>;
  try {
    progress(`Fetch OpenAPI (${url})…`);
    componentsOpenApi = await fetchOpenApi(url);
  } catch (error) {
    process.stderr.write(
      `\x1b[31m✗ OpenAPI unreachable at ${url} — is the local backend running? \x1b[0m\n  ${(error as Error).message}\n`,
    );
    return EXIT_CODE["error"];
  }

  progress(`Loading zod schemas…`);
  const { zodSchemas, errors } = await loadZodSchemas(rootDir);

  progress(`Pairing…`);
  const componentNames = Object.keys(componentsOpenApi);
  const { zodSchemaAndSerializerPairs, unmatched } = pairZodAndSerializer(
    zodSchemas.map((s) => s.name),
    componentNames,
  );
  const zodSchemasByName = new Map(zodSchemas.map((s) => [s.name, s]));

  progress(`Comparison (${zodSchemaAndSerializerPairs.length} pairs)…`);
  const rendered: Rendered[] = [];
  const results: SchemaResult[] = [];

  for (const { zodSchemaName, componentName } of zodSchemaAndSerializerPairs) {
    const zodSchemaLoaded = zodSchemasByName.get(zodSchemaName)!;
    let result: SchemaResult;
    let numberUntyped = 0;
    try {
      const zodJson = zodSchemaLoaded.zodSchema.toJSONSchema({ io: "input" });
      const zodNormalized = normalize(zodJson as JsonNode);
      const openApiNormalized = normalize(componentsOpenApi[componentName]);
      numberUntyped = countUntypedObject(openApiNormalized);
      const comparison = diff(zodNormalized, openApiNormalized);
      if (comparison.status === "drift")
        result = {
          zodSchemaName: zodSchemaName,
          kind: "drift",
          drifts: comparison.drifts,
        };
      else if (comparison.status === "union") {
        result = { zodSchemaName: zodSchemaName, kind: "union" };
      } else {
        result = { zodSchemaName: zodSchemaName, kind: "conform" };
      }
    } catch (error) {
      result = {
        zodSchemaName: zodSchemaName,
        kind: "error",
        error: (error as Error).message,
      };
    }
    results.push(result);
    rendered.push({
      schemaName: zodSchemaName,
      componentName,
      file: zodSchemaLoaded.file,
      result,
      numberUntyped,
    });
  }

  for (const e of errors) {
    results.push({ zodSchemaName: e.file, kind: "error", error: e.error });
    rendered.push({
      schemaName: e.file,
      componentName: e.file,
      file: e.file,
      result: { zodSchemaName: e.file, kind: "error", error: e.error },
      numberUntyped: 0,
    });
  }

  renderReport(rendered, unmatched, { verbose });
  return EXIT_CODE[toExitCode(results)];
}

main().then(
  (code) => process.exit(code),
  (error) => {
    process.stderr.write(
      `\x1b[31m✗ Unexpected error: ${(error as Error).message}\x1b[0m\n`,
    );
    process.exit(EXIT_CODE["error"]);
  },
);
