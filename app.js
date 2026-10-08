/* =========================================================
   PHARMACY INVENTORY - CLEAN APP.JS
   ========================================================= */

(function () {
  "use strict";

  /* ---------- STORAGE ---------- */

  const DB = {
    medicines: "pharmacy_medicines",
    purchases: "pharmacy_purchases",
    sales: "pharmacy_sales",
    suppliers: "pharmacy_suppliers",
    customers: "pharmacy_customers",
    payments: "pharmacy_payments",
    settings: "pharmacy_settings",
    adminUser: "pharmacy_admin_user",
    adminPass: "pharmacy_admin_pass",
    loggedIn: "pharmacy_logged_in"
  };

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getMedicines() {
    return read(DB.medicines, []);
  }

  function getPurchases() {
    return read(DB.purchases, []);
  }

  function getSales() {
    return read(DB.sales, []);
  }

  function getSuppliers() {
    return read(DB.suppliers, []);
  }

  function getCustomers() {
    return read(DB.customers, []);
  }

  function getPayments() {
    return read(DB.payments, []);
  }

  function uid(prefix) {
    return prefix + Date.now() + Math.floor(Math.random() * 1000);
  }

  function money(n) {
    return "৳ " + Number(n || 0).toFixed(2);
  }

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function app() {
    return document.getElementById("app");
  }

  function loggedIn() {
    return localStorage.getItem(DB.loggedIn) === "true";
  }

  /* =========================================================
     LOGIN
     ========================================================= */

  function showLogin() {
    if (!app()) return;

    app().innerHTML = `
      <div style="
        max-width:420px;
        margin:60px auto;
        padding:30px;
        background:#fff;
        border-radius:15px;
        box-shadow:0 5px 25px rgba(0,0,0,.12);
      ">
        <h2 style="text-align:center;margin-bottom:10px;">
          🏥 Pharmacy Inventory
        </h2>

        <p style="text-align:center;color:#777;margin-bottom:25px;">
          Admin Login
        </p>

        <form id="loginForm">

          <label>Username</label>
          <input
            id="loginUsername"
            class="form-control"
            type="text"
            value="admin"
            required
            style="width:100%;margin:8px 0 15px;padding:12px;"
          >

          <label>Password</label>
          <input
            id="loginPassword"
            class="form-control"
            type="password"
            required
            style="width:100%;margin:8px 0 20px;padding:12px;"
          >

          <button
            type="submit"
            class="btn btn-primary"
            style="width:100%;padding:13px;"
          >
            🔐 Login
          </button>

          <p id="loginError"
             style="color:red;text-align:center;margin-top:15px;">
          </p>

        </form>

        <p style="text-align:center;color:#888;font-size:13px;margin-top:20px;">
          Default: admin / 1234
        </p>
      </div>
    `;

    const form = document.getElementById("loginForm");

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        adminLogin();
      });
    }
  }

  function adminLogin() {
    const username =
      document.getElementById("loginUsername")?.value.trim();

    const password =
      document.getElementById("loginPassword")?.value;

    const savedUser =
      localStorage.getItem(DB.adminUser) || "admin";

    const savedPass =
      localStorage.getItem(DB.adminPass) || "1234";

    if (username === savedUser && password === savedPass) {
      localStorage.setItem(DB.loggedIn, "true");
      showDashboard();
    } else {
      const error = document.getElementById("loginError");

      if (error) {
        error.textContent = "Username অথবা Password ভুল!";
      }
    }
  }

  function adminLogout() {
    localStorage.removeItem(DB.loggedIn);
    showLogin();
  }

  function changeAdminPassword() {
    const oldPass = prompt("বর্তমান Password দিন:");

    if (oldPass === null) return;

    const savedPass =
      localStorage.getItem(DB.adminPass) || "1234";

    if (oldPass !== savedPass) {
      alert("বর্তমান Password সঠিক নয়!");
      return;
    }

    const newPass = prompt("নতুন Password দিন:");

    if (!newPass || newPass.length < 4) {
      alert("কমপক্ষে ৪ অক্ষরের Password দিন!");
      return;
    }

    localStorage.setItem(DB.adminPass, newPass);

    alert("Password সফলভাবে পরিবর্তন হয়েছে।");
  }

  /* =========================================================
     PAGE HEADER
     ========================================================= */

  function page(title, content) {
    if (!app()) return;

    app().innerHTML = `
      <div style="margin-bottom:20px;">
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
          flex-wrap:wrap;
        ">
          <h2>${title}</h2>

          <button
            class="btn"
            onclick="showDashboard()"
          >
            🏠 Dashboard
          </button>
        </div>
      </div>

      ${content}
    `;
  }

  /* =========================================================
     DASHBOARD
     ========================================================= */

  function showDashboard() {

    if (!loggedIn()) {
      showLogin();
      return;
    }

    const medicines = getMedicines();
    const purchases = getPurchases();
    const sales = getSales();

    let stockValue = 0;
    let lowStock = 0;

    medicines.forEach(m => {
      const stock = Number(m.stock || 0);
      const buy = Number(m.buyPrice || 0);

      stockValue += stock * buy;

      if (stock <= Number(m.minStock || 5)) {
        lowStock++;
      }
    });

    const todaySales = sales
      .filter(s => s.date === today())
      .reduce((sum, s) => sum + Number(s.total || 0), 0);

    const todayPurchase = purchases
      .filter(p => p.date === today())
      .reduce((sum, p) => sum + Number(p.total || 0), 0);

    app().innerHTML = `

      <div style="margin-bottom:25px;">
        <h2>📊 Dashboard</h2>
        <p style="color:#777;">
          Pharmacy Inventory Management
        </p>
      </div>

      <div class="cards" style="
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
        gap:15px;
      ">

        <div class="card">
          <h3>💊 Medicines</h3>
          <h2>${medicines.length}</h2>
        </div>

        <div class="card">
          <h3>📦 Stock Value</h3>
          <h2>${money(stockValue)}</h2>
        </div>

        <div class="card">
          <h3>💰 Today's Sale</h3>
          <h2>${money(todaySales)}</h2>
        </div>

        <div class="card">
          <h3>🛒 Today's Purchase</h3>
          <h2>${money(todayPurchase)}</h2>
        </div>

        <div class="card">
          <h3>⚠️ Low Stock</h3>
          <h2>${lowStock}</h2>
        </div>

      </div>

      <div style="
        margin-top:25px;
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
        gap:12px;
      ">

        <button class="btn btn-primary"
          onclick="showMedicines()">
          💊 Medicines
        </button>

        <button class="btn"
          onclick="showPurchase()">
          📦 Purchase
        </button>

        <button class="btn"
          onclick="showSales()">
          💰 Sale / POS
        </button>

        <button class="btn"
          onclick="showSuppliers()">
          🚚 Suppliers
        </button>

        <button class="btn"
          onclick="showCustomers()">
          👥 Customers
        </button>

        <button class="btn"
          onclick="showReports()">
          📊 Reports
        </button>

        <button class="btn"
          onclick="showPharmacySettings()">
          ⚙️ Settings
        </button>

        <button class="btn"
          onclick="changeAdminPassword()">
          🔑 Password
        </button>

        <button class="btn"
          onclick="adminLogout()">
          🚪 Logout
        </button>

      </div>

      <div class="panel" style="margin-top:25px;">
        <h3>⚠️ Low Stock Medicines</h3>
        ${renderLowStock()}
      </div>
    `;
  }

  function renderLowStock() {
    const medicines = getMedicines();

    const low = medicines.filter(
      m => Number(m.stock || 0) <= Number(m.minStock || 5)
    );

    if (!low.length) {
      return `<p style="color:green;">সব Medicine-এর Stock ঠিক আছে।</p>`;
    }

    return `
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <th style="padding:8px;text-align:left;">Medicine</th>
            <th style="padding:8px;">Stock</th>
            <th style="padding:8px;">Minimum</th>
          </tr>

          ${low.map(m => `
            <tr>
              <td style="padding:8px;">${esc(m.name)}</td>
              <td style="padding:8px;text-align:center;">
                ${Number(m.stock || 0)}
              </td>
              <td style="padding:8px;text-align:center;">
                ${Number(m.minStock || 5)}
              </td>
            </tr>
          `).join("")}
        </table>
      </div>
    `;
  }

  /* =========================================================
     MEDICINES
     ========================================================= */

  function showMedicines() {

    if (!loggedIn()) return showLogin();

    const medicines = getMedicines();

    page("💊 Medicines", `

      <div class="panel">

        <h3>Add New Medicine</h3>

        <form id="medicineForm">

          <div style="
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
            gap:12px;
          ">

            <input
              id="medName"
              class="form-control"
              placeholder="Medicine Name"
              required
            >

            <input
              id="medGeneric"
              class="form-control"
              placeholder="Generic Name"
            >

            <input
              id="medCompany"
              class="form-control"
              placeholder="Company"
            >

            <input
              id="medBuy"
              class="form-control"
              type="number"
              step="0.01"
              placeholder="Buy Price"
              required
            >

            <input
              id="medSale"
              class="form-control"
              type="number"
              step="0.01"
              placeholder="Sale Price"
              required
            >

            <input
              id="medStock"
              class="form-control"
              type="number"
              placeholder="Stock"
              value="0"
            >

            <input
              id="medMin"
              class="form-control"
              type="number"
              placeholder="Minimum Stock"
              value="5"
            >

            <input
              id="medExpiry"
              class="form-control"
              type="date"
            >

          </div>

          <br>

          <button class="btn btn-primary" type="submit">
            ➕ Add Medicine
          </button>

        </form>

      </div>

      <div class="panel" style="margin-top:20px;">

        <h3>Medicine List</h3>

        <input
          id="medicineSearch"
          class="form-control"
          placeholder="🔎 Search medicine..."
          style="max-width:400px;margin-bottom:15px;"
        >

        <div style="overflow-x:auto;">
          <table id="medicineTable"
            style="width:100%;border-collapse:collapse;">

            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Generic</th>
                <th>Company</th>
                <th>Buy</th>
                <th>Sale</th>
                <th>Stock</th>
                <th>Expiry</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              ${medicineRows(medicines)}
            </tbody>

          </table>
        </div>

      </div>
    `);

    document
      .getElementById("medicineForm")
      ?.addEventListener("submit", function (e) {
        e.preventDefault();
        addMedicine();
      });

    document
      .getElementById("medicineSearch")
      ?.addEventListener("input", function () {
        filterMedicines(this.value);
      });
  }

  function medicineRows(list) {

    if (!list.length) {
      return `
        <tr>
          <td colspan="9" style="text-align:center;padding:20px;">
            কোনো Medicine নেই।
          </td>
        </tr>
      `;
    }

    return list.map((m, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${esc(m.name)}</td>
        <td>${esc(m.generic)}</td>
        <td>${esc(m.company)}</td>
        <td>${money(m.buyPrice)}</td>
        <td>${money(m.salePrice)}</td>
        <td>${Number(m.stock || 0)}</td>
        <td>${esc(m.expiry || "-")}</td>
        <td>
          <button
            class="btn"
            onclick="editMedicine('${m.id}')">
            ✏️
          </button>

          <button
            class="btn"
            onclick="deleteMedicine('${m.id}')">
            🗑️
          </button>
        </td>
      </tr>
    `).join("");
  }

  function addMedicine() {

    const medicines = getMedicines();

    const medicine = {
      id: uid("MED"),
      name: document.getElementById("medName").value.trim(),
      generic: document.getElementById("medGeneric").value.trim(),
      company: document.getElementById("medCompany").value.trim(),
      buyPrice: Number(document.getElementById("medBuy").value || 0),
      salePrice: Number(document.getElementById("medSale").value || 0),
      stock: Number(document.getElementById("medStock").value || 0),
      minStock: Number(document.getElementById("medMin").value || 5),
      expiry: document.getElementById("medExpiry").value,
      createdAt: new Date().toISOString()
    };

    medicines.push(medicine);
    write(DB.medicines, medicines);

    alert("Medicine যোগ হয়েছে।");

    showMedicines();
  }

  function deleteMedicine(id) {

    if (!confirm("এই Medicine Delete করতে চান?")) return;

    const medicines =
      getMedicines().filter(m => m.id !== id);

    write(DB.medicines, medicines);

    showMedicines();
  }

  function editMedicine(id) {

    const medicines = getMedicines();

    const m = medicines.find(x => x.id === id);

    if (!m) return;

    const name = prompt("Medicine Name:", m.name);
    if (name === null) return;

    const buy = prompt("Buy Price:", m.buyPrice);
    if (buy === null) return;

    const sale = prompt("Sale Price:", m.salePrice);
    if (sale === null) return;

    const stock = prompt("Stock:", m.stock);
    if (stock === null) return;

    m.name = name.trim();
    m.buyPrice = Number(buy);
    m.salePrice = Number(sale);
    m.stock = Number(stock);

    write(DB.medicines, medicines);

    alert("Medicine update হয়েছে.");

    showMedicines();
  }

  function filterMedicines(value) {

    const search = value.toLowerCase();

    const medicines = getMedicines().filter(m =>
      String(m.name).toLowerCase().includes(search) ||
      String(m.generic).toLowerCase().includes(search) ||
      String(m.company).toLowerCase().includes(search)
    );

    const tbody =
      document.querySelector("#medicineTable tbody");

    if (tbody) {
      tbody.innerHTML = medicineRows(medicines);
    }
  }

  /* =========================================================
     PURCHASE
     ========================================================= */

  function showPurchase() {

    if (!loggedIn()) return showLogin();

    const medicines = getMedicines();
    const suppliers = getSuppliers();

    page("📦 Medicine Purchase", `

      <div class="panel">

        <form id="purchaseForm">

          <div style="
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
            gap:12px;
          ">

            <select id="purchaseMedicine"
              class="form-control" required>
              <option value="">Select Medicine</option>

              ${medicines.map(m => `
                <option value="${m.id}">
                  ${esc(m.name)}
                </option>
              `).join("")}

            </select>

            <select id="purchaseSupplier"
              class="form-control">
              <option value="">Select Supplier</option>

              ${suppliers.map(s => `
                <option value="${s.id}">
                  ${esc(s.name)}
                </option>
              `).join("")}

            </select>

            <input
              id="purchaseQty"
              class="form-control"
              type="number"
              min="1"
              placeholder="Quantity"
              required
            >

            <input
              id="purchasePrice"
              class="form-control"
              type="number"
              step="0.01"
              placeholder="Purchase Price"
              required
            >

            <input
              id="purchaseDate"
              class="form-control"
              type="date"
              value="${today()}"
            >

          </div>

          <br>

          <button class="btn btn-primary" type="submit">
            💾 Save Purchase
          </button>

        </form>

      </div>

      <div class="panel" style="margin-top:20px;">

        <h3>Recent Purchases</h3>

        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;">

            <tr>
              <th>Date</th>
              <th>Medicine</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>

            ${purchaseRows()}

          </table>
        </div>

      </div>
    `);

    document
      .getElementById("purchaseMedicine")
      ?.addEventListener("change", function () {

        const m = medicines.find(x => x.id === this.value);

        if (m) {
          document.getElementById("purchasePrice").value =
            m.buyPrice || "";
        }
      });

    document
      .getElementById("purchaseForm")
      ?.addEventListener("submit", function (e) {
        e.preventDefault();
        addPurchase();
      });
  }

  function addPurchase() {

    const medicineId =
      document.getElementById("purchaseMedicine").value;

    const qty =
      Number(document.getElementById("purchaseQty").value);

    const price =
      Number(document.getElementById("purchasePrice").value);

    if (!medicineId || qty <= 0 || price < 0) {
      alert("সব তথ্য সঠিকভাবে দিন।");
      return;
    }

    const medicines = getMedicines();

    const medicine =
      medicines.find(m => m.id === medicineId);

    if (!medicine) {
      alert("Medicine পাওয়া যায়নি।");
      return;
    }

    medicine.stock =
      Number(medicine.stock || 0) + qty;

    write(DB.medicines, medicines);

    const purchases = getPurchases();

    purchases.unshift({
      id: uid("PUR"),
      medicineId,
      medicineName: medicine.name,
      supplierId:
        document.getElementById("purchaseSupplier").value,
      qty,
      price,
      total: qty * price,
      date:
        document.getElementById("purchaseDate").value || today()
    });

    write(DB.purchases, purchases);

    alert("Purchase Save হয়েছে।");

    showPurchase();
  }

  function purchaseRows() {

    const purchases = getPurchases();

    if (!purchases.length) {
      return `
        <tr>
          <td colspan="5" style="text-align:center;padding:20px;">
            কোনো Purchase নেই।
          </td>
        </tr>
      `;
    }

    return purchases.slice(0, 50).map(p => `
      <tr>
        <td>${esc(p.date)}</td>
        <td>${esc(p.medicineName)}</td>
        <td>${p.qty}</td>
        <td>${money(p.price)}</td>
        <td>${money(p.total)}</td>
      </tr>
    `).join("");
  }

  /* =========================================================
     SALES / POS
     ========================================================= */

  let cart = [];

  function showSales() {

    if (!loggedIn()) return showLogin();

    cart = [];

    page("💰 Sales / POS", `

      <div class="panel">

        <h3>New Sale</h3>

        <div style="
          display:grid;
          grid-template-columns:2fr 1fr 1fr;
          gap:10px;
        ">

          <select id="saleMedicine"
            class="form-control">
            <option value="">Select Medicine</option>

            ${getMedicines().map(m => `
              <option value="${m.id}">
                ${esc(m.name)} — Stock: ${m.stock}
              </option>
            `).join("")}

          </select>

          <input
            id="saleQty"
            class="form-control"
            type="number"
            min="1"
            value="1"
            placeholder="Qty"
          >

          <button
            class="btn btn-primary"
            onclick="addToCart()">
            ➕ Add
          </button>

        </div>

      </div>

      <div class="panel" style="margin-top:20px;">

        <h3>🛒 Cart</h3>

        <div id="cartArea">
          ${renderCart()}
        </div>

      </div>

    `);
  }

  function addToCart() {

    const medicineId =
      document.getElementById("saleMedicine").value;

    const qty =
      Number(document.getElementById("saleQty").value || 0);

    const medicine =
      getMedicines().find(m => m.id === medicineId);

    if (!medicine) {
      alert("Medicine Select করুন।");
      return;
    }

    if (qty <= 0) {
      alert("Quantity সঠিক দিন।");
      return;
    }

    const existing =
      cart.find(x => x.medicineId === medicineId);

    const currentQty =
      existing ? existing.qty : 0;

    if (currentQty + qty > Number(medicine.stock || 0)) {
      alert("পর্যাপ্ত Stock নেই।");
      return;
    }

    if (existing) {
      existing.qty += qty;
      existing.total =
        existing.qty * existing.price;
    } else {
      cart.push({
        medicineId,
        name: medicine.name,
        qty,
        price: Number(medicine.salePrice || 0),
        total: qty * Number(medicine.salePrice || 0)
      });
    }

    const area = document.getElementById("cartArea");

    if (area) {
      area.innerHTML = renderCart();
    }
  }

  function renderCart() {

    if (!cart.length) {
      return `<p>Cart খালি।</p>`;
    }

    const total =
      cart.reduce((sum, x) => sum + x.total, 0);

    return `

      <div style="overflow-x:auto;">

        <table style="width:100%;border-collapse:collapse;">

          <tr>
            <th>Medicine</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th></th>
          </tr>

          ${cart.map((x, i) => `
            <tr>
              <td>${esc(x.name)}</td>
              <td>${x.qty}</td>
              <td>${money(x.price)}</td>
              <td>${money(x.total)}</td>
              <td>
                <button
                  class="btn"
                  onclick="removeCartItem(${i})">
                  ❌
                </button>
              </td>
            </tr>
          `).join("")}

        </table>

      </div>

      <h2 style="text-align:right;">
        Total: ${money(total)}
      </h2>

      <div style="margin-top:15px;">

        <input
          id="customerName"
          class="form-control"
          placeholder="Customer Name"
          style="max-width:400px;"
        >

        <br>

        <select id="paymentMethod"
          class="form-control"
          style="max-width:400px;">

          <option value="Cash">Cash</option>
          <option value="bKash">bKash</option>
          <option value="Nagad">Nagad</option>
          <option value="Due">Due</option>

        </select>

        <br>

        <button
          class="btn btn-primary"
          onclick="completeSale()">
          ✅ Complete Sale
        </button>

      </div>
    `;
  }

  function removeCartItem(index) {

    cart.splice(index, 1);

    const area = document.getElementById("cartArea");

    if (area) {
      area.innerHTML = renderCart();
    }
  }

  function completeSale() {

    if (!cart.length) {
      alert("Cart খালি!");
      return;
    }

    const medicines = getMedicines();

    cart.forEach(item => {

      const m =
        medicines.find(x => x.id === item.medicineId);

      if (m) {
        m.stock =
          Number(m.stock || 0) - Number(item.qty);
      }

    });

    write(DB.medicines, medicines);

    const total =
      cart.reduce((sum, x) => sum + x.total, 0);

    const sale = {
      id: uid("SALE"),
      items: cart.map(x => ({ ...x })),
      total,
      customer:
        document.getElementById("customerName")?.value.trim() || "",
      payment:
        document.getElementById("paymentMethod")?.value || "Cash",
      date: today(),
      createdAt: new Date().toISOString()
    };

    const sales = getSales();

    sales.unshift(sale);

    write(DB.sales, sales);

    alert(
      "Sale সফলভাবে Complete হয়েছে!\nTotal: " +
      money(total)
    );

    cart = [];

    showSales();
  }

  /* =========================================================
     SUPPLIERS
     ========================================================= */

  function showSuppliers() {

    if (!loggedIn()) return showLogin();

    const suppliers = getSuppliers();

    page("🚚 Suppliers", `

      <div class="panel">

        <form id="supplierForm">

          <div style="
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
            gap:12px;
          ">

            <input
              id="supplierName"
              class="form-control"
              placeholder="Supplier Name"
              required
            >

            <input
              id="supplierPhone"
              class="form-control"
              placeholder="Phone"
            >

            <input
              id="supplierAddress"
              class="form-control"
              placeholder="Address"
            >

          </div>

          <br>

          <button class="btn btn-primary">
            ➕ Add Supplier
          </button>

        </form>

      </div>

      <div class="panel" style="margin-top:20px;">

        <h3>Supplier List</h3>

        ${supplierRows(suppliers)}

      </div>
    `);

    document
      .getElementById("supplierForm")
      ?.addEventListener("submit", function (e) {
        e.preventDefault();

        const list = getSuppliers();

        list.push({
          id: uid("SUP"),
          name:
            document.getElementById("supplierName").value.trim(),
          phone:
            document.getElementById("supplierPhone").value.trim(),
          address:
            document.getElementById("supplierAddress").value.trim()
        });

        write(DB.suppliers, list);

        alert("Supplier যোগ হয়েছে.");

        showSuppliers();
      });
  }

  function supplierRows(list) {

    if (!list.length) {
      return "<p>কোনো Supplier নেই।</p>";
    }

    return `
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">

          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Action</th>
          </tr>

          ${list.map(s => `
            <tr>
              <td>${esc(s.name)}</td>
              <td>${esc(s.phone)}</td>
              <td>${esc(s.address)}</td>
              <td>
                <button
                  class="btn"
                  onclick="deleteSupplier('${s.id}')">
                  🗑️
                </button>
              </td>
            </tr>
          `).join("")}

        </table>
      </div>
    `;
  }

  function deleteSupplier(id) {

    if (!confirm("Supplier Delete করবেন?")) return;

    write(
      DB.suppliers,
      getSuppliers().filter(s => s.id !== id)
    );

    showSuppliers();
  }

  /* =========================================================
     CUSTOMERS
     ========================================================= */

  function showCustomers() {

    if (!loggedIn()) return showLogin();

    const customers = getCustomers();

    page("👥 Customers", `

      <div class="panel">

        <form id="customerForm">

          <div style="
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
            gap:12px;
          ">

            <input
              id="customerNameInput"
              class="form-control"
              placeholder="Customer Name"
              required
            >

            <input
              id="customerPhone"
              class="form-control"
              placeholder="Phone"
            >

            <input
              id="customerAddress"
              class="form-control"
              placeholder="Address"
            >

          </div>

          <br>

          <button class="btn btn-primary">
            ➕ Add Customer
          </button>

        </form>

      </div>

      <div class="panel" style="margin-top:20px;">

        <h3>Customer List</h3>

        ${customerRows(customers)}

      </div>
    `);

    document
      .getElementById("customerForm")
      ?.addEventListener("submit", function (e) {

        e.preventDefault();

        const list = getCustomers();

        list.push({
          id: uid("CUS"),
          name:
            document.getElementById("customerNameInput")
              .value.trim(),
          phone:
            document.getElementById("customerPhone")
              .value.trim(),
          address:
            document.getElementById("customerAddress")
              .value.trim()
        });

        write(DB.customers, list);

        alert("Customer যোগ হয়েছে.");

        showCustomers();
      });
  }

  function customerRows(list) {

    if (!list.length) {
      return "<p>কোনো Customer নেই।</p>";
    }

    return `
      <div style="overflow-x:auto;">

        <table style="width:100%;border-collapse:collapse;">

          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Action</th>
          </tr>

          ${list.map(c => `
            <tr>
              <td>${esc(c.name)}</td>
              <td>${esc(c.phone)}</td>
              <td>${esc(c.address)}</td>
              <td>
                <button
                  class="btn"
                  onclick="deleteCustomer('${c.id}')">
                  🗑️
                </button>
              </td>
            </tr>
          `).join("")}

        </table>

      </div>
    `;
  }

  function deleteCustomer(id) {

    if (!confirm("Customer Delete করবেন?")) return;

    write(
      DB.customers,
      getCustomers().filter(c => c.id !== id)
    );

    showCustomers();
  }

  /* =========================================================
     REPORTS
     ========================================================= */

  function showReports() {

    if (!loggedIn()) return showLogin();

    const sales = getSales();
    const purchases = getPurchases();

    const totalSales =
      sales.reduce((s, x) => s + Number(x.total || 0), 0);

    const totalPurchase =
      purchases.reduce((s, x) => s + Number(x.total || 0), 0);

    page("📊 Reports", `

      <div class="cards" style="
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
        gap:15px;
      ">

        <div class="card">
          <h3>Total Sales</h3>
          <h2>${money(totalSales)}</h2>
        </div>

        <div class="card">
          <h3>Total Purchase</h3>
          <h2>${money(totalPurchase)}</h2>
        </div>

        <div class="card">
          <h3>Sales Count</h3>
          <h2>${sales.length}</h2>
        </div>

        <div class="card">
          <h3>Purchase Count</h3>
          <h2>${purchases.length}</h2>
        </div>

      </div>

      <div class="panel" style="margin-top:20px;">

        <h3>Recent Sales</h3>

        <div style="overflow-x:auto;">

          <table style="width:100%;border-collapse:collapse;">

            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Payment</th>
              <th>Total</th>
            </tr>

            ${
              sales.length
              ? sales.slice(0,100).map(s => `
                  <tr>
                    <td>${esc(s.date)}</td>
                    <td>${esc(s.customer || "Walk-in")}</td>
                    <td>${esc(s.payment)}</td>
                    <td>${money(s.total)}</td>
                  </tr>
                `).join("")
              : `
                <tr>
                  <td colspan="4"
                    style="text-align:center;padding:20px;">
                    কোনো Sale নেই।
                  </td>
                </tr>
              `
            }

          </table>

        </div>

      </div>

      <div class="panel" style="margin-top:20px;">

        <h3>💾 Backup</h3>

        <button class="btn btn-primary"
          onclick="backupData()">
          ⬇️ Download Backup
        </button>

        <button class="btn"
          onclick="restoreData()">
          ⬆️ Restore Backup
        </button>

      </div>
    `);
  }

  /* =========================================================
     SETTINGS
     ========================================================= */

  function showPharmacySettings() {

    if (!loggedIn()) return showLogin();

    const settings = read(DB.settings, {
      name: "My Pharmacy",
      phone: "",
      address: ""
    });

    page("⚙️ Pharmacy Settings", `

      <div class="panel">

        <form id="settingsForm">

          <input
            id="pharmacyName"
            class="form-control"
            value="${esc(settings.name)}"
            placeholder="Pharmacy Name"
          >

          <br>

          <input
            id="pharmacyPhone"
            class="form-control"
            value="${esc(settings.phone)}"
            placeholder="Phone"
          >

          <br>

          <textarea
            id="pharmacyAddress"
            class="form-control"
            placeholder="Address"
            rows="3"
          >${esc(settings.address)}</textarea>

          <br>

          <button class="btn btn-primary">
            💾 Save Settings
          </button>

        </form>

      </div>
    `);

    document
      .getElementById("settingsForm")
      ?.addEventListener("submit", function (e) {

        e.preventDefault();

        write(DB.settings, {
          name:
            document.getElementById("pharmacyName").value.trim(),
          phone:
            document.getElementById("pharmacyPhone").value.trim(),
          address:
            document.getElementById("pharmacyAddress").value.trim()
        });

        alert("Settings Save হয়েছে.");

        showDashboard();
      });
  }

  /* =========================================================
     BACKUP / RESTORE
     ========================================================= */

  function backupData() {

    const data = {
      medicines: getMedicines(),
      purchases: getPurchases(),
      sales: getSales(),
      suppliers: getSuppliers(),
      customers: getCustomers(),
      payments: getPayments(),
      settings: read(DB.settings, {})
    };

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download =
      "pharmacy-backup-" + today() + ".json";

    a.click();

    URL.revokeObjectURL(url);
  }

  function restoreData() {

    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".json";

    input.onchange = function () {

      const file = input.files[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = function () {

        try {

          const data =
            JSON.parse(reader.result);

          if (!confirm(
            "Backup Restore করলে বর্তমান Data replace হবে। Continue?"
          )) return;

          if (Array.isArray(data.medicines))
            write(DB.medicines, data.medicines);

          if (Array.isArray(data.purchases))
            write(DB.purchases, data.purchases);

          if (Array.isArray(data.sales))
            write(DB.sales, data.sales);

          if (Array.isArray(data.suppliers))
            write(DB.suppliers, data.suppliers);

          if (Array.isArray(data.customers))
            write(DB.customers, data.customers);

          if (Array.isArray(data.payments))
            write(DB.payments, data.payments);

          if (data.settings)
            write(DB.settings, data.settings);

          alert("Backup Restore হয়েছে।");

          showDashboard();

        } catch (e) {

          alert("Backup file সঠিক নয়।");

        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  /* =========================================================
     COMPATIBILITY FUNCTIONS
     ========================================================= */

  function setupDefaultAdmin() {

    if (!localStorage.getItem(DB.adminUser)) {
      localStorage.setItem(DB.adminUser, "admin");
    }

    if (!localStorage.getItem(DB.adminPass)) {
      localStorage.setItem(DB.adminPass, "1234");
    }
  }

  function showMedicinesPage() {
    showMedicines();
  }

  function showPurchasePage() {
    showPurchase();
  }

  function showSalesPage() {
    showSales();
  }

  function showSupplierPage() {
    showSuppliers();
  }

  function showCustomerPage() {
    showCustomers();
  }

  function showReportPage() {
    showReports();
  }

  /* =========================================================
     MAKE ALL FUNCTIONS GLOBAL
     IMPORTANT FOR INLINE BUTTONS IN index.html
     ========================================================= */

  window.showLogin = showLogin;
  window.adminLogin = adminLogin;
  window.adminLogout = adminLogout;

  window.showDashboard = showDashboard;
  window.showMedicines = showMedicines;
  window.showPurchase = showPurchase;
  window.showSales = showSales;
  window.showSuppliers = showSuppliers;
  window.showCustomers = showCustomers;
  window.showReports = showReports;

  window.addMedicine = addMedicine;
  window.editMedicine = editMedicine;
  window.deleteMedicine = deleteMedicine;

  window.addPurchase = addPurchase;

  window.addToCart = addToCart;
  window.removeCartItem = removeCartItem;
  window.completeSale = completeSale;

  window.deleteSupplier = deleteSupplier;
  window.deleteCustomer = deleteCustomer;

  window.changeAdminPassword = changeAdminPassword;

  window.showPharmacySettings = showPharmacySettings;

  window.backupData = backupData;
  window.restoreData = restoreData;

  window.setupDefaultAdmin = setupDefaultAdmin;

  window.showMedicinesPage = showMedicinesPage;
  window.showPurchasePage = showPurchasePage;
  window.showSalesPage = showSalesPage;
  window.showSupplierPage = showSupplierPage;
  window.showCustomerPage = showCustomerPage;
  window.showReportPage = showReportPage;

  /* =========================================================
     START APP
     ========================================================= */

  document.addEventListener("DOMContentLoaded", function () {

    setupDefaultAdmin();

    if (loggedIn()) {
      showDashboard();
    } else {
      showLogin();
    }

  });

})();
