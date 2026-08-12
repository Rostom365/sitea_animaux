const { createClient } = require("@libsql/client");
const path = require("node:path");
const fs = require("node:fs");

// Read .env.local manually since this script runs outside Next.js.
const envPath = path.join(__dirname, "..", ".env.local");
const envRaw = fs.readFileSync(envPath, "utf-8");
for (const line of envRaw.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error("Missing TURSO_DATABASE_URL / TURSO_AUTH_TOKEN in .env.local");
  process.exit(1);
}

const local = createClient({ url: `file:${path.join(__dirname, "patte.db")}` });
const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prix REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    categorie TEXT NOT NULL,
    sousCategorie TEXT NOT NULL,
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    promo INTEGER NOT NULL DEFAULT 0
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
`;

const TABLES = [
  { name: "products", cols: ["id", "nom", "prix", "stock", "categorie", "sousCategorie", "description", "image", "promo"] },
  { name: "clients", cols: ["id", "prenom", "nom", "email", "telephone", "adresse", "dateNaissance", "password", "createdAt"] },
  { name: "orders", cols: ["id", "clientId", "clientName", "total", "status", "createdAt", "updatedAt"] },
  { name: "order_items", cols: ["id", "orderId", "productId", "productName", "prix", "quantite", "subTotal"] },
  { name: "pets", cols: ["id", "customerId", "espece", "nom", "dateNaissanceConnue", "dateNaissance", "estCroise", "race", "sexe", "sterilise", "nourriture", "besoinsSpeciaux", "photo", "createdAt"] },
];

async function main() {
  console.log("Creating schema on Turso...");
  await turso.executeMultiple(SCHEMA);

  for (const table of TABLES) {
    const res = await local.execute(`SELECT ${table.cols.join(", ")} FROM ${table.name}`);
    console.log(`Migrating ${res.rows.length} rows from "${table.name}"...`);

    const placeholders = table.cols.map(() => "?").join(", ");
    const sql = `INSERT OR IGNORE INTO ${table.name} (${table.cols.join(", ")}) VALUES (${placeholders})`;

    for (const row of res.rows) {
      const args = table.cols.map((c) => row[c]);
      await turso.execute({ sql, args });
    }
  }

  console.log("Verifying counts on Turso:");
  for (const table of TABLES) {
    const res = await turso.execute(`SELECT COUNT(*) as c FROM ${table.name}`);
    console.log(`  ${table.name}: ${res.rows[0].c}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
