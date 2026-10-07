// Pharmacy Inventory Pro
// Medicine + Sales POS Stable Version

let medicines = [];
let sales = [];


/* ================= START ================= */

document.addEventListener("DOMContentLoaded", function () {

    loadData();
    loadSales();

    setupForm();
    updateDashboard();
    renderMedicines();

    const today = document.getElementById("today");

    if (today) {
        today.textContent = new Date().toLocaleDateString("en-BD", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

});


/* ================= MENU ================= */

function toggleMenu() {

    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }

}


/* ================= DASHBOARD ================= */

function showDashboard() {

    const dashboard = document.getElementById("dashboardPage");
    const medicine = document.getElementById("medicinePage");
    const salesPage = document.getElementById("salesPage");
    const title = document.getElementById("pageTitle");

    if (dashboard) dashboard.style.display = "block";
    if (medicine) medicine.style.display = "none";
    if (salesPage) salesPage.style.display = "none";

    if (title) title.textContent = "Dashboard";

    updateDashboard();

}


/* ================= MEDICINES ================= */

function showMedicines() {

    const dashboard = document.getElementById("dashboardPage");
    const medicine = document.getElementById("medicinePage");
    const salesPage = document.getElementById("salesPage");
    const title = document.getElementById("pageTitle");

    if (dashboard) dashboard.style.display = "none";
    if (medicine) medicine.style.display = "block";
    if (salesPage) salesPage.style.display = "none";

    if (title) title.textContent = "Medicines";

    renderMedicines();

    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }

}


/* ================= OTHER MENU ================= */

function comingSoon(name) {

    if (
        name === "Sales / POS" ||
        name === "New Sale"
    ) {
        showSales();
        return;
    }

    alert(name + " module শীঘ্রই চালু করা হবে।");

}


/* ================= VALUE ================= */

function getValue(id) {

    const el = document.getElementById(id);

    if (!el) return "";

    return el.value.trim();

}


function getNumber(id) {

    const el = document.getElementById(id);

    if (!el) return 0;

    const n = Number(el.value);

    return Number.isFinite(n) ? n : 0;

}


/* ================= MEDICINE FORM ================= */

function setupForm() {

    const form = document.getElementById("medicineForm");

    if (!form) return;

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const name = getValue("medicineName");
        const expiry = getValue("expiryDate");

        if (!name) {
            alert("Medicine Name দিন।");
            return;
        }

        if (!expiry) {
            alert("Expiry Date দিন।");
            return;
        }

        const medicine = {

            id: Date.now(),

            name: name,

            generic: getValue("genericName"),

            company: getValue("companyName"),

            strength: getValue("strength"),

            dosageForm: getValue("dosageForm"),

            barcode: getValue("barcode"),

            packSize: getValue("packSize"),

            stock: getNumber("stock"),

            reorderLevel:
                getNumber("reorderLevel") || 10,

            batchNumber:
                getValue("batchNumber"),

            manufacturingDate:
                getValue("manufacturingDate"),

            expiryDate: expiry,

            purchasePrice:
                getNumber("purchasePrice"),

            salePrice:
                getNumber("salePrice")

        };


        medicines.push(medicine);

        saveData();

        renderMedicines();

        updateDashboard();

        alert("Medicine সফলভাবে Save হয়েছে!");

        clearMedicineForm();

    });

}


/* ================= CLEAR MEDICINE ================= */

function clearMedicineForm() {

    const form =
        document.getElementById("medicineForm");

    if (!form) return;

    form.reset();

    const stock =
        document.getElementById("stock");

    const reorder =
        document.getElementById("reorderLevel");

    if (stock) stock.value = 0;

    if (reorder) reorder.value = 10;

}


/* ================= MEDICINE SAVE ================= */

function saveData() {

    localStorage.setItem(
        "pharmacy_medicines",
        JSON.stringify(medicines)
    );

}


function loadData() {

    try {

        const data =
            localStorage.getItem(
                "pharmacy_medicines"
            );

        medicines =
            data ? JSON.parse(data) : [];

        if (!Array.isArray(medicines)) {
            medicines = [];
        }

    } catch (error) {

        medicines = [];

    }

}


/* ================= MEDICINE LIST ================= */

