/* ===========================================================
   admin.js — logique de l'espace vendeur (admin.html)
   =========================================================== */

// Mot de passe en base64 (patte2026)
const ADMIN_CODE = "cGF0dGUyMDI2";

document.addEventListener("DOMContentLoaded", () => {
  setIcon("lock-icon", "lock");
  setIcon("admin-logo-icon", "paw");

  /* ---------------- connexion ---------------- */
  const loginScreen = document.getElementById("login-screen");
  const adminScreen = document.getElementById("admin-screen");
  const loginInput = document.getElementById("login-input");
  const loginBtn = document.getElementById("login-btn");
  const loginError = document.getElementById("login-error");

  /* déclaré avant tryLogin/showAdmin : sessionStorage peut déclencher
     showAdmin() de façon synchrone plus bas (revisite déjà connectée) */
  let adminInitialized = false;

  function tryLogin() {
    const correctPassword = atob(ADMIN_CODE);
    
    if (loginInput.value === correctPassword) {
      sessionStorage.setItem("patte_admin_ok", "1");
      showAdmin();
    } else {
      loginError.textContent = "Code incorrect, veuillez réessayer.";
      loginInput.value = "";
      loginInput.focus();
    }
  }

  loginBtn.addEventListener("click", tryLogin);
  loginInput.addEventListener("keydown", (e) => { if (e.key === "Enter") tryLogin(); });

  document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem("patte_admin_ok");
    location.reload();
  });

  function showAdmin() {
    loginScreen.style.display = "none";
    adminScreen.style.display = "block";
    adminInitialized = false; // Réinitialiser le flag
    initAdmin();
  }

  if (sessionStorage.getItem("patte_admin_ok") === "1") {
    showAdmin();
  } else {
    // Au chargement initial, vérifier si déjà authentifié via sessionStorage
    // (au cas où admin.html est ouvert directement en tant que page)
  }

  /* ---------------- initialisation de l'admin ---------------- */
  function initAdmin() {
    if (adminInitialized) { renderAll(); return; }
    adminInitialized = true;

    // Vérifier que les données sont chargées
    if (typeof CATEGORIES === 'undefined' || !CATEGORIES || CATEGORIES.length === 0) {
      console.error("CATEGORIES n'est pas chargé ! Vérifiez que data.js est bien inclus.");
      showToast("Erreur : données des catégories non chargées", true);
      return;
    }

    const catSelect = document.getElementById("f-categorie");
    const subSelect = document.getElementById("f-souscategorie");

    // Vider les selects avant de les remplir
    catSelect.innerHTML = '';
    subSelect.innerHTML = '';

    // 1. Peupler les catégories
    CATEGORIES.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.label;
      catSelect.appendChild(opt);
    });

    // 2. Fonction pour peupler les sous-catégories
    function populateSubcategories(selectedSub) {
      subSelect.innerHTML = '';
      const catId = catSelect.value;
      
      if (!catId) {
        const emptyOpt = document.createElement("option");
        emptyOpt.value = "";
        emptyOpt.textContent = "Sélectionnez d'abord un animal";
        subSelect.appendChild(emptyOpt);
        return;
      }
      
      const list = patteSubcategories(catId);
      console.log("Sous-catégories pour", catId, ":", list); // Debug
      
      if (!list || list.length === 0) {
        const emptyOpt = document.createElement("option");
        emptyOpt.value = "";
        emptyOpt.textContent = "Aucune sous-catégorie";
        subSelect.appendChild(emptyOpt);
        return;
      }
      
      list.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = s.label;
        subSelect.appendChild(opt);
      });
      
      if (selectedSub && list.some(s => s.id === selectedSub)) {
        subSelect.value = selectedSub;
      }
    }

    // 3. Écouter le changement de catégorie
    catSelect.addEventListener("change", () => {
      populateSubcategories();
    });

    // 4. Peupler les sous-catégories initiales (avec la première catégorie)
    populateSubcategories();

    /* --- upload photo --- */
    const imageInput = document.getElementById("f-image");
    const imagePreview = document.getElementById("image-preview");
    const imageDropText = document.getElementById("image-drop-text");
    let currentImageData = "";

    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        currentImageData = reader.result;
        imagePreview.src = currentImageData;
        imagePreview.style.display = "block";
        imageDropText.textContent = file.name;
      };
      reader.readAsDataURL(file);
    });

    /* --- formulaire ajout / édition --- */
    const form = document.getElementById("product-form");
    const idField = document.getElementById("product-id");
    const formTitle = document.getElementById("form-title");
    const submitBtn = document.getElementById("submit-btn");
    const cancelBtn = document.getElementById("cancel-edit-btn");
    const promoField = document.getElementById("f-promo");

    function resetForm() {
      form.reset();
      idField.value = "";
      promoField.checked = false;
      // Ne pas réinitialiser les selects, garder la catégorie sélectionnée
      populateSubcategories();
      currentImageData = "";
      imagePreview.style.display = "none";
      imagePreview.src = "";
      imageDropText.textContent = "Cliquez pour choisir une photo depuis votre ordinateur";
      formTitle.textContent = "Ajouter un produit";
      submitBtn.textContent = "Enregistrer le produit";
      cancelBtn.style.display = "none";
    }

    cancelBtn.addEventListener("click", resetForm);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const category = document.getElementById("f-categorie").value;
      const subCategory = document.getElementById("f-souscategorie").value;
      
      if (!category) {
        showToast("Veuillez sélectionner un animal", true);
        return;
      }
      
      if (!subCategory) {
        showToast("Veuillez sélectionner une sous-catégorie", true);
        return;
      }
      
      const payload = {
        nom: document.getElementById("f-nom").value.trim(),
        prix: parseFloat(document.getElementById("f-prix").value) || 0,
        stock: parseInt(document.getElementById("f-stock").value, 10) || 0,
        categorie: category,
        sousCategorie: subCategory,
        description: document.getElementById("f-description").value.trim(),
        image: currentImageData,
        promo: promoField.checked,
      };

      if (idField.value) {
        const existing = patteLoadProducts().find(p => p.id === Number(idField.value));
        if (existing && !payload.image) payload.image = existing.image || "";
        patteUpdateProduct(Number(idField.value), payload);
        showToast("Produit modifié ✔");
      } else {
        patteAddProduct(payload);
        showToast("Produit ajouté ✔");
      }

      resetForm();
      renderAll();
    });

    /* --- édition depuis le tableau --- */
    window.patteEditProduct = function (id) {
      const p = patteLoadProducts().find(p => p.id === id);
      if (!p) return;
      
      idField.value = p.id;
      document.getElementById("f-nom").value = p.nom || "";
      document.getElementById("f-prix").value = p.prix || 0;
      document.getElementById("f-stock").value = p.stock || 0;
      document.getElementById("f-categorie").value = p.categorie || "";
      
      populateSubcategories(p.sousCategorie || "");
      
      document.getElementById("f-description").value = p.description || "";
      promoField.checked = !!p.promo;
      currentImageData = p.image || "";
      if (p.image) {
        imagePreview.src = p.image;
        imagePreview.style.display = "block";
        imageDropText.textContent = "Photo actuelle (cliquez pour la remplacer)";
      }
      formTitle.textContent = "Modifier le produit";
      submitBtn.textContent = "Enregistrer les modifications";
      cancelBtn.style.display = "inline-flex";
      document.getElementById("form-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    };

    window.patteRemoveProduct = function (id) {
      if (!confirm("Supprimer définitivement ce produit ?")) return;
      patteDeleteProduct(id);
      showToast("Produit supprimé");
      renderAll();
    };

    window.patteQuickPrice = function (id, value) {
      const price = parseFloat(value);
      if (isNaN(price) || price < 0) return;
      patteUpdateProduct(id, { prix: price });
      renderStats();
    };

    window.pattePromoToggle = function (id, value) {
      patteUpdateProduct(id, { promo: value });
    };

    /* --- coordonnées de la boutique --- */
    const csEmail = document.getElementById("cs-email");
    const csTelephone = document.getElementById("cs-telephone");
    const csAdresse = document.getElementById("cs-adresse");
    const contactSettingsForm = document.getElementById("contact-settings-form");

    const currentContact = patteLoadContactInfo();
    csEmail.value = currentContact.email;
    csTelephone.value = currentContact.telephone;
    csAdresse.value = currentContact.adresse;

    contactSettingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      patteSaveContactInfo({
        email: csEmail.value.trim(),
        telephone: csTelephone.value.trim(),
        adresse: csAdresse.value.trim(),
      });
      showToast("Coordonnées mises à jour ✔");
    });

    /* --- historique des commandes --- */
    document.getElementById("clear-orders-btn").addEventListener("click", () => {
      if (!confirm("Supprimer définitivement tout l'historique des commandes ?")) return;
      patteSaveOrders([]);
      renderOrders();
      showToast("Historique des commandes vidé");
    });

    /* --- recherche dans le tableau --- */
    document.getElementById("table-search").addEventListener("input", renderTable);

    /* --- export / import --- */
    document.getElementById("export-btn").addEventListener("click", patteExportJSON);
    document.getElementById("import-input").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      patteImportJSON(file, (success) => {
        if (success) { showToast("Catalogue importé ✔"); renderAll(); }
        else showToast("Erreur : fichier invalide", true);
        e.target.value = "";
      });
    });

    renderAll();
  }

  function renderAll() {
    renderTable();
    renderStats();
    renderOrders();
  }

  function renderOrders() {
    const tbody = document.getElementById("orders-table-body");
    const title = document.getElementById("orders-title");
    const orders = patteLoadOrders().slice().reverse();

    title.textContent = orders.length ? `Commandes (${orders.length})` : "Commandes";
    tbody.innerHTML = "";

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#8b9184;padding:30px;">Aucune commande pour l'instant.</td></tr>`;
      return;
    }

    orders.forEach((o) => {
      const tr = document.createElement("tr");
      const itemsLabel = (o.items || []).map((i) => `${i.qty}× ${escapeHtml(i.nom)}`).join(", ");
      const dateLabel = new Date(o.date).toLocaleString("fr-TN", { dateStyle: "short", timeStyle: "short" });
      const clientLabel = o.clientNom ? escapeHtml(o.clientNom) : "Invité";
      tr.innerHTML = `
        <td><strong>${escapeHtml(o.id)}</strong></td>
        <td>${clientLabel}</td>
        <td>${dateLabel}</td>
        <td>${itemsLabel}</td>
        <td>${patteFormatPrice(o.total)}</td>`;
      tbody.appendChild(tr);
    });
  }

  function renderStats() {
    const products = patteLoadProducts();
    document.getElementById("stat-total").textContent = products.length;
    document.getElementById("stat-rupture").textContent = products.filter(p => Number(p.stock) <= 0).length;
    const valeur = products.reduce((sum, p) => sum + (Number(p.prix) || 0) * (Number(p.stock) || 0), 0);
    document.getElementById("stat-valeur").textContent = patteFormatPrice(valeur);
  }

  function renderTable() {
    const tbody = document.getElementById("table-body");
    const q = document.getElementById("table-search").value.trim().toLowerCase();
    const products = patteLoadProducts().filter(p => !q || (p.nom || "").toLowerCase().includes(q));

    tbody.innerHTML = "";

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#8b9184;padding:30px;">Aucun produit. Utilisez le formulaire à gauche pour en ajouter un.</td></tr>`;
      return;
    }

    products.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.image ? `<img src="${p.image}" alt="">` : `<div style="width:44px;height:44px;border-radius:8px;background:var(--sand);"></div>`}</td>
        <td><strong>${escapeHtml(p.nom)}</strong></td>
        <td>${patteCategoryLabel(p.categorie)}</td>
        <td>${patteSubcategoryLabel(p.categorie, p.sousCategorie)}</td>
        <td>
          <input type="number" class="price-input" min="0" step="0.01" value="${p.prix}" data-id="${p.id}">
        </td>
        <td>${p.stock}</td>
        <td style="text-align:center;">
          <input type="checkbox" class="promo-toggle" data-id="${p.id}" title="Article en promotion" ${p.promo ? "checked" : ""}>
        </td>
        <td>
          <div class="row-actions">
            <button class="icon-btn" title="Modifier" data-edit="${p.id}">${icon("edit")}</button>
            <button class="icon-btn" title="Supprimer" data-del="${p.id}">${icon("trash")}</button>
          </div>
        </td>`;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("[data-edit]").forEach(btn =>
      btn.addEventListener("click", () => window.patteEditProduct(Number(btn.dataset.edit))));
    tbody.querySelectorAll("[data-del]").forEach(btn =>
      btn.addEventListener("click", () => window.patteRemoveProduct(Number(btn.dataset.del))));
    tbody.querySelectorAll(".price-input").forEach(input =>
      input.addEventListener("change", () => window.patteQuickPrice(Number(input.dataset.id), input.value)));
    tbody.querySelectorAll(".promo-toggle").forEach(cb =>
      cb.addEventListener("change", () => window.pattePromoToggle(Number(cb.dataset.id), cb.checked)));
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function showToast(msg, isError) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.style.background = isError ? "#B3401F" : "";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2200);
  }
});

function setIcon(id, name) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = icon(name);
}