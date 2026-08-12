(() => {
  const cfg = window.SWIFTDROP_CONFIG;
  const $ = id => document.getElementById(id);
  const form = $("orderForm");
  const priceEl = $("price");
  const errorEl = $("error");
  const ordersEl = $("orders");

  function money(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0
    }).format(value);
  }

  function calculatePrice(km) {
    if (!Number.isFinite(km) || km <= 0) return cfg.pricing.baseFare;
    let total = cfg.pricing.baseFare;
    const first = Math.min(km, cfg.pricing.firstKm);
    total += first * cfg.pricing.firstRate;
    if (km > cfg.pricing.firstKm) {
      const second = Math.min(km - cfg.pricing.firstKm, cfg.pricing.secondKm);
      total += second * cfg.pricing.secondRate;
    }
    if (km > cfg.pricing.firstKm + cfg.pricing.secondKm) {
      total += (km - cfg.pricing.firstKm - cfg.pricing.secondKm) * cfg.pricing.laterRate;
    }
    return Math.round(total);
  }

  function updatePrice() {
    priceEl.textContent = money(calculatePrice(Number($("distance").value)));
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function clearError() {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }

  function orderId() {
    const d = new Date();
    const date = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `SWD-${date}-${random}`;
  }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }

  function renderOrders() {
    const orders = SwiftDropBackend.listOrders();
    if (!orders.length) {
      ordersEl.innerHTML = '<div class="empty">No orders yet.</div>';
      return;
    }
    ordersEl.innerHTML = orders.slice(0, 10).map(o => `
      <article class="order">
        <div class="orderTop">
          <b>${esc(o.id)}</b><span class="pill">${esc(o.status)}</span>
        </div>
        <div class="route">${esc(o.pickup)} → ${esc(o.drop)}</div>
        <div class="meta">${esc(o.packageType)} • ${o.distanceKm.toFixed(1)} km • ${money(o.priceInr)}</div>
      </article>
    `).join("");
  }

  $("distance").addEventListener("input", updatePrice);

  form.addEventListener("submit", event => {
    event.preventDefault();
    clearError();

    const name = $("customerName").value.trim();
    const phone = $("phone").value.replace(/\D/g, "");
    const pickup = $("pickup").value.trim();
    const drop = $("drop").value.trim();
    const packageType = $("packageType").value;
    const distanceKm = Number($("distance").value);

    if (name.length < 2) return showError("Enter a valid customer name.");
    if (!/^[6-9]\d{9}$/.test(phone)) return showError("Enter a valid 10-digit Indian mobile number.");
    if (pickup.length < 5) return showError("Enter the complete pickup address.");
    if (drop.length < 5) return showError("Enter the complete delivery address.");
    if (!Number.isFinite(distanceKm) || distanceKm <= 0 || distanceKm > cfg.pricing.maxDistanceKm) {
      return showError(`Distance must be between 0.1 and ${cfg.pricing.maxDistanceKm} km.`);
    }

    const order = {
      id: orderId(),
      customerName: name,
      phone,
      pickup,
      drop,
      packageType,
      distanceKm,
      priceInr: calculatePrice(distanceKm),
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    SwiftDropBackend.createOrder(order);
    form.reset();
    updatePrice();
    renderOrders();
    alert(`SwiftDrop order created!\n\n${order.id}\nFee: ${money(order.priceInr)}`);
  });

  updatePrice();
  renderOrders();
})();
