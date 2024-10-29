// #TODO (pguichon): Fix story as it is breaking storybook
// import { applicationConfig, Meta, StoryObj } from "@storybook/angular";
// import { provideAnimations } from "@angular/platform-browser/animations";
// import { Component, isDevMode } from "@angular/core";
// import { provideHttpClient } from "@angular/common/http";
// import { provideTransloco } from "@jsverse/transloco";
// import { TranslocoHttpLoaderService } from "@tenzu/utils/services";
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
//             availableLangs: ["en-US"],
//             defaultLang: "en-US",
//             fallbackLang: "en-US",
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
