"use strict";

(function initApp() {
  const menuContainer = document.getElementById("menu");
  const modal = document.getElementById("item-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalPrice = document.getElementById("modal-price");
  const modalCategory = document.getElementById("modal-category");
  const modalIngredients = document.getElementById("modal-ingredients");
  const modalNutrition = document.getElementById("modal-nutrition");
  const closeElements = modal.querySelectorAll('[data-close]');

  let menuItems = [];
  let lastFocusedElement = null;

  fetch("data/menu.json")
    .then((r) => r.json())
    .then((data) => {
      menuItems = data;
      renderMenu(menuItems);
    })
    .catch((err) => {
      console.error("Failed to load menu.json", err);
      menuContainer.innerHTML = '<p role="alert">Unable to load the menu. Please refresh.</p>';
    });

  function renderMenu(items) {
    menuContainer.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("button");
      card.className = "menu-card";
      card.setAttribute("role", "listitem");
      card.setAttribute("aria-haspopup", "dialog");
      card.dataset.id = item.id;
      card.innerHTML = `
        <div class="title-row">
          <span class="menu-emoji">${escapeHtml(item.emoji || "☕")}</span>
          <span class="menu-name">${escapeHtml(item.name)}</span>
        </div>
        <div class="menu-category">${escapeHtml(item.category)}</div>
        <div class="menu-price">${formatPrice(item.price)}</div>
      `;
      card.addEventListener("click", () => openModal(item.id));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(item.id);
        }
      });
      menuContainer.appendChild(card);
    });
  }

  function openModal(itemId) {
    const item = menuItems.find((i) => i.id === itemId);
    if (!item) return;

    lastFocusedElement = document.activeElement;

    modalTitle.textContent = item.name;
    modalPrice.textContent = formatPrice(item.price);
    modalCategory.textContent = item.category;

    modalIngredients.innerHTML = "";
    item.ingredients.forEach((ing) => {
      const li = document.createElement("li");
      li.textContent = ing;
      modalIngredients.appendChild(li);
    });

    modalNutrition.innerHTML = "";
    const nutritionMap = {
      "Calories": item.nutrition.calories,
      "Caffeine (mg)": item.nutrition.caffeine_mg,
      "Sugar (g)": item.nutrition.sugar_g,
      "Fat (g)": item.nutrition.fat_g,
      "Protein (g)": item.nutrition.protein_g,
    };
    Object.entries(nutritionMap).forEach(([label, value]) => {
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = String(value);
      modalNutrition.appendChild(dt);
      modalNutrition.appendChild(dd);
    });

    modal.setAttribute("aria-hidden", "false");
    trapFocus(modal);
    const firstFocusable = getFocusableElements(modal)[0];
    (firstFocusable || modal).focus();
    document.addEventListener("keydown", onEscClose);
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onEscClose);
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function onEscClose(e) {
    if (e.key === "Escape") {
      closeModal();
    }
  }

  closeElements.forEach((el) => el.addEventListener("click", closeModal));
  modal.addEventListener("click", (e) => {
    if (e.target && e.target.hasAttribute("data-close")) {
      closeModal();
    }
  });

  function formatPrice(value) {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
    } catch (_) {
      return `$${Number(value).toFixed(2)}`;
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Basic focus trap within the modal
  function trapFocus(container) {
    const focusable = getFocusableElements(container);
    if (focusable.length === 0) return;
    function handleTab(e) {
      if (e.key !== "Tab") return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    container.addEventListener("keydown", handleTab);
  }

  function getFocusableElements(container) {
    const selectors = [
      'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
      'input[type="text"]:not([disabled])', 'input[type="search"]:not([disabled])',
      'input[type="radio"]:not([disabled])', 'input[type="checkbox"]:not([disabled])',
      'select:not([disabled])', '[tabindex]:not([tabindex="-1"])'
    ];
    return Array.from(container.querySelectorAll(selectors.join(',')))
      .filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
  }
})();
