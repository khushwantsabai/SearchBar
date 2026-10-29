/**
 * SearchBar Storefront Search Engine
 * Integrates directly with Shopify's native search routes and Predictive Search API.
 */

(function () {
  "use strict";

  function initSearchBar(container) {
    if (container.dataset.sbInitialized === "true") return;
    container.dataset.sbInitialized = "true";

    const form = container.querySelector(".sb-form");
    const input = container.querySelector(".sb-input");
    const dropdown = container.querySelector(".sb-predictive-dropdown");
    const resultsList = container.querySelector(".sb-results-list");
    const emptyState = container.querySelector(".sb-empty-state");
    const loadingState = container.querySelector(".sb-loading-state");
    const viewAllLink = container.querySelector(".sb-view-all");

    if (!input || !dropdown) return;

    let debounceTimer = null;
    let currentAbortController = null;
    let selectedIndex = -1;

    // Optional dynamic configuration hydration
    const shopDomain = container.dataset.shopDomain;
    const appUrl = container.dataset.appUrl;

    if (shopDomain && appUrl) {
      fetch(`${appUrl}/api/storefront-config?shop=${encodeURIComponent(shopDomain)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.settings) {
            applyCustomStyles(container, data.settings);
          }
        })
        .catch(() => {
          // Graceful fallback to embedded theme block settings
        });
    }

    function applyCustomStyles(root, s) {
      const inputContainer = root.querySelector(".sb-input-container");
      const btn = root.querySelector(".sb-btn");
      if (inputContainer) {
        if (s.backgroundColor) inputContainer.style.backgroundColor = s.backgroundColor;
        if (s.borderColor) inputContainer.style.borderColor = s.borderColor;
        if (s.borderRadius !== undefined) inputContainer.style.borderRadius = `${s.borderRadius}px`;
        if (s.textColor) input.style.color = s.textColor;
      }
      if (btn) {
        if (s.buttonBgColor) btn.style.backgroundColor = s.buttonBgColor;
        if (s.buttonTextColor) btn.style.color = s.buttonTextColor;
        if (s.buttonBorderRadius !== undefined) btn.style.borderRadius = `${s.buttonBorderRadius}px`;
      }
    }

    // Debounced predictive query
    function onInput() {
      const query = input.value.trim();

      if (debounceTimer) clearTimeout(debounceTimer);

      if (!query || query.length < 2) {
        closeDropdown();
        return;
      }

      debounceTimer = setTimeout(() => {
        fetchSuggestions(query);
      }, 250);
    }

    async function fetchSuggestions(query) {
      if (currentAbortController) {
        currentAbortController.abort();
      }
      currentAbortController = new AbortController();

      showLoading(true);
      openDropdown();

      try {
        const endpoint = `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[options][unavailable_products]=hide`;
        const res = await fetch(endpoint, { signal: currentAbortController.signal });

        if (!res.ok) throw new Error("Search request failed");

        const data = await res.json();
        const products = data?.resources?.results?.products || [];

        renderSuggestions(query, products);
      } catch (err) {
        if (err.name !== "AbortError") {
          showEmpty(true);
        }
      } finally {
        showLoading(false);
      }
    }

    function renderSuggestions(query, products) {
      resultsList.innerHTML = "";
      selectedIndex = -1;

      // Update View All link
      if (viewAllLink) {
        viewAllLink.href = `/search?q=${encodeURIComponent(query)}&type=product`;
      }

      if (products.length === 0) {
        showEmpty(true);
        return;
      }

      showEmpty(false);

      products.slice(0, 6).forEach((product, idx) => {
        const li = document.createElement("li");
        li.setAttribute("role", "option");
        li.id = `sb-result-${idx}`;

        const a = document.createElement("a");
        a.className = "sb-result-item";
        a.href = product.url;

        // Image
        if (product.image) {
          const img = document.createElement("img");
          img.className = "sb-product-thumb";
          img.src = product.image;
          img.alt = product.title || "";
          img.loading = "lazy";
          a.appendChild(img);
        }

        // Details container
        const details = document.createElement("div");
        details.className = "sb-product-details";

        const title = document.createElement("div");
        title.className = "sb-product-title";
        title.textContent = product.title;
        details.appendChild(title);

        if (product.price) {
          const price = document.createElement("div");
          price.className = "sb-product-price";
          price.textContent = product.price;
          details.appendChild(price);
        }

        a.appendChild(details);
        li.appendChild(a);
        resultsList.appendChild(li);
      });
    }

    function openDropdown() {
      dropdown.classList.add("sb-is-active");
      input.setAttribute("aria-expanded", "true");
    }

    function closeDropdown() {
      dropdown.classList.remove("sb-is-active");
      input.setAttribute("aria-expanded", "false");
      selectedIndex = -1;
    }

    function showLoading(isLoading) {
      if (loadingState) loadingState.style.display = isLoading ? "block" : "none";
      if (isLoading && resultsList) resultsList.style.display = "none";
      else if (resultsList) resultsList.style.display = "block";
    }

    function showEmpty(isEmpty) {
      if (emptyState) emptyState.style.display = isEmpty ? "block" : "none";
    }

    // Keyboard navigation
    input.addEventListener("keydown", (e) => {
      const items = resultsList.querySelectorAll(".sb-result-item");

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (items.length === 0) return;
        selectedIndex = (selectedIndex + 1) % items.length;
        updateActiveItem(items);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (items.length === 0) return;
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateActiveItem(items);
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0 && items[selectedIndex]) {
          e.preventDefault();
          items[selectedIndex].click();
        }
      } else if (e.key === "Escape") {
        closeDropdown();
      }
    });

    function updateActiveItem(items) {
      items.forEach((item, idx) => {
        if (idx === selectedIndex) {
          item.classList.add("sb-item-focused");
          item.scrollIntoView({ block: "nearest" });
          input.setAttribute("aria-activedescendant", `sb-result-${idx}`);
        } else {
          item.classList.remove("sb-item-focused");
        }
      });
    }

    input.addEventListener("input", onInput);
    input.addEventListener("focus", () => {
      if (input.value.trim().length >= 2) {
        openDropdown();
      }
    });

    // Close on click outside
    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        closeDropdown();
      }
    });
  }

  // Initialize all search bars on page
  function initAll() {
    document.querySelectorAll(".sb-wrapper").forEach(initSearchBar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();

