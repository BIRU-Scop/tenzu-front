import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AvatarComponent } from "./avatar.component";

describe("AvatarComponent", () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("input Norma Fisher -> ouput N F", () => {
    fixture.componentRef.setInput("name", "Norma Fisher");
    expect(component.initials()).toEqual("NF");
  });

  it("input / Norma Fisher -> ouput / N", () => {
    fixture.componentRef.setInput("name", "/ Norma Fisher");
    expect(component.initials()).toEqual("/N");
  });

  it("input Norma ? Fisher -> ouput N ?", () => {
    fixture.componentRef.setInput("name", "Norma ? Fisher");
    expect(component.initials()).toEqual("N?");
  });

  it(" input Norma 🤖 Fisher -> ouput N", () => {
    fixture.componentRef.setInput("name", "Norma 🤖 Fisher");
    expect(component.initials()).toEqual("N");
  });

  it(" input 🤖 Norma Fisher -> ouput 🤖", () => {
    fixture.componentRef.setInput("name", "🤖 Norma Fisher");
    expect(component.initials()).toEqual("🤖");
  });
});