function renderMedicines() {

    const tbody =
        document.getElementById(
            "medicineTableBody"
        );

    if (!tbody) return;

    const searchBox =
        document.getElementById(
            "medicineSearch"
        );

    const search =
        searchBox
            ? searchBox.value.toLowerCase().trim()
            : "";


    const list =
        medicines.filter(function (m) {

            const text =
                (m.name || "") + " " +
                (m.generic || "") + " " +
                (m.company || "") + " " +
                (m.barcode || "");

            return text
                .toLowerCase()
                .includes(search);

        });


    if (list.length === 0) {

        tbody.innerHTML =
            '<tr>' +
            '<td colspan="10" ' +
            'style="text-align:center;padding:30px;">' +
            'কোনো Medicine পাওয়া যায়নি।' +
            '</td>' +
            '</tr>';

        return;

    }


    let html = "";


    list.forEach(function (m, index) {

        const stock =
            Number(m.stock) || 0;

        const reorder =
            Number(m.reorderLevel) || 0;

        let status = "";


        if (stock === 0) {

            status =
                '<span class="status status-danger">' +
                'Out of Stock' +
                '</span>';

        }

        else if (stock <= reorder) {

            status =
                '<span class="status status-warning">' +
                'Low Stock' +
                '</span>';

        }

        else {

            status =
                '<span class="status status-success">' +
                'In Stock' +
                '</span>';

        }


        html +=

            "<tr>" +

            "<td>" +
            (index + 1) +
            "</td>" +

            "<td><strong>" +
            escapeHTML(m.name) +
            "</strong><br><small>" +
            escapeHTML(m.strength || "") +
            "</small></td>" +

            "<td>" +
            escapeHTML(m.generic || "-") +
            "</td>" +

            "<td>" +
            escapeHTML(m.company || "-") +
            "</td>" +

            "<td>" +
            escapeHTML(m.batchNumber || "-") +
            "</td>" +

            "<td>" +
            escapeHTML(m.expiryDate || "-") +
            "</td>" +

            "<td>" +
            stock +
            "</td>" +

            "<td>৳ " +
            Number(m.salePrice || 0)
                .toFixed(2) +
            "</td>" +

            "<td>" +
            status +
            "</td>" +

            "<td>" +

            '<button class="btn btn-danger" ' +
            'onclick="deleteMedicine(' +
            m.id +
            ')">' +

            "Delete" +

            "</button>" +

            "</td>" +

            "</tr>";

    });


    tbody.innerHTML = html;

}


/* ================= DELETE MEDICINE ================= */

function deleteMedicine(id) {

    if (!confirm(
        "Medicine Delete করতে চান?"
    )) {
        return;
    }


    medicines =
        medicines.filter(function (m) {

            return Number(m.id) !==
                   Number(id);

        });


    saveData();

    renderMedicines();

    updateDashboard();

}


/* ================= SALES PAGE ================= */

function showSales() {

    createSalesPage();


    const dashboard =
        document.getElementById(
            "dashboardPage"
        );

    const medicine =
        document.getElementById(
            "medicinePage"
        );

    const salesPage =
        document.getElementById(
            "salesPage"
        );

    const title =
        document.getElementById(
            "pageTitle"
        );


    if (dashboard)
        dashboard.style.display = "none";


    if (medicine)
        medicine.style.display = "none";


    if (salesPage)
        salesPage.style.display = "block";


    if (title)
        title.textContent = "Sales / POS";


    populateSaleMedicines();

    renderSales();


    const sidebar =
        document.getElementById(
            "sidebar"
        );

    if (sidebar) {
        sidebar.classList.remove("open");
    }

}


/* ================= CREATE SALES UI ================= */

