function render() {
<<<<<<< HEAD
<<<<<<< HEAD
  if (state.error) {
    showError(state.error);
    return;
  }
  renderSettings();
  renderDashboard();
  renderOrders();
}

function renderSettings() {
  const brandName = document.getElementById("brand-name");
  const footerInfo = document.getElementById("footer-info");
  if (brandName) brandName.innerText = state.settings.restaurantName || "Foodiez";
  if (footerInfo) footerInfo.innerText = `${state.settings.restaurantName} | ${state.settings.contactEmail}`;
}

function renderDashboard() {
  const statsContainer = document.getElementById("dashboard-stats");
  if (!statsContainer) return;

  const total = state.orders.length;
  const pending = state.orders.filter(o => o.status === "pending").length;
  const accepted = state.orders.filter(o => o.status === "accepted").length;
  const completed = state.orders.filter(o => o.status === "completed").length;
  const rejected = state.orders.filter(o => o.status === "rejected").length;

  statsContainer.innerHTML = `
    <div class="glass-card p-6 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
      <span class="text-slate-400 text-sm font-medium mb-1">Total Orders</span>
      <span class="text-4xl font-bold text-white">${total}</span>
    </div>
    <div class="glass-card p-6 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
      <span class="text-amber-400 text-sm font-medium mb-1">Pending</span>
      <span class="text-4xl font-bold text-amber-500">${pending}</span>
    </div>
    <div class="glass-card p-6 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
      <span class="text-blue-400 text-sm font-medium mb-1">Accepted</span>
      <span class="text-4xl font-bold text-blue-500">${accepted}</span>
    </div>
    <div class="glass-card p-6 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
      <span class="text-emerald-400 text-sm font-medium mb-1">Completed</span>
      <span class="text-4xl font-bold text-emerald-500">${completed}</span>
    </div>
    <div class="glass-card p-6 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
      <span class="text-rose-400 text-sm font-medium mb-1">Rejected</span>
      <span class="text-4xl font-bold text-rose-500">${rejected}</span>
    </div>
  `;
}

function renderOrders() {
  const ordersList = document.getElementById("orders-list");
  if (!ordersList) return;

  let list = state.orders;
  if (state.filter !== "all") {
    list = list.filter(o => o.status === state.filter);
  }

  if (list.length === 0) {
    ordersList.innerHTML = `
      <div class="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-lg">No orders found.</p>
      </div>
    `;
    return;
  }

  ordersList.innerHTML = list.map(order => `
    <div class="glass-card p-5 rounded-xl fade-in flex flex-col h-full">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-lg font-bold text-white mb-1">${order.customerName}</h3>
          <p class="text-slate-400 text-sm">${new Date(order.createdAt).toLocaleDateString()} - #${order.id}</p>
        </div>
        ${getStatusBadge(order.status)}
      </div>
      
      <div class="mb-4 flex-grow">
        <p class="text-slate-300 text-sm mb-2"><span class="text-slate-500">Items:</span> ${order.items.join(', ')}</p>
        <p class="text-2xl font-bold text-indigo-400">${order.totalPrice} <span class="text-sm font-normal text-slate-500">MAD</span></p>
      </div>

      <div class="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-700/50">
        ${order.status === 'pending' ? \`<button onclick="window.events.handleStatus(\${order.id}, 'accepted')" class="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium py-2 px-3 rounded border border-blue-500/20 transition-colors">Accept</button>\` : ''}
        ${['pending', 'accepted'].includes(order.status) ? \`<button onclick="window.events.handleStatus(\${order.id}, 'completed')" class="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium py-2 px-3 rounded border border-emerald-500/20 transition-colors">Complete</button>\` : ''}
        ${['pending', 'accepted'].includes(order.status) ? \`<button onclick="window.events.handleStatus(\${order.id}, 'rejected')" class="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium py-2 px-3 rounded border border-rose-500/20 transition-colors">Reject</button>\` : ''}
        <button onclick="window.events.handleDelete(${order.id})" class="flex-1 bg-slate-700/30 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs font-medium py-2 px-3 rounded border border-slate-600/30 hover:border-red-500/30 transition-colors">Delete</button>
      </div>
    </div>
  `).join('');
}

function getStatusBadge(status) {
  const styles = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    accepted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20"
  };
  return \`<span class="px-2.5 py-1 rounded-full text-xs font-medium border \${styles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'} uppercase tracking-wider">\${status}</span>\`;
}

function updateFilterUI(type) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-500');
    btn.classList.add('bg-slate-800/50', 'text-slate-400', 'border-slate-700');
    if (btn.dataset.filter === type) {
      btn.classList.remove('bg-slate-800/50', 'text-slate-400', 'border-slate-700');
      btn.classList.add('bg-indigo-600', 'text-white', 'border-indigo-500');
    }
  });
}

function updateNavUI(page) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('text-indigo-400', 'bg-slate-800/50');
    btn.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-slate-800/30');
    if (btn.dataset.page === page) {
      btn.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-slate-800/30');
      btn.classList.add('text-indigo-400', 'bg-slate-800/50');
    }
  });
}

function toggleLoading(isLoading) {
  const loader = document.getElementById('global-loader');
  if (loader) loader.classList.toggle('hidden', !isLoading);
}

function showError(msg) {
  const errorBanner = document.getElementById('error-banner');
  const errorText = document.getElementById('error-text');
  if (errorBanner && errorText) {
    errorText.innerText = msg;
    errorBanner.classList.remove('hidden');
    setTimeout(() => errorBanner.classList.add('hidden'), 5000);
  }
}

// Attach to window for direct access if needed, though most is handled in events
window.ui = { render, updateFilterUI, updateNavUI, toggleLoading, showError };
=======
  renderStats(state.orders);
  renderOrders(filteredOrders());
}
>>>>>>> 3fe9538 (new file:   db.json)
=======
  renderStats(state.orders);
  renderOrders(filteredOrders());
}
>>>>>>> 2a6db0e (# Please enter the commit message for your changes. Lines starting)
