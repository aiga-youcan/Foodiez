// app.js

window.app = {
  loadData: async function () {
    window.ui.toggleLoading(true);
    try {
      var results = await Promise.all([getOrders(), getSettings()]);
      state.orders = results[0];
      state.settings = results[1];
      state.error = null;
    } catch (e) {
      console.error("API Error:", e);
      state.error =
        "JSON Server mawjoudach — lance: json-server --watch db.json --port 3000";
      window.ui.showError(state.error);
    } finally {
      window.ui.toggleLoading(false);
      // Render la page active avec les nouvelles donnees
      window.ui.render();
    }
  },

  init: function () {
    // 1. Affiche la section dashboard (nav + show section)
    window.events.handleNavigation("dashboard");
    // 2. Active le filtre "all"
    window.ui.updateFilterUI("all");
    // 3. Charge les donnees (va appeler render() apres)
    window.app.loadData();
  },
};

document.addEventListener("DOMContentLoaded", function () {
  // Boutons navigation
  document.querySelectorAll(".nav-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (btn.dataset.page) window.events.handleNavigation(btn.dataset.page);
    });
  });

  // Boutons filtres
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.dataset.filter) window.events.handleFilter(btn.dataset.filter);
    });
  });

  // Formulaire nouvelle commande
  var form = document.getElementById("order-form");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var customerName = document.getElementById("form-name").value.trim();
      var itemsStr = document.getElementById("form-items").value.trim();
      var totalPrice = parseFloat(document.getElementById("form-price").value);

      if (!customerName || !itemsStr || isNaN(totalPrice) || totalPrice <= 0) {
        showToast("Remplissez tous les champs correctement.", "error");
        return;
      }

      var newOrder = {
        customerName: customerName,
        items: itemsStr
          .split(",")
          .map(function (i) {
            return i.trim();
          })
          .filter(Boolean),
        totalPrice: totalPrice,
        status: "pending",
        createdAt: new Date().toISOString().split("T")[0],
      };

      try {
        window.ui.toggleLoading(true);
        var created = await createOrder(newOrder);
        state.orders.push(created);
        form.reset();
        showToast("Commande ajoutee !", "success");
        window.events.handleNavigation("orders");
      } catch (err) {
        window.ui.showError(
          "Impossible de creer la commande. JSON Server est-il demarre ?",
        );
      } finally {
        window.ui.toggleLoading(false);
      }
    });
  }

  // Lance l'app
  window.app.init();
});
