// ==========================================
// PHARMACY INVENTORY PRO - COMPLETE VERSION
// ==========================================

let medicines = JSON.parse(
    localStorage.getItem("pharmacy_medicines") || "[]"
);

let purchases = JSON.parse(
    localStorage.getItem("pharmacy_purchases") || "[]"
);

let sales = JSON.parse(
    localStorage.getItem("pharmacy_sales") || "[]"
);

let customers = JSON.parse(
    localStorage.getItem("pharmacy_customers") || "[]"
);

let suppliers = JSON.parse(
    localStorage.getItem("pharmacy_suppliers") || "[]"
);

let saleCart = [];
let editingMedicineIndex = -1;


// ==========================================
// SAVE DATA
// ==========================================

function saveData() {

    localStorage.setItem(
        "pharmacy_medicines",
        JSON.stringify(medicines)
    );

    localStorage.setItem(
        "pharmacy_purchases",
        JSON.stringify(purchases)
    );

    localStorage.setItem(
        "pharmacy_sales",
        JSON.stringify(sales)
    );

    localStorage.setItem(
        "pharmacy_customers",
        JSON.stringify(customers)
    );

    localStorage.setItem(
        "pharmacy_suppliers",
        JSON.stringify(suppliers)
    );
}


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {
        showDashboard();
    }
);


// ==========================================
// HELPERS
// ==========================================

function money(n) {

    return "৳ " +
        Number(n || 0).toFixed(2);
}


function today() {

    return new Date()
        .toISOString()
        .split("T")[0];
}


function currentTime() {

    return new Date()
        .toLocaleTimeString();
}


