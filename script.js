const API_BASE = 'http://localhost:3000';
const ORDERS_API = `${API_BASE}/orders`;
const PRODUCTS_API = `${API_BASE}/products`;

let orders = [];
let products = [];
let currentPage = 'dashboard';
let orderFilter = 'all';
let orderSearch = '';

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