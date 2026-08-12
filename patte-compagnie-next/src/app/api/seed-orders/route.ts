import db, { dbReady } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  await dbReady;
  try {
    let clientsRes = await db.execute("SELECT id, nom FROM clients ORDER BY id ASC");
    let clients = clientsRes.rows as unknown as { id: number; nom: string }[];

    if (clients.length === 0) {
      const now = new Date().toISOString();
      const sampleClients = [
        { nom: "Amine Ben Salah", email: "amine@example.com", telephone: "+216 20 000 001", adresse: "Ariana, Tunisie" },
        { nom: "Sarra Trabelsi", email: "sarra@example.com", telephone: "+216 20 000 002", adresse: "Sfax, Tunisie" },
        { nom: "Karim Jlassi", email: "karim@example.com", telephone: "+216 20 000 003", adresse: "Sousse, Tunisie" },
      ];
      for (const c of sampleClients) {
        await db.execute({
          sql: `INSERT INTO clients (nom, email, telephone, adresse, createdAt) VALUES (?, ?, ?, ?, ?)`,
          args: [c.nom, c.email, c.telephone, c.adresse, now],
        });
      }
      clientsRes = await db.execute("SELECT id, nom FROM clients ORDER BY id ASC");
      clients = clientsRes.rows as unknown as { id: number; nom: string }[];
    }

    const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

    const sampleOrders = [
      {
        clientId: String(clients[0].id),
        clientName: clients[0].nom,
        items: [{ productId: "1", productName: "Croquettes Chien", prix: 45.99, quantite: 2, subTotal: 91.98 }],
        total: 91.98,
        status: "confirmed",
        createdAt: daysAgo(3),
      },
      {
        clientId: String(clients[1].id),
        clientName: clients[1].nom,
        items: [
          { productId: "2", productName: "Litière Chat", prix: 25.50, quantite: 1, subTotal: 25.50 },
          { productId: "3", productName: "Jouet Souris", prix: 8.99, quantite: 2, subTotal: 17.98 },
        ],
        total: 43.48,
        status: "pending",
        createdAt: daysAgo(1),
      },
      {
        clientId: String(clients[2].id),
        clientName: clients[2].nom,
        items: [
          { productId: "4", productName: "Graines Oiseau", prix: 15.00, quantite: 3, subTotal: 45.00 },
          { productId: "5", productName: "Cage Oiseau", prix: 120.00, quantite: 1, subTotal: 120.00 },
        ],
        total: 165.00,
        status: "shipped",
        createdAt: daysAgo(7),
      },
      {
        clientId: String(clients[0].id),
        clientName: clients[0].nom,
        items: [{ productId: "6", productName: "Friandises Chien", prix: 12.99, quantite: 5, subTotal: 64.95 }],
        total: 64.95,
        status: "delivered",
        createdAt: daysAgo(30),
      },
    ];

    const addedOrders = [];
    for (const order of sampleOrders) {
      const result = await db.execute({
        sql: `INSERT INTO orders (clientId, clientName, total, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [order.clientId, order.clientName, order.total, order.status, order.createdAt, order.createdAt],
      });
      const orderId = result.lastInsertRowid;
      for (const item of order.items) {
        await db.execute({
          sql: `INSERT INTO order_items (orderId, productId, productName, prix, quantite, subTotal) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [orderId!, item.productId, item.productName, item.prix, item.quantite, item.subTotal],
        });
      }
      addedOrders.push({ id: String(orderId), ...order });
    }

    return NextResponse.json({
      success: true,
      message: `${addedOrders.length} commandes ajoutées avec succès`,
      orders: addedOrders,
    });
  } catch (error) {
    console.error("Error seeding orders:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
