import { TestBed } from "@angular/core/testing";

import { TranslocoHttpLoaderService } from "./transloco-http-loader.service";

describe("TranslocoHttpLoaderService", () => {
  let service: TranslocoHttpLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslocoHttpLoaderService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
