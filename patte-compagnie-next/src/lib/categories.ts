export interface Category {
  id: string;
  label: string;
}

export interface Subcategory {
  id: string;
  label: string;
}

export const CATEGORIES: Category[] = [
  { id: "chien", label: "Chiens" },
  { id: "chat", label: "Chats" },
  { id: "oiseau", label: "Oiseaux" },
  { id: "rongeur", label: "Rongeurs" },
  { id: "poisson", label: "Poissons" },
];

export const SUBCATEGORIES: Record<string, Subcategory[]> = {
  chien: [
    { id: "nourriture", label: "Nourriture" },
    { id: "hygiene-sante", label: "Hygiène & Santé" },
    { id: "litieres", label: "Litières" },
    { id: "accessoires", label: "Accessoires" },
    { id: "friandises", label: "Friandises" },
  ],
  chat: [
    { id: "nourriture", label: "Nourriture" },
    { id: "hygiene-sante", label: "Hygiène & Santé" },
    { id: "litieres", label: "Litières" },
    { id: "accessoires", label: "Accessoires" },
    { id: "friandises", label: "Friandises" },
  ],
  oiseau: [
    { id: "nourriture", label: "Nourriture" },
    { id: "hygiene-sante", label: "Hygiène & Santé" },
    { id: "litieres", label: "Litières" },
    { id: "accessoires", label: "Accessoires" },
    { id: "friandises", label: "Friandises" },
  ],
  rongeur: [
    { id: "nourriture", label: "Nourriture" },
    { id: "hygiene-sante", label: "Hygiène & Santé" },
    { id: "litieres", label: "Litières" },
    { id: "accessoires", label: "Accessoires" },
    { id: "friandises", label: "Friandises" },
  ],
  poisson: [
    { id: "nourriture", label: "Nourriture" },
    { id: "hygiene-sante", label: "Hygiène & Santé" },
    { id: "litieres", label: "Litières" },
    { id: "accessoires", label: "Accessoires" },
    { id: "friandises", label: "Friandises" },
  ],
};

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label || id;
}

export function subcategoryLabel(catId: string, subId: string): string {
  return (SUBCATEGORIES[catId] || []).find((s) => s.id === subId)?.label || subId;
}

export function formatPrice(value: number): string {
  const n = Number(value) || 0;
  return n.toLocaleString("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TND";
}