function escapeHTML(value) {

    return String(value ?? "")
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


function input(
    id,
    label,
    type = "text",
    value = ""
) {

    return `
        <div style="margin-bottom:12px;">

            <label>
                <b>${label}</b>
            </label>

            <input
                id="${id}"
                type="${type}"
                value="${escapeHTML(value)}"
                class="form-control"
                style="
                    width:100%;
                    padding:10px;
                    margin-top:5px;
                    box-sizing:border-box;
                "
            >

        </div>
    `;
}


// ==========================================
// DASHBOARD
// ==========================================

function showDashboard() {

    const salesToday = sales
        .filter(s => s.date === today())
        .reduce(
            (sum, s) =>
                sum + Number(s.total || 0),
            0
        );

    const lowStock = medicines.filter(
        m =>
            Number(m.stock || 0) <=
            Number(m.reorder || 0)
    ).length;

    const expiry = medicines.filter(m => {

        if (!m.expiry) return false;

        const d = new Date(m.expiry);
        const now = new Date();

        const days =
            (d - now) / 86400000;

        return days >= 0 && days <= 30;

    }).length;

    app().innerHTML = `

        <div class="cards">

            <div class="card">
                <h3>💰 Today's Sales</h3>
                <div class="card-value">
                    ${money(salesToday)}
                </div>
            </div>

            <div class="card">
                <h3>💊 Medicines</h3>
                <div class="card-value">
                    ${medicines.length}
                </div>
            </div>

            <div class="card">
                <h3>⚠️ Low Stock</h3>
                <div class="card-value">
                    ${lowStock}
                </div>
            </div>

            <div class="card">
                <h3>📅 Near Expiry</h3>
                <div class="card-value">
                    ${expiry}
                </div>
            </div>

        </div>


        <div class="panel" style="margin-top:20px;">

            <h3>⚡ Quick Actions</h3>

            <div style="
                display:flex;
                gap:10px;
                flex-wrap:wrap;
            ">

                <button
                    class="btn btn-primary"
                    onclick="showMedicines()">
                    💊 Add Medicine
                </button>

                <button
                    class="btn btn-primary"
                    onclick="showPurchase()">
                    📦 Purchase
                </button>

                <button
                    class="btn btn-primary"
                    onclick="showSales()">
                    🧾 New Sale
                </button>

                <button
                    class="btn btn-primary"
                    onclick="showReports()">
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

    const recent =
        [...sales]
        .reverse()
        .slice(0, 5);

    if (!recent.length) {

        return `
            <p>
                এখনো কোনো বিক্রয় নেই।
            </p>
        `;
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

                            <td>
                                ${escapeHTML(s.date)}
                            </td>

                            <td>
                                ${escapeHTML(
                                    s.medicine ||
                                    (
                                        s.items &&
                                        s.items.length
                                            ? s.items
                                                .map(i => i.medicine)
                                                .join(", ")
                                            : "-"
                                    )
                                )}
                            </td>

                            <td>
                                ${s.qty || "-"}
                            </td>

                            <td>
                                ${money(s.total)}
                            </td>

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

    layout(
        "💊 Medicine Management",
        `

        <form id="medicineForm">

            ${input(
                "mName",
                "Medicine Name *"
            )}

            ${input(
                "mGeneric",
                "Generic Name"
            )}

            ${input(
                "mCompany",
                "Company"
            )}

            ${input(
                "mStrength",
                "Strength"
            )}

            ${input(
                "mBatch",
                "Batch Number"
            )}

            ${input(
                "mExpiry",
                "Expiry Date",
                "date"
            )}

            ${input(
                "mStock",
                "Opening Stock",
                "number",
                "0"
            )}

            ${input(
                "mReorder",
                "Reorder Level",
                "number",
                "10"
            )}

            ${input(
                "mPurchase",
                "Purchase Price",
                "number",
                "0"
            )}

            ${input(
                "mSale",
                "Sale Price",
                "number",
                "0"
            )}

            <button
                id="medicineSaveBtn"
                type="submit"
                class="btn btn-primary">

                💾 Save Medicine

            </button>

            <button
                id="medicineCancelBtn"
                type="button"
                onclick="cancelMedicineEdit()"
                style="
                    display:none;
                    margin-left:8px;
                ">

                ❌ Cancel Edit

            </button>

        </form>


        <hr style="margin:25px 0;">


        <h3>📋 Medicine List</h3>


        <input
            id="medicineSearch"
            class="form-control"
            placeholder="🔍 Search medicine..."
            oninput="renderMedicines()"
            style="
                width:100%;
                padding:10px;
                box-sizing:border-box;
                margin-bottom:15px;
            "
        >


        <div id="medicineList"></div>

        `
    );


    document.getElementById(
        "medicineForm"
    ).onsubmit = function(e) {

        e.preventDefault();

        const name =
            document.getElementById(
                "mName"
            ).value.trim();

        if (!name) {

            alert(
                "Medicine Name দিন"
            );

            return;
        }


        const medicineData = {

            name: name,

            generic:
                document.getElementById(
                    "mGeneric"
                ).value.trim(),

            company:
                document.getElementById(
                    "mCompany"
                ).value.trim(),

            strength:
                document.getElementById(
                    "mStrength"
                ).value.trim(),

            batch:
                document.getElementById(
                    "mBatch"
                ).value.trim(),

            expiry:
                document.getElementById(
                    "mExpiry"
                ).value,

            stock:
                Number(
                    document.getElementById(
                        "mStock"
                    ).value
                ) || 0,

            reorder:
                Number(
                    document.getElementById(
                        "mReorder"
                    ).value
                ) || 0,

            purchase:
                Number(
                    document.getElementById(
                        "mPurchase"
                    ).value
                ) || 0,

            sale:
                Number(
                    document.getElementById(
                        "mSale"
                    ).value
                ) || 0
        };


        // UPDATE EXISTING MEDICINE
        if (
            editingMedicineIndex >= 0 &&
            medicines[editingMedicineIndex]
        ) {

            medicineData.id =
                medicines[
                    editingMedicineIndex
                ].id;

            medicines[
                editingMedicineIndex
            ] = medicineData;

            saveData();

            alert(
                "Medicine successfully updated!"
            );

        }

        // ADD NEW MEDICINE
        else {

            medicineData.id =
                Date.now();

            medicines.push(
                medicineData
            );

            saveData();

            alert(
                "Medicine successfully saved!"
            );
        }


        editingMedicineIndex = -1;

        showMedicines();
    };


    renderMedicines();
}


// ==========================================
// RENDER MEDICINES
// ==========================================

function renderMedicines() {

    const list =
        document.getElementById(
            "medicineList"
        );

    if (!list) return;


    const searchBox =
        document.getElementById(
            "medicineSearch"
        );

    const search =
        searchBox
            ? searchBox.value
                .trim()
                .toLowerCase()
            : "";


    const filtered =
        medicines.filter(m => {

            const text = (

                (m.name || "") +
                " " +
                (m.generic || "") +
                " " +
                (m.company || "") +
                " " +
                (m.batch || "")

            ).toLowerCase();

            return text.includes(search);
        });


    if (!filtered.length) {

        list.innerHTML = `
            <p>
                কোনো Medicine পাওয়া যায়নি।
            </p>
        `;

        return;
    }


    list.innerHTML = `

        <div style="overflow:auto;">

            <table>

                <thead>

                    <tr>

                        <th>Medicine</th>
                        <th>Generic</th>
                        <th>Company</th>
                        <th>Stock</th>
                        <th>Purchase</th>
                        <th>Sale Price</th>
                        <th>Expiry</th>
                        <th>Action</th>

                    </tr>

                </thead>


                <tbody>

                    ${filtered.map(m => {

                        const realIndex =
                            medicines.indexOf(m);

                        return `

                        <tr>

                            <td>
                                ${escapeHTML(
                                    m.name
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    m.generic
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    m.company
                                )}
                            </td>

                            <td>
                                ${m.stock || 0}
                            </td>

                            <td>
                                ${money(
                                    m.purchase
                                )}
                            </td>

                            <td>
                                ${money(
                                    m.sale
                                )}
                            </td>

                            <td>
                                ${m.expiry || "-"}
                            </td>

                            <td>

                                <button
                                    onclick="editMedicine(${realIndex})">
                                    ✏️ Edit
                                </button>

                                <button
                                    onclick="deleteMedicine(${realIndex})">
                                    🗑️ Delete
                                </button>

                            </td>

                        </tr>

                        `;

                    }).join("")}

                </tbody>

            </table>

        </div>
    `;
}


// ==========================================
// EDIT MEDICINE
// ==========================================

function editMedicine(index) {

    const m =
        medicines[index];

    if (!m) return;


    editingMedicineIndex =
        index;


    document.getElementById(
        "mName"
    ).value =
        m.name || "";


    document.getElementById(
        "mGeneric"
    ).value =
        m.generic || "";


    document.getElementById(
        "mCompany"
    ).value =
        m.company || "";


    document.getElementById(
        "mStrength"
    ).value =
        m.strength || "";


    document.getElementById(
        "mBatch"
    ).value =
        m.batch || "";


    document.getElementById(
        "mExpiry"
    ).value =
        m.expiry || "";


    document.getElementById(
        "mStock"
    ).value =
        m.stock || 0;


    document.getElementById(
        "mReorder"
    ).value =
        m.reorder || 0;


    document.getElementById(
        "mPurchase"
    ).value =
        m.purchase || 0;


    document.getElementById(
        "mSale"
    ).value =
        m.sale || 0;


    const saveBtn =
        document.getElementById(
            "medicineSaveBtn"
        );

    if (saveBtn) {

        saveBtn.textContent =
            "💾 Update Medicine";
    }


    const cancelBtn =
        document.getElementById(
            "medicineCancelBtn"
        );

    if (cancelBtn) {

        cancelBtn.style.display =
            "inline-block";
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// CANCEL EDIT
// ==========================================

function cancelMedicineEdit() {

    editingMedicineIndex = -1;

    showMedicines();
}


// ==========================================
// DELETE MEDICINE
// ==========================================

function deleteMedicine(index) {

    if (
        !medicines[index]
    ) return;


    if (
        !confirm(
            "এই medicine delete করবেন?"
        )
    ) {
        return;
    }


    medicines.splice(
        index,
        1
    );

    saveData();

    showMedicines();
}


// ==========================================
// PURCHASE
// ==========================================

function showPurchase() {

    layout(
        "📦 Purchase / Stock In",
        `

        <form id="purchaseForm">

            <div style="margin-bottom:12px;">

                <label>
                    <b>Medicine</b>
                </label>

                <select
                    id="purchaseMedicine"
                    class="form-control"
                    style="
                        width:100%;
                        padding:10px;
                        margin-top:5px;
                    ">

                    <option value="">
                        Select Medicine
                    </option>

                    ${medicines.map(m => `

                        <option
                            value="${m.id}">

                            ${escapeHTML(m.name)}

                            |
                            Stock:
                            ${m.stock}

                        </option>

                    `).join("")}

                </select>

            </div>


            ${input(
                "purchaseQty",
                "Quantity",
                "number",
                "1"
            )}


            ${input(
                "purchasePriceInput",
                "Purchase Price",
                "number",
                "0"
            )}


            ${input(
                "purchaseSupplier",
                "Supplier"
            )}


            <button
                class="btn btn-primary"
                type="submit">

                📦 Add Purchase

            </button>

        </form>


        <hr style="margin:25px 0;">


        <h3>Recent Purchases</h3>

        <div id="purchaseList"></div>

        `
    );


    renderPurchases();


    document.getElementById(
        "purchaseForm"
    ).onsubmit =
        function(e) {

            e.preventDefault();


            const id =
                Number(
                    document.getElementById(
                        "purchaseMedicine"
                    ).value
                );


            const qty =
                Number(
                    document.getElementById(
                        "purchaseQty"
                    ).value
                );


            const price =
                Number(
                    document.getElementById(
                        "purchasePriceInput"
                    ).value
                );


            const medicine =
                medicines.find(
                    m => m.id === id
                );


            if (!medicine) {

                alert(
                    "Medicine select করুন"
                );

                return;
            }


            if (qty <= 0) {

                alert(
                    "Quantity সঠিক দিন"
                );

                return;
            }


            medicine.stock =
                Number(
                    medicine.stock || 0
                ) + qty;


            purchases.push({

                id: Date.now(),

                date: today(),

                medicine:
                    medicine.name,

                qty: qty,

                price: price,

                supplier:
                    document.getElementById(
                        "purchaseSupplier"
                    ).value.trim(),

                total:
                    qty * price

            });


            saveData();


            alert(
                "Purchase added এবং stock updated!"
            );


            showPurchase();
        };
}


// ==========================================
// RENDER PURCHASE
// ==========================================

function renderPurchases() {

    const box =
        document.getElementById(
            "purchaseList"
        );

    if (!box) return;


    const list =
        [...purchases]
        .reverse()
        .slice(0, 20);


    if (!list.length) {

        box.innerHTML =
            "<p>কোনো purchase নেই।</p>";

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

                        <td>
                            ${escapeHTML(p.date)}
                        </td>

                        <td>
                            ${escapeHTML(
                                p.medicine
                            )}
                        </td>

                        <td>
                            ${p.qty}
                        </td>

                        <td>
                            ${money(p.total)}
                        </td>

                        <td>
                            ${escapeHTML(
                                p.supplier
                            )}
                        </td>

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

    saleCart = [];


    layout(
        "🧾 Sales / POS",
        `

        <div
            class="panel"
            style="
                padding:0;
                box-shadow:none;
            ">


            <div style="margin-bottom:12px;">

                <label>
                    <b>Medicine</b>
                </label>


                <select
                    id="cartMedicine"
                    class="form-control"
                    style="
                        width:100%;
                        padding:10px;
                        margin-top:5px;
                    ">

                    <option value="">
                        Select Medicine
                    </option>


                    ${medicines.map(m => `

                        <option
                            value="${m.id}">

                            ${escapeHTML(
                                m.name
                            )}

                            |
                            Stock:
                            ${m.stock}

                            |
                            ${money(m.sale)}

                        </option>

                    `).join("")}

                </select>

            </div>


            <div style="
                display:grid;
                grid-template-columns:
                    1fr 1fr;
                gap:10px;
            ">

                ${input(
                    "cartQty",
                    "Quantity",
                    "number",
                    "1"
                )}


                ${input(
                    "cartPrice",
                    "Sale Price",
                    "number",
                    "0"
                )}

            </div>


            <button
                type="button"
                class="btn btn-primary"
                onclick="addToCart()">

                ➕ Add to Cart

            </button>


            <hr style="margin:25px 0;">


            <h3>🛒 Sale Cart</h3>


            <div id="cartList"></div>


            <div style="margin-top:15px;">

                ${input(
                    "saleCustomer",
                    "Customer Name"
                )}


                ${input(
                    "saleDiscount",
                    "Discount",
                    "number",
                    "0"
                )}


                ${input(
                    "salePaid",
                    "Paid Amount",
                    "number",
                    "0"
                )}

            </div>


            <div
                id="saleSummary"
                style="margin-top:15px;">
            </div>


            <button
                type="button"
                class="btn btn-primary"
                onclick="completeCartSale()">

                💰 Complete Sale &
                Print Invoice

            </button>


            <hr style="margin:25px 0;">


            <h3>📋 Today's Sales</h3>


            <div id="salesList"></div>

        </div>

        `
    );


    document.getElementById(
        "cartMedicine"
    ).onchange =
        function() {

            const medicine =
                medicines.find(
                    m =>
                        m.id ===
                        Number(this.value)
                );


            document.getElementById(
                "cartPrice"
            ).value =
                medicine
                    ? medicine.sale
                    : 0;
        };


    document.getElementById(
        "saleDiscount"
    ).oninput =
        renderCart;


    document.getElementById(
        "salePaid"
    ).oninput =
        renderCart;


    renderCart();

    renderSales();
}


// ==========================================
// ADD TO CART
// ==========================================

function addToCart() {

    const id =
        Number(
            document.getElementById(
                "cartMedicine"
            ).value
        );


    const qty =
        Number(
            document.getElementById(
                "cartQty"
            ).value
        );


    const price =
        Number(
            document.getElementById(
                "cartPrice"
            ).value
        );


    const medicine =
        medicines.find(
            m => m.id === id
        );


    if (!medicine) {

        alert(
            "Medicine select করুন"
        );

        return;
    }


    if (qty <= 0) {

        alert(
            "Quantity সঠিক দিন"
        );

        return;
    }


    if (
        qty >
        Number(medicine.stock || 0)
    ) {

        alert(
            "পর্যাপ্ত stock নেই!"
        );

        return;
    }


    if (price < 0) {

        alert(
            "Price সঠিক দিন"
        );

        return;
    }


    const existing =
        saleCart.find(
            i =>
                i.medicineId === id
        );


    if (existing) {

        if (
            existing.qty + qty >
            Number(medicine.stock || 0)
        ) {

            alert(
                "Stock-এর চেয়ে বেশি quantity দেওয়া যাবে না!"
            );

            return;
        }


        existing.qty += qty;

        existing.price = price;

    }

    else {

        saleCart.push({

            medicineId: id,

            medicine:
                medicine.name,

            qty: qty,

            price: price

        });
    }


    document.getElementById(
        "cartQty"
    ).value = 1;


    document.getElementById(
        "cartMedicine"
    ).value = "";


    document.getElementById(
        "cartPrice"
    ).value = 0;


    renderCart();
}


// ==========================================
// RENDER CART
// ==========================================

function renderCart() {

    const box =
        document.getElementById(
            "cartList"
        );

    if (!box) return;


    if (!saleCart.length) {

        box.innerHTML = `
            <p>
                Cart এখনো খালি।
            </p>
        `;

    }

    else {

        box.innerHTML = `

            <div style="overflow:auto;">

                <table>

                    <tr>

                        <th>Medicine</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Action</th>

                    </tr>


                    ${saleCart.map(
                        (item, index) => `

                        <tr>

                            <td>
                                ${escapeHTML(
                                    item.medicine
                                )}
                            </td>

                            <td>
                                ${item.qty}
                            </td>

                            <td>
                                ${money(
                                    item.price
                                )}
                            </td>

                            <td>
                                ${money(
                                    item.qty *
                                    item.price
                                )}
                            </td>

                            <td>

                                <button
                                    onclick="removeFromCart(${index})">

                                    🗑️ Remove

                                </button>

                            </td>

                        </tr>

                    `
                    ).join("")}

                </table>

            </div>
        `;
    }


    const subtotal =
        saleCart.reduce(
            (sum, item) =>
                sum +
                (
                    Number(item.qty) *
                    Number(item.price)
                ),
            0
        );


    const discount =
        Number(
            document.getElementById(
                "saleDiscount"
            )?.value || 0
        );


    const total =
        Math.max(
            0,
            subtotal - discount
        );


    const paid =
        Number(
            document.getElementById(
                "salePaid"
            )?.value || 0
        );


    const due =
        Math.max(
            0,
            total - paid
        );


    const change =
        Math.max(
            0,
            paid - total
        );


    const summary =
        document.getElementById(
            "saleSummary"
        );


    if (summary) {

        summary.innerHTML = `

            <div style="
                border:1px solid #ddd;
                padding:15px;
                border-radius:8px;
            ">

                <p>
                    <b>Subtotal:</b>
                    ${money(subtotal)}
                </p>

                <p>
                    <b>Discount:</b>
                    ${money(discount)}
                </p>

                <p style="
                    font-size:20px;
                ">
                    <b>Grand Total:</b>
                    ${money(total)}
                </p>

                <p>
                    <b>Paid:</b>
                    ${money(paid)}
                </p>

                <p>
                    <b>Due:</b>
                    ${money(due)}
                </p>

                <p>
                    <b>Change:</b>
                    ${money(change)}
                </p>

            </div>
        `;
    }
}


// ==========================================
// REMOVE CART
// ==========================================

function removeFromCart(index) {

    saleCart.splice(
        index,
        1
    );

    renderCart();
}


// ==========================================
// COMPLETE SALE
// ==========================================

function completeCartSale() {

    if (!saleCart.length) {

        alert(
            "Cart-এ কোনো medicine নেই!"
        );

        return;
    }


    const discount =
        Number(
            document.getElementById(
                "saleDiscount"
            ).value
        ) || 0;


    const paid =
        Number(
            document.getElementById(
                "salePaid"
            ).value
        ) || 0;


    const customer =
        document.getElementById(
            "saleCustomer"
        ).value.trim();


    const subtotal =
        saleCart.reduce(
            (sum, item) =>
                sum +
                (
                    Number(item.qty) *
                    Number(item.price)
                ),
            0
        );


    if (discount < 0) {

        alert(
            "Discount সঠিক দিন"
        );

        return;
    }


    if (discount > subtotal) {

        alert(
            "Discount subtotal-এর চেয়ে বেশি হতে পারবে না!"
        );

        return;
    }


    const total =
        subtotal - discount;


    const due =
        Math.max(
            0,
            total - paid
        );


    const change =
        Math.max(
            0,
            paid - total
        );


    // CHECK STOCK AGAIN
    for (
        const item of saleCart
    ) {

        const medicine =
            medicines.find(
                m =>
                    m.id ===
                    item.medicineId
            );


        if (!medicine) {

            alert(
                "একটি medicine পাওয়া যাচ্ছে না!"
            );

            return;
        }


        if (
            Number(item.qty) >
            Number(medicine.stock || 0)
        ) {

            alert(
                medicine.name +
                " এর পর্যাপ্ত stock নেই!"
            );

            return;
        }
    }


    // REDUCE STOCK
    saleCart.forEach(
        item => {

            const medicine =
                medicines.find(
                    m =>
                        m.id ===
                        item.medicineId
                );


            medicine.stock =
                Number(
                    medicine.stock || 0
                ) -
                Number(item.qty);
        }
    );


    const sale = {

        id: Date.now(),

        invoice:
            "INV-" +
            Date.now(),

        date: today(),

        time: currentTime(),

        customer:
            customer ||
            "Walk-in Customer",

        items:
            saleCart.map(
                item => ({
                    medicineId:
                        item.medicineId,

                    medicine:
                        item.medicine,

                    qty:
                        item.qty,

                    price:
                        item.price,

                    total:
                        Number(item.qty) *
                        Number(item.price)
                })
            ),

        subtotal:
            subtotal,

        discount:
            discount,

        total:
            total,

        paid:
            paid,

        due:
            due,

        change:
            change
    };


    sales.push(sale);

    saveData();


    alert(
        "Sale completed successfully!"
    );


    printInvoice(sale);


    saleCart = [];

    showSales();
}


// ==========================================
// SALES HISTORY
// ==========================================

function renderSales() {

    const box =
        document.getElementById(
            "salesList"
        );

    if (!box) return;


    const list =
        sales
        .filter(
            s =>
                s.date ===
                today()
        )
        .reverse();


    if (!list.length) {

        box.innerHTML =
            "<p>আজকে কোনো sale নেই।</p>";

        return;
    }


    box.innerHTML = `

        <div style="overflow:auto;">

            <table>

                <tr>

                    <th>Invoice</th>
                    <th>Time</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Due</th>
                    <th>Action</th>

                </tr>


                ${list.map(
                    s => `

                    <tr>

                        <td>
                            ${escapeHTML(
                                s.invoice || "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                s.time || ""
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                s.customer ||
                                "Walk-in Customer"
                            )}
                        </td>

                        <td>
                            ${
                                s.items
                                    ? s.items.length
                                    : 1
                            }
                        </td>

                        <td>
                            ${money(
                                s.total
                            )}
                        </td>

                        <td>
                            ${money(
                                s.due
                            )}
                        </td>

                        <td>

                            <button
                                onclick='printInvoice(${JSON.stringify(s)})'>

                                🖨️ Print

                            </button>

                        </td>

                    </tr>

                `
                ).join("")}

            </table>

        </div>
    `;
}


// ==========================================
// PRINT INVOICE
// ==========================================

function printInvoice(sale) {

    const w =
        window.open(
            "",
            "_blank"
        );


    if (!w) {

        alert(
            "Browser popup blocked করেছে। Print করার অনুমতি দিন।"
        );

        return;
    }


    const items =
        Array.isArray(
            sale.items
        ) &&
        sale.items.length

            ? sale.items

            : [
                {
                    medicine:
                        sale.medicine,

                    qty:
                        sale.qty,

                    price:
                        sale.price
                }
            ];


    w.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                ${escapeHTML(
                    sale.invoice ||
                    "Pharmacy Invoice"
                )}
            </title>


            <style>

                body {

                    font-family:
                        Arial, sans-serif;

                    padding:25px;
                }


                .invoice {

                    max-width:650px;

                    margin:auto;
                }


                h1,
                h2 {

                    text-align:center;
                }


                table {

                    width:100%;

                    border-collapse:
                        collapse;

                    margin-top:20px;
                }


                th,
                td {

                    border:
                        1px solid #999;

                    padding:9px;

                    text-align:left;
                }


                .right {

                    text-align:right;
                }


                .total {

                    font-size:18px;

                    font-weight:bold;
                }

            </style>

        </head>


        <body
            onload="window.print()">


            <div class="invoice">

                <h1>
                    💊 Pharmacy
                </h1>


                <h2>
                    Sales Invoice
                </h2>


                <p>

                    <b>Invoice:</b>
                    ${escapeHTML(
                        sale.invoice || "-"
                    )}

                    <br>

                    <b>Date:</b>
                    ${escapeHTML(
                        sale.date || ""
                    )}

                    <br>

                    <b>Time:</b>
                    ${escapeHTML(
                        sale.time || ""
                    )}

                    <br>

                    <b>Customer:</b>
                    ${escapeHTML(
                        sale.customer ||
                        "Walk-in Customer"
                    )}

                </p>


                <table>

                    <tr>

                        <th>
                            Medicine
                        </th>

                        <th>
                            Qty
                        </th>

                        <th>
                            Price
                        </th>

                        <th>
                            Total
                        </th>

                    </tr>


                    ${items.map(
                        item => `

                        <tr>

                            <td>
                                ${escapeHTML(
                                    item.medicine
                                )}
                            </td>

                            <td>
                                ${item.qty}
                            </td>

                            <td>
                                ${money(
                                    item.price
                                )}
                            </td>

                            <td>
                                ${money(
                                    Number(
                                        item.qty
                                    ) *
                                    Number(
                                        item.price
                                    )
                                )}
                            </td>

                        </tr>

                    `
                    ).join("")}

                </table>


                <p class="right">

                    <b>Subtotal:</b>

                    ${money(
                        sale.subtotal ??
                        sale.total
                    )}

                </p>


                <p class="right">

                    <b>Discount:</b>

                    ${money(
                        sale.discount || 0
                    )}

                </p>


                <p class="right total">

                    <b>Grand Total:</b>

                    ${money(
                        sale.total
                    )}

                </p>


                <p class="right">

                    <b>Paid:</b>

                    ${money(
                        sale.paid || 0
                    )}

                </p>


                <p class="right">

                    <b>Due:</b>

                    ${money(
                        sale.due || 0
                    )}

                </p>


                <p class="right">

                    <b>Change:</b>

                    ${money(
                        sale.change || 0
                    )}

                </p>


                <p style="
                    text-align:center;
                    margin-top:40px;
                ">

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

    layout(
        "🚚 Suppliers",
        `

        <form id="supplierForm">

            ${input(
                "supplierName",
                "Supplier Name"
            )}

            ${input(
                "supplierPhone",
                "Phone"
            )}

            ${input(
                "supplierAddress",
                "Address"
            )}


            <button
                class="btn btn-primary"
                type="submit">

                💾 Save Supplier

            </button>

        </form>


        <hr style="margin:25px 0;">


        <div id="supplierList"></div>

        `
    );


    renderSuppliers();


    document.getElementById(
        "supplierForm"
    ).onsubmit =
        function(e) {

            e.preventDefault();


            const name =
                document.getElementById(
                    "supplierName"
                ).value.trim();


            if (!name) {

                alert(
                    "Supplier Name দিন"
                );

                return;
            }


            suppliers.push({

                id: Date.now(),

                name: name,

                phone:
                    document.getElementById(
                        "supplierPhone"
                    ).value.trim(),

                address:
                    document.getElementById(
                        "supplierAddress"
                    ).value.trim()

            });


            saveData();

            showSuppliers();
        };
}


function renderSuppliers() {

    const box =
        document.getElementById(
            "supplierList"
        );

    if (!box) return;


    if (!suppliers.length) {

        box.innerHTML =
            "<p>কোনো Supplier নেই।</p>";

        return;
    }


    box.innerHTML = `

        <h3>
            Supplier List
        </h3>


        <div style="overflow:auto;">

            <table>

                <tr>

                    <th>Name</th>
                    <th>Phone</th>
                    <th>Address</th>

                </tr>


                ${suppliers.map(
                    s => `

                    <tr>

                        <td>
                            ${escapeHTML(
                                s.name
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                s.phone
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                s.address
                            )}
                        </td>

                    </tr>

                `
                ).join("")}

            </table>

        </div>
    `;
}


// ==========================================
// CUSTOMERS
// ==========================================

function showCustomers() {

    layout(
        "👤 Customers",
        `

        <form id="customerForm">

            ${input(
                "custName",
                "Customer Name"
            )}

            ${input(
                "custPhone",
                "Phone"
            )}

            ${input(
                "custAddress",
                "Address"
            )}


            <button
                class="btn btn-primary"
                type="submit">

                💾 Save Customer

            </button>

        </form>


        <hr style="margin:25px 0;">


        <div id="customerList"></div>

        `
    );


    renderCustomers();


    document.getElementById(
        "customerForm"
    ).onsubmit =
        function(e) {

            e.preventDefault();


            const name =
                document.getElementById(
                    "custName"
                ).value.trim();


            if (!name) {

                alert(
                    "Customer Name দিন"
                );

                return;
            }


            customers.push({

                id: Date.now(),

                name: name,

                phone:
                    document.getElementById(
                        "custPhone"
                    ).value.trim(),

                address:
                    document.getElementById(
                        "custAddress"
                    ).value.trim()

            });


            saveData();

            showCustomers();
        };
}


function renderCustomers() {

    const box =
        document.getElementById(
            "customerList"
        );

    if (!box) return;


    if (!customers.length) {

        box.innerHTML =
            "<p>কোনো Customer নেই।</p>";

        return;
    }


    box.innerHTML = `

        <h3>
            Customer List
        </h3>


        <div style="overflow:auto;">

            <table>

                <tr>

                    <th>Name</th>
                    <th>Phone</th>
                    <th>Address</th>

                </tr>


                ${customers.map(
                    c => `

                    <tr>

                        <td>
                            ${escapeHTML(
                                c.name
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                c.phone
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                c.address
                            )}
                        </td>

                    </tr>

                `
                ).join("")}

            </table>

        </div>
    `;
}


// ==========================================
// REPORTS
// ==========================================

function showReports() {

    const totalSales =
        sales.reduce(
            (sum, s) =>
                sum +
                Number(
                    s.total || 0
                ),
            0
        );


    const totalPurchase =
        purchases.reduce(
            (sum, p) =>
                sum +
                Number(
                    p.total || 0
                ),
            0
        );


    const todaySales =
        sales
        .filter(
            s =>
                s.date ===
                today()
        )
        .reduce(
            (sum, s) =>
                sum +
                Number(
                    s.total || 0
                ),
            0
        );


    const low =
        medicines.filter(
            m =>
                Number(
                    m.stock || 0
                ) <=
                Number(
                    m.reorder || 0
                )
        );


    const expiry =
        medicines.filter(
            m => {

                if (!m.expiry)
                    return false;


                const days =
                    (
                        new Date(
                            m.expiry
                        ) -
                        new Date()
                    ) / 86400000;


                return (
                    days >= 0 &&
                    days <= 30
                );
            }
        );


    layout(
        "📈 Reports",
        `

        <div class="cards">

            <div class="card">

                <h3>
                    Today's Sales
                </h3>

                <div class="card-value">
                    ${money(
                        todaySales
                    )}
                </div>

            </div>


            <div class="card">

                <h3>
                    Total Sales
                </h3>

                <div class="card-value">
                    ${money(
                        totalSales
                    )}
                </div>

            </div>


            <div class="card">

                <h3>
                    Total Purchase
                </h3>

                <div class="card-value">
                    ${money(
                        totalPurchase
                    )}
                </div>

            </div>


            <div class="card">

                <h3>
                    Medicines
                </h3>

                <div class="card-value">
                    ${medicines.length}
                </div>

            </div>

        </div>


        <hr style="margin:25px 0;">


        <h3>
            ⚠️ Low Stock
        </h3>


        ${
            low.length

                ? low.map(
                    m => `

                    <p>

                        <b>
                            ${escapeHTML(
                                m.name
                            )}
                        </b>

                        — Stock:
                        ${m.stock}

                    </p>
                `
                ).join("")

                : `
                    <p>
                        কোনো Low Stock নেই।
                    </p>
                `
        }


        <h3 style="margin-top:25px;">

            📅 Near Expiry
            (30 days)

        </h3>


        ${
            expiry.length

                ? expiry.map(
                    m => `

                    <p>

                        <b>
                            ${escapeHTML(
                                m.name
                            )}
                        </b>

                        — Expiry:
                        ${m.expiry}

                    </p>
                `
                ).join("")

                : `
                    <p>
                        আগামী ৩০ দিনের মধ্যে
                        কোনো expiry নেই।
                    </p>
                `
        }


        <hr style="margin:25px 0;">


        <button
            class="btn btn-primary"
            onclick="window.print()">

            🖨️ Print Report

        </button>

        `
    );
}


// ==========================================
// OLD BUTTON COMPATIBILITY
// ==========================================

function comingSoon(name) {

    if (
        name === "Sales / POS" ||
        name === "New Sale"
    ) {

        showSales();

        return;
    }


    if (
        name === "Purchase"
    ) {

        showPurchase();

        return;
    }


    if (
        name === "Suppliers"
    ) {

        showSuppliers();

        return;
    }


    if (
        name === "Customers"
    ) {

        showCustomers();

        return;
    }


    if (
        name === "Reports"
    ) {

        showReports();

        return;
    }


    alert(
        name +
        " available soon."
    );
}


// ==========================================
// MOBILE MENU
// ==========================================

function toggleMenu() {

    const nav =
        document.querySelector(
            "nav"
        );


    if (nav) {

        nav.style.display =
            nav.style.display === "none"
                ? "flex"
                : "none";
    }
}


// ==========================================
// CLEAR MEDICINE FORM
// ==========================================

function clearMedicineForm() {

    editingMedicineIndex = -1;

    const form =
        document.getElementById(
            "medicineForm"
        );


    if (form) {

        form.reset();
    }
}