function createSalesPage() {

    if (
        document.getElementById(
            "salesPage"
        )
    ) {
        return;
    }


    const content =
        document.getElementById(
            "content"
        );

    if (!content) return;


    const page =
        document.createElement("div");

    page.id = "salesPage";

    page.style.display = "none";


    page.innerHTML = `

        <div class="panel">

            <h2>🧾 Sales / POS</h2>

            <p style="color:#6b7280;">
                Medicine বিক্রি করুন এবং
                Stock স্বয়ংক্রিয়ভাবে কমবে।
            </p>


            <form id="salesForm"
                  onsubmit="saveSale(event)">

                <div class="form-grid">


                    <div class="form-group">

                        <label>
                            Medicine *
                        </label>

                        <select
                            id="saleMedicine"
                            class="form-control"
                            required
                            onchange="updateSalePrice()">

                            <option value="">
                                Medicine Select করুন
                            </option>

                        </select>

                    </div>


                    <div class="form-group">

                        <label>
                            Customer Name
                        </label>

                        <input
                            type="text"
                            id="customerName"
                            class="form-control"
                            placeholder="Customer name">

                    </div>


                    <div class="form-group">

                        <label>
                            Quantity *
                        </label>

                        <input
                            type="number"
                            id="saleQuantity"
                            class="form-control"
                            min="1"
                            value="1"
                            required>

                    </div>


                    <div class="form-group">

                        <label>
                            Sale Price
                        </label>

                        <input
                            type="number"
                            id="saleUnitPrice"
                            class="form-control"
                            min="0"
                            step="0.01"
                            required>

                    </div>


                </div>


                <div style="
                    margin-top:20px;
                    display:flex;
                    gap:10px;
                    flex-wrap:wrap;
                ">

                    <button
                        type="submit"
                        class="btn btn-primary">

                        💾 Complete Sale

                    </button>


                    <button
                        type="button"
                        class="btn"
                        onclick="clearSaleForm()">

                        Clear

                    </button>

                </div>


            </form>

        </div>


        <div
            class="panel"
            style="margin-top:18px;"
        >

            <h3>
                📋 Today's Sales
            </h3>


            <div
                class="table-container"
                style="margin-top:15px;"
            >

                <table>

                    <thead>

                        <tr>

                            <th>#</th>

                            <th>Medicine</th>

                            <th>Customer</th>

                            <th>Qty</th>

                            <th>Total</th>

                            <th>Time</th>

                        </tr>

                    </thead>


                    <tbody
                        id="salesTableBody"
                    >
                    </tbody>

                </table>

            </div>

        </div>

    `;


    content.appendChild(page);

}


/* ================= SALES DATA ================= */

function loadSales() {

    try {

        const data =
            localStorage.getItem(
                "pharmacy_sales"
            );

        sales =
            data ? JSON.parse(data) : [];

        if (!Array.isArray(sales)) {
            sales = [];
        }

    } catch (error) {

        sales = [];

    }

}


function saveSales() {

    localStorage.setItem(
        "pharmacy_sales",
        JSON.stringify(sales)
    );

}


/* ================= SALE MEDICINES ================= */

function populateSaleMedicines() {

    const select =
        document.getElementById(
            "saleMedicine"
        );

    if (!select) return;


    const current =
        select.value;


    select.innerHTML =
        '<option value="">' +
        'Medicine Select করুন' +
        '</option>';


    medicines.forEach(function (m) {

        select.innerHTML +=

            '<option value="' +
            m.id +
            '">' +

            escapeHTML(m.name) +

            ' — Stock: ' +

            (Number(m.stock) || 0) +

            '</option>';

    });


    if (current) {
        select.value = current;
    }


    updateSalePrice();

}


/* ================= SALE PRICE ================= */

function updateSalePrice() {

    const select =
        document.getElementById(
            "saleMedicine"
        );

    const price =
        document.getElementById(
            "saleUnitPrice"
        );


    if (!select || !price) return;


    const medicine =
        medicines.find(function (m) {

            return String(m.id) ===
                   String(select.value);

        });


    if (medicine) {

        price.value =
            Number(
                medicine.salePrice || 0
            );

    }

}


/* ================= COMPLETE SALE ================= */

function saveSale(event) {

    event.preventDefault();


    const select =
        document.getElementById(
            "saleMedicine"
        );


    const quantity =
        Number(
            document.getElementById(
                "saleQuantity"
            ).value
        );


    const price =
        Number(
            document.getElementById(
                "saleUnitPrice"
            ).value
        );


    const customer =
        getValue("customerName");


    const medicine =
        medicines.find(function (m) {

            return String(m.id) ===
                   String(select.value);

        });


    if (!medicine) {

        alert(
            "Medicine Select করুন।"
        );

        return;

    }


    if (
        !Number.isFinite(quantity) ||
        quantity < 1
    ) {

        alert(
            "সঠিক Quantity দিন।"
        );

        return;

    }


    const currentStock =
        Number(medicine.stock) || 0;


    if (quantity > currentStock) {

        alert(
            "এই Medicine-এর Stock যথেষ্ট নেই। " +
            "বর্তমান Stock: " +
            currentStock
        );

        return;

    }


    medicine.stock =
        currentStock - quantity;


    const total =
        quantity * price;


    sales.unshift({

        id: Date.now(),

        medicineId:
            medicine.id,

        medicineName:
            medicine.name,

        customer:
            customer ||
            "Walk-in Customer",

        quantity:
            quantity,

        unitPrice:
            price,

        total:
            total,

        date:
            new Date().toISOString(),

        saleDate:
            new Date()
                .toLocaleDateString(
                    "en-CA"
                )

    });


    saveData();

    saveSales();

    renderMedicines();

    populateSaleMedicines();

    renderSales();

    updateDashboard();


    alert(
        "Sale সফলভাবে সম্পন্ন হয়েছে!"
    );


    clearSaleForm();

}


