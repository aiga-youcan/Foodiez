// ui.js

function render() {
  renderSettings();
  const page = state.currentPage;
  if (page === "dashboard") renderDashboard();
  else if (page === "orders") renderOrders();
  // new-order page: static HTML, no render needed
}

function renderSettings() {
  const brandName = document.getElementById("brand-name");
  const footerInfo = document.getElementById("footer-info");
  if (brandName)
    brandName.innerText = state.settings.restaurantName || "Foodiez";
  if (footerInfo)
    footerInfo.innerText =
      (state.settings.restaurantName || "Foodiez") +
      " | " +
      (state.settings.contactEmail || "");
}

function renderDashboard() {
  const statsEl = document.getElementById("dashboard-stats");
  const recentEl = document.getElementById("recent-orders");
  if (!statsEl) return;

  const o = state.orders;
  const counts = {
    total: o.length,
    pending: o.filter((x) => x.status === "pending").length,
    accepted: o.filter((x) => x.status === "accepted").length,
    completed: o.filter((x) => x.status === "completed").length,
    rejected: o.filter((x) => x.status === "rejected").length,
  };

  statsEl.innerHTML = [
    {
      label: "Total",
      val: counts.total,
      color: "text-white",
      border: "border-slate-600/40",
    },
    {
      label: "En attente",
      val: counts.pending,
      color: "text-amber-400",
      border: "border-amber-500/30",
    },
    {
      label: "Acceptees",
      val: counts.accepted,
      color: "text-blue-400",
      border: "border-blue-500/30",
    },
    {
      label: "Terminees",
      val: counts.completed,
      color: "text-emerald-400",
      border: "border-emerald-500/30",
    },
    {
      label: "Rejetees",
      val: counts.rejected,
      color: "text-rose-400",
      border: "border-rose-500/30",
    },
  ]
    .map(
      (c) =>
        '<div class="glass-card p-5 rounded-xl border ' +
        c.border +
        ' flex flex-col items-center justify-center text-center">' +
        '<span class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">' +
        c.label +
        "</span>" +
        '<span class="text-4xl font-bold ' +
        c.color +
        '">' +
        c.val +
        "</span>" +
        "</div>",
    )
    .join("");

  if (!recentEl) return;

  const recent = o
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  if (recent.length === 0) {
    recentEl.innerHTML =
      '<p class="text-slate-500 text-sm text-center py-6">Aucune commande.</p>';
    return;
  }

  recentEl.innerHTML = recent
    .map(function (r) {
      return (
        '<div class="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">' +
        "<div>" +
        '<p class="font-semibold text-white">' +
        r.customerName +
        "</p>" +
        '<p class="text-xs text-slate-500">' +
        formatDate(r.createdAt) +
        " &middot; " +
        r.items.join(", ") +
        "</p>" +
        "</div>" +
        '<div class="flex items-center gap-3">' +
        '<span class="text-orange-400 font-bold">' +
        r.totalPrice +
        " MAD</span>" +
        getStatusBadge(r.status) +
        "</div>" +
        "</div>"
      );
    })
    .join("");
}

function renderOrders() {
  const container = document.getElementById("orders-list");
  if (!container) return;

  const list = filteredOrders();

  if (list.length === 0) {
    container.innerHTML =
      '<div class="col-span-full py-16 flex flex-col items-center justify-center text-slate-500">' +
      '<i class="fas fa-box-open text-5xl mb-4 opacity-40"></i>' +
      '<p class="text-lg font-medium">Aucune commande trouvee.</p>' +
      "</div>";
    return;
  }

  container.innerHTML = list
    .map(function (order) {
      var isPending = order.status === "pending";
      var isActive = order.status === "pending" || order.status === "accepted";

      var btnAccept = isPending
        ? '<button onclick="window.events.handleStatus(' +
          order.id +
          ', \'accepted\')" class="flex-1 bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 text-xs font-semibold py-2 px-3 rounded-lg border border-blue-500/20 transition-all"><i class="fas fa-check mr-1"></i>Accepter</button>'
        : "";
      var btnComplete = isActive
        ? '<button onclick="window.events.handleStatus(' +
          order.id +
          ', \'completed\')" class="flex-1 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold py-2 px-3 rounded-lg border border-emerald-500/20 transition-all"><i class="fas fa-flag-checkered mr-1"></i>Terminer</button>'
        : "";
      var btnReject = isActive
        ? '<button onclick="window.events.handleStatus(' +
          order.id +
          ', \'rejected\')" class="flex-1 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold py-2 px-3 rounded-lg border border-rose-500/20 transition-all"><i class="fas fa-times mr-1"></i>Rejeter</button>'
        : "";
      var btnDelete =
        '<button onclick="window.events.handleDelete(' +
        order.id +
        ')" class="flex-1 bg-slate-700/30 hover:bg-red-500/15 text-slate-400 hover:text-red-400 text-xs font-semibold py-2 px-3 rounded-lg border border-slate-600/30 hover:border-red-500/30 transition-all"><i class="fas fa-trash mr-1"></i>Supprimer</button>';

      return (
        '<div class="glass-card p-5 rounded-xl flex flex-col">' +
        '<div class="flex justify-between items-start mb-4">' +
        "<div>" +
        '<h3 class="text-lg font-bold text-white">' +
        order.customerName +
        "</h3>" +
        '<p class="text-slate-500 text-xs mt-0.5">' +
        formatDate(order.createdAt) +
        " &middot; #" +
        order.id +
        "</p>" +
        "</div>" +
        getStatusBadge(order.status) +
        "</div>" +
        '<div class="mb-4 flex-grow">' +
        '<p class="text-slate-400 text-sm mb-2"><span class="text-slate-600">Items:</span> ' +
        order.items.join(", ") +
        "</p>" +
        '<p class="text-2xl font-bold text-orange-400">' +
        order.totalPrice +
        ' <span class="text-sm font-normal text-slate-500">MAD</span></p>' +
        "</div>" +
        '<div class="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-700/50">' +
        btnAccept +
        btnComplete +
        btnReject +
        btnDelete +
        "</div>" +
        "</div>"
      );
    })
    .join("");
}

function updateFilterUI(type) {
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    var active = btn.dataset.filter === type;
    btn.classList.toggle("bg-orange-500", active);
    btn.classList.toggle("text-white", active);
    btn.classList.toggle("border-orange-500", active);
    btn.classList.toggle("bg-slate-800/50", !active);
    btn.classList.toggle("text-slate-400", !active);
    btn.classList.toggle("border-slate-700", !active);
  });
}

function updateNavUI(page) {
  document.querySelectorAll(".nav-btn").forEach(function (btn) {
    var active = btn.dataset.page === page;
    btn.classList.toggle("text-orange-400", active);
    btn.classList.toggle("bg-slate-800/60", active);
    btn.classList.toggle("text-slate-400", !active);
  });
}

function toggleLoading(isLoading) {
  var loader = document.getElementById("global-loader");
  if (loader) loader.classList.toggle("hidden", !isLoading);
}

function showError(msg) {
  var banner = document.getElementById("error-banner");
  var text = document.getElementById("error-text");
  if (banner && text) {
    text.innerText = msg;
    banner.classList.remove("hidden");
    setTimeout(function () {
      banner.classList.add("hidden");
    }, 6000);
  }
  showToast(msg, "error");
}

window.ui = {
  render,
  renderDashboard,
  renderOrders,
  renderSettings,
  updateFilterUI,
  updateNavUI,
  toggleLoading,
  showError,
};
