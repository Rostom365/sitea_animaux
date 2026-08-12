export interface SpeciesOption {
  id: string;
  label: string;
  emoji: string;
}

export const SPECIES: SpeciesOption[] = [
  { id: "chien", label: "Chien", emoji: "🐶" },
  { id: "chat", label: "Chat", emoji: "🐱" },
  { id: "rongeur", label: "Rongeur & Co.", emoji: "🐹" },
  { id: "oiseau", label: "Oiseau", emoji: "🐦" },
  { id: "poisson", label: "Poisson", emoji: "🐠" },
];

export function speciesEmoji(id: string): string {
  return SPECIES.find((s) => s.id === id)?.emoji || "🐾";
}

export function speciesLabel(id: string): string {
  return SPECIES.find((s) => s.id === id)?.label || id;
}

export const RACES: Record<string, string[]> = {
  chien: [
    "Labrador", "Berger Allemand", "Golden Retriever", "Bulldog", "Beagle",
    "Caniche", "Rottweiler", "Yorkshire", "Boxer", "Teckel", "Chihuahua",
    "Husky Sibérien", "Cocker Spaniel", "Shih Tzu", "Jack Russell", "Autre",
  ],
  chat: [
    "Européen", "Persan", "Siamois", "Maine Coon", "British Shorthair",
    "Ragdoll", "Sphynx", "Bengal", "Abyssin", "Autre",
  ],
  rongeur: [
    "Hamster doré", "Hamster nain", "Lapin nain", "Lapin bélier",
    "Cochon d'Inde", "Gerbille", "Chinchilla", "Autre",
  ],
  oiseau: [
    "Canari", "Perruche", "Perroquet", "Inséparable", "Calopsitte",
    "Cacatoès", "Mainate", "Autre",
  ],
  poisson: [
    "Poisson rouge", "Combattant", "Guppy", "Discus", "Néon", "Koï", "Autre",
  ],
};

export const NOURRITURE_TYPES = [
  { id: "humide", label: "Humide", emoji: "🥫" },
  { id: "sec", label: "Sec", emoji: "🌾" },
  { id: "barf", label: "BARF", emoji: "🍖" },
];

export const BESOINS_SPECIAUX = [
  "Construction et convalescence",
  "Dents",
  "Diabète",
  "Diététique",
  "Estomac et intestins",
  "Foie et thyroïde",
  "Hypoallergéniques",
  "Régime rénal",
  "Sans céréales",
  "Sans gluten",
  "Stress et angoisse",
  "Stérilisée et castré",
  "Urinary",
];