/* ================= CLEAR SALE ================= */

function clearSaleForm() {

    const form =
        document.getElementById(
            "salesForm"
        );

    if (form) {
        form.reset();
    }


    const quantity =
        document.getElementById(
            "saleQuantity"
        );

    if (quantity) {
        quantity.value = 1;
    }


    updateSalePrice();

}


/* ================= SALES LIST ================= */

function renderSales() {

    const tbody =
        document.getElementById(
            "salesTableBody"
        );

    if (!tbody) return;


    const today =
        new Date()
            .toLocaleDateString(
                "en-CA"
            );


    const todaySales =
        sales.filter(function (s) {

            return s.saleDate ===
                   today;

        });


    if (!todaySales.length) {

        tbody.innerHTML =

            '<tr>' +

            '<td colspan="6" ' +
            'style="text-align:center;padding:30px;">' +

            'আজ কোনো Sale নেই।' +

            '</td>' +

            '</tr>';

        return;

    }


    tbody.innerHTML =
        todaySales.map(
            function (s, i) {

                return (

                    "<tr>" +

                    "<td>" +
                    (i + 1) +
                    "</td>" +

                    "<td>" +
                    escapeHTML(
                        s.medicineName
                    ) +
                    "</td>" +

                    "<td>" +
                    escapeHTML(
                        s.customer
                    ) +
                    "</td>" +

                    "<td>" +
                    s.quantity +
                    "</td>" +

                    "<td>৳ " +
                    Number(
                        s.total || 0
                    ).toFixed(2) +
                    "</td>" +

                    "<td>" +
                    new Date(
                        s.date
                    ).toLocaleTimeString(
                        "en-BD",
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    ) +
                    "</td>" +

                    "</tr>"

                );

            }
        ).join("");

}


/* ================= DASHBOARD ================= */

function updateDashboard() {

    const total =
        document.getElementById(
            "totalMedicines"
        );


    const low =
        document.getElementById(
            "lowStockCount"
        );


    const expiry =
        document.getElementById(
            "expiryCount"
        );


    if (total) {

        total.textContent =
            medicines.length;

    }


    if (low) {

        low.textContent =
            medicines.filter(
                function (m) {

                    const stock =
                        Number(m.stock) || 0;

                    const reorder =
                        Number(
                            m.reorderLevel
                        ) || 0;

                    return stock <=
                           reorder;

                }
            ).length;

    }


    if (expiry) {

        const now =
            new Date();


        const future =
            new Date();


        future.setDate(
            now.getDate() + 30
        );


        expiry.textContent =
            medicines.filter(
                function (m) {

                    if (!m.expiryDate)
                        return false;


                    const date =
                        new Date(
                            m.expiryDate +
                            "T23:59:59"
                        );


                    return (
                        date >= now &&
                        date <= future
                    );

                }
            ).length;

    }


    /* Today's Sales */

    const salesCard =
        document.querySelector(
            ".card:first-child .card-value"
        );


    if (salesCard) {

        const today =
            new Date()
                .toLocaleDateString(
                    "en-CA"
                );


        const totalSales =
            sales
                .filter(function (s) {

                    return s.saleDate ===
                           today;

                })
                .reduce(
                    function (sum, s) {

                        return sum +
                            Number(
                                s.total || 0
                            );

                    },
                    0
                );


        salesCard.textContent =
            "৳ " +
            totalSales.toFixed(2);

    }

}


/* ================= ESCAPE HTML ================= */

function escapeHTML(value) {

    return String(value || "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
