// utils.js
function formatDate(dateStr) {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("fr-FR");
}

function getStatusBadge(status) {
  const styles = {
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    accepted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    rejected: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  };
  const labels = {
    pending: "En attente",
    accepted: "Acceptee",
    completed: "Terminee",
    rejected: "Rejetee",
  };
  const cls =
    styles[status] || "bg-slate-500/15 text-slate-400 border-slate-500/30";
  const label = labels[status] || status;
  return `<span class="px-2.5 py-1 rounded-full text-xs font-semibold border ${cls} uppercase tracking-wider">${label}</span>`;
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const colors = {
    success: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    error: "bg-rose-500/20 border-rose-500/40 text-rose-300",
    info: "bg-slate-700/80 border-slate-600 text-slate-200",
  };
  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    info: "fas fa-info-circle",
  };
  const toast = document.createElement("div");
  toast.className =
    "toast flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm text-sm font-medium shadow-xl " +
    (colors[type] || colors.info);
  toast.innerHTML = `<i class="${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = "opacity 0.4s ease";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function filteredOrders() {
  if (state.filter === "all") return state.orders;
  return state.orders.filter((o) => o.status === state.filter);
}
