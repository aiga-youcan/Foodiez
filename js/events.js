window.events = {
  handleStatus: async (id, status) => {
    try {
      window.ui.toggleLoading(true);
      await updateOrderStatus(id, status);
      await window.app.loadData();
    } catch (e) {
      state.error = e.message;
      window.ui.showError(e.message);
    } finally {
      window.ui.toggleLoading(false);
    }
  },

  handleDelete: async (id) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      window.ui.toggleLoading(true);
      await deleteOrder(id);
      await window.app.loadData();
    } catch (e) {
      state.error = e.message;
      window.ui.showError(e.message);
    } finally {
      window.ui.toggleLoading(false);
    }
  },

  handleFilter: (type) => {
    state.filter = type;
    window.ui.updateFilterUI(type);
    window.ui.render();
  },

  handleNavigation: (page) => {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(`page-${page}`).classList.remove('hidden');
    window.ui.updateNavUI(page);
  }
};

// Setup DOM Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.events.handleNavigation(btn.dataset.page);
    });
  });

  // Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => window.events.handleFilter(btn.dataset.filter));
  });

  // Form Submit
  const form = document.getElementById("order-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const customerName = document.getElementById("form-name").value;
      const itemsStr = document.getElementById("form-items").value;
      const totalPrice = parseFloat(document.getElementById("form-price").value);
      
      if (!customerName || !itemsStr || isNaN(totalPrice)) {
        window.ui.showError("Please fill in all fields correctly.");
        return;
      }

      const items = itemsStr.split(',').map(i => i.trim()).filter(i => i);
      
      const newOrder = {
        customerName,
        items,
        totalPrice,
        status: "pending",
        createdAt: new Date().toISOString()
      };

      try {
        window.ui.toggleLoading(true);
        await createOrder(newOrder);
        form.reset();
        await window.app.loadData();
        window.events.handleNavigation('orders');
      } catch (err) {
        window.ui.showError("Failed to create order.");
      } finally {
        window.ui.toggleLoading(false);
      }
    });
  }
});
