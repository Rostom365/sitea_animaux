export interface Client {
  id?: string;
  prenom?: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  dateNaissance?: string;
  createdAt: string;
}

export async function getClients(): Promise<Client[]> {
  const res = await fetch("/api/clients");
  if (!res.ok) throw new Error("Erreur lors du chargement des clients");
  return res.json();
}

export async function addClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  const res = await fetch("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
  });
  if (!res.ok) throw new Error("Erreur lors de l'ajout du client");
  return res.json();
}

export async function getClient(id: string): Promise<Client> {
  const res = await fetch(`/api/clients/${id}`);
  if (!res.ok) throw new Error("Client introuvable");
  return res.json();
}

export async function deleteClient(id: string): Promise<void> {
  const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur lors de la suppression du client");
}

async function getClientStats(clientId: string): Promise<{ orderCount: number; totalSpent: number }> {
  const res = await fetch(`/api/clients/${clientId}/stats`);
  if (!res.ok) throw new Error("Erreur lors du chargement des statistiques du client");
  return res.json();
}

export async function getClientOrderCount(clientId: string): Promise<number> {
  const stats = await getClientStats(clientId);
  return stats.orderCount;
}

export async function getClientTotalSpent(clientId: string): Promise<number> {
  const stats = await getClientStats(clientId);
  return stats.totalSpent;
}

export interface RegisterInput {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  dateNaissance?: string;
  password: string;
}

export async function registerCustomer(input: RegisterInput): Promise<Client> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription");
  return data;
}

export async function loginCustomer(email: string, password: string): Promise<Client> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur de connexion");
  return data;
}
