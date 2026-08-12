(() => {
  const KEY = "swiftdrop_v10_orders";

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  }

  function write(orders) {
    localStorage.setItem(KEY, JSON.stringify(orders));
  }

  window.SwiftDropBackend = {
    createOrder(order) {
      const orders = read();
      orders.unshift(order);
      write(orders);
      return order;
    },
    listOrders() { return read(); },
    getOrder(id) { return read().find(o => o.id === id) || null; },
    updateOrder(id, patch) {
      const orders = read();
      const i = orders.findIndex(o => o.id === id);
      if (i < 0) return null;
      orders[i] = { ...orders[i], ...patch };
      write(orders);
      return orders[i];
    }
  };
})();
