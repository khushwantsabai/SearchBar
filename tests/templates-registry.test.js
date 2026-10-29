import test from "node:test";
import assert from "node:assert/strict";
import { TEMPLATES, PLANS, getTemplateById } from "../app/constants/templates.ts";

test("Template Registry: 8 Unique Templates Specification", () => {
  assert.equal(TEMPLATES.length, 8, "Exactly 8 templates must be registered");

  const freeTemplates = TEMPLATES.filter((t) => t.tier === "FREE");
  const proTemplates = TEMPLATES.filter((t) => t.tier === "PRO");
  const advancedTemplates = TEMPLATES.filter((t) => t.tier === "ADVANCED");

  assert.equal(freeTemplates.length, 1, "Must have exactly 1 Free template");
  assert.equal(proTemplates.length, 3, "Must have exactly 3 Pro templates");
  assert.equal(advancedTemplates.length, 4, "Must have exactly 4 Advanced templates");

  // Verify unique numbers 1 through 8
  const numbers = TEMPLATES.map((t) => t.number).sort((a, b) => a - b);
  assert.deepEqual(numbers, [1, 2, 3, 4, 5, 6, 7, 8]);

  // Verify each template has required defaults
  TEMPLATES.forEach((tpl) => {
    assert.ok(tpl.id, `Template ${tpl.name} has ID`);
    assert.ok(tpl.name, `Template ${tpl.id} has name`);
    assert.ok(tpl.defaultSettings, `Template ${tpl.id} has defaultSettings`);
    assert.ok(tpl.defaultSettings.placeholder, `Template ${tpl.id} has placeholder`);
    assert.ok(tpl.features.length > 0, `Template ${tpl.id} has features`);
  });
});

test("Plan Configuration: Pricing and Limits", () => {
  assert.equal(PLANS.FREE.price, 0);
  assert.equal(PLANS.FREE.maxConfigurations, 1);
  assert.equal(PLANS.FREE.templatesAllowed.length, 1);

  assert.equal(PLANS.PRO.price, 4.99);
  assert.equal(PLANS.PRO.maxConfigurations, 5);
  assert.equal(PLANS.PRO.templatesAllowed.length, 4); // Free + 3 Pro

  assert.equal(PLANS.ADVANCED.price, 9.99);
  assert.equal(PLANS.ADVANCED.maxConfigurations, 20);
  assert.equal(PLANS.ADVANCED.templatesAllowed.length, 8); // All 8
});
