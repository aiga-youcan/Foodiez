function render() {
  renderStats(state.orders);
  renderOrders(filteredOrders());
}