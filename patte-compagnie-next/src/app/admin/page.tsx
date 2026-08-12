"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getProducts, addProduct, deleteProduct, Product } from "@/services/productService";
import { getClients, addClient, deleteClient, getClientOrderCount, getClientTotalSpent, Client } from "@/services/clientService";
import { getOrders, addOrder, updateOrderStatus, deleteOrder, getTotalRevenue, getPendingOrdersCount, getDeliveredOrdersCount, Order } from "@/services/orderService";

const SUBCATEGORIES: Record<string, string[]> = {
  chien: ["nourriture", "hygiene-sante", "litieres", "accessoires", "friandises"],
  chat: ["nourriture", "hygiene-sante", "litieres", "accessoires", "friandises"],
  oiseau: ["nourriture", "hygiene-sante", "litieres", "accessoires", "friandises"],
  rongeur: ["nourriture", "hygiene-sante", "litieres", "accessoires", "friandises"],
  poisson: ["nourriture", "hygiene-sante", "litieres", "accessoires", "friandises"]
};

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'clients' | 'orders'>('products');

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clientStats, setClientStats] = useState<Map<string, {orderCount: number, totalSpent: number}>>(new Map());

  // Form states
  const [formData, setFormData] = useState({
    nom: "",
    prix: "",
    stock: "",
    categorie: "chien",
    sousCategorie: "",
    description: "",
    promo: false,
    image: ""
  });

  const [clientFormData, setClientFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: ""
  });

  const [orderFormData, setOrderFormData] = useState({
    clientId: "",
    items: [{ productId: "", productName: "", quantite: 1, prix: 0 }],
    total: 0
  });

  // Modal states
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Stats states
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [subCategoriesForAnimal, setSubCategoriesForAnimal] = useState<string[]>([]);

  // Load all data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadProducts();
      loadClients();
      loadOrders();
      loadOrderStats();
    }
  }, [isLoggedIn]);

  // Update subcategories when category changes
  useEffect(() => {
    const subs = SUBCATEGORIES[formData.categorie] || [];
    setSubCategoriesForAnimal(subs);
    setFormData(prev => ({ ...prev, sousCategorie: subs[0] || "" }));
  }, [formData.categorie]);

  // Load functions
  async function loadProducts() {
    const data = await getProducts();
    setProducts(data);
  }

  async function loadClients() {
    const data = await getClients();
    setClients(data);

    // Load stats for each client
    const stats = new Map();
    for (const client of data) {
      const orderCount = await getClientOrderCount(client.id!);
      const totalSpent = await getClientTotalSpent(client.id!);
      stats.set(client.id!, { orderCount, totalSpent });
    }
    setClientStats(stats);
  }

  async function loadOrders() {
    const data = await getOrders();
    setOrders(data);
  }

  async function loadOrderStats() {
    const revenue = await getTotalRevenue();
    setTotalRevenue(revenue);
  }

  // Auth handlers
  const handleLogin = () => {
    const input = document.getElementById("login-input") as HTMLInputElement;
    if (input && input.value === "patte2026") {
      setIsLoggedIn(true);
    } else {
      alert("Code incorrect");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Form handlers - Products
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [id]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct = {
      nom: formData.nom,
      prix: parseFloat(formData.prix),
      stock: parseInt(formData.stock),
      categorie: formData.categorie,
      sousCategorie: formData.sousCategorie,
      description: formData.description,
      promo: formData.promo,
      image: formData.image
    };

    await addProduct(newProduct);
    alert("Produit ajouté avec succès !");
    setFormData({
      nom: "", prix: "", stock: "", categorie: "chien", sousCategorie: "", description: "", promo: false, image: ""
    });
    loadProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  // Form handlers - Clients
  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setClientFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClient = {
      nom: clientFormData.nom,
      email: clientFormData.email,
      telephone: clientFormData.telephone,
      adresse: clientFormData.adresse
    };

    await addClient(newClient);
    alert("Client ajouté avec succès !");
    setClientFormData({ nom: "", email: "", telephone: "", adresse: "" });
    loadClients();
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce client ?")) {
      await deleteClient(id);
      loadClients();
    }
  };

  // Order handlers
  const handleDeleteOrder = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer cette commande ?")) {
      await deleteOrder(id);
      loadOrders();
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus as Order['status']);
    loadOrders();
  };

  // Stats calculations
  const totalClientSpent = clients.reduce((sum, client) => {
    return sum + (clientStats.get(client.id!)?.totalSpent || 0);
  }, 0);

  const avgOrdersPerClient = clients.length > 0
    ? (orders.length / clients.length).toFixed(1)
    : 0;

  return (
    <>
      {!isLoggedIn ? (
        // LOGIN SCREEN
        <div className="login-wrap" id="login-screen">
          <div className="login-card">
            <h2>Espace vendeur</h2>
            <p className="panel-sub">Entrez le code d'accès pour gérer le catalogue.</p>
            <div className="field">
              <label htmlFor="login-input">Code d'accès</label>
              <input type="text" id="login-input" placeholder="Code" autoComplete="off" />
            </div>
            <button className="btn btn-primary" id="login-btn" style={{width: "100%", justifyContent: "center"}} onClick={handleLogin}>
              Entrer
            </button>
            <p className="error-msg" id="login-error"></p>
            <p className="panel-sub" style={{marginTop: "16px"}}>Code par défaut : <strong>patte2026</strong></p>
          </div>
        </div>
      ) : (
        // ADMIN DASHBOARD
        <div className="admin-shell" id="admin-screen">
          <header className="admin-header">
            <div className="container bar">
              <Link href="/" className="logo">
                <span id="admin-logo-icon"></span>
                Patte &amp; Compagnie <span className="tag">Espace vendeur</span>
              </Link>
              <div style={{display: "flex", gap: "10px"}}>
                <Link href="/" className="btn btn-outline btn-small" style={{color: "#fff", borderColor: "rgba(255,255,255,.5)"}}>Voir la boutique</Link>
                <button className="btn btn-small" id="logout-btn" style={{background: "rgba(255,255,255,.15)", color: "#fff"}} onClick={handleLogout}>
                  Se déconnecter
                </button>
              </div>
            </div>
          </header>

          <main className="admin-main">
            <div className="container">
              {/* TABS */}
              <div style={{display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #ddd", paddingBottom: "10px"}}>
                <button
                  onClick={() => setActiveTab('products')}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: activeTab === 'products' ? "#2d5f4f" : "transparent",
                    color: activeTab === 'products' ? "#fff" : "#666",
                    cursor: "pointer",
                    borderRadius: "4px",
                    fontWeight: activeTab === 'products' ? "bold" : "normal"
                  }}
                >
                  Produits
                </button>
                <button
                  onClick={() => setActiveTab('clients')}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: activeTab === 'clients' ? "#2d5f4f" : "transparent",
                    color: activeTab === 'clients' ? "#fff" : "#666",
                    cursor: "pointer",
                    borderRadius: "4px",
                    fontWeight: activeTab === 'clients' ? "bold" : "normal"
                  }}
                >
                  Clients
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: activeTab === 'orders' ? "#2d5f4f" : "transparent",
                    color: activeTab === 'orders' ? "#fff" : "#666",
                    cursor: "pointer",
                    borderRadius: "4px",
                    fontWeight: activeTab === 'orders' ? "bold" : "normal"
                  }}
                >
                  Commandes
                </button>
              </div>

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && (
                <>
                  <div className="stat-row">
                    <div className="stat-card">
                      <div className="num" id="stat-total">{products.length}</div>
                      <div className="label">Produits au catalogue</div>
                    </div>
                    <div className="stat-card">
                      <div className="num" id="stat-rupture">{products.filter(p => p.stock <= 0).length}</div>
                      <div className="label">Produits en rupture</div>
                    </div>
                    <div className="stat-card">
                      <div className="num" id="stat-valeur">0 TND</div>
                      <div className="label">Valeur totale du stock</div>
                    </div>
                  </div>

                  <div className="admin-grid">
                    {/* PRODUCT FORM */}
                    <section className="panel" id="form-panel">
                      <h2 id="form-title">Ajouter un produit</h2>
                      <p className="panel-sub">Remplissez les champs ci-dessous puis cliquez sur « Enregistrer ».</p>

                      <form id="product-form" onSubmit={handleProductSubmit}>
                        <div className="field">
                          <label htmlFor="nom">Nom du produit</label>
                          <input type="text" id="nom" value={formData.nom} onChange={handleProductChange} placeholder="Ex. Croquettes chien adulte 3kg" required />
                        </div>

                        <div className="field-row">
                          <div className="field">
                            <label htmlFor="prix">Prix (TND)</label>
                            <input type="number" id="prix" min="0" step="0.01" value={formData.prix} onChange={handleProductChange} placeholder="0.00" required />
                          </div>
                          <div className="field">
                            <label htmlFor="stock">Quantité en stock</label>
                            <input type="number" id="stock" min="0" step="1" value={formData.stock} onChange={handleProductChange} placeholder="0" required />
                          </div>
                        </div>

                        <div className="field-row">
                          <div className="field">
                            <label htmlFor="categorie">Animal</label>
                            <select id="categorie" value={formData.categorie} onChange={handleProductChange} required>
                              <option value="chien">Chien</option>
                              <option value="chat">Chat</option>
                              <option value="oiseau">Oiseau</option>
                              <option value="rongeur">Rongeur</option>
                              <option value="poisson">Poisson</option>
                            </select>
                          </div>
                          <div className="field">
                            <label htmlFor="sousCategorie">Sous-catégorie</label>
                            <select id="sousCategorie" value={formData.sousCategorie} onChange={handleProductChange} required>
                              {subCategoriesForAnimal.map(sub => (
                                <option key={sub} value={sub}>{sub.replace(/-/g, ' ')}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="field">
                          <label htmlFor="description">Description (facultatif)</label>
                          <textarea id="description" value={formData.description} onChange={handleProductChange} placeholder="Quelques mots sur le produit…"></textarea>
                        </div>

                        <label className="toggle-row">
                          <input type="checkbox" id="promo" checked={formData.promo} onChange={handleProductChange} />
                          <span className="toggle-switch"></span> Article en promotion
                        </label>

                        <div className="field">
                          <label htmlFor="image">Photo du produit (facultatif)</label>
                          <input
                            type="url"
                            id="image"
                            value={formData.image}
                            onChange={handleProductChange}
                            placeholder="https://exemple.com/photo.jpg"
                          />
                          <p className="hint">Collez le lien d&apos;une image déjà hébergée en ligne.</p>
                          {formData.image && (
                            <div className="image-drop" style={{ marginTop: 10, cursor: "default" }}>
                              <img src={formData.image} alt="Aperçu" />
                            </div>
                          )}
                        </div>

                        <div className="form-actions">
                          <button type="submit" className="btn btn-primary" id="submit-btn">Enregistrer le produit</button>
                        </div>
                      </form>
                    </section>

                    {/* PRODUCTS TABLE */}
                    <section className="panel">
                      <div className="table-tools">
                        <div>
                          <h2 style={{marginBottom: "2px"}}>Catalogue</h2>
                          <p className="panel-sub" style={{marginBottom: "0"}}>Modifiez un prix directement dans le tableau.</p>
                        </div>
                        <input type="search" id="table-search" placeholder="Rechercher…" />
                      </div>

                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Photo</th>
                              <th>Nom</th>
                              <th>Catégorie</th>
                              <th>Sous-catégorie</th>
                              <th>Prix</th>
                              <th>Stock</th>
                              <th>Promo</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody id="table-body">
                            {products.length === 0 ? (
                              <tr>
                                <td colSpan={8} style={{textAlign: "center", color: "#8b9184", padding: "30px"}}>
                                  Aucun produit. Utilisez le formulaire à gauche pour en ajouter un.
                                </td>
                              </tr>
                            ) : (
                              products.map((p) => (
                                <tr key={p.id}>
                                  <td>{p.image ? <img src={p.image} alt="" style={{width: 44, height: 44, borderRadius: 8}} /> : <div style={{width: 44, height: 44, borderRadius: 8, background: "#E8B86D"}}></div>}</td>
                                  <td><strong>{p.nom}</strong></td>
                                  <td>{p.categorie}</td>
                                  <td>{p.sousCategorie}</td>
                                  <td>{p.prix} TND</td>
                                  <td>{p.stock}</td>
                                  <td style={{textAlign: "center"}}>{p.promo ? "⭐" : ""}</td>
                                  <td>
                                    <div className="row-actions">
                                      <button className="icon-btn" onClick={() => handleDeleteProduct(p.id!)} title="Supprimer">🗑️</button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>
                </>
              )}

              {/* CLIENTS TAB */}
              {activeTab === 'clients' && (
                <>
                  <div className="stat-row">
                    <div className="stat-card">
                      <div className="num" id="stat-clients">{clients.length}</div>
                      <div className="label">Clients totaux</div>
                    </div>
                    <div className="stat-card">
                      <div className="num" id="stat-spent">{totalClientSpent.toFixed(2)} TND</div>
                      <div className="label">Montant total dépensé</div>
                    </div>
                    <div className="stat-card">
                      <div className="num" id="stat-avg-orders">{avgOrdersPerClient}</div>
                      <div className="label">Commandes par client</div>
                    </div>
                  </div>

                  <div className="admin-grid">
                    {/* CLIENTS TABLE */}
                    <section className="panel" style={{gridColumn: "1 / -1"}}>
                      <div className="table-tools">
                        <h2 style={{marginBottom: "2px"}}>Liste des clients</h2>
                      </div>

                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Nom</th>
                              <th>Email</th>
                              <th>Téléphone</th>
                              <th>Adresse</th>
                              <th>Commandes</th>
                              <th>Total dépensé</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clients.length === 0 ? (
                              <tr>
                                <td colSpan={7} style={{textAlign: "center", color: "#8b9184", padding: "30px"}}>
                                  Aucun client pour le moment.
                                </td>
                              </tr>
                            ) : (
                              clients.map((c) => (
                                <tr key={c.id}>
                                  <td><strong>{c.nom}</strong></td>
                                  <td>{c.email}</td>
                                  <td>{c.telephone}</td>
                                  <td>{c.adresse}</td>
                                  <td style={{textAlign: "center"}}>{clientStats.get(c.id!)?.orderCount || 0}</td>
                                  <td>{(clientStats.get(c.id!)?.totalSpent || 0).toFixed(2)} TND</td>
                                  <td>
                                    <div className="row-actions">
                                      <button className="icon-btn" onClick={() => handleDeleteClient(c.id!)} title="Supprimer">🗑️</button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>
                </>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <>
                  <div className="stat-row">
                    <div className="stat-card">
                      <div className="num" id="stat-all-orders">{orders.length}</div>
                      <div className="label">Commandes totales</div>
                    </div>
                    <div className="stat-card">
                      <div className="num" id="stat-revenue">{totalRevenue.toFixed(2)} TND</div>
                      <div className="label">Chiffre d'affaires</div>
                    </div>
                    <div className="stat-card">
                      <div className="num" id="stat-pending">{orders.filter(o => o.status === 'pending').length}</div>
                      <div className="label">Commandes en attente</div>
                    </div>
                    <div className="stat-card">
                      <div className="num" id="stat-delivered">{orders.filter(o => o.status === 'delivered').length}</div>
                      <div className="label">Commandes livrées</div>
                    </div>
                  </div>

                  <section className="panel">
                    <div className="table-tools">
                      <h2 style={{marginBottom: "2px"}}>Commandes</h2>
                    </div>

                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Client</th>
                            <th>Montant</th>
                            <th>Statut</th>
                            <th>Items</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{textAlign: "center", color: "#8b9184", padding: "30px"}}>
                                Aucune commande pour le moment.
                              </td>
                            </tr>
                          ) : (
                            orders.map((o) => (
                              <tr key={o.id}>
                                <td><small>{o.id?.slice(0, 8)}...</small></td>
                                <td>{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                                <td><strong>{o.clientName}</strong></td>
                                <td>{o.total.toFixed(2)} TND</td>
                                <td>
                                  <select
                                    value={o.status}
                                    onChange={(e) => handleStatusChange(o.id!, e.target.value)}
                                    style={{
                                      padding: "5px 10px",
                                      borderRadius: "4px",
                                      border: "1px solid #ddd",
                                      background: o.status === 'delivered' ? '#d4edda' : o.status === 'shipped' ? '#fff3cd' : o.status === 'confirmed' ? '#d1ecf1' : '#f8d7da'
                                    }}
                                  >
                                    <option value="pending">En attente</option>
                                    <option value="confirmed">Confirmée</option>
                                    <option value="shipped">Expédiée</option>
                                    <option value="delivered">Livrée</option>
                                  </select>
                                </td>
                                <td style={{textAlign: "center"}}>{o.items.length}</td>
                                <td>
                                  <div className="row-actions">
                                    <button className="icon-btn" onClick={() => { setSelectedOrder(o); setShowOrderDetailsModal(true); }} title="Voir détails">👁️</button>
                                    <button className="icon-btn" onClick={() => handleDeleteOrder(o.id!)} title="Supprimer">🗑️</button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}
            </div>
          </main>

          {/* ORDER DETAILS MODAL */}
          {showOrderDetailsModal && selectedOrder && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000
            }}>
              <div style={{
                background: "#fff",
                borderRadius: "8px",
                padding: "30px",
                maxWidth: "500px",
                width: "90%",
                maxHeight: "80vh",
                overflowY: "auto",
                position: "relative"
              }}>
                <button
                  onClick={() => setShowOrderDetailsModal(false)}
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    background: "none",
                    border: "none",
                    fontSize: "28px",
                    cursor: "pointer",
                    color: "#666",
                    padding: "0",
                    width: "30px",
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ×
                </button>

                <h2 style={{marginTop: "0"}}>Détails de la commande</h2>
                <p><strong>ID :</strong> {selectedOrder.id}</p>
                <p><strong>Client :</strong> {selectedOrder.clientName}</p>
                <p><strong>Date :</strong> {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')}</p>
                <p><strong>Statut :</strong> {selectedOrder.status}</p>

                <h3 style={{marginTop: "20px"}}>Produits commandés</h3>
                <table style={{width: "100%", borderCollapse: "collapse"}}>
                  <thead>
                    <tr>
                      <th style={{borderBottom: "1px solid #ddd", padding: "10px", textAlign: "left"}}>Produit</th>
                      <th style={{borderBottom: "1px solid #ddd", padding: "10px", textAlign: "center"}}>Quantité</th>
                      <th style={{borderBottom: "1px solid #ddd", padding: "10px", textAlign: "right"}}>Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{borderBottom: "1px solid #f0f0f0", padding: "10px"}}>{item.productName}</td>
                        <td style={{borderBottom: "1px solid #f0f0f0", padding: "10px", textAlign: "center"}}>{item.quantite}</td>
                        <td style={{borderBottom: "1px solid #f0f0f0", padding: "10px", textAlign: "right"}}>{item.subTotal.toFixed(2)} TND</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{marginTop: "20px", paddingTop: "20px", borderTop: "2px solid #ddd", fontSize: "18px", fontWeight: "bold"}}>
                  Total : {selectedOrder.total.toFixed(2)} TND
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
