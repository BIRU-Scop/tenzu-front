/*
 * Copyright (C) 2024-2026 BIRU
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

// #TODO (pguichon): Fix story as it is breaking storybook
// import { applicationConfig, Meta, StoryObj } from "@storybook/angular";
// import { provideAnimations } from "@angular/platform-browser/animations";
// import { Component, isDevMode } from "@angular/core";
// import { provideHttpClient } from "@angular/common/http";
// import { provideTransloco } from "@jsverse/transloco";
// import { TranslocoHttpLoaderService } from "@tenzu/utils/services/transloco-http-loader/transloco-http-loader.service";
// import { BreadcrumbComponent } from "./breadcrumb.component";
// import { provideRouter } from "@angular/router";
//
// @Component({
//   selector: "app-routing-component-test",
//   template: ``,
//   standalone: true,
// })
// class RoutingTestComponent {}
//
// type Story = StoryObj<BreadcrumbComponent>;
//
// const args = {
//   Workspaces: [{ link: "", label: "Workspace" }],
//   Workspace: [
//     { link: "", label: "Workspace" },
//     { link: "", label: "Mon Workspace" },
//   ],
//   Project: [
//     { link: "", label: "Workspace" },
//     { link: "", label: "Mon Workspace" },
//     { link: "", label: "My project" },
//   ],
// };
//
// const meta: Meta<BreadcrumbComponent> = {
//   title: "Components/Breadcrumb",
//   component: BreadcrumbComponent,
//   argTypes: {
//     breadCrumbs: {
//       options: Object.keys(args),
//       control: "select",
//       mapping: args,
//       description: "A array of BreadCrumbConfig",
//     },
//   },
//   args: {},
//   decorators: [
//     applicationConfig({
//       providers: [
//         provideRouter([
//           {
//             path: "**",
//             component: RoutingTestComponent,
//           },
//         ]),
//         provideHttpClient(),
//         provideAnimations(),
//         provideTransloco({
//           config: {
//             reRenderOnLangChange: true,
//             prodMode: !isDevMode(),
//             availableLangs: ["en-us"],
//             defaultLang: "en-us",
//             fallbackLang: "en-us",
//             flatten: {
//               aot: !isDevMode(),
//             },
//           },
//           loader: TranslocoHttpLoaderService,
//         }),
//       ],
//     }),
//   ],
// };
//
// export const BreadcrumbStories: Story = {
//   args: {
//     breadCrumbs: args.Workspace,
//   },
// };
//
// export default meta;
