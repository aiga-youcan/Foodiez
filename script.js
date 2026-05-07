// FOODIEZ ADMIN - SCRIPT PRINCIPAL
// API & Configuration
const API_BASE = 'http://localhost:3000';
const ORDERS_API = `${API_BASE}/orders`;
const PRODUCTS_API = `${API_BASE}/products`;

let orders = [];
let products = [];
let currentPage = 'dashboard';
let orderFilter = 'all';
let orderSearch = '';

// ========== TOAST NOTIFICATIONS ==========
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  toast.className = `${styles[type] || styles.success} px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ========== FETCH DATA ==========
async function fetchOrders() {
  try {
    const res = await fetch(ORDERS_API);
    if (!res.ok) throw new Error('Erreur serveur');
    orders = await res.json();
  } catch (err) {
    showToast('Impossible de charger les commandes', 'error');
  }
}

async function fetchProducts() {
  try {
    const res = await fetch(PRODUCTS_API);
    if (!res.ok) throw new Error('Erreur serveur');
    products = await res.json();
  } catch (err) {
    showToast('Impossible de charger les produits', 'error');
  }
}

async function loadAllData() {
  await Promise.all([fetchOrders(), fetchProducts()]);
}

// ========== NAVIGATION ==========
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllData();
  setupNavigation();
  renderPage('dashboard');
});

function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      navigate(page);
    });
  });
}

function navigate(page) {
  renderPage(page);
}

function renderPage(page) {
  currentPage = page;
  const title = document.getElementById('page-title');
  const desc = document.getElementById('page-desc');

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('btn-active', btn.dataset.page === page);
  });

  if (page === 'dashboard') {
    title.textContent = 'Dashboard';
    desc.textContent = 'Vue d\'ensemble de votre restaurant';
    renderDashboard();
  } else if (page === 'orders') {
    title.textContent = 'Orders';
    desc.textContent = 'Gérez les commandes de vos clients';
    renderOrders();
  } else if (page === 'menu') {
    title.textContent = 'Menu';
    desc.textContent = 'Gérez votre catalogue de produits';
    renderMenu();
  } else if (page === 'stats') {
    title.textContent = 'Stats';
    desc.textContent = 'Analysez vos performances';
    renderStats();
  }
}

// ========== DASHBOARD ==========
function renderDashboard() {
  const app = document.getElementById('app');
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  app.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-600 text-sm font-medium">Total commandes</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">${totalOrders}</p>
          </div>
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-receipt text-orange-500 text-lg"></i>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-600 text-sm font-medium">Revenus totaux</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">${formatCurrency(totalRevenue)}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-wallet text-green-500 text-lg"></i>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-600 text-sm font-medium">Commandes livrées</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">${deliveredCount}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-truck text-blue-500 text-lg"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-lg font-bold text-gray-800 mb-4">Dernières commandes créées</h3>
      ${orders.length > 0 ? `
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-gray-600 font-medium">Client</th>
                <th class="px-4 py-3 text-left text-gray-600 font-medium">Articles</th>
                <th class="px-4 py-3 text-left text-gray-600 font-medium">Total</th>
                <th class="px-4 py-3 text-left text-gray-600 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              ${orders.slice(-5).reverse().map(order => `
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-4 py-3 text-gray-800">${order.customerName || order.client || 'Inconnu'}</td>
                  <td class="px-4 py-3 text-gray-700">${(order.items || []).join(', ')}</td>
                  <td class="px-4 py-3 font-semibold text-gray-800">${formatCurrency(order.total)}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)} capitalize">
                      ${order.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '<p class="text-gray-500 text-center py-8">Aucune commande</p>'}
    </div>
  `;
}

function getFilteredOrders() {
  return orders
    .filter(order => {
      if (orderFilter === 'all') return true;
      return order.status === orderFilter;
    })
    .filter(order => {
      const query = orderSearch.trim().toLowerCase();
      if (!query) return true;
      const client = (order.customerName || order.client || '').toLowerCase();
      const items = (order.items || []).join(' ').toLowerCase();
      return client.includes(query) || items.includes(query);
    });
}

function renderOrders() {
  const app = document.getElementById('app');
  const filteredOrders = getFilteredOrders();

  app.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <div class="bg-white p-6 rounded-lg shadow-md sticky top-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Créer une commande</h3>
          <form id="add-order-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <input type="text" id="order-client" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Nom du client">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Articles</label>
              <input type="text" id="order-items" placeholder="Ex: Burger, Pizza" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Total (DH)</label>
              <input type="number" id="order-total" min="1" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
            </div>
            <button type="submit" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition">
              <i class="fas fa-plus mr-2"></i>Ajouter
            </button>
          </form>
        </div>
      </div>
      <div class="lg:col-span-2">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h3 class="text-lg font-bold text-gray-800">Commandes (${orders.length})</h3>
              <p class="text-sm text-gray-500">Gérez vos commandes en attente, livrées ou annulées.</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input id="order-search" type="search" placeholder="Rechercher client ou article" value="${orderSearch}" class="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <select id="order-filter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="all" ${orderFilter === 'all' ? 'selected' : ''}>Tous les statuts</option>
                <option value="pending" ${orderFilter === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="delivered" ${orderFilter === 'delivered' ? 'selected' : ''}>Delivered</option>
                <option value="cancelled" ${orderFilter === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>
          </div>
          ${filteredOrders.length > 0 ? `
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-4 py-3 text-left text-gray-600 font-medium">Client</th>
                    <th class="px-4 py-3 text-left text-gray-600 font-medium">Articles</th>
                    <th class="px-4 py-3 text-left text-gray-600 font-medium">Total</th>
                    <th class="px-4 py-3 text-left text-gray-600 font-medium">Statut</th>
                    <th class="px-4 py-3 text-left text-gray-600 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredOrders.map(order => `
                    <tr class="border-b border-gray-200 hover:bg-gray-50">
                      <td class="px-4 py-3 text-gray-800">${order.customerName || order.client || 'Inconnu'}</td>
                      <td class="px-4 py-3 text-gray-700">${(order.items || []).join(', ')}</td>
                      <td class="px-4 py-3 font-semibold text-gray-800">${formatCurrency(order.total)}</td>
                      <td class="px-4 py-3">
                        <span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)} capitalize">
                          ${order.status}
                        </span>
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex flex-wrap gap-2">
                          <button onclick="updateOrderStatus(${order.id}, 'pending')" class="px-3 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs">Pending</button>
                          <button onclick="updateOrderStatus(${order.id}, 'delivered')" class="px-3 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs">Delivered</button>
                          <button onclick="updateOrderStatus(${order.id}, 'cancelled')" class="px-3 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs">Cancelled</button>
                          <button onclick="deleteOrder(${order.id})" class="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs flex items-center gap-2">
                            <i class="fas fa-trash"></i>Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : '<p class="text-gray-500 text-center py-8">Aucune commande</p>'}
        </div>
      </div>
    </div>
  `;

  document.getElementById('add-order-form').addEventListener('submit', handleAddOrder);
  document.getElementById('order-search').addEventListener('input', e => {
    orderSearch = e.target.value;
    renderOrders();
  });
  document.getElementById('order-filter').addEventListener('change', e => {
    orderFilter = e.target.value;
    renderOrders();
  });
}

async function handleAddOrder(e) {
  e.preventDefault();
  const order = {
    customerName: document.getElementById('order-client').value,
    items: document.getElementById('order-items').value.split(',').map(s => s.trim()),
    total: parseInt(document.getElementById('order-total').value, 10),
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0]
  };

  try {
    const res = await fetch(ORDERS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (res.ok) {
      showToast('Commande créée', 'success');
      await fetchOrders();
      renderOrders();
    } else {
      throw new Error('Erreur création');
    }
  } catch (err) {
    showToast('Erreur lors de la création', 'error');
  }
}

async function updateOrderStatus(id, status) {
  try {
    const res = await fetch(`${ORDERS_API}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      showToast('Statut mis à jour', 'success');
      await fetchOrders();
      renderOrders();
    } else {
      throw new Error('Mise à jour impossible');
    }
  } catch (err) {
    showToast('Erreur lors de la mise à jour', 'error');
  }
}

