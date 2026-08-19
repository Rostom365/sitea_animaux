import { createClient, type Client } from "@libsql/client";
import path from "node:path";
import fs from "node:fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Falls back to a local file when TURSO_DATABASE_URL isn't set, so the app
// keeps working in local dev without a Turso account. Point both env vars
// at a real Turso database (libsql://...) to switch to hosted storage —
// no other code changes needed, since @libsql/client speaks both.
const url = process.env.TURSO_DATABASE_URL || `file:${path.join(dataDir, "patte.db")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

declare global {
  var __patteDb: Client | undefined;
  var __patteDbReady: Promise<void> | undefined;
}

const db: Client = globalThis.__patteDb ?? createClient(authToken ? { url, authToken } : { url });
globalThis.__patteDb = db;

async function tableSql(name: string): Promise<string> {
  const res = await db.execute({
    sql: "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?",
    args: [name],
  });
  return (res.rows[0]?.sql as string) ?? "";
}

// libsql can't ALTER TABLE to add a foreign key, so existing databases
// created before these constraints were added get rebuilt in place,
// preserving all rows. Each check is idempotent (skips once migrated).

async function migrateOrdersForeignKey() {
  if ((await tableSql("orders")).includes("REFERENCES clients")) return;
  await db.executeMultiple(`
    ALTER TABLE orders RENAME TO orders_old;

    CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientId TEXT NOT NULL REFERENCES clients(id),
      clientName TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    INSERT INTO orders (id, clientId, clientName, total, status, createdAt, updatedAt)
      SELECT id, clientId, clientName, total, status, createdAt, updatedAt FROM orders_old;

    DROP TABLE orders_old;
  `);
}

async function migrateOrderItemsForeignKey() {
  if ((await tableSql("order_items")).includes("REFERENCES products")) return;
  await db.executeMultiple(`
    ALTER TABLE order_items RENAME TO order_items_old;

    CREATE TABLE order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      productId TEXT REFERENCES products(id),
      productName TEXT,
      prix REAL,
      quantite INTEGER,
      subTotal REAL
    );

    INSERT INTO order_items (id, orderId, productId, productName, prix, quantite, subTotal)
      SELECT id, orderId, productId, productName, prix, quantite, subTotal FROM order_items_old;

    DROP TABLE order_items_old;
  `);
}

async function migrateClientsColumns() {
  const res = await db.execute("PRAGMA table_info(clients)");
  const existing = new Set(res.rows.map((r) => r.name as string));
  const toAdd: [string, string][] = [
    ["prenom", "TEXT DEFAULT ''"],
    ["dateNaissance", "TEXT DEFAULT ''"],
    ["password", "TEXT DEFAULT ''"],
  ];
  for (const [name, type] of toAdd) {
    if (!existing.has(name)) {
      await db.execute(`ALTER TABLE clients ADD COLUMN ${name} ${type}`);
    }
  }
}

async function migrateProductsColumns() {
  const res = await db.execute("PRAGMA table_info(products)");
  const existing = new Set(res.rows.map((r) => r.name as string));
  if (!existing.has("ancienPrix")) {
    await db.execute("ALTER TABLE products ADD COLUMN ancienPrix REAL");
  }
}

async function init() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prix REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      categorie TEXT NOT NULL,
      sousCategorie TEXT NOT NULL,
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      promo INTEGER NOT NULL DEFAULT 0,
      ancienPrix REAL
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prenom TEXT DEFAULT '',
      nom TEXT NOT NULL,
      email TEXT NOT NULL,
      telephone TEXT DEFAULT '',
      adresse TEXT DEFAULT '',
      dateNaissance TEXT DEFAULT '',
      password TEXT DEFAULT '',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientId TEXT NOT NULL REFERENCES clients(id),
      clientName TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      productId TEXT REFERENCES products(id),
      productName TEXT,
      prix REAL,
      quantite INTEGER,
      subTotal REAL
    );

    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      espece TEXT NOT NULL,
      nom TEXT NOT NULL,
      dateNaissanceConnue INTEGER DEFAULT 0,
      dateNaissance TEXT DEFAULT '',
      estCroise INTEGER DEFAULT 0,
      race TEXT DEFAULT '',
      sexe TEXT DEFAULT '',
      sterilise TEXT DEFAULT '',
      nourriture TEXT DEFAULT '',
      besoinsSpeciaux TEXT DEFAULT '',
      photo TEXT DEFAULT '',
      createdAt TEXT NOT NULL
    );
  `);

  await migrateOrdersForeignKey();
  await migrateOrderItemsForeignKey();
  await migrateClientsColumns();
  await migrateProductsColumns();
}

// Cached on globalThis so Next.js's module-reload-on-change in dev doesn't
// re-run migrations on every request, and so concurrent requests during
// cold start await the same in-flight init instead of racing each other.
export const dbReady: Promise<void> = globalThis.__patteDbReady ?? init();
globalThis.__patteDbReady = dbReady;

export default db;
