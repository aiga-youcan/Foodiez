window.app = {
  loadData: async () => {
    try {
      window.ui.toggleLoading(true);
      const [ordersData, settingsData] = await Promise.all([
        getOrders(),
        getSettings()
      ]);
      state.orders = ordersData;
      state.settings = settingsData;
      state.error = null;
    } catch (e) {
      console.error(e);
      state.error = "Could not connect to the server. Is json-server running?";
    } finally {
      window.ui.toggleLoading(false);
      window.ui.render();
    }
  },
  
  init: () => {
    window.events.handleNavigation('dashboard');
    window.events.handleFilter('all');
    window.app.loadData();
  }
};

// Start App
document.addEventListener("DOMContentLoaded", () => {
  window.app.init();
});
