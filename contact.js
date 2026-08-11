/* ===========================================================
   contact.js — logique de la page contact (contact.html)
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
  });

  /* --- formulaire de contact (ouvre le client mail du visiteur) --- */
  const form = document.getElementById("contact-form");
  const feedbackEl = document.getElementById("contact-feedback");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nom = document.getElementById("c-nom").value.trim();
    const email = document.getElementById("c-email").value.trim();
    const message = document.getElementById("c-message").value.trim();
    const contactEmail = patteLoadContactInfo().email;

    const subject = `Message de ${nom} — Patte & Compagnie`;
    const body = `${message}\n\n— ${nom} (${email})`;
    const mailtoUrl = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
    feedbackEl.textContent = "Votre application de messagerie va s'ouvrir avec le message prêt à envoyer.";
    form.reset();
  });
});

function setIcon(id, name) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = icon(name);
}
