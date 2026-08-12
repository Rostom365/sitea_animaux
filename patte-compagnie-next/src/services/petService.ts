export interface Pet {
  id?: string;
  customerId: string;
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
  createdAt?: string;
}

export async function getPets(customerId: string): Promise<Pet[]> {
  const res = await fetch(`/api/pets?customerId=${customerId}`);
  if (!res.ok) throw new Error("Erreur lors du chargement des animaux");
  return res.json();
}

export async function addPet(pet: Omit<Pet, "id" | "createdAt">): Promise<Pet> {
  const res = await fetch("/api/pets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pet),
  });
  if (!res.ok) throw new Error("Erreur lors de l'ajout de l'animal");
  return res.json();
}

export async function deletePet(id: string): Promise<void> {
  const res = await fetch(`/api/pets/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur lors de la suppression de l'animal");
}

export async function uploadPetPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/pets/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Erreur lors de l'envoi de la photo");
  const data = await res.json();
  return data.url;
}
