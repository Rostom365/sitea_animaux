export interface PendingProductChange {
  id: string;
  prix?: number;
  stock?: number;
  ancienPrix?: number;
}

const QUEUE_KEY = "patte_offline_queue";

export function getPendingChanges(): PendingProductChange[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: PendingProductChange[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function queueProductChange(id: string, changes: Partial<Pick<PendingProductChange, "prix" | "stock" | "ancienPrix">>) {
  const queue = getPendingChanges();
  const existing = queue.find((c) => c.id === id);
  if (existing) {
    Object.assign(existing, changes);
  } else {
    queue.push({ id, ...changes });
  }
  saveQueue(queue);
}

export function clearPendingField(id: string, field: "prix" | "stock" | "ancienPrix") {
  const queue = getPendingChanges();
  for (const c of queue) {
    if (c.id === id) delete c[field];
  }
  saveQueue(queue.filter((c) => c.prix !== undefined || c.stock !== undefined || c.ancienPrix !== undefined));
}

export function removePendingChange(id: string) {
  saveQueue(getPendingChanges().filter((c) => c.id !== id));
}

export function getPendingCount(): number {
  return getPendingChanges().length;
}
