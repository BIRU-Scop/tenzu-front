import "@analogjs/vitest-angular/setup-zone";

import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";
import { getTestBed, TestBed } from "@angular/core/testing";
import { httpTestingProviders } from "./libs/utils/testing/testings-providers";
import { provideNoopAnimations } from "@angular/platform-browser/animations";

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

beforeEach(() =>
  TestBed.configureTestingModule({
    providers: [...httpTestingProviders, provideNoopAnimations()],
  }),
);
