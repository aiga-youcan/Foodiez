// events.js

window.events = {
  handleStatus: async function (id, status) {
    try {
      window.ui.toggleLoading(true);
      await updateOrderStatus(id, status);
      var idx = state.orders.findIndex(function (o) {
        return o.id === id;
      });
      if (idx !== -1) state.orders[idx].status = status;
      window.ui.render();
      showToast("Statut mis a jour !", "success");
    } catch (e) {
      window.ui.showError(e.message);
    } finally {
      window.ui.toggleLoading(false);
    }
  },

  handleDelete: async function (id) {
    if (!confirm("Supprimer cette commande ?")) return;
    try {
      window.ui.toggleLoading(true);
      await deleteOrder(id);
      state.orders = state.orders.filter(function (o) {
        return o.id !== id;
      });
      window.ui.render();
      showToast("Commande supprimee.", "info");
    } catch (e) {
      window.ui.showError(e.message);
    } finally {
      window.ui.toggleLoading(false);
    }
  },

  handleFilter: function (type) {
    state.filter = type;
    window.ui.updateFilterUI(type);
    window.ui.renderOrders();
  },

  handleNavigation: function (page) {
    state.currentPage = page;
    // Cache toutes les sections
    var sections = document.querySelectorAll(".page-section");
    sections.forEach(function (sec) {
      sec.classList.add("hidden");
    });
    // Affiche la section cible
    var target = document.getElementById("page-" + page);
    if (target) target.classList.remove("hidden");
    // Met a jour le nav
    window.ui.updateNavUI(page);
    // Render le contenu de la page
    if (page === "dashboard") window.ui.renderDashboard();
    if (page === "orders") window.ui.renderOrders();
  },
};
