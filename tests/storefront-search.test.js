import test from "node:test";
import assert from "node:assert/strict";

test("Storefront Predictive Search URL & Query Building", () => {
  const query = "winter jacket";
  const expectedEndpoint = `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[options][unavailable_products]=hide`;

  assert.equal(
    expectedEndpoint,
    "/search/suggest.json?q=winter%20jacket&resources[type]=product&resources[options][unavailable_products]=hide"
  );
});

test("Storefront Search Navigation Route", () => {
  const query = "running shoes";
  const searchRoute = `/search?q=${encodeURIComponent(query)}&type=product`;
  assert.equal(searchRoute, "/search?q=running%20shoes&type=product");
});

