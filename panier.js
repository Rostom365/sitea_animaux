/* ===========================================================
   panier.js — logique de la page panier (panier.html)
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  setIcon("logo-icon", "paw");
  setIcon("cart-icon", "cart");
  setIcon("burger-btn", "menu");
  ["paw1", "paw2", "paw3"].forEach((id) => setIcon(id, "paw"));

  /* --- menu mobile --- */
  const burger = document.getElementById("burger-btn");
  const nav = document.getElementById("main-nav");
  burger.addEventListener("click", () => nav.classList.toggle("open"));

  const catIcons = { chien: "dog", chat: "cat", oiseau: "bird", rongeur: "rodent", poisson: "fish" };

  const cartListEl = document.getElementById("cart-list");
  const cartCountEl = document.getElementById("cart-count");
  const subtotalEl = document.getElementById("sum-subtotal");
  const totalEl = document.getElementById("sum-total");
  const checkoutBtn = document.getElementById("checkout-btn");
  const errorEl = document.getElementById("checkout-error");

  function stockFor(id) {
    const p = patteLoadProducts().find((p) => p.id === id);
    return p ? Number(p.stock) || 0 : null;
  }

  function categoryIconFor(id) {
    const p = patteLoadProducts().find((p) => p.id === id);
    return p ? (catIcons[p.categorie] || "paw") : "box";
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function render() {
    const cart = patteLoadCart();
    cartCountEl.textContent = patteCartCount();

    if (cart.length === 0) {
      cartListEl.innerHTML = `
        <div class="cart-empty">
          ${icon("box")}
          <h3>Votre panier est vide</h3>
          <p>Parcourez le catalogue pour trouver de quoi faire plaisir à votre compagnon.</p>
          <a href="catalogue.html" class="btn btn-primary">Découvrir le catalogue</a>
        </div>`;
      subtotalEl.textContent = patteFormatPrice(0);
      totalEl.textContent = patteFormatPrice(0);
      checkoutBtn.disabled = true;
      return;
    }

    checkoutBtn.disabled = false;
    cartListEl.innerHTML = "";

    let subtotal = 0;

    cart.forEach((item) => {
      const lineTotal = (Number(item.prix) || 0) * (Number(item.qty) || 0);
      subtotal += lineTotal;

      const line = document.createElement("div");
      line.className = "cart-line";
      line.innerHTML = `
        <div class="cart-thumb">
          ${item.image ? `<img src="${item.image}" alt="">` : icon(categoryIconFor(item.id))}
        </div>
        <div>
          <div class="cart-line-name">${escapeHtml(item.nom)}</div>
          <div class="cart-line-unit">${patteFormatPrice(item.prix)} / unité</div>
        </div>
        <div class="qty-stepper">
          <button type="button" data-minus="${item.id}">−</button>
          <span>${item.qty}</span>
          <button type="button" data-plus="${item.id}">+</button>
        </div>
        <div class="cart-line-price">${patteFormatPrice(lineTotal)}</div>
        <button type="button" class="icon-btn" title="Retirer" data-remove="${item.id}">${icon("trash")}</button>`;
      cartListEl.appendChild(line);
    });

    subtotalEl.textContent = patteFormatPrice(subtotal);
    totalEl.textContent = patteFormatPrice(subtotal);

    cartListEl.querySelectorAll("[data-plus]").forEach((btn) =>
      btn.addEventListener("click", () => changeQty(Number(btn.dataset.plus), 1)));
    cartListEl.querySelectorAll("[data-minus]").forEach((btn) =>
      btn.addEventListener("click", () => changeQty(Number(btn.dataset.minus), -1)));
    cartListEl.querySelectorAll("[data-remove]").forEach((btn) =>
      btn.addEventListener("click", () => removeItem(Number(btn.dataset.remove))));
  }

  function changeQty(id, delta) {
    const cart = patteLoadCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    const nextQty = item.qty + delta;
    if (nextQty < 1) return;

    const stock = stockFor(id);
    if (delta > 0 && stock !== null && nextQty > stock) {
      errorEl.textContent = "Stock insuffisant pour cette quantité.";
      return;
    }

    errorEl.textContent = "";
    item.qty = nextQty;
    patteSaveCart(cart);
    render();
  }

  function removeItem(id) {
    const cart = patteLoadCart().filter((i) => i.id !== id);
    patteSaveCart(cart);
    render();
  }

  checkoutBtn.addEventListener("click", () => {
    const cart = patteLoadCart();
    if (!cart.length) return;

    const products = patteLoadProducts();

    for (const item of cart) {
      const product = products.find((p) => p.id === item.id);
      if (product && Number(product.stock) < item.qty) {
        errorEl.textContent = `Stock insuffisant pour « ${product.nom} ».`;
        return;
      }
    }

    products.forEach((p) => {
      const item = cart.find((i) => i.id === p.id);
      if (item) p.stock = Math.max(0, (Number(p.stock) || 0) - item.qty);
    });
    patteSaveProducts(products);

    const total = cart.reduce((sum, item) => sum + (Number(item.prix) || 0) * (Number(item.qty) || 0), 0);
    const customer = patteCurrentCustomer();
    const order = patteAddOrder({
      id: "CMD-" + Date.now(),
      date: new Date().toISOString(),
      items: cart.map((item) => ({ id: item.id, nom: item.nom, prix: item.prix, qty: item.qty })),
      total,
      clientNom: customer ? `${customer.prenom} ${customer.nom}`.trim() : null,
      clientEmail: customer ? customer.email : null,
    });

    patteSaveCart([]);

    errorEl.textContent = "";
    cartListEl.innerHTML = `
      <div class="cart-confirm">
        ${icon("paw")}
        <h3>Merci ! Votre commande a bien été enregistrée.</h3>
        <p class="ref">Référence : ${order.id}</p>
        <a href="catalogue.html" class="btn btn-primary" style="margin-top:14px;">Continuer mes achats</a>
      </div>`;
    cartCountEl.textContent = "0";
    subtotalEl.textContent = patteFormatPrice(0);
    totalEl.textContent = patteFormatPrice(0);
    checkoutBtn.disabled = true;
  });

  window.addEventListener("storage", (e) => {
    if (e.key === PATTE_CART_KEY || e.key === PATTE_STORAGE_KEY) render();
    if (e.key === PATTE_CONTACT_KEY) patteRenderContactInfo();
    if (e.key === PATTE_CUSTOMER_SESSION_KEY) patteRenderAccountLink();
  });

  /* --- coordonnées de la boutique (modifiables depuis l'espace vendeur) --- */
  patteRenderContactInfo();
  patteRenderAccountLink();

  render();
});

function setIcon(id, name) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = icon(name);
}
