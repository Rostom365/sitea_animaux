/* ===========================================================
   data.js — couche de données partagée entre le site et l'admin
   Stockage : localStorage du navigateur (clé "patte_produits")
   -----------------------------------------------------------
   IMPORTANT : localStorage est propre à CE navigateur / cet
   ordinateur. Si le site est mis en ligne sur un hébergeur,
   chaque visiteur voit une boutique vide tant que le VENDEUR
   n'a pas ajouté ses produits depuis le même navigateur que
   celui utilisé pour consulter la boutique publique, ou tant
   que les données n'ont pas été exportées/importées (voir
   boutons Exporter / Importer dans l'admin).
   =========================================================== */

const PATTE_STORAGE_KEY = "patte_produits";

const CATEGORIES = [
  { id: "chien", label: "Chiens" },
  { id: "chat", label: "Chats" },
  { id: "oiseau", label: "Oiseaux" },
  { id: "rongeur", label: "Rongeurs" },
  { id: "poisson", label: "Poissons" },
];

/* Sous-catégories propres à chaque univers animalier.
   Pour ajouter/renommer une sous-catégorie, modifiez simplement
   les listes ci-dessous (id = identifiant technique, label = texte affiché). */
const SUBCATEGORIES = {
  chien: [
    { id: "alimentation-chien", label: "Alimentation" },
    { id: "friandises-chien", label: "Friandises" },
    { id: "hygiene-sante-chien", label: "Hygiène & Santé" },
    { id: "accessoires-chien", label: "Accessoires" },
    { id: "couchage-transport-chien", label: "Couchages & Transport" },
    { id: "jouets-chien", label: "Jouets" },
  ],
  chat: [
    { id: "alimentation-chat", label: "Alimentation" },
    { id: "litieres-chat", label: "Litières" },
    { id: "friandises-chat", label: "Friandises" },
    { id: "hygiene-sante-chat", label: "Hygiène & Santé" },
    { id: "accessoires-chat", label: "Accessoires" },
    { id: "jouets-chat", label: "Jouets" },
  ],
  oiseau: [
    { id: "alimentation-oiseau", label: "Alimentation" },
    { id: "friandises-oiseau", label: "Friandises" },
    { id: "hygiene-sante-oiseau", label: "Hygiène & Santé" },
    { id: "cages-accessoires-oiseau", label: "Cages & Accessoires" },
  ],
  rongeur: [
    { id: "alimentation-rongeur", label: "Alimentation" },
    { id: "litieres-accessoires-rongeur", label: "Litières & Accessoires" },
    { id: "friandises-rongeur", label: "Friandises" },
    { id: "hygiene-sante-rongeur", label: "Hygiène & Santé" },
  ],
  poisson: [
    { id: "alimentation-poisson", label: "Alimentation" },
    { id: "aquariophilie-poisson", label: "Aquariophilie & Matériel" },
    { id: "entretien-eau-poisson", label: "Entretien de l'eau" },
  ],
};

function pattePad(n) {
  return String(n).padStart(4, "0");
}

function patteLoadProducts() {
  try {
    const raw = localStorage.getItem(PATTE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Erreur de lecture des produits :", e);
    return [];
  }
}

function patteSaveProducts(products) {
  localStorage.setItem(PATTE_STORAGE_KEY, JSON.stringify(products));
}

function patteNextId(products) {
  const maxId = products.reduce((max, p) => Math.max(max, p.id || 0), 0);
  return maxId + 1;
}

function patteAddProduct(product) {
  const products = patteLoadProducts();
  product.id = patteNextId(products);
  products.push(product);
  patteSaveProducts(products);
  return product;
}

function patteUpdateProduct(id, changes) {
  const products = patteLoadProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...changes };
  patteSaveProducts(products);
  return products[idx];
}

function patteDeleteProduct(id) {
  const products = patteLoadProducts().filter((p) => p.id !== id);
  patteSaveProducts(products);
}

/* Complète le catalogue avec les données de seed-data.js à chaque chargement
   de page, dans n'importe quel navigateur (Chrome, Edge…), sans écraser les
   produits déjà présents : seuls les produits du seed absents du catalogue
   actuel (comparés par nom + animal) sont ajoutés. Ainsi le site affiche
   toujours l'ensemble Zanimo + Animal Zone + Zanimax, même si le navigateur
   contenait déjà d'anciens produits de test ou des produits ajoutés depuis
   l'admin. */
