import { defineConfig } from "vitest/config";

// tus-js-client has no `exports` map: Vitest resolves its `module` entry (Node build) while the
// Angular build follows its `browser` field. Alias the browser build so specs match the app.
export default defineConfig({
  resolve: {
    alias: {
      "tus-js-client": "tus-js-client/lib.esm/browser/index.js",
    },
  },
});
