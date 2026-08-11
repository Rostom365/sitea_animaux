/* ===========================================================
   catalogue.js — logique de la page catalogue (catalogue.html)
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

  const catIcons = { chien: "dog", chat: "cat", oiseau: "bird", rongeur: "rodent", poisson: "fish" };
  const catFilter = document.getElementById("cat-filter");
  const subcatFilter = document.getElementById("subcat-filter");

  CATEGORIES.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.label;
    catFilter.appendChild(opt);
  });

  function updateSubcatOptions() {
    const cat = catFilter.value;
    subcatFilter.innerHTML = `<option value="">Toutes les sous-catégories</option>`;
    patteSubcategories(cat).forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.label;
      subcatFilter.appendChild(opt);
    });
  }

  /* --- pré-remplissage des filtres depuis l'URL (venant de categories.html) --- */
  const params = new URLSearchParams(location.search);
  const initialCat = params.get("cat") || "";
  const initialSub = params.get("sub") || "";
  const initialPromo = params.get("promo") === "1";

  if (initialCat) {
    catFilter.value = initialCat;
    updateSubcatOptions();
    if (initialSub) subcatFilter.value = initialSub;
  }

  if (initialPromo) {
    const labelEl = document.getElementById("catalogue-label");
    const headingEl = document.getElementById("catalogue-heading");
    if (labelEl) labelEl.textContent = "Promotions";
    if (headingEl) {
      headingEl.textContent = initialCat
        ? `Promotions — ${patteCategoryLabel(initialCat)}`
        : "Toutes les promotions";
    }
  }

  /* --- panier (persisté dans localStorage, partagé avec les autres pages) --- */
  const cartCountEl = document.getElementById("cart-count");

  function refreshCartCount() {
    cartCountEl.textContent = patteCartCount();
  }

  refreshCartCount();

  /* --- coordonnées de la boutique (modifiables depuis l'espace vendeur) --- */
  patteRenderContactInfo();
  patteRenderAccountLink();

  /* --- rendu des produits --- */
  const grid = document.getElementById("product-grid");
  const searchInput = document.getElementById("search-input");

  function stockBadge(stock) {
    stock = Number(stock) || 0;
    if (stock <= 0) return `<span class="stock-badge stock-out">Rupture</span>`;
    if (stock <= 5) return `<span class="stock-badge stock-low">Stock faible</span>`;
    return `<span class="stock-badge stock-ok">En stock</span>`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function renderProducts() {
    const all = patteLoadProducts();
    const q = searchInput.value.trim().toLowerCase();
    const cat = catFilter.value;
    const sub = subcatFilter.value;

    const filtered = all.filter(p => {
      const matchQ = !q || (p.nom || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
      const matchCat = !cat || p.categorie === cat;
      const matchSub = !sub || p.sousCategorie === sub;
      const matchPromo = !initialPromo || p.promo;
      return matchQ && matchCat && matchSub && matchPromo;
    });

    grid.innerHTML = "";

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          ${icon("box")}
          <h3>${all.length === 0 ? "Aucun produit pour l'instant" : "Aucun résultat"}</h3>
          <p>${all.length === 0
              ? "Le catalogue sera bientôt garni ! Le vendeur peut ajouter des produits depuis l'espace vendeur."
              : "Essayez une autre recherche ou une autre catégorie."}</p>
        </div>`;
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        ${p.promo ? `<span class="promo-badge" title="Article en promotion">${icon("star")}</span>` : ""}
        <a href="produit.html?id=${p.id}" class="product-img product-link-img">
          ${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.nom)}">` : icon(catIcons[p.categorie] || "paw")}
        </a>
        <div class="product-body">
          <span class="product-cat">${patteCategoryLabel(p.categorie)} · ${patteSubcategoryLabel(p.categorie, p.sousCategorie)}</span>
          <a href="produit.html?id=${p.id}" class="product-link-name"><h3 class="product-name">${escapeHtml(p.nom)}</h3></a>
          <p class="product-desc">${escapeHtml(p.description || "")}</p>
          <div class="product-foot">
            <span class="product-price">${patteFormatPrice(p.prix)}</span>
            ${stockBadge(p.stock)}
          </div>
          <button class="add-btn" ${Number(p.stock) <= 0 ? "disabled" : ""}>Ajouter au panier</button>
        </div>`;
      card.querySelector(".add-btn").addEventListener("click", () => {
        patteAddToCart(p, 1);
        refreshCartCount();
      });
      grid.appendChild(card);
    });
  }

  searchInput.addEventListener("input", renderProducts);
  catFilter.addEventListener("change", () => { updateSubcatOptions(); renderProducts(); });
  subcatFilter.addEventListener("change", renderProducts);

  renderProducts();

  /* Se remet à jour si l'admin modifie le catalogue dans un autre onglet */
  window.addEventListener("storage", (e) => {
    if (e.key === PATTE_STORAGE_KEY) renderProducts();
    if (e.key === PATTE_CART_KEY) refreshCartCount();
    if (e.key === PATTE_CONTACT_KEY) patteRenderContactInfo();
    if (e.key === PATTE_CUSTOMER_SESSION_KEY) patteRenderAccountLink();
  });
});

function setIcon(id, name) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = icon(name);
}
