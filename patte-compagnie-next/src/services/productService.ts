export interface Product {
  id?: string;
  nom: string;
  prix: number;
  stock: number;
  categorie: string;
  sousCategorie: string;
  description: string;
  image: string;
  promo: boolean;
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Erreur lors du chargement des produits");
  return res.json();
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Erreur lors de l'ajout du produit");
  return res.json();
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<void> {
  const res = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Erreur lors de la mise à jour du produit");
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur lors de la suppression du produit");
}
