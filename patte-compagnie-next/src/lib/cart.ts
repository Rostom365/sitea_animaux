export interface CartItem {
  id: string;
  nom: string;
  prix: number;
  image: string;
  qty: number;
}

const CART_KEY = "patte_panier";
export const CART_UPDATED_EVENT = "patte-cart-updated";

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function addToCart(product: { id?: string; nom: string; prix: number; image: string; stock: number }, qty = 1) {
  if (!product.id) return;
  const cart = loadCart();
  const existing = cart.find((item) => item.id === product.id);
  const stock = Number(product.stock) || 0;

  if (existing) {
    existing.qty = stock > 0 ? Math.min(existing.qty + qty, stock) : existing.qty + qty;
  } else {
    cart.push({
      id: product.id,
      nom: product.nom,
      prix: Number(product.prix) || 0,
      image: product.image || "",
      qty: stock > 0 ? Math.min(qty, stock) : qty,
    });
  }

  saveCart(cart);
  return cart;
}

export function getCartCount(): number {
  return loadCart().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
}

export function getCartTotal(): number {
  return loadCart().reduce((sum, item) => sum + (Number(item.prix) || 0) * (Number(item.qty) || 0), 0);
}

export function updateQty(id: string, qty: number) {
  const cart = loadCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  if (qty <= 0) {
    saveCart(cart.filter((i) => i.id !== id));
    return;
  }
  item.qty = qty;
  saveCart(cart);
}

export function removeFromCart(id: string) {
  saveCart(loadCart().filter((i) => i.id !== id));
}

export function clearCart() {
  saveCart([]);
}
