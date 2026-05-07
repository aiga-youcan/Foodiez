const API_BASE = "http://localhost:3000";
const ORDERS_API = `${API_BASE}/orders`;
const PRODUCTS_API = `${API_BASE}/products`;

let orders = [];
let products = [];
let currentPage = "dashboard";
let orderFilter = "all";
let orderSearch = "";

// ========== FETCH DATA ==========
async function fetchOrders() {
  try {
    const res = await fetch(ORDERS_API);
    if (!res.ok) throw new Error("Erreur serveur");
    orders = await res.json();
  } catch (err) {
    showToast("Impossible de charger les commandes", "error");
  }
}

async function fetchProducts() {
  try {
    const res = await fetch(PRODUCTS_API);
    if (!res.ok) throw new Error("Erreur serveur");
    products = await res.json();
  } catch (err) {
    showToast("Impossible de charger les produits", "error");
  }
}

async function loadAllData() {
  await Promise.all([fetchOrders(), fetchProducts()]);
}

async function handleAddOrder(e) {
  e.preventDefault();
  const order = {
    customerName: document.getElementById("order-client").value,
    items: document
      .getElementById("order-items")
      .value.split(",")
      .map((s) => s.trim()),
    total: parseInt(document.getElementById("order-total").value, 10),
    status: "pending",
    createdAt: new Date().toISOString().split("T")[0],
  };

  try {
    const res = await fetch(ORDERS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (res.ok) {
      showToast("Commande créée", "success");
      await fetchOrders();
      renderOrders();
    } else {
      throw new Error("Erreur création");
    }
  } catch (err) {
    showToast("Erreur lors de la création", "error");
  }
}

async function updateOrderStatus(id, status) {
  try {
    const res = await fetch(`${ORDERS_API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      showToast("Statut mis à jour", "success");
      await fetchOrders();
      renderOrders();
    } else {
      throw new Error("Mise à jour impossible");
    }
  } catch (err) {
    showToast("Erreur lors de la mise à jour", "error");
  }
}

async function deleteOrder(id) {
  if (!confirm("Supprimer cette commande ?")) return;

  try {
    const res = await fetch(`${ORDERS_API}/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Commande supprimée", "success");
      await fetchOrders();
      renderOrders();
    } else {
      throw new Error("Suppression impossible");
    }
  } catch (err) {
    showToast("Erreur lors de la suppression", "error");
  }
}

async function handleAddProduct(e) {
  e.preventDefault();
  const imageUrl = document.getElementById("product-image").value.trim();
  const product = {
    name: document.getElementById("product-name").value,
    price: parseInt(document.getElementById("product-price").value, 10),
    image:
      imageUrl || `https://source.unsplash.com/400x300/?food&sig=${Date.now()}`,
  };

  try {
    const res = await fetch(PRODUCTS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (res.ok) {
      showToast("Produit ajouté", "success");
      await fetchProducts();
      renderMenu();
    } else {
      throw new Error("Erreur ajout");
    }
  } catch (err) {
    showToast("Erreur lors de l'ajout", "error");
  }
}

async function deleteProduct(id) {
  if (!confirm("Supprimer ce produit ?")) return;

  try {
    const res = await fetch(`${PRODUCTS_API}/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Produit supprimé", "success");
      await fetchProducts();
      renderMenu();
    } else {
      throw new Error("Suppression produit");
    }
  } catch (err) {
    showToast("Erreur lors de la suppression", "error");
  }
}

//tache 2

// ========== DASHBOARD
function renderDashboard() {
  const app = document.getElementById("app");

  const totalOrders = orders.length;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  app.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

      <!-- TOTAL ORDERS -->
      <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
        <div class="flex justify-between items-start">

          <div>
            <p class="text-gray-600 text-sm font-medium">
              Total commandes
            </p>

            <p class="text-3xl font-bold text-gray-800 mt-2">
              ${totalOrders}
            </p>
          </div>

          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-receipt text-orange-500 text-lg"></i>
          </div>

        </div>
      </div>

      <!-- REVENUE -->
      <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
        <div class="flex justify-between items-start">

          <div>
            <p class="text-gray-600 text-sm font-medium">
              Revenus totaux
            </p>

            <p class="text-3xl font-bold text-gray-800 mt-2">
              ${formatCurrency(totalRevenue)}
            </p>
          </div>

          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-wallet text-green-500 text-lg"></i>
          </div>

        </div>
      </div>

      <!-- DELIVERED -->
      <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
        <div class="flex justify-between items-start">

          <div>
            <p class="text-gray-600 text-sm font-medium">
              Commandes livrées
            </p>

            <p class="text-3xl font-bold text-gray-800 mt-2">
              ${deliveredCount}
            </p>
          </div>

          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-truck text-blue-500 text-lg"></i>
          </div>

        </div>
      </div>

    </div>
  `;
}

// ========== ORDERS ==========
function renderOrders() {
  const app = document.getElementById("app");

  const filteredOrders = getFilteredOrders();

  app.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- FORM -->
      <div class="lg:col-span-1">

        <div class="bg-white p-6 rounded-lg shadow-md sticky top-6">

          <h3 class="text-lg font-bold text-gray-800 mb-4">
            Créer une commande
          </h3>

          <form id="add-order-form" class="space-y-4">

            <input
              type="text"
              id="order-client"
              required
              placeholder="Nom du client"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >

            <input
              type="text"
              id="order-items"
              required
              placeholder="Burger, Pizza"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >

            <input
              type="number"
              id="order-total"
              required
              placeholder="Total"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >

            <button
              type="submit"
              class="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg"
            >
              Ajouter
            </button>

          </form>

        </div>

      </div>

      <!-- TABLE -->
      <div class="lg:col-span-2">

        <div class="bg-white p-6 rounded-lg shadow-md">

          <div class="flex justify-between mb-6">

            <h3 class="text-lg font-bold text-gray-800">
              Commandes (${orders.length})
            </h3>

          </div>

          ${
            filteredOrders.length > 0
              ? `
            <div class="overflow-x-auto">

              <table class="w-full text-sm">

                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-4 py-3 text-left">Client</th>
                    <th class="px-4 py-3 text-left">Articles</th>
                    <th class="px-4 py-3 text-left">Total</th>
                    <th class="px-4 py-3 text-left">Statut</th>
                  </tr>
                </thead>

                <tbody>

                  ${filteredOrders
                    .map(
                      (order) => `
                    <tr class="border-b border-gray-200">

                      <td class="px-4 py-3">
                        ${order.customerName || "Inconnu"}
                      </td>

                      <td class="px-4 py-3">
                        ${(order.items || []).join(", ")}
                      </td>

                      <td class="px-4 py-3 font-semibold">
                        ${formatCurrency(order.total)}
                      </td>

                      <td class="px-4 py-3">

                        <span class="
                          inline-flex
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-semibold
                          ${getStatusBadge(order.status)}
                        ">
                          ${order.status}
                        </span>

                      </td>

                    </tr>
                  `,
                    )
                    .join("")}

                </tbody>

              </table>

            </div>
          `
              : `
            <p class="text-gray-500 text-center py-8">
              Aucune commande
            </p>
          `
          }

        </div>

      </div>

    </div>
  `;
}

// ========== MENU
function renderMenu() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      ${products
        .map(
          (product) => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">

          <img
            src="${product.image}"
            alt="${product.name}"
            class="w-full h-40 object-cover"
          >

          <div class="p-4">

            <h3 class="font-bold text-gray-800">
              ${product.name}
            </h3>

            <p class="text-orange-500 font-semibold mt-2">
              ${formatCurrency(product.price)}
            </p>

          </div>

        </div>
      `,
        )
        .join("")}

    </div>
  `;
}

// ========== STATS
function renderStats() {
  const app = document.getElementById("app");

  const totalOrders = orders.length;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

  app.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="font-bold text-gray-800 mb-4">
          Statistiques
        </h3>

        <div class="space-y-3">

          <div class="flex justify-between">
            <span>En attente</span>
            <span class="text-yellow-500 font-bold">
              ${pendingCount}
            </span>
          </div>

          <div class="flex justify-between">
            <span>Livrées</span>
            <span class="text-green-500 font-bold">
              ${deliveredCount}
            </span>
          </div>

          <div class="flex justify-between">
            <span>Annulées</span>
            <span class="text-red-500 font-bold">
              ${cancelledCount}
            </span>
          </div>

        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">

        <h3 class="font-bold text-gray-800 mb-4">
          Taux de livraison
        </h3>

        <div class="space-y-4">

          ${renderProgressBar(
            "Livrées",
            deliveredCount,
            totalOrders,
            "bg-green-500",
          )}

          ${renderProgressBar(
            "En attente",
            pendingCount,
            totalOrders,
            "bg-yellow-500",
          )}

          ${renderProgressBar(
            "Annulées",
            cancelledCount,
            totalOrders,
            "bg-red-500",
          )}

        </div>

      </div>

    </div>
  `;
}

// ========== PROGRESS BAR ==========
function renderProgressBar(label, value, total, color) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return `
    <div>

      <div class="flex justify-between mb-1">

        <span class="text-sm font-medium text-gray-700">
          ${label}
        </span>

        <span class="text-sm font-bold text-gray-800">
          ${percent}%
        </span>

      </div>

      <div class="w-full bg-gray-200 rounded-full h-2">

        <div
          class="${color} h-2 rounded-full"
          style="width:${percent}%"
        ></div>

      </div>

    </div>
  `;
}

// ========== STATUS BADGE ==========
function getStatusBadge(status) {
  const badges = {
    pending: "bg-yellow-100 text-yellow-600",
    delivered: "bg-green-100 text-green-600",
    cancelled: "bg-red-100 text-red-600",
  };

  return badges[status] || "bg-gray-100 text-gray-600";
}

// ========== FORMAT MONEY ==========
function formatCurrency(value) {
  return `${value.toLocaleString("fr-FR")} DH`;
}
