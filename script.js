/* ===========================================================
   script.js — logique de la page d'accueil (index.html)
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Vider la session admin quand on arrive sur la page publique
  sessionStorage.removeItem("patte_admin_ok");

  /* --- icônes statiques --- */
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
    if (e.key === PATTE_STORAGE_KEY) renderHeroPromos();
  });

  /* --- badge PROMO affiché à droite de chaque univers du carrousel s'il a des promos --- */
  function renderHeroPromos() {
    const products = patteLoadProducts();
    document.querySelectorAll("[data-promo-cat]").forEach((el) => {
      const cat = el.dataset.promoCat;
      const hasPromo = products.some((p) => p.categorie === cat && p.promo);
      el.innerHTML = hasPromo
        ? `<a href="catalogue.html?cat=${cat}&promo=1" class="promo-starburst-badge" title="Voir les promotions">${promoStarburst()}</a>`
        : "";
    });
  }

  renderHeroPromos();

  /* --- carrousel d'accueil --- */
  const track = document.getElementById("hero-track");
  if (track) {
    const slides = Array.from(track.children);
    const dotsWrap = document.getElementById("hero-dots");
    const prevBtn = document.getElementById("hero-prev");
    const nextBtn = document.getElementById("hero-next");
    let index = 0;
    let timer = null;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "hero-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", `Aller à l'image ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle("active", di === index));
      resetTimer();
    }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(() => goTo(index + 1), 6000);
    }

    prevBtn.addEventListener("click", () => goTo(index - 1));
    nextBtn.addEventListener("click", () => goTo(index + 1));

    resetTimer();
  }
});

function setIcon(id, name) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = icon(name);
}