async function deleteOrder(id) {
  if (!confirm('Supprimer cette commande ?')) return;

  try {
    const res = await fetch(`${ORDERS_API}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Commande supprimée', 'success');
      await fetchOrders();
      renderOrders();
    } else {
      throw new Error('Suppression impossible');
    }
  } catch (err) {
    showToast('Erreur lors de la suppression', 'error');
  }
}

function renderMenu() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <div class="bg-white p-6 rounded-lg shadow-md sticky top-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Ajouter un produit</h3>
          <form id="add-product-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" id="product-name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Nom du plat">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prix (DH)</label>
              <input type="number" id="product-price" min="1" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Prix en DH">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Image (URL)</label>
              <input type="url" id="product-image" placeholder="https://..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
            </div>
            <button type="submit" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition">
              <i class="fas fa-plus mr-2"></i>Ajouter
            </button>
          </form>
        </div>
      </div>
      <div class="lg:col-span-2">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-800">Produits (${products.length})</h3>
              <p class="text-sm text-gray-500">Catalogue visuel de votre menu.</p>
            </div>
          </div>
          ${products.length > 0 ? `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${products.map(product => `
                <div class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                  <img src="${product.image || `https://source.unsplash.com/400x300/?food&sig=${product.id}`}" alt="${product.name}" class="w-full h-40 object-cover rounded-t-lg">
                  <div class="p-4">
                    <h4 class="font-bold text-gray-800">${product.name}</h4>
                    <p class="text-orange-500 font-semibold mt-2">${formatCurrency(product.price)}</p>
                    <button onclick="deleteProduct(${product.id})" class="w-full mt-4 bg-red-100 text-red-600 hover:bg-red-200 font-medium py-2 rounded transition flex items-center justify-center gap-2 text-sm">
                      <i class="fas fa-trash"></i>Supprimer
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p class="text-gray-500 text-center py-8">Aucun produit</p>'}
        </div>
      </div>
    </div>
  `;

  document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
}

async function handleAddProduct(e) {
  e.preventDefault();
  const imageUrl = document.getElementById('product-image').value.trim();
  const product = {
    name: document.getElementById('product-name').value,
    price: parseInt(document.getElementById('product-price').value, 10),
    image: imageUrl || `https://source.unsplash.com/400x300/?food&sig=${Date.now()}`
  };

  try {
    const res = await fetch(PRODUCTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (res.ok) {
      showToast('Produit ajouté', 'success');
      await fetchProducts();
      renderMenu();
    } else {
      throw new Error('Erreur ajout');
    }
  } catch (err) {
    showToast('Erreur lors de l\'ajout', 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Supprimer ce produit ?')) return;

  try {
    const res = await fetch(`${PRODUCTS_API}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Produit supprimé', 'success');
      await fetchProducts();
      renderMenu();
    } else {
      throw new Error('Suppression produit');
    }
  } catch (err) {
    showToast('Erreur lors de la suppression', 'error');
  }
}

// ========== STATS PAGE ==========
function renderStats() {
  const app = document.getElementById('app');
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgRevenue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  app.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <p class="text-gray-600 text-sm">Total commandes</p>
        <p class="text-3xl font-bold text-gray-800 mt-2">${totalOrders}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <p class="text-gray-600 text-sm">Revenus totaux</p>
        <p class="text-3xl font-bold text-green-600 mt-2">${formatCurrency(totalRevenue)}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <p class="text-gray-600 text-sm">Revenu moyen</p>
        <p class="text-3xl font-bold text-blue-600 mt-2">${formatCurrency(avgRevenue)}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <p class="text-gray-600 text-sm">Produits</p>
        <p class="text-3xl font-bold text-purple-600 mt-2">${products.length}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="font-bold text-gray-800 mb-4">Statistiques</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">En attente</span>
            <span class="text-yellow-600 font-bold">${pendingCount}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Livrées</span>
            <span class="text-green-600 font-bold">${deliveredCount}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Annulées</span>
            <span class="text-red-600 font-bold">${cancelledCount}</span>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
        <h3 class="font-bold text-gray-800 mb-4">Taux de livraison</h3>
        <div class="space-y-4">
          ${renderProgressBar('Livrées', deliveredCount, totalOrders, 'bg-green-500')}
          ${renderProgressBar('En attente', pendingCount, totalOrders, 'bg-yellow-500')}
          ${renderProgressBar('Annulées', cancelledCount, totalOrders, 'bg-red-500')}
        </div>
      </div>
    </div>
  `;
}

function renderProgressBar(label, value, total, color) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return `
    <div>
      <div class="flex justify-between mb-1">
        <span class="text-sm font-medium text-gray-700">${label}</span>
        <span class="text-sm font-bold text-gray-800">${percent}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div class="${color} h-2 rounded-full transition-all" style="width: ${percent}%"></div>
      </div>
    </div>
  `;
}

function getStatusBadge(status) {
  const badges = {
    pending: 'bg-yellow-100 text-yellow-600',
    delivered: 'bg-green-100 text-green-600',
    cancelled: 'bg-red-100 text-red-600'
  };
  return badges[status] || 'bg-gray-100 text-gray-600';
}

function formatCurrency(value) {
  return `${value.toLocaleString('fr-FR')} DH`;
}

