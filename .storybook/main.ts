import type { StorybookConfig } from "@storybook/angular-vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const tenzuPathAliases = [
  ["@tenzu/shared/components/", "src/libs/shared/components/"],
  ["@tenzu/shared/layouts/", "src/libs/shared/layouts/"],
  ["@tenzu/directives/", "src/libs/shared/directives/"],
  ["@tenzu/pipes/", "src/libs/shared/pipes/"],
  ["@tenzu/repository/", "src/libs/repository/"],
  ["@tenzu/utils/services/", "src/libs/utils/services/"],
  ["@tenzu/utils/", "src/libs/utils/"],
  ["@tenzu/plugins/", "src/plugins/"],
].map(([find, target]) => ({
  find,
  replacement: resolve(projectRoot, target) + "/",
}));

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: {
    name: "@storybook/angular-vite",
    options: {
      compodoc: false,
    },
  },
  async viteFinal(config) {
    const { mergeConfig } = await import("vite");
    const { default: tailwindcss } = await import("tailwindcss");
    const { default: autoprefixer } = await import("autoprefixer");
    return mergeConfig(config, {
      resolve: {
        alias: tenzuPathAliases,
      },
      css: {
        postcss: {
          plugins: [tailwindcss(), autoprefixer()],
        },
      },
    });
  },

  staticDirs: ["../public", { from: "../src/assets", to: "/assets" }],
};
export default config;
