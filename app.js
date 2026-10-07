// ==========================================
// PHARMACY INVENTORY PRO - COMPLETE VERSION
// ==========================================

let medicines = JSON.parse(localStorage.getItem("pharmacy_medicines") || "[]");
let purchases = JSON.parse(localStorage.getItem("pharmacy_purchases") || "[]");
let sales = JSON.parse(localStorage.getItem("pharmacy_sales") || "[]");
let customers = JSON.parse(localStorage.getItem("pharmacy_customers") || "[]");
let suppliers = JSON.parse(localStorage.getItem("pharmacy_suppliers") || "[]");

function saveData() {
    localStorage.setItem("pharmacy_medicines", JSON.stringify(medicines));
    localStorage.setItem("pharmacy_purchases", JSON.stringify(purchases));
    localStorage.setItem("pharmacy_sales", JSON.stringify(sales));
    localStorage.setItem("pharmacy_customers", JSON.stringify(customers));
    localStorage.setItem("pharmacy_suppliers", JSON.stringify(suppliers));
}

document.addEventListener("DOMContentLoaded", function () {
    showDashboard();
});

// ---------- HELPERS ----------

function money(n) {
    return "৳ " + Number(n || 0).toFixed(2);
}

function today() {
    return new Date().toISOString().split("T")[0];
}

