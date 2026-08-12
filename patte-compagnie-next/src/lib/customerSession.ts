export interface CustomerSession {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  dateNaissance?: string;
}

const SESSION_KEY = "patte_client_session";
export const SESSION_UPDATED_EVENT = "patte-session-updated";

export function setCustomerSession(customer: CustomerSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(customer));
  window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
}

export function getCustomerSession(): CustomerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCustomerSession() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
}
