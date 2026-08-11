/* ===========================================================
   produit.js — logique de la page détail produit (produit.html)
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  setIcon("logo-icon", "paw");
  setIcon("cart-icon", "cart");
  setIcon("burger-btn", "menu");

  /* --- menu mobile --- */
  const burger = document.getElementById("burger-btn");
  const nav = document.getElementById("main-nav");
  burger.addEventListener("click", () => nav.classList.toggle("open"));

  const catIcons = { chien: "dog", chat: "cat", oiseau: "bird", rongeur: "rodent", poisson: "fish" };
  const cartCountEl = document.getElementById("cart-count");

  function refreshCartCount() {
    cartCountEl.textContent = patteCartCount();
  }
  refreshCartCount();

  /* --- coordonnées de la boutique (modifiables depuis l'espace vendeur) --- */
  patteRenderContactInfo();
  patteRenderAccountLink();

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

  const params = new URLSearchParams(location.search);
  const productId = Number(params.get("id"));
  const root = document.getElementById("product-detail-root");
  const similarSection = document.getElementById("similar-section");
  const similarGrid = document.getElementById("similar-grid");

  function renderNotFound() {
    document.title = "Produit introuvable — Patte & Compagnie";
    root.innerHTML = `
      <div class="empty-state">
        ${icon("box")}
        <h3>Produit introuvable</h3>
        <p>Ce produit n'existe plus ou a été retiré du catalogue.</p>
        <a href="catalogue.html" class="btn btn-primary">Retour au catalogue</a>
      </div>`;
    similarSection.style.display = "none";
  }

  function renderSimilar(current) {
    const products = patteLoadProducts().filter(
      (p) => p.categorie === current.categorie && p.id !== current.id
    );

    if (products.length === 0) {
      similarSection.style.display = "none";
      return;
    }

    similarSection.style.display = "block";
    similarGrid.innerHTML = "";

    products.slice(0, 4).forEach((p) => {
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
          <div class="product-foot">
            <span class="product-price">${patteFormatPrice(p.prix)}</span>
            ${stockBadge(p.stock)}
          </div>
        </div>`;
      similarGrid.appendChild(card);
    });
  }

  function renderProduct() {
    const products = patteLoadProducts();
    const p = products.find((item) => item.id === productId);

    if (!p) {
      renderNotFound();
      return;
    }

    document.title = `${p.nom} — Patte & Compagnie`;
    const stock = Number(p.stock) || 0;
    let qty = 1;

    root.innerHTML = `
      <div class="product-detail">
        <div class="product-detail-img">
          ${p.promo ? `<span class="promo-badge promo-badge-lg" title="Article en promotion">${icon("star")}</span>` : ""}
          ${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.nom)}">` : icon(catIcons[p.categorie] || "paw")}
        </div>
        <div class="product-detail-body">
          <span class="product-cat">${patteCategoryLabel(p.categorie)} · ${patteSubcategoryLabel(p.categorie, p.sousCategorie)}</span>
          <h1>${escapeHtml(p.nom)}</h1>
          <div class="product-detail-price">${patteFormatPrice(p.prix)}</div>
          ${stockBadge(stock)}
          <p class="product-detail-desc">${escapeHtml(p.description) || "Aucune description pour ce produit."}</p>
          <div class="product-detail-actions">
            <div class="qty-stepper">
              <button type="button" id="qty-minus">−</button>
              <span id="qty-value">1</span>
              <button type="button" id="qty-plus">+</button>
            </div>
            <button class="btn btn-primary" id="detail-add-btn" ${stock <= 0 ? "disabled" : ""}>Ajouter au panier</button>
          </div>
          <p class="feedback-msg" id="detail-feedback"></p>
        </div>
      </div>`;

    const qtyValueEl = document.getElementById("qty-value");
    const feedbackEl = document.getElementById("detail-feedback");

    document.getElementById("qty-plus").addEventListener("click", () => {
      if (stock > 0 && qty >= stock) return;
      qty += 1;
      qtyValueEl.textContent = qty;
    });

    document.getElementById("qty-minus").addEventListener("click", () => {
      if (qty <= 1) return;
      qty -= 1;
      qtyValueEl.textContent = qty;
    });

    document.getElementById("detail-add-btn").addEventListener("click", () => {
      patteAddToCart(p, qty);
      refreshCartCount();
      feedbackEl.textContent = "Ajouté au panier ✔";
    });

    renderSimilar(p);
  }

  if (!productId) {
    renderNotFound();
  } else {
    renderProduct();
  }

  window.addEventListener("storage", (e) => {
    if (e.key === PATTE_STORAGE_KEY && productId) renderProduct();
    if (e.key === PATTE_CART_KEY) refreshCartCount();
    if (e.key === PATTE_CONTACT_KEY) patteRenderContactInfo();
    if (e.key === PATTE_CUSTOMER_SESSION_KEY) patteRenderAccountLink();
  });
});

function setIcon(id, name) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = icon(name);
}
