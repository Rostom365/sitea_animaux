/* ===========================================================
   compte.js — logique du compte client (compte.html)
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

  /* --- panier --- */
  const cartCountEl = document.getElementById("cart-count");
  function refreshCartCount() {
    cartCountEl.textContent = patteCartCount();
  }
  refreshCartCount();

  /* --- coordonnées de la boutique --- */
  patteRenderContactInfo();
  patteRenderAccountLink();

  window.addEventListener("storage", (e) => {
    if (e.key === PATTE_CART_KEY) refreshCartCount();
    if (e.key === PATTE_CONTACT_KEY) patteRenderContactInfo();
    if (e.key === PATTE_CUSTOMER_SESSION_KEY) render();
  });

  const root = document.getElementById("account-root");

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function renderLoggedOut() {
    root.innerHTML = `
      <div class="account-grid">
        <section class="panel">
          <h2>Connexion</h2>
          <p class="panel-sub">Déjà client ? Connectez-vous pour retrouver vos commandes.</p>
          <form id="login-form">
            <div class="field">
              <label for="li-email">Email</label>
              <input type="text" id="li-email" required>
            </div>
            <div class="field">
              <label for="li-password">Mot de passe</label>
              <input type="text" id="li-password" required>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Se connecter</button>
            </div>
            <p class="error-msg" id="login-error"></p>
          </form>
        </section>

        <section class="panel">
          <h2>Créer un compte</h2>
          <p class="panel-sub">Créez un compte pour suivre vos commandes plus facilement.</p>
          <form id="signup-form">
            <div class="field">
              <label for="su-prénom">Prénom</label>
              <input type="text" id="su-prénom" required>
            </div>
            <div class="field">
              <label for="su-nom">Nom</label>
              <input type="text" id="su-nom" required>
            </div>
            <div class="field">
              <label for="su-email">Email</label>
              <input type="text" id="su-email" required>
            </div>
            <div class="field">
              <label for="su-tel">Téléphone</label>
              <input type="text" id="su-tel" required>
            </div>
            <div class="field">
              <label for="su-naissance" style="display:flex;justify-content:space-between;">
                <span>Date de naissance</span>
                <span style="font-weight:400;color:#8b9184;">Optionnel</span>
              </label>
              <input type="text" id="su-naissance" placeholder="JJ/MM/AAAA">
              <p class="hint">(Ex. : 31/05/1970)</p>
            </div>
            <div class="field">
              <label for="su-password">Mot de passe</label>
              <input type="text" id="su-password" required minlength="4">
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Créer mon compte</button>
            </div>
            <p class="error-msg" id="signup-error"></p>
          </form>
        </section>
      </div>`;

    document.getElementById("login-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("li-email").value.trim();
      const password = document.getElementById("li-password").value;
      const errorEl = document.getElementById("login-error");

      const customer = patteLoginCustomer(email, password);
      if (!customer) {
        errorEl.textContent = "Email ou mot de passe incorrect.";
        return;
      }
      render();
    });

    document.getElementById("signup-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const prenom = document.getElementById("su-prénom").value.trim();
      const nom = document.getElementById("su-nom").value.trim();
      const email = document.getElementById("su-email").value.trim();
      const telephone = document.getElementById("su-tel").value.trim();
      const dateNaissance = document.getElementById("su-naissance").value.trim();
      const password = document.getElementById("su-password").value;
      const errorEl = document.getElementById("signup-error");

      if (dateNaissance && !/^\d{2}\/\d{2}\/\d{4}$/.test(dateNaissance)) {
        errorEl.textContent = "Date de naissance invalide, utilisez le format JJ/MM/AAAA.";
        return;
      }

      try {
        patteRegisterCustomer(prenom, nom, email, telephone, dateNaissance, password);
        render();
      } catch (err) {
        errorEl.textContent = err.message;
      }
    });
  }

  function renderLoggedIn(customer) {
    const myOrders = patteLoadOrders()
      .filter((o) => o.clientEmail && o.clientEmail.toLowerCase() === customer.email.toLowerCase())
      .slice()
      .reverse();

    const ordersRows = myOrders.length
      ? myOrders.map((o) => {
          const itemsLabel = (o.items || []).map((i) => `${i.qty}× ${escapeHtml(i.nom)}`).join(", ");
          const dateLabel = new Date(o.date).toLocaleString("fr-TN", { dateStyle: "short", timeStyle: "short" });
          return `<tr>
            <td><strong>${escapeHtml(o.id)}</strong></td>
            <td>${dateLabel}</td>
            <td>${itemsLabel}</td>
            <td>${patteFormatPrice(o.total)}</td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="4" style="text-align:center;color:#8b9184;padding:30px;">Vous n'avez pas encore passé de commande.</td></tr>`;

    root.innerHTML = `
      <div class="panel account-profile">
        <div>
          <h2>Bonjour, ${escapeHtml(customer.prenom)} ${escapeHtml(customer.nom)}</h2>
          <p class="panel-sub" style="margin-bottom:0;">${escapeHtml(customer.email)}${customer.telephone ? " · " + escapeHtml(customer.telephone) : ""}${customer.dateNaissance ? " · Né(e) le " + escapeHtml(customer.dateNaissance) : ""}</p>
        </div>
        <button class="btn btn-outline btn-small" id="logout-btn">Se déconnecter</button>
      </div>

      <section class="panel" style="margin-top:26px;">
        <h2>Mes commandes</h2>
        <p class="panel-sub">Historique des commandes passées avec ce compte.</p>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr><th>Référence</th><th>Date</th><th>Articles</th><th>Total</th></tr>
            </thead>
            <tbody>${ordersRows}</tbody>
          </table>
        </div>
      </section>

      <section class="panel" style="margin-top:26px;" id="pets-panel">
        <div id="pets-list-view">
          <h2>Mes animaux</h2>
          <p class="panel-sub">Modifiez vos profils animaux ou créez un nouveau profil pour votre animal.</p>
          <div class="pet-grid" id="pet-grid"></div>
        </div>
        <div id="pets-wizard-view" style="display:none;"></div>
      </section>`;

    document.getElementById("logout-btn").addEventListener("click", () => {
      patteLogoutCustomer();
      render();
    });

    initPets(customer);
  }

  const PET_SPECIES = [
    { id: "chien", label: "Chien", emoji: "🐶" },
    { id: "chat", label: "Chat", emoji: "🐱" },
    { id: "rongeur", label: "Rongeur & Co.", emoji: "🐹" },
    { id: "oiseau", label: "Oiseau", emoji: "🐦" },
    { id: "poisson", label: "Poisson", emoji: "🐟" },
  ];

  const FOOD_OPTIONS = [
    { id: "humide", label: "Humide", emoji: "🥫" },
    { id: "sec", label: "Sec", emoji: "🌾" },
    { id: "barf", label: "BARF", emoji: "🍖" },
  ];

  const BREEDS = {
    chien: ["Labrador", "Berger Allemand", "Golden Retriever", "Bulldog Français", "Caniche", "Chihuahua", "Husky Sibérien", "Beagle", "Rottweiler", "Yorkshire", "Autre"],
    chat: ["Européen", "Persan", "Siamois", "Maine Coon", "British Shorthair", "Sphynx", "Ragdoll", "Bengal", "Abyssin", "Autre"],
    rongeur: ["Hamster doré", "Cochon d'Inde", "Lapin nain", "Gerbille", "Chinchilla", "Rat", "Souris", "Autre"],
    oiseau: ["Perruche ondulée", "Canari", "Cacatoès", "Perroquet gris", "Inséparable", "Autre"],
    poisson: ["Poisson rouge", "Combattant", "Guppy", "Discus", "Néon", "Autre"],
  };

  const SPECIAL_NEEDS = [
    "Construction et convalescence", "Dents", "Diabète", "Diététique",
    "Estomac et intestins", "Foie et thyroïde", "Hypoallergéniques", "Régime rénal",
    "Sans céréales", "Sans gluten", "Stress et angoisse", "Stérilisée et castré",
    "Surpoids", "Urinary",
  ];

  const WIZARD_STEPS = ["espece", "nom", "naissance", "race", "sexe", "castre", "nourriture", "besoins", "photo", "confirmation"];

  function speciesEmoji(id) {
    const s = PET_SPECIES.find((sp) => sp.id === id);
    return s ? s.emoji : "🐾";
  }

  function breedsFor(espece) {
    return BREEDS[espece] || ["Autre"];
  }

  function initPets(customer) {
    const listView = document.getElementById("pets-list-view");
    const wizardView = document.getElementById("pets-wizard-view");
    const petGrid = document.getElementById("pet-grid");

    let wizardData = null;
    let wizardStep = 0;
    let isEdit = false;

    function blankPet() {
      return {
        espece: "", nom: "", dateConnue: false, jour: "", mois: "", annee: "",
        estCroise: false, race: "", race2: "", sexe: "", castre: "",
        nourriture: [], besoins: [], _besoinsNone: false, photo: "",
      };
    }

    function openWizard(existingPet) {
      isEdit = !!existingPet;
      wizardData = existingPet
        ? { ...blankPet(), ...existingPet, nourriture: [...(existingPet.nourriture || [])], besoins: [...(existingPet.besoins || [])] }
        : blankPet();
      wizardStep = 0;
      listView.style.display = "none";
      wizardView.style.display = "block";
      renderWizardStep();
    }

    function closeWizard() {
      wizardView.style.display = "none";
      listView.style.display = "block";
      renderPetGrid();
    }

    function wizardHeader(title, showDelete) {
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
          <a href="#" class="btn-ghost" id="wizard-back">← Mes animaux</a>
          ${showDelete ? `<button type="button" class="wizard-delete-link" id="wizard-delete">Supprimer ce profil</button>` : ""}
        </div>
        <h2>${title}</h2>`;
    }

    function wizardActions(opts) {
      opts = opts || {};
      return `
        <div class="form-actions">
          ${opts.showSkip ? `<button type="button" class="btn btn-outline" id="wizard-skip">Plus tard</button>` : ""}
          <button type="button" class="btn btn-primary" id="wizard-next" ${opts.nextDisabled ? "disabled" : ""}>${opts.nextLabel || "Poursuivre"}</button>
        </div>
        <p class="error-msg" id="wizard-error"></p>`;
    }

    function renderWizardStep() {
      const stepId = WIZARD_STEPS[wizardStep];
      wizardView.innerHTML = renderStepHtml(stepId);
      wireStepEvents(stepId);
    }

    function renderStepHtml(stepId) {
      switch (stepId) {
        case "espece":
          return wizardHeader("Quel type d'animal avez-vous ?", isEdit) + `
            <div class="choice-grid">
              ${PET_SPECIES.map((s) => `
                <button type="button" class="choice-card choice-card-photo ${wizardData.espece === s.id ? "selected" : ""}" data-espece="${s.id}">
                  <span class="choice-emoji">${s.emoji}</span><span>${s.label}</span>
                </button>`).join("")}
            </div>
            ${wizardActions({ nextDisabled: !wizardData.espece })}`;

        case "nom":
          return wizardHeader("Quel est le nom de votre animal ?", isEdit) + `
            <div class="wizard-with-art">
              <div class="wizard-art-content">
                <div class="field" style="max-width:360px;">
                  <label for="wiz-nom">Nom</label>
                  <input type="text" id="wiz-nom" value="${escapeHtml(wizardData.nom)}">
                </div>
                ${wizardActions({})}
              </div>
              <div class="wizard-art"><span class="wizard-art-emoji">${speciesEmoji(wizardData.espece)}</span></div>
            </div>`;

        case "naissance":
          return wizardHeader(`Quelle est la date d'anniversaire de ${escapeHtml(wizardData.nom)} ?`, isEdit) + `
            <label class="toggle-row">
              <input type="checkbox" id="wiz-date-known" ${wizardData.dateConnue ? "checked" : ""}>
              <span class="toggle-switch"></span> La date est connue
            </label>
            <div id="wiz-date-fields" style="${wizardData.dateConnue ? "" : "display:none;"}">
              <div class="field-row-3">
                <div class="field"><label>Jour</label><input type="number" id="wiz-jour" min="1" max="31" value="${escapeHtml(wizardData.jour)}"></div>
                <div class="field"><label>Mois</label><input type="number" id="wiz-mois" min="1" max="12" value="${escapeHtml(wizardData.mois)}"></div>
                <div class="field"><label>Année</label><input type="number" id="wiz-annee" value="${escapeHtml(wizardData.annee)}"></div>
              </div>
            </div>
            ${wizardActions({ showSkip: true })}`;

        case "race": {
          const breedOptions = (selected) => `
            <option value="">Sélectionnez une race</option>
            ${breedsFor(wizardData.espece).map((b) => `<option value="${escapeHtml(b)}" ${selected === b ? "selected" : ""}>${escapeHtml(b)}</option>`).join("")}`;
          return wizardHeader(`Quelle est la race de ${escapeHtml(wizardData.nom)} ?`, isEdit) + `
            <div class="wizard-with-art">
              <div class="wizard-art-content">
                <label class="toggle-row">
                  <input type="checkbox" id="wiz-croise" ${wizardData.estCroise ? "checked" : ""}>
                  <span class="toggle-switch"></span> ${escapeHtml(wizardData.nom)} est un croisé
                </label>
                <div class="field" style="max-width:360px;">
                  <label>Race</label>
                  <select id="wiz-race1">${breedOptions(wizardData.race)}</select>
                </div>
                <div class="field" id="wiz-race2-wrap" style="max-width:360px;${wizardData.estCroise ? "" : "display:none;"}">
                  <label>Race</label>
                  <select id="wiz-race2">${breedOptions(wizardData.race2)}</select>
                </div>
                ${wizardActions({ showSkip: true })}
              </div>
              <div class="wizard-art"><span class="wizard-art-emoji">${speciesEmoji(wizardData.espece)}</span></div>
            </div>`;
        }

        case "sexe":
          return wizardHeader(`Quel est le sexe de ${escapeHtml(wizardData.nom)} ?`, isEdit) + `
            <div class="choice-grid choice-grid-2">
              <button type="button" class="choice-card ${wizardData.sexe === "male" ? "selected" : ""}" data-sexe="male">${icon("male")}<span>Mâle</span></button>
              <button type="button" class="choice-card ${wizardData.sexe === "femelle" ? "selected" : ""}" data-sexe="femelle">${icon("female")}<span>Femelle</span></button>
            </div>
            ${wizardActions({ showSkip: true })}`;

        case "castre": {
          const sexIcon = wizardData.sexe === "male" ? "male" : wizardData.sexe === "femelle" ? "female" : "unknown";
          return wizardHeader(`${escapeHtml(wizardData.nom)} est-il castré / stérilisé ?`, isEdit) + `
            <div class="choice-grid choice-grid-3">
              <button type="button" class="choice-card ${wizardData.castre === "non" ? "selected" : ""}" data-castre="non">${icon(sexIcon)}<span>Non</span></button>
              <button type="button" class="choice-card ${wizardData.castre === "inconnu" ? "selected" : ""}" data-castre="inconnu">${icon("unknown")}<span>Ne sais pas</span></button>
              <button type="button" class="choice-card ${wizardData.castre === "oui" ? "selected" : ""}" data-castre="oui">${icon("neutered")}<span>Oui</span></button>
            </div>
            ${wizardActions({ showSkip: true })}`;
        }

        case "nourriture":
          return wizardHeader(`Quelle nourriture ${escapeHtml(wizardData.nom)} préfère-t-il ?`, isEdit) + `
            <p class="panel-sub">Sélections multiples possibles</p>
            <div class="choice-grid choice-grid-3">
              ${FOOD_OPTIONS.map((f) => `
                <button type="button" class="choice-card choice-card-photo ${wizardData.nourriture.includes(f.id) ? "selected" : ""}" data-food="${f.id}">
                  <span class="choice-emoji">${f.emoji}</span><span>${f.label}</span>
                </button>`).join("")}
            </div>
            ${wizardActions({ showSkip: true })}`;

        case "besoins":
          return wizardHeader(`${escapeHtml(wizardData.nom)} a-t-il besoin d'une alimentation spéciale ?`, isEdit) + `
            <div class="checkbox-grid">
              <label class="checkbox-row checkbox-row-none">
                <input type="checkbox" id="wiz-need-none"> <strong>Aucun</strong>
              </label>
              ${SPECIAL_NEEDS.map((n) => `
                <label class="checkbox-row">
                  <input type="checkbox" value="${escapeHtml(n)}" ${wizardData.besoins.includes(n) ? "checked" : ""}> ${escapeHtml(n)}
                </label>`).join("")}
            </div>
            ${wizardActions({ showSkip: true })}`;

        case "photo":
          return wizardHeader(`Téléchargez votre photo préférée de ${escapeHtml(wizardData.nom)}`, isEdit) + `
            <p class="panel-sub">Téléchargez un fichier PNG ou JPEG.</p>
            <label class="pet-photo-drop" id="wiz-photo-drop">
              <input type="file" id="wiz-photo-input" accept="image/png,image/jpeg" style="display:none;">
              ${wizardData.photo
                ? `<img src="${wizardData.photo}" class="pet-photo-preview-wizard">`
                : `<span class="pet-photo-drop-icon">+</span><span>Télécharger la photo</span>`}
            </label>
            ${wizardActions({ showSkip: true })}`;

        case "confirmation":
          return `
            <h2>${isEdit ? "Profil mis à jour !" : `Bienvenue ${escapeHtml(wizardData.nom)} !`}</h2>
            <p>${isEdit
              ? `Les informations de ${escapeHtml(wizardData.nom)} ont été mises à jour.`
              : `Le profil de ${escapeHtml(wizardData.nom)} a été créé. Vous pouvez à tout moment ajouter ou modifier des photos, des caractéristiques et d'autres détails.`}</p>
            <div class="wizard-confirm-photo">
              ${wizardData.photo ? `<img src="${wizardData.photo}" alt="">` : `<span class="pet-avatar-emoji">${speciesEmoji(wizardData.espece)}</span>`}
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-primary" id="wizard-done">Terminé</button>
            </div>`;

        default:
          return "";
      }
    }

    function wireStepEvents(stepId) {
      const backLink = document.getElementById("wizard-back");
      if (backLink) backLink.addEventListener("click", (e) => { e.preventDefault(); closeWizard(); });

      const deleteBtn = document.getElementById("wizard-delete");
      if (deleteBtn) deleteBtn.addEventListener("click", () => {
        if (!confirm("Supprimer définitivement cette fiche animal ?")) return;
        patteDeletePet(wizardData.id);
        closeWizard();
      });

      const nextBtn = document.getElementById("wizard-next");
      const skipBtn = document.getElementById("wizard-skip");
      const errorEl = document.getElementById("wizard-error");

      switch (stepId) {
        case "espece":
          wizardView.querySelectorAll("[data-espece]").forEach((btn) =>
            btn.addEventListener("click", () => { wizardData.espece = btn.dataset.espece; renderWizardStep(); }));
          nextBtn.addEventListener("click", () => {
            if (!wizardData.espece) return;
            wizardStep++;
            renderWizardStep();
          });
          break;

        case "nom":
          nextBtn.addEventListener("click", () => {
            const val = document.getElementById("wiz-nom").value.trim();
            if (!val) {
              errorEl.textContent = "Merci d'indiquer un nom.";
              return;
            }
            wizardData.nom = val;
            wizardStep++;
            renderWizardStep();
          });
          break;

        case "naissance": {
          const dateKnown = document.getElementById("wiz-date-known");
          const dateFields = document.getElementById("wiz-date-fields");
          dateKnown.addEventListener("change", () => {
            dateFields.style.display = dateKnown.checked ? "" : "none";
          });
          function saveNaissance() {
            wizardData.dateConnue = dateKnown.checked;
            if (dateKnown.checked) {
              wizardData.jour = document.getElementById("wiz-jour").value.trim();
              wizardData.mois = document.getElementById("wiz-mois").value.trim();
              wizardData.annee = document.getElementById("wiz-annee").value.trim();
            } else {
              wizardData.jour = ""; wizardData.mois = ""; wizardData.annee = "";
            }
          }
          nextBtn.addEventListener("click", () => { saveNaissance(); wizardStep++; renderWizardStep(); });
          if (skipBtn) skipBtn.addEventListener("click", () => {
            wizardData.dateConnue = false; wizardData.jour = ""; wizardData.mois = ""; wizardData.annee = "";
            wizardStep++; renderWizardStep();
          });
          break;
        }

        case "race": {
          const croiseBox = document.getElementById("wiz-croise");
          const race2Wrap = document.getElementById("wiz-race2-wrap");
          croiseBox.addEventListener("change", () => {
            race2Wrap.style.display = croiseBox.checked ? "" : "none";
          });
          function saveRace() {
            wizardData.estCroise = croiseBox.checked;
            wizardData.race = document.getElementById("wiz-race1").value.trim();
            wizardData.race2 = croiseBox.checked ? document.getElementById("wiz-race2").value.trim() : "";
          }
          nextBtn.addEventListener("click", () => { saveRace(); wizardStep++; renderWizardStep(); });
          if (skipBtn) skipBtn.addEventListener("click", () => { wizardStep++; renderWizardStep(); });
          break;
        }

        case "sexe":
          wizardView.querySelectorAll("[data-sexe]").forEach((btn) =>
            btn.addEventListener("click", () => { wizardData.sexe = btn.dataset.sexe; renderWizardStep(); }));
          nextBtn.addEventListener("click", () => { wizardStep++; renderWizardStep(); });
          if (skipBtn) skipBtn.addEventListener("click", () => { wizardStep++; renderWizardStep(); });
          break;

        case "castre":
          wizardView.querySelectorAll("[data-castre]").forEach((btn) =>
            btn.addEventListener("click", () => { wizardData.castre = btn.dataset.castre; renderWizardStep(); }));
          nextBtn.addEventListener("click", () => { wizardStep++; renderWizardStep(); });
          if (skipBtn) skipBtn.addEventListener("click", () => { wizardStep++; renderWizardStep(); });
          break;

        case "nourriture":
          wizardView.querySelectorAll("[data-food]").forEach((btn) =>
            btn.addEventListener("click", () => {
              const val = btn.dataset.food;
              const idx = wizardData.nourriture.indexOf(val);
              if (idx === -1) wizardData.nourriture.push(val);
              else wizardData.nourriture.splice(idx, 1);
              renderWizardStep();
            }));
          nextBtn.addEventListener("click", () => { wizardStep++; renderWizardStep(); });
          if (skipBtn) skipBtn.addEventListener("click", () => { wizardStep++; renderWizardStep(); });
          break;

        case "besoins": {
          const noneBox = document.getElementById("wiz-need-none");
          const needBoxes = Array.from(wizardView.querySelectorAll(".checkbox-row input")).filter((el) => el !== noneBox);

          noneBox.checked = wizardData.besoins.length === 0 && wizardData._besoinsNone;
          noneBox.addEventListener("change", () => {
            if (noneBox.checked) needBoxes.forEach((b) => { b.checked = false; });
          });
          needBoxes.forEach((b) =>
            b.addEventListener("change", () => { if (b.checked) noneBox.checked = false; }));

          nextBtn.addEventListener("click", () => {
            wizardData._besoinsNone = noneBox.checked;
            wizardData.besoins = noneBox.checked ? [] : needBoxes.filter((b) => b.checked).map((b) => b.value);
            wizardStep++;
            renderWizardStep();
          });
          if (skipBtn) skipBtn.addEventListener("click", () => { wizardStep++; renderWizardStep(); });
          break;
        }

        case "photo": {
          const dropInput = document.getElementById("wiz-photo-input");
          const dropLabel = document.getElementById("wiz-photo-drop");
          dropLabel.addEventListener("click", (e) => { if (e.target !== dropInput) dropInput.click(); });
          dropInput.addEventListener("change", () => {
            const file = dropInput.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => { wizardData.photo = reader.result; renderWizardStep(); };
            reader.readAsDataURL(file);
          });
          nextBtn.addEventListener("click", () => { savePet(); wizardStep++; renderWizardStep(); });
          if (skipBtn) skipBtn.addEventListener("click", () => { savePet(); wizardStep++; renderWizardStep(); });
          break;
        }

        case "confirmation":
          document.getElementById("wizard-done").addEventListener("click", closeWizard);
          break;
      }
    }

    function savePet() {
      const payload = { ...wizardData };
      delete payload.id;
      if (isEdit) {
        patteUpdatePet(wizardData.id, payload);
      } else {
        payload.customerId = customer.id;
        const saved = patteAddPet(payload);
        wizardData.id = saved.id;
        isEdit = true;
      }
    }

    function renderPetGrid() {
      const pets = pattePetsForCustomer(customer.id);
      petGrid.innerHTML = "";

      pets.forEach((pet) => {
        const card = document.createElement("div");
        card.className = "pet-avatar-card";
        card.innerHTML = `
          <button type="button" class="pet-avatar-delete" title="Supprimer ${escapeHtml(pet.nom)}" data-del-pet="${pet.id}">${icon("trash")}</button>
          <div class="pet-avatar">${pet.photo ? `<img src="${pet.photo}" alt="${escapeHtml(pet.nom)}">` : `<span class="pet-avatar-emoji">${speciesEmoji(pet.espece)}</span>`}</div>
          <div class="pet-avatar-name">${escapeHtml(pet.nom)}</div>`;
        card.addEventListener("click", () => openWizard(pet));
        card.querySelector("[data-del-pet]").addEventListener("click", (e) => {
          e.stopPropagation();
          if (!confirm(`Supprimer définitivement la fiche de ${pet.nom} ?`)) return;
          patteDeletePet(pet.id);
          renderPetGrid();
        });
        petGrid.appendChild(card);
      });

      const addCard = document.createElement("div");
      addCard.className = "pet-avatar-card pet-avatar-add";
      addCard.innerHTML = `
        <div class="pet-avatar pet-avatar-add-icon">+</div>
        <div class="pet-avatar-name">Ajouter un nouvel animal</div>`;
      addCard.addEventListener("click", () => openWizard(null));
      petGrid.appendChild(addCard);
    }

    renderPetGrid();
  }

  function render() {
    const customer = patteCurrentCustomer();
    patteRenderAccountLink();
    if (customer) {
      renderLoggedIn(customer);
    } else {
      renderLoggedOut();
    }
  }

  render();
});

function setIcon(id, name) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = icon(name);
}