function patteSeedInitialProducts() {
  if (typeof PATTE_SEED_ANIMALZONE === "undefined" || typeof PATTE_SEED_ZANIMO === "undefined") return;
  const existing = patteLoadProducts();
  const existingKeys = new Set(existing.map((p) => (p.nom || "") + "|" + (p.categorie || "")));
  const seedAll = [
    ...PATTE_SEED_ANIMALZONE,
    ...PATTE_SEED_ZANIMO,
    ...(typeof PATTE_SEED_ZANIMAX !== "undefined" ? PATTE_SEED_ZANIMAX : []),
  ];
  const missing = seedAll.filter((p) => !existingKeys.has((p.nom || "") + "|" + (p.categorie || "")));
  if (missing.length === 0) return;
  const startId = patteNextId(existing);
  const toAdd = missing.map((p, i) => ({ ...p, id: startId + i }));
  patteSaveProducts([...existing, ...toAdd]);
}
patteSeedInitialProducts();

function patteCategoryLabel(id) {
  const cat = CATEGORIES.find((c) => c.id === id);
  return cat ? cat.label : id;
}

function patteSubcategories(catId) {
  return SUBCATEGORIES[catId] || [];
}

function patteSubcategoryLabel(catId, subId) {
  const list = SUBCATEGORIES[catId] || [];
  const found = list.find((s) => s.id === subId);
  return found ? found.label : (subId || "");
}

function patteFormatPrice(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TND";
}

/* Export / import JSON — permet au vendeur de transférer son
   catalogue d'un ordinateur à un autre, ou de faire une sauvegarde. */
function patteExportJSON() {
  const data = patteLoadProducts();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "catalogue-produits.json";
  a.click();
  URL.revokeObjectURL(url);
}

function patteImportJSON(file, onDone) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) throw new Error("Format invalide");
      patteSaveProducts(parsed);
      onDone(true);
    } catch (e) {
      onDone(false, e);
    }
  };
  reader.readAsText(file);
}

/* ===========================================================
   Panier — stocké séparément du catalogue (clé "patte_panier"),
   partagé entre index.html (ajout) et panier.html (gestion).
   =========================================================== */
const PATTE_CART_KEY = "patte_panier";

function patteLoadCart() {
  try {
    const raw = localStorage.getItem(PATTE_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Erreur de lecture du panier :", e);
    return [];
  }
}

function patteSaveCart(cart) {
  localStorage.setItem(PATTE_CART_KEY, JSON.stringify(cart));
}

function patteAddToCart(product, qty) {
  qty = Number(qty) || 1;
  const cart = patteLoadCart();
  const stock = Number(product.stock) || 0;
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.qty = stock > 0 ? Math.min(existing.qty + qty, stock) : existing.qty + qty;
  } else {
    cart.push({
      id: product.id,
      nom: product.nom,
      prix: Number(product.prix) || 0,
      image: product.image || "",
      qty: stock > 0 ? Math.min(qty, stock) : qty,
    });
  }

  patteSaveCart(cart);
  return cart;
}

function patteCartCount() {
  return patteLoadCart().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
}

/* ===========================================================
   Commandes — historique des commandes validées (clé
   "patte_commandes"), écrit par panier.html, lu par admin.html.
   =========================================================== */
const PATTE_ORDERS_KEY = "patte_commandes";

