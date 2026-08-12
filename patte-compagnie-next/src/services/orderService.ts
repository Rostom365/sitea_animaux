export interface OrderItem {
  productId: string;
  productName: string;
  prix: number;
  quantite: number;
  subTotal: number;
}

export interface Order {
  id?: string;
  clientId: string;
  clientName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

export async function getOrders(): Promise<Order[]> {
  const res = await fetch("/api/orders");
  if (!res.ok) throw new Error("Erreur lors du chargement des commandes");
  return res.json();
}

export async function getOrder(id: string): Promise<Order> {
  const res = await fetch(`/api/orders/${id}`);
  if (!res.ok) throw new Error("Commande introuvable");
  return res.json();
}

export async function getOrdersByClient(clientId: string): Promise<Order[]> {
  const res = await fetch(`/api/orders?clientId=${clientId}`);
  if (!res.ok) throw new Error("Erreur lors du chargement des commandes du client");
  return res.json();
}

export async function addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error("Erreur lors de la création de la commande");
  return res.json();
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Erreur lors de la mise à jour du statut");
}

export async function deleteOrder(id: string): Promise<void> {
  const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur lors de la suppression de la commande");
}

async function getOrderStats(): Promise<{ totalRevenue: number; pendingCount: number; deliveredCount: number }> {
  const res = await fetch("/api/orders/stats");
  if (!res.ok) throw new Error("Erreur lors du chargement des statistiques");
  return res.json();
}

export async function getTotalRevenue(): Promise<number> {
  const stats = await getOrderStats();
  return stats.totalRevenue;
}

export async function getPendingOrdersCount(): Promise<number> {
  const stats = await getOrderStats();
  return stats.pendingCount;
}

export async function getDeliveredOrdersCount(): Promise<number> {
  const stats = await getOrderStats();
  return stats.deliveredCount;
}
