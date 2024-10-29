import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DescriptionFieldComponent } from "@tenzu/shared";

describe("DescriptionFieldComponent", () => {
  let component: DescriptionFieldComponent;
  let fixture: ComponentFixture<DescriptionFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescriptionFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DescriptionFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