function patteLoadOrders() {
  try {
    const raw = localStorage.getItem(PATTE_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Erreur de lecture des commandes :", e);
    return [];
  }
}

function patteSaveOrders(orders) {
  localStorage.setItem(PATTE_ORDERS_KEY, JSON.stringify(orders));
}

function patteAddOrder(order) {
  const orders = patteLoadOrders();
  orders.push(order);
  patteSaveOrders(orders);
  return order;
}

/* ===========================================================
   Coordonnées de la boutique — modifiables depuis l'espace
   vendeur (clé "patte_contact"), affichées sur contact.html et
   dans le pied de page de toutes les pages.
   =========================================================== */
const PATTE_CONTACT_KEY = "patte_contact";

const PATTE_CONTACT_DEFAULT = {
  email: "contact@patte-compagnie.tn",
  telephone: "+216 00 000 000",
  adresse: "Tunis, Tunisie",
};

function patteLoadContactInfo() {
  try {
    const raw = localStorage.getItem(PATTE_CONTACT_KEY);
    if (!raw) return { ...PATTE_CONTACT_DEFAULT };
    const parsed = JSON.parse(raw);
    return { ...PATTE_CONTACT_DEFAULT, ...parsed };
  } catch (e) {
    console.error("Erreur de lecture des coordonnées :", e);
    return { ...PATTE_CONTACT_DEFAULT };
  }
}

function patteSaveContactInfo(info) {
  localStorage.setItem(PATTE_CONTACT_KEY, JSON.stringify(info));
}

/* Remplit tout élément marqué data-contact-email / -telephone / -adresse
   avec les coordonnées actuelles. Appelé par chaque page publique. */
function patteRenderContactInfo() {
  const info = patteLoadContactInfo();

  document.querySelectorAll("[data-contact-email]").forEach((el) => {
    el.textContent = info.email;
    if (el.tagName === "A") el.href = "mailto:" + info.email;
  });

  document.querySelectorAll("[data-contact-telephone]").forEach((el) => {
    el.textContent = info.telephone;
    if (el.tagName === "A") el.href = "tel:" + info.telephone.replace(/[^\d+]/g, "");
  });

  document.querySelectorAll("[data-contact-adresse]").forEach((el) => {
    el.textContent = info.adresse;
  });
}

/* ===========================================================
   Comptes clients — inscription/connexion (clé "patte_clients"),
   session courante (clé "patte_client_session").
   ⚠️ Démo uniquement : les mots de passe sont stockés en clair
   dans le navigateur, comme le reste du site (voir LISEZ-MOI.md).
   Pas de vraie sécurité sans serveur.
   =========================================================== */
const PATTE_CUSTOMERS_KEY = "patte_clients";
const PATTE_CUSTOMER_SESSION_KEY = "patte_client_session";

function patteLoadCustomers() {
  try {
    const raw = localStorage.getItem(PATTE_CUSTOMERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Erreur de lecture des comptes clients :", e);
    return [];
  }
}

function patteSaveCustomers(customers) {
  localStorage.setItem(PATTE_CUSTOMERS_KEY, JSON.stringify(customers));
}

function patteFindCustomerByEmail(email) {
  const normalized = (email || "").trim().toLowerCase();
  return patteLoadCustomers().find((c) => c.email.toLowerCase() === normalized) || null;
}

function patteRegisterCustomer(prenom, nom, email, telephone, dateNaissance, password) {
  const customers = patteLoadCustomers();
  if (patteFindCustomerByEmail(email)) {
    throw new Error("Un compte existe déjà avec cet email.");
  }
  const customer = {
    id: customers.reduce((max, c) => Math.max(max, c.id || 0), 0) + 1,
    prenom: prenom.trim(),
    nom: nom.trim(),
    email: email.trim(),
    telephone: telephone.trim(),
    dateNaissance: (dateNaissance || "").trim(),
    password,
    createdAt: new Date().toISOString(),
  };
  customers.push(customer);
  patteSaveCustomers(customers);
  localStorage.setItem(PATTE_CUSTOMER_SESSION_KEY, String(customer.id));
  return customer;
}

function patteLoginCustomer(email, password) {
  const customer = patteFindCustomerByEmail(email);
  if (!customer || customer.password !== password) return null;
  localStorage.setItem(PATTE_CUSTOMER_SESSION_KEY, String(customer.id));
  return customer;
}

function patteLogoutCustomer() {
  localStorage.removeItem(PATTE_CUSTOMER_SESSION_KEY);
}

function patteCurrentCustomer() {
  const id = Number(localStorage.getItem(PATTE_CUSTOMER_SESSION_KEY));
  if (!id) return null;
  return patteLoadCustomers().find((c) => c.id === id) || null;
}

/* Met à jour le lien "Mon compte" du header sur chaque page publique. */
function patteRenderAccountLink() {
  const el = document.getElementById("account-link");
  if (!el) return;
  const customer = patteCurrentCustomer();
  el.textContent = customer ? `Bonjour, ${customer.prenom}` : "Mon compte";
}

/* ===========================================================
   Animaux des clients — fiches animalières rattachées à un
   compte client (clé "patte_animaux"), gérées depuis compte.html.
   =========================================================== */
const PATTE_PETS_KEY = "patte_animaux";

function patteLoadPets() {
  try {
    const raw = localStorage.getItem(PATTE_PETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Erreur de lecture des animaux :", e);
    return [];
  }
}

function patteSavePets(pets) {
  localStorage.setItem(PATTE_PETS_KEY, JSON.stringify(pets));
}

function pattePetsForCustomer(customerId) {
  return patteLoadPets().filter((p) => p.customerId === customerId);
}

function patteAddPet(pet) {
  const pets = patteLoadPets();
  pet.id = pets.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;
  pets.push(pet);
  patteSavePets(pets);
  return pet;
}

function patteUpdatePet(id, changes) {
  const pets = patteLoadPets();
  const idx = pets.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  pets[idx] = { ...pets[idx], ...changes };
  patteSavePets(pets);
  return pets[idx];
}

function patteDeletePet(id) {
  const pets = patteLoadPets().filter((p) => p.id !== id);
  patteSavePets(pets);
}