const API_BASE = 'http://localhost:3000';
const ORDERS_API = `${API_BASE}/orders`;
const PRODUCTS_API = `${API_BASE}/products`;

// GET
export async function getOrders() {
  try {
    const res = await fetch(ORDERS_API);

    if (!res.ok) {
      throw new Error('Erreur lors du chargement des commandes');
    }

    return await res.json();
  } catch (error) {
    console.error('getOrders error:', error);
    return []; 
  }
}

// ADD
export async function addOrder(order) {
  try {
    const res = await fetch(ORDERS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    });

    if (!res.ok) {
      throw new Error('Erreur lors de l\'ajout');
    }

    return await res.json();
  } catch (error) {
    console.error('addOrder error:', error);
    throw error; 
  }
}

// UPDATE
export async function updateOrder(id, data) {
  try {
    const res = await fetch(`${ORDERS_API}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      throw new Error('Erreur lors de la mise à jour');
    }

    return await res.json();
  } catch (error) {
    console.error('updateOrder error:', error);
    throw error;
  }
}

// DELETE
export async function deleteOrder(id) {
  try {
    const res = await fetch(`${ORDERS_API}/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      throw new Error('Erreur lors de la suppression');
    }

    return true;
  } catch (error) {
    console.error('deleteOrder error:', error);
    throw error;
  }
}

import { getOrders, addOrder } from 

async function testAPI() {
  // TEST GET
  const orders = await getOrders();
  console.log("Orders:", orders);

  // TEST ADD
  const newOrder = {
    customerName: "Test Client",
    items: ["Pizza"],
    total: 100,
    status: "pending"
  };

  const result = await addOrder(newOrder);
  console.log("Added:", result);
}

testAPI();