function escapeHTML(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function app() {
    return document.getElementById("app");
}

function layout(title, html) {
    app().innerHTML = `
        <div class="panel">
            <h2>${title}</h2>
            ${html}
        </div>
    `;
}

function input(id, label, type = "text", value = "") {
    return `
        <div style="margin-bottom:12px;">
            <label><b>${label}</b></label>
            <input id="${id}" type="${type}" value="${escapeHTML(value)}"
                   class="form-control"
                   style="width:100%;padding:10px;margin-top:5px;box-sizing:border-box;">
        </div>
    `;
}

// ==========================================
// DASHBOARD
// ==========================================

function showDashboard() {
    const salesToday = sales
        .filter(s => s.date === today())
        .reduce((sum, s) => sum + Number(s.total || 0), 0);

    const lowStock = medicines.filter(m =>
        Number(m.stock || 0) <= Number(m.reorder || 0)
    ).length;

    const expiry = medicines.filter(m => {
        if (!m.expiry) return false;
        const d = new Date(m.expiry);
        const now = new Date();
        const days = (d - now) / 86400000;
        return days >= 0 && days <= 30;
    }).length;

    app().innerHTML = `
        <div class="cards">
            <div class="card">
                <h3>💰 Today's Sales</h3>
                <div class="card-value">${money(salesToday)}</div>
            </div>

            <div class="card">
                <h3>💊 Medicines</h3>
                <div class="card-value">${medicines.length}</div>
            </div>

            <div class="card">
                <h3>⚠️ Low Stock</h3>
                <div class="card-value">${lowStock}</div>
            </div>

            <div class="card">
                <h3>📅 Near Expiry</h3>
                <div class="card-value">${expiry}</div>
            </div>
        </div>

        <div class="panel" style="margin-top:20px;">
            <h3>⚡ Quick Actions</h3>

            <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="showMedicines()">
                    💊 Add Medicine
                </button>

                <button class="btn btn-primary" onclick="showPurchase()">
                    📦 Purchase
                </button>

                <button class="btn btn-primary" onclick="showSales()">
                    🧾 New Sale
                </button>

                <button class="btn btn-primary" onclick="showReports()">
                    📊 Reports
                </button>
            </div>
        </div>

        <div class="panel" style="margin-top:20px;">
            <h3>📋 Recent Sales</h3>
            ${recentSalesHTML()}
        </div>
    `;
}

function recentSalesHTML() {
    const recent = [...sales].reverse().slice(0, 5);

    if (!recent.length) {
        return "<p>এখনো কোনো বিক্রয় নেই।</p>";
    }

    return `
        <div style="overflow:auto;">
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Medicine</th>
                    <th>Qty</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${recent.map(s => `
                    <tr>
                        <td>${s.date}</td>
                        <td>${escapeHTML(s.medicine)}</td>
                        <td>${s.qty}</td>
                        <td>${money(s.total)}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
        </div>
    `;
}

// ==========================================
// MEDICINES
// ==========================================

function showMedicines() {
    layout("💊 Medicine Management", `
        <form id="medicineForm">
            ${input("mName", "Medicine Name *")}
            ${input("mGeneric", "Generic Name")}
            ${input("mCompany", "Company")}
            ${input("mStrength", "Strength")}
            ${input("mBatch", "Batch Number")}
            ${input("mExpiry", "Expiry Date", "date")}
            ${input("mStock", "Opening Stock", "number", "0")}
            ${input("mReorder", "Reorder Level", "number", "10")}
            ${input("mPurchase", "Purchase Price", "number", "0")}
            ${input("mSale", "Sale Price", "number", "0")}

            <button type="submit" class="btn btn-primary">
                💾 Save Medicine
            </button>
        </form>

        <hr style="margin:25px 0;">

        <h3>📋 Medicine List</h3>

        <input id="medicineSearch"
               class="form-control"
               placeholder="🔍 Search medicine..."
               oninput="renderMedicines()"
               style="width:100%;padding:10px;box-sizing:border-box;margin-bottom:15px;">

        <div id="medicineList"></div>
    `);

    document.getElementById("medicineForm").onsubmit = function(e) {
        e.preventDefault();

        const name = document.getElementById("mName").value.trim();

        if (!name) {
            alert("Medicine Name দিন");
            return;
        }

        medicines.push({
            id: Date.now(),
            name,
            generic: document.getElementById("mGeneric").value.trim(),
            company: document.getElementById("mCompany").value.trim(),
            strength: document.getElementById("mStrength").value.trim(),
            batch: document.getElementById("mBatch").value.trim(),
            expiry: document.getElementById("mExpiry").value,
            stock: Number(document.getElementById("mStock").value) || 0,
            reorder: Number(document.getElementById("mReorder").value) || 0,
            purchase: Number(document.getElementById("mPurchase").value) || 0,
            sale: Number(document.getElementById("mSale").value) || 0
        });

        saveData();

        alert("Medicine successfully saved!");
        showMedicines();
    };

    renderMedicines();
}

function renderMedicines() {
    const box = document.getElementById("medicineList");
    if (!box) return;

    const search = (
        document.getElementById("medicineSearch")?.value || ""
    ).toLowerCase();

    const list = medicines.filter(m =>
        (m.name || "").toLowerCase().includes(search) ||
        (m.generic || "").toLowerCase().includes(search) ||
        (m.company || "").toLowerCase().includes(search)
    );

    if (!list.length) {
        box.innerHTML = "<p>কোনো medicine পাওয়া যায়নি।</p>";
        return;
    }

    box.innerHTML = `
        <div style="overflow:auto;">
        <table>
            <thead>
                <tr>
                    <th>Medicine</th>
                    <th>Company</th>
                    <th>Batch</th>
                    <th>Expiry</th>
                    <th>Stock</th>
                    <th>Sale Price</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody>
                ${list.map(m => `
                    <tr>
                        <td>${escapeHTML(m.name)}</td>
                        <td>${escapeHTML(m.company)}</td>
                        <td>${escapeHTML(m.batch)}</td>
                        <td>${m.expiry || "-"}</td>
                        <td>${m.stock}</td>
                        <td>${money(m.sale)}</td>
                        <td>
                            <button onclick="deleteMedicine(${m.id})">
                                Delete
                            </button>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
        </div>
    `;
}

function deleteMedicine(id) {
    if (!confirm("এই medicine delete করবেন?")) return;

    medicines = medicines.filter(m => m.id !== id);
    saveData();
    showMedicines();
}

// ==========================================
// PURCHASE
// ==========================================

function showPurchase() {
    layout("📦 Purchase / Stock In", `
        <form id="purchaseForm">

            <div style="margin-bottom:12px;">
                <label><b>Medicine</b></label>
                <select id="purchaseMedicine"
                        class="form-control"
                        style="width:100%;padding:10px;margin-top:5px;">
                    <option value="">Select Medicine</option>
                    ${medicines.map(m => `
                        <option value="${m.id}">
                            ${escapeHTML(m.name)}
                        </option>
                    `).join("")}
                </select>
            </div>

            ${input("purchaseQty", "Quantity", "number", "1")}
            ${input("purchasePriceInput", "Purchase Price", "number", "0")}
            ${input("purchaseSupplier", "Supplier")}

            <button class="btn btn-primary" type="submit">
                📦 Add Purchase
            </button>
        </form>

        <hr style="margin:25px 0;">

        <h3>Recent Purchases</h3>
        <div id="purchaseList"></div>
    `);

    renderPurchases();

    document.getElementById("purchaseForm").onsubmit = function(e) {
        e.preventDefault();

        const id = Number(document.getElementById("purchaseMedicine").value);
        const qty = Number(document.getElementById("purchaseQty").value);
        const price = Number(document.getElementById("purchasePriceInput").value);

        const medicine = medicines.find(m => m.id === id);

        if (!medicine) {
            alert("Medicine select করুন");
            return;
        }

        if (qty <= 0) {
            alert("Quantity সঠিক দিন");
            return;
        }

        medicine.stock = Number(medicine.stock || 0) + qty;

        purchases.push({
            id: Date.now(),
            date: today(),
            medicine: medicine.name,
            qty,
            price,
            supplier: document.getElementById("purchaseSupplier").value.trim(),
            total: qty * price
        });

        saveData();

        alert("Purchase added এবং stock updated!");
        showPurchase();
    };
}

function renderPurchases() {
    const box = document.getElementById("purchaseList");
    if (!box) return;

    const list = [...purchases].reverse().slice(0, 20);

    if (!list.length) {
        box.innerHTML = "<p>কোনো purchase নেই।</p>";
        return;
    }

    box.innerHTML = `
        <div style="overflow:auto;">
        <table>
            <tr>
                <th>Date</th>
                <th>Medicine</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Supplier</th>
            </tr>

            ${list.map(p => `
                <tr>
                    <td>${p.date}</td>
                    <td>${escapeHTML(p.medicine)}</td>
                    <td>${p.qty}</td>
                    <td>${money(p.total)}</td>
                    <td>${escapeHTML(p.supplier)}</td>
                </tr>
            `).join("")}
        </table>
        </div>
    `;
}

// ==========================================
// SALES / POS
// ==========================================

function showSales() {
    layout("🧾 Sales / POS", `
        <form id="salesForm">

            <div style="margin-bottom:12px;">
                <label><b>Medicine</b></label>

                <select id="saleMedicine"
                        class="form-control"
                        style="width:100%;padding:10px;margin-top:5px;">
                    <option value="">Select Medicine</option>

                    ${medicines.map(m => `
                        <option value="${m.id}">
                            ${escapeHTML(m.name)} | Stock: ${m.stock}
                        </option>
                    `).join("")}
                </select>
            </div>

            ${input("customerName", "Customer Name")}
            ${input("saleQty", "Quantity", "number", "1")}
            ${input("salePriceInput", "Sale Price", "number", "0")}

            <button type="submit" class="btn btn-primary">
                💰 Complete Sale
            </button>
        </form>

        <hr style="margin:25px 0;">

        <h3>📋 Today's Sales</h3>

        <div id="salesList"></div>
    `);

    const select = document.getElementById("saleMedicine");

    select.onchange = function() {
        const medicine = medicines.find(
            m => m.id === Number(this.value)
        );

        document.getElementById("salePriceInput").value =
            medicine ? medicine.sale : 0;
    };

    renderSales();

    document.getElementById("salesForm").onsubmit = function(e) {
        e.preventDefault();

        const medicine = medicines.find(
            m => m.id === Number(
                document.getElementById("saleMedicine").value
            )
        );

        const qty = Number(document.getElementById("saleQty").value);
        const price = Number(document.getElementById("salePriceInput").value);

        if (!medicine) {
            alert("Medicine select করুন");
            return;
        }

        if (qty <= 0) {
            alert("Quantity সঠিক দিন");
            return;
        }

        if (qty > Number(medicine.stock)) {
            alert("পর্যাপ্ত stock নেই!");
            return;
        }

        medicine.stock -= qty;

        const sale = {
            id: Date.now(),
            date: today(),
            time: new Date().toLocaleTimeString(),
            medicine: medicine.name,
            qty,
            price,
            total: qty * price,
            customer: document.getElementById("customerName").value.trim()
        };

        sales.push(sale);

        saveData();

        alert("Sale completed successfully!");

        printInvoice(sale);

        showSales();
    };
}

function renderSales() {
    const box = document.getElementById("salesList");
    if (!box) return;

    const list = sales.filter(s => s.date === today()).reverse();

    if (!list.length) {
        box.innerHTML = "<p>আজকে কোনো sale নেই।</p>";
        return;
    }

    box.innerHTML = `
        <div style="overflow:auto;">
        <table>
            <tr>
                <th>Time</th>
                <th>Medicine</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Action</th>
            </tr>

            ${list.map(s => `
                <tr>
                    <td>${s.time}</td>
                    <td>${escapeHTML(s.medicine)}</td>
                    <td>${s.qty}</td>
                    <td>${money(s.total)}</td>
                    <td>
                        <button onclick='printInvoice(${JSON.stringify(s)})'>
                            🖨️ Print
                        </button>
                    </td>
                </tr>
            `).join("")}
        </table>
        </div>
    `;
}

// ==========================================
// INVOICE / PRINT
// ==========================================

function printInvoice(sale) {
    const w = window.open("", "_blank");

    if (!w) {
        alert("Browser popup blocked করেছে। Print করার অনুমতি দিন।");
        return;
    }

    w.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Pharmacy Invoice</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 25px;
                }

                .invoice {
                    max-width: 600px;
                    margin: auto;
                }

                h1, h2 {
                    text-align: center;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th, td {
                    border: 1px solid #999;
                    padding: 10px;
                    text-align: left;
                }

                .total {
                    text-align: right;
                    font-size: 20px;
                    font-weight: bold;
                    margin-top: 20px;
                }
            </style>
        </head>

        <body onload="window.print()">

            <div class="invoice">

                <h1>💊 Pharmacy</h1>
                <h2>Sales Invoice</h2>

                <p>
                    <b>Date:</b> ${sale.date}<br>
                    <b>Time:</b> ${sale.time || ""}<br>
                    <b>Customer:</b> ${escapeHTML(sale.customer || "Walk-in Customer")}
                </p>

                <table>
                    <tr>
                        <th>Medicine</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>

                    <tr>
                        <td>${escapeHTML(sale.medicine)}</td>
                        <td>${sale.qty}</td>
                        <td>${money(sale.price)}</td>
                        <td>${money(sale.total)}</td>
                    </tr>
                </table>

                <div class="total">
                    Grand Total: ${money(sale.total)}
                </div>

                <p style="text-align:center;margin-top:40px;">
                    Thank you for your purchase!
                </p>

            </div>

        </body>
        </html>
    `);

    w.document.close();
}

// ==========================================
// SUPPLIERS
// ==========================================

function showSuppliers() {
    layout("🚚 Suppliers", `
        <form id="supplierForm">
            ${input("supplierName", "Supplier Name")}
            ${input("supplierPhone", "Phone")}
            ${input("supplierAddress", "Address")}

            <button class="btn btn-primary" type="submit">
                💾 Save Supplier
            </button>
        </form>

        <hr style="margin:25px 0;">

        <div id="supplierList"></div>
    `);

    renderSuppliers();

    document.getElementById("supplierForm").onsubmit = function(e) {
        e.preventDefault();

        const name = document.getElementById("supplierName").value.trim();

        if (!name) {
            alert("Supplier Name দিন");
            return;
        }

        suppliers.push({
            id: Date.now(),
            name,
            phone: document.getElementById("supplierPhone").value.trim(),
            address: document.getElementById("supplierAddress").value.trim()
        });

        saveData();
        showSuppliers();
    };
}

function renderSuppliers() {
    const box = document.getElementById("supplierList");
    if (!box) return;

    box.innerHTML = `
        <h3>Supplier List</h3>

        <div style="overflow:auto;">
        <table>
            <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
            </tr>

            ${suppliers.map(s => `
                <tr>
                    <td>${escapeHTML(s.name)}</td>
                    <td>${escapeHTML(s.phone)}</td>
                    <td>${escapeHTML(s.address)}</td>
                </tr>
            `).join("")}
        </table>
        </div>
    `;
}

// ==========================================
// CUSTOMERS
// ==========================================

function showCustomers() {
    layout("👤 Customers", `
        <form id="customerForm">
            ${input("custName", "Customer Name")}
            ${input("custPhone", "Phone")}
            ${input("custAddress", "Address")}

            <button class="btn btn-primary" type="submit">
                💾 Save Customer
            </button>
        </form>

        <hr style="margin:25px 0;">

        <div id="customerList"></div>
    `);

    renderCustomers();

    document.getElementById("customerForm").onsubmit = function(e) {
        e.preventDefault();

        const name = document.getElementById("custName").value.trim();

        if (!name) {
            alert("Customer Name দিন");
            return;
        }

        customers.push({
            id: Date.now(),
            name,
            phone: document.getElementById("custPhone").value.trim(),
            address: document.getElementById("custAddress").value.trim()
        });

        saveData();
        showCustomers();
    };
}

function renderCustomers() {
    const box = document.getElementById("customerList");
    if (!box) return;

    box.innerHTML = `
        <h3>Customer List</h3>

        <div style="overflow:auto;">
        <table>
            <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
            </tr>

            ${customers.map(c => `
                <tr>
                    <td>${escapeHTML(c.name)}</td>
                    <td>${escapeHTML(c.phone)}</td>
                    <td>${escapeHTML(c.address)}</td>
                </tr>
            `).join("")}
        </table>
        </div>
    `;
}

// ==========================================
// REPORTS
// ==========================================

function showReports() {
    const totalSales = sales.reduce(
        (sum, s) => sum + Number(s.total || 0), 0
    );

    const totalPurchase = purchases.reduce(
        (sum, p) => sum + Number(p.total || 0), 0
    );

    const todaySales = sales
        .filter(s => s.date === today())
        .reduce((sum, s) => sum + Number(s.total || 0), 0);

    const low = medicines.filter(m =>
        Number(m.stock || 0) <= Number(m.reorder || 0)
    );

    const expiry = medicines.filter(m => {
        if (!m.expiry) return false;

        const days =
            (new Date(m.expiry) - new Date()) / 86400000;

        return days >= 0 && days <= 30;
    });

    layout("📈 Reports", `

        <div class="cards">

            <div class="card">
                <h3>Today's Sales</h3>
                <div class="card-value">${money(todaySales)}</div>
            </div>

            <div class="card">
                <h3>Total Sales</h3>
                <div class="card-value">${money(totalSales)}</div>
            </div>

            <div class="card">
                <h3>Total Purchase</h3>
                <div class="card-value">${money(totalPurchase)}</div>
            </div>

            <div class="card">
                <h3>Medicines</h3>
                <div class="card-value">${medicines.length}</div>
            </div>

        </div>

        <hr style="margin:25px 0;">

        <h3>⚠️ Low Stock</h3>

        ${low.length
            ? low.map(m => `
                <p>
                    <b>${escapeHTML(m.name)}</b>
                    — Stock: ${m.stock}
                </p>
              `).join("")
            : "<p>কোনো Low Stock নেই।</p>"
        }

        <h3 style="margin-top:25px;">📅 Near Expiry (30 days)</h3>

        ${expiry.length
            ? expiry.map(m => `
                <p>
                    <b>${escapeHTML(m.name)}</b>
                    — Expiry: ${m.expiry}
                </p>
              `).join("")
            : "<p>আগামী ৩০ দিনের মধ্যে কোনো expiry নেই।</p>"
        }

        <hr style="margin:25px 0;">

        <button class="btn btn-primary" onclick="window.print()">
            🖨️ Print Report
        </button>
    `);
}

// ==========================================
// OLD BUTTON COMPATIBILITY
// ==========================================

function comingSoon(name) {

    if (name === "Sales / POS" || name === "New Sale") {
        showSales();
        return;
    }

    if (name === "Purchase") {
        showPurchase();
        return;
    }

    if (name === "Suppliers") {
        showSuppliers();
        return;
    }

    if (name === "Customers") {
        showCustomers();
        return;
    }

    if (name === "Reports") {
        showReports();
        return;
    }

    alert(name + " available soon.");
}

// Mobile menu compatibility
function toggleMenu() {
    const nav = document.querySelector("nav");
    if (nav) {
        nav.style.display =
            nav.style.display === "none" ? "flex" : "none";
    }
}

// Compatibility with old medicine page
function clearMedicineForm() {
    const form = document.getElementById("medicineForm");
    if (form) form.reset();
}
