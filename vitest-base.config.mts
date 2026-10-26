import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// tus-js-client: no `exports` map, Vitest would take the Node build instead of the browser one.
// lib0/webcrypto: its `exports` prefers `node`, whose `node:crypto` is empty in the test browser.
export default defineConfig({
  resolve: {
    alias: [
      {
        find: "tus-js-client",
        replacement: "tus-js-client/lib.esm/browser/index.js",
      },
      {
        find: /^lib0\/webcrypto$/,
        replacement: fileURLToPath(
          new URL("./node_modules/lib0/src/webcrypto.js", import.meta.url),
        ),
      },
    ],
  },
});
