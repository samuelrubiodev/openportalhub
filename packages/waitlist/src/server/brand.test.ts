import { describe, expect, test } from "bun:test";
import { BRANDS, DEFAULT_BRAND_ID, resolveBrand } from "./brand";

describe("brand resolution (never fails the request)", () => {
  test("an X-Site header naming a known profile selects it", () => {
    expect(resolveBrand({ xSite: "eventimeline", defaultBrand: "openportalhub" })).toEqual({
      brand: BRANDS.eventimeline,
      via: "x-site",
    });
    expect(resolveBrand({ xSite: "openportalhub", defaultBrand: "eventimeline" }).brand).toEqual(BRANDS.openportalhub);
  });

  test("the X-Site match tolerates casing and surrounding whitespace", () => {
    expect(resolveBrand({ xSite: "  Eventimeline  ", defaultBrand: "openportalhub" }).brand).toEqual(BRANDS.eventimeline);
  });

  test("an unknown X-Site falls through to the host match and is reported", () => {
    const resolution = resolveBrand({
      xSite: "shop.example.org",
      host: "eventimeline.openportalhub.org:8787",
      defaultBrand: "openportalhub",
    });
    expect(resolution.brand).toEqual(BRANDS.eventimeline);
    expect(resolution.via).toBe("host");
    expect(resolution.unknownXSite).toBe("shop.example.org");
  });

  test("an unknown X-Site falls through to the default brand when no host matches", () => {
    const resolution = resolveBrand({
      xSite: "shop.example.org",
      host: "unknown.example.org",
      defaultBrand: "eventimeline",
    });
    expect(resolution.brand).toEqual(BRANDS.eventimeline);
    expect(resolution.via).toBe("default");
    expect(resolution.unknownXSite).toBe("shop.example.org");
  });

  test("a host match ignores the port and the case", () => {
    expect(resolveBrand({ host: "OPENPORTALHUB.ORG:8443", defaultBrand: "eventimeline" })).toEqual({
      brand: BRANDS.openportalhub,
      via: "host",
    });
    expect(resolveBrand({ host: "eventimeline.openportalhub.org", defaultBrand: "openportalhub" }).brand).toEqual(BRANDS.eventimeline);
  });

  test("the www variants select the profile too", () => {
    expect(resolveBrand({ host: "www.openportalhub.org", defaultBrand: "eventimeline" }).brand).toEqual(BRANDS.openportalhub);
    expect(resolveBrand({ host: "www.eventimeline.openportalhub.org:80", defaultBrand: "openportalhub" }).brand).toEqual(BRANDS.eventimeline);
  });

  test("without routing hints the default brand wins", () => {
    expect(resolveBrand({ defaultBrand: "eventimeline" })).toEqual({ brand: BRANDS.eventimeline, via: "default" });
    expect(resolveBrand({}).brand).toEqual(BRANDS[DEFAULT_BRAND_ID]);
  });

  test("missing or empty headers never throw and never fail the request", () => {
    expect(resolveBrand({ xSite: null, host: null, defaultBrand: "openportalhub" }).via).toBe("default");
    expect(resolveBrand({ xSite: "   ", host: "" }).via).toBe("default");
    expect(resolveBrand({ xSite: "", host: "openportalhub.org:8787" }).via).toBe("host");
  });
});
