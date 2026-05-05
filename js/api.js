const URL = "http://localhost:3000/orders";

// GET
export async function getOrders() {
  try {
    const res = await fetch(URL);
    return await res.json();
  } catch (error) {
    console.log("Error fetching orders:", error);
  }
}
// ADD
export async function addOrder(order) {
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(order)
    });
    return await res.json();
  } catch (error) {
    console.log("Error adding order:", error);
  }
}

// UPDATE
export async function updateOrder(id, data) {
  try {
    const res = await fetch(`${URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (error) {
    console.log("Error updating order:", error);
  }
}

// DELETE
export async function deleteOrder(id) {
  try {
    await fetch(`${URL}/${id}`, {
      method: "DELETE"
    });
  } catch (error) {
    console.log("Error deleting order:", error);
  }
}