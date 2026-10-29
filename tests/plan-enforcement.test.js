import test from "node:test";
import assert from "node:assert/strict";
import { validateSettingsForPlan } from "../app/utils/plan-enforcer.server.ts";
import { TEMPLATES, PLANS, isTemplateAllowed } from "../app/constants/templates.ts";

test("Free Plan: Allowed templates and restrictions", () => {
  // 1. Template allowance
  assert.equal(isTemplateAllowed("FREE", "classic-search"), true);
  assert.equal(isTemplateAllowed("FREE", "modern-rounded"), false);
  assert.equal(isTemplateAllowed("FREE", "banner-search"), false);

  // 2. Reject non-free templates
  const resModern = validateSettingsForPlan("FREE", "modern-rounded", {});
  assert.equal(resModern.valid, false);
  assert.match(resModern.error, /requires the PRO plan/);

  // 3. Valid default settings for classic-search
  const resValid = validateSettingsForPlan("FREE", "classic-search", {
    placeholder: "Search shop...",
  });
  assert.equal(resValid.valid, true);
  assert.equal(resValid.sanitizedSettings.placeholder, "Search shop...");

  // 4. Reject color customization on Free plan
  const resColor = validateSettingsForPlan("FREE", "classic-search", {
    backgroundColor: "#ff0000",
  });
  assert.equal(resColor.valid, false);
  assert.match(resColor.error, /Custom color controls require a Pro or Advanced/);

  // 5. Reject image integration on Free plan
  const resImage = validateSettingsForPlan("FREE", "classic-search", {
    imageUrl: "https://example.com/logo.png",
  });
  assert.equal(resImage.valid, false);
  assert.match(resImage.error, /Image integration is an Advanced/);
});

test("Pro Plan: Allowed templates and feature boundaries", () => {
  // 1. Allowed templates (Free + 3 Pro)
  assert.equal(isTemplateAllowed("PRO", "classic-search"), true);
  assert.equal(isTemplateAllowed("PRO", "modern-rounded"), true);
  assert.equal(isTemplateAllowed("PRO", "minimal-outline"), true);
  assert.equal(isTemplateAllowed("PRO", "bold-search-button"), true);
  assert.equal(isTemplateAllowed("PRO", "banner-search"), false);
  assert.equal(isTemplateAllowed("PRO", "image-accent-search"), false);

  // 2. Allows color customization
  const resColors = validateSettingsForPlan("PRO", "modern-rounded", {
    backgroundColor: "#1e293b",
    textColor: "#ffffff",
    borderColor: "#3b82f6",
    borderRadius: 28,
  });
  assert.equal(resColors.valid, true);
  assert.equal(resColors.sanitizedSettings.backgroundColor, "#1e293b");
  assert.equal(resColors.sanitizedSettings.borderRadius, 28);

  // 3. Rejects Advanced images on Pro plan
  const resImage = validateSettingsForPlan("PRO", "modern-rounded", {
    imageUrl: "https://example.com/promo.png",
  });
  assert.equal(resImage.valid, false);
  assert.match(resImage.error, /only available on the Advanced plan/);
});

test("Advanced Plan: Unlocks all 8 templates and image capabilities", () => {
  // 1. All 8 templates allowed
  TEMPLATES.forEach((tpl) => {
    assert.equal(isTemplateAllowed("ADVANCED", tpl.id), true, `Template ${tpl.id} should be allowed`);
  });

  // 2. Banner search with custom overlay and image
  const resBanner = validateSettingsForPlan("ADVANCED", "banner-search", {
    imageUrl: "https://example.com/hero.jpg",
    bgOverlayColor: "rgba(0,0,0,0.6)",
    bgOverlayOpacity: 0.6,
    placeholder: "Find what you love...",
  });
  assert.equal(resBanner.valid, true);
  assert.equal(resBanner.sanitizedSettings.imageUrl, "https://example.com/hero.jpg");

  // 3. Image accent search
  const resAccent = validateSettingsForPlan("ADVANCED", "image-accent-search", {
    imageUrl: "https://example.com/brand.png",
    imagePlacement: "right",
    imageWidth: 48,
  });
  assert.equal(resAccent.valid, true);
  assert.equal(resAccent.sanitizedSettings.imagePlacement, "right");
});

test("Invalid template rejection", () => {
  const result = validateSettingsForPlan("ADVANCED", "non-existent-template", {});
  assert.equal(result.valid, false);
  assert.match(result.error, /Invalid template ID/);
});
