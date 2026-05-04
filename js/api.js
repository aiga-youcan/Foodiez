<<<<<<< HEAD
const API_BASE = "http://localhost:3000";

async function getOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

async function createOrder(order) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
}

async function deleteOrder(id) {
  const res = await fetch(`${API_BASE}/orders/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete order");
  return res.json();
}

async function updateOrderStatus(id, status) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

async function getSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}
=======
fetch('http://localhost:3000/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
>>>>>>> 3fe9538 (new file:   db.json)
