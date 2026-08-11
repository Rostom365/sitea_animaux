/* ===========================================================
   categories.js — logique de la page catégories (categories.html)
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  sessionStorage.removeItem("patte_admin_ok");

  setIcon("logo-icon", "paw");
  setIcon("cart-icon", "cart");
  setIcon("burger-btn", "menu");
  ["paw1", "paw2", "paw3"].forEach(id => setIcon(id, "paw"));

  /* --- menu mobile --- */
  const burger = document.getElementById("burger-btn");
  const nav = document.getElementById("main-nav");
  burger.addEventListener("click", () => nav.classList.toggle("open"));

  /* --- panier (persisté dans localStorage, partagé avec les autres pages) --- */
  const cartCountEl = document.getElementById("cart-count");

  function refreshCartCount() {
    cartCountEl.textContent = patteCartCount();
  }

  refreshCartCount();

  /* --- coordonnées de la boutique (modifiables depuis l'espace vendeur) --- */
  patteRenderContactInfo();
  patteRenderAccountLink();

  window.addEventListener("storage", (e) => {
    if (e.key === PATTE_CART_KEY) refreshCartCount();
    if (e.key === PATTE_CONTACT_KEY) patteRenderContactInfo();
    if (e.key === PATTE_CUSTOMER_SESSION_KEY) patteRenderAccountLink();
    if (e.key === PATTE_STORAGE_KEY) renderCategoryGrid();
  });

  /* --- grille des catégories --- */
  const catIcons = { chien: "dog", chat: "cat", oiseau: "bird", rongeur: "rodent", poisson: "fish" };
  const catGrid = document.getElementById("cat-grid");

  function renderCategoryGrid() {
    const products = patteLoadProducts();
    catGrid.innerHTML = "";

    CATEGORIES.forEach(cat => {
      const card = document.createElement("div");
      card.className = "cat-card";

      const chips = patteSubcategories(cat.id)
        .map(s => `<a href="catalogue.html?cat=${cat.id}&sub=${s.id}" class="subcat-chip">${s.label}</a>`)
        .join("");

      const hasPromo = products.some(p => p.categorie === cat.id && p.promo);

      card.innerHTML = `
        ${hasPromo ? `<a href="catalogue.html?cat=${cat.id}&promo=1" class="promo-starburst-badge cat-card-promo" title="Voir les promotions">${promoStarburst()}</a>` : ""}
        <a href="catalogue.html?cat=${cat.id}" class="cat-card-main">
          ${icon(catIcons[cat.id] || "paw")}<span>${cat.label}</span>
        </a>
        <div class="subcat-chips">${chips}</div>`;

      catGrid.appendChild(card);
    });
  }

  renderCategoryGrid();
});

function setIcon(id, name) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = icon(name);
}
