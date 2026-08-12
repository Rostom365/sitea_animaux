"use client";

import { useState } from "react";
import { addPet, uploadPetPhoto } from "@/services/petService";
import { SPECIES, RACES, NOURRITURE_TYPES, BESOINS_SPECIAUX, speciesEmoji } from "@/lib/petData";

interface PetWizardProps {
  customerId: string;
  onDone: () => void;
  onCancel: () => void;
}

interface WizardData {
  espece: string;
  nom: string;
  dateNaissanceConnue: boolean;
  dateNaissance: string;
  estCroise: boolean;
  race: string;
  sexe: string;
  sterilise: string;
  nourriture: string[];
  besoinsSpeciaux: string[];
  photo: string;
}

const STEP_COUNT = 10;

export default function PetWizard({ customerId, onDone, onCancel }: PetWizardProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<WizardData>({
    espece: "",
    nom: "",
    dateNaissanceConnue: false,
    dateNaissance: "",
    estCroise: false,
    race: "",
    sexe: "",
    sterilise: "",
    nourriture: [],
    besoinsSpeciaux: [],
    photo: "",
  });

  const update = (patch: Partial<WizardData>) => setData((prev) => ({ ...prev, ...patch }));
  const goNext = () => setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  const goBack = () => (step === 0 ? onCancel() : setStep((s) => s - 1));

  const toggleInArray = (field: "nourriture" | "besoinsSpeciaux", value: string) => {
    setData((prev) => {
      const arr = prev[field];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [field]: next };
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadPetPhoto(file);
      update({ photo: url });
    } catch {
      alert("L'envoi de la photo a échoué.");
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await addPet({ customerId, ...data });
      onDone();
    } catch {
      alert("Erreur lors de l'enregistrement de l'animal.");
      setSaving(false);
    }
  };

  const races = RACES[data.espece] || [];

  return (
    <div className="panel">
      <a className="wizard-back" href="#" onClick={(e) => { e.preventDefault(); goBack(); }}>
        ← Mes animaux
      </a>

      {step === 0 && (
        <>
          <h2>Quel type d&apos;animal avez-vous ?</h2>
          <div className="choice-grid">
            {SPECIES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`choice-card choice-card-photo ${data.espece === s.id ? "selected" : ""}`}
                onClick={() => { update({ espece: s.id }); goNext(); }}
              >
                <span className="choice-emoji">{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h2>Quel est le nom de votre animal ?</h2>
          <div className="wizard-art">
            <span className="wizard-art-emoji">{speciesEmoji(data.espece)}</span>
          </div>
          <div className="field">
            <label htmlFor="pet-nom">Nom</label>
            <input
              type="text"
              id="pet-nom"
              value={data.nom}
              onChange={(e) => update({ nom: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" disabled={!data.nom.trim()} onClick={goNext}>Poursuivre</button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Quelle est la date d&apos;anniversaire de {data.nom} ?</h2>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={data.dateNaissanceConnue}
              onChange={(e) => update({ dateNaissanceConnue: e.target.checked })}
            />
            <span className="toggle-switch"></span>
            La date est connue
          </label>
          {data.dateNaissanceConnue && (
            <div className="field">
              <label htmlFor="pet-date">Date de naissance</label>
              <input
                type="text"
                id="pet-date"
                placeholder="JJ/MM/AAAA"
                value={data.dateNaissance}
                onChange={(e) => update({ dateNaissance: e.target.value })}
              />
            </div>
          )}
          <div className="form-actions">
            <button className="btn btn-outline" onClick={goNext}>Plus tard</button>
            <button className="btn btn-primary" onClick={goNext}>Poursuivre</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2>Quelle est la race de {data.nom} ?</h2>
          <div className="wizard-art">
            <span className="wizard-art-emoji">{speciesEmoji(data.espece)}</span>
          </div>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={data.estCroise}
              onChange={(e) => update({ estCroise: e.target.checked, race: "" })}
            />
            <span className="toggle-switch"></span>
            {data.nom || "Votre animal"} est un croisé
          </label>
          {!data.estCroise && (
            <div className="field">
              <label htmlFor="pet-race">Race</label>
              <select id="pet-race" value={data.race} onChange={(e) => update({ race: e.target.value })}>
                <option value="">Sélectionnez une race</option>
                {races.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-actions">
            <button className="btn btn-outline" onClick={goNext}>Plus tard</button>
            <button className="btn btn-primary" onClick={goNext}>Poursuivre</button>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <h2>Quel est le sexe de {data.nom} ?</h2>
          <div className="choice-grid choice-grid-2">
            {[{ id: "male", label: "Mâle", symbol: "♂" }, { id: "femelle", label: "Femelle", symbol: "♀" }].map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`choice-card ${data.sexe === opt.id ? "selected" : ""}`}
                onClick={() => update({ sexe: opt.id })}
              >
                <span className="choice-emoji" style={{ fontSize: "2rem" }}>{opt.symbol}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={goNext}>Plus tard</button>
            <button className="btn btn-primary" onClick={goNext}>Poursuivre</button>
          </div>
        </>
      )}

      {step === 5 && (
        <>
          <h2>{data.nom} est-il castré / stérilisé ?</h2>
          <div className="choice-grid choice-grid-3">
            {[{ id: "non", label: "Non" }, { id: "ne_sais_pas", label: "Ne sais pas" }, { id: "oui", label: "Oui" }].map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`choice-card ${data.sterilise === opt.id ? "selected" : ""}`}
                onClick={() => update({ sterilise: opt.id })}
              >
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={goNext}>Plus tard</button>
            <button className="btn btn-primary" onClick={goNext}>Poursuivre</button>
          </div>
        </>
      )}

      {step === 6 && (
        <>
          <h2>Quelle nourriture {data.nom} préfère-t-il ?</h2>
          <p className="panel-sub">Sélections multiples possibles</p>
          <div className="choice-grid choice-grid-3">
            {NOURRITURE_TYPES.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`choice-card ${data.nourriture.includes(n.id) ? "selected" : ""}`}
                onClick={() => toggleInArray("nourriture", n.id)}
              >
                <span className="choice-emoji">{n.emoji}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={goNext}>Plus tard</button>
            <button className="btn btn-primary" onClick={goNext}>Poursuivre</button>
          </div>
        </>
      )}

      {step === 7 && (
        <>
          <h2>{data.nom} a-t-il besoin d&apos;une alimentation spéciale ?</h2>
          <label className="checkbox-row checkbox-row-none">
            <input
              type="checkbox"
              checked={data.besoinsSpeciaux.length === 0}
              onChange={() => update({ besoinsSpeciaux: [] })}
            />
            <strong>Aucun</strong>
          </label>
          <div className="checkbox-grid">
            {BESOINS_SPECIAUX.map((b) => (
              <label key={b} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={data.besoinsSpeciaux.includes(b)}
                  onChange={() => toggleInArray("besoinsSpeciaux", b)}
                />
                {b}
              </label>
            ))}
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={goNext}>Plus tard</button>
            <button className="btn btn-primary" onClick={goNext}>Poursuivre</button>
          </div>
        </>
      )}

      {step === 8 && (
        <>
          <h2>Téléchargez votre photo préférée de {data.nom}</h2>
          <p className="panel-sub">Téléchargez un fichier PNG ou JPEG.</p>
          <label className="pet-photo-drop">
            {data.photo ? (
              <img src={data.photo} alt={data.nom} className="pet-photo-preview-wizard" />
            ) : (
              <>
                <span className="pet-photo-drop-icon">+</span>
                <span>Télécharger la photo</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
          </label>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={goNext}>Plus tard</button>
            <button className="btn btn-primary" onClick={goNext}>Poursuivre</button>
          </div>
        </>
      )}

      {step === 9 && (
        <>
          <h2>Profil mis à jour !</h2>
          <p className="panel-sub">Les informations de {data.nom} ont été mises à jour.</p>
          <div className="wizard-confirm-photo">
            {data.photo ? <img src={data.photo} alt={data.nom} /> : <span className="wizard-art-emoji">{speciesEmoji(data.espece)}</span>}
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" disabled={saving} onClick={handleFinish}>
              {saving ? "Enregistrement…" : "Terminé"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
