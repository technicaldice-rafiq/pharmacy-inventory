// Pharmacy Inventory Pro - Final Stable App

let medicines = [];
let suppliers = [];
let customers = [];
let purchases = [];
let sales = [];

// ===============================
// START APP
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    loadData();

    const today = document.getElementById("today");

    if (today) {
        today.textContent = new Date().toLocaleDateString("en-BD", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    setupMedicineForm();

    renderMedicines();

    updateDashboard();
});


// ===============================
// SIDEBAR MENU
// ===============================

function toggleMenu() {

    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }
}


// ===============================
// DASHBOARD
// ===============================

function showDashboard() {

    const dashboard = document.getElementById("dashboardPage");
    const medicinePage = document.getElementById("medicinePage");
    const title = document.getElementById("pageTitle");

    if (dashboard) {
        dashboard.style.display = "block";
    }

    if (medicinePage) {
        medicinePage.style.display = "none";
    }

    if (title) {
        title.textContent = "Dashboard";
    }

    updateDashboard();
}


// ===============================
// MEDICINES PAGE
// ===============================

function showMedicines() {

    const dashboard = document.getElementById("dashboardPage");
    const medicinePage = document.getElementById("medicinePage");
    const title = document.getElementById("pageTitle");

    if (dashboard) {
        dashboard.style.display = "none";
    }

    if (medicinePage) {
        medicinePage.style.display = "block";
    }

    if (title) {
        title.textContent = "Medicines";
    }

    renderMedicines();

    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }
}


// ===============================
// OTHER MODULES
// ===============================

function comingSoon(name) {

    alert(name + " module খুব শীঘ্রই চালু করা হবে।");
}


// ===============================
// GET VALUE
// ===============================

function getValue(id) {

    const element = document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value.trim();
}


function getNumber(id) {

    const element = document.getElementById(id);

    if (!element) {
        return 0;
    }

    const number = Number(element.value);

    return Number.isFinite(number) ? number : 0;
}


// ===============================
// MEDICINE FORM
// ===============================

function setupMedicineForm() {

    const form = document.getElementById("medicineForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const name = getValue("medicineName");
        const expiry = getValue("expiryDate");

        if (!name) {

            alert("⚠️ Medicine Name দিন।");

            document.getElementById("medicineName")?.focus();

            return;
        }

        if (!expiry) {

            alert("⚠️ Expiry Date দিন।");

            document.getElementById("expiryDate")?.focus();

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

            reorderLevel: getNumber("reorderLevel") || 10,

            batchNumber: getValue("batchNumber"),

            manufacturingDate: getValue("manufacturingDate"),

            expiryDate: expiry,

            purchasePrice: getNumber("purchasePrice"),

            salePrice: getNumber("salePrice"),

            createdAt: new Date().toISOString()

        };


        medicines.push(medicine);

        saveData();

        renderMedicines();

        updateDashboard();

        alert("✅ Medicine সফলভাবে Save হয়েছে।");

        clearMedicineForm();

    });
}


// ===============================
// CLEAR FORM
// ===============================

function clearMedicineForm() {

    const form = document.getElementById("medicineForm");

    if (!form) {
        return;
    }

    form.reset();

    const stock = document.getElementById("stock");

    const reorder = document.getElementById("reorderLevel");

    if (stock) {
        stock.value = 0;
    }

    if (reorder) {
        reorder.value = 10;
    }
}


// ===============================
// SAVE DATA
// ===============================

function saveData() {

    localStorage.setItem(
        "pharmacy_medicines",
        JSON.stringify(medicines)
    );

    localStorage.setItem(
        "pharmacy_suppliers",
        JSON.stringify(suppliers)
    );

    localStorage.setItem(
        "pharmacy_customers",
        JSON.stringify(customers)
    );

    localStorage.setItem(
        "pharmacy_purchases",
        JSON.stringify(purchases)
    );

    localStorage.setItem(
        "pharmacy_sales",
        JSON.stringify(sales)
    );
}


// ===============================
// LOAD DATA
// ===============================

function loadData() {

    try {

        medicines = JSON.parse(
            localStorage.getItem("pharmacy_medicines") || "[]"
        );

        suppliers = JSON.parse(
            localStorage.getItem("pharmacy_suppliers") || "[]"
        );

        customers = JSON.parse(
            localStorage.getItem("pharmacy_customers") || "[]"
        );

        purchases = JSON.parse(
            localStorage.getItem("pharmacy_purchases") || "[]"
        );

        sales = JSON.parse(
            localStorage.getItem("pharmacy_sales") || "[]"
        );

    } catch (error) {

        medicines = [];
        suppliers = [];
        customers = [];
        purchases = [];
        sales = [];

    }
}


// ===============================
// RENDER MEDICINES
// ===============================

function renderMedicines() {

    const tbody = document.getElementById("medicineTableBody");

    if (!tbody) {
        return;
    }

    const searchBox = document.getElementById("medicineSearch");

    const search = searchBox
        ? searchBox.value.toLowerCase().trim()
        : "";


    const list = medicines.filter(function (medicine) {

        const text = [

            medicine.name,
            medicine.generic,
            medicine.company,
            medicine.barcode

        ].join(" ").toLowerCase();

        return text.includes(search);

    });


    if (list.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="10"
                    style="text-align:center;padding:30px;color:#777;">
                    কোনো Medicine পাওয়া যায়নি।
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML = list.map(function (medicine, index) {

        const stock = Number(medicine.stock) || 0;

        const reorder = Number(medicine.reorderLevel) || 0;

        let status = "";

        if (stock === 0) {

            status =
                '<span class="status status-danger">Out of Stock</span>';

        } else if (stock <= reorder) {

            status =
                '<span class="status status-warning">Low Stock</span>';

        } else {

            status =
                '<span class="status status-success">In Stock</span>';

        }


        return `
            <tr>

                <td>${index + 1}</td>

                <td>
                    <strong>
                        ${escapeHTML(medicine.name)}
                    </strong>
                    <br>
                    <small>
                        ${escapeHTML(medicine.strength || "")}
                    </small>
                </td>

                <td>
                    ${escapeHTML(medicine.generic || "-")}
                </td>

                <td>
                    ${escapeHTML(medicine.company || "-")}
                </td>

                <td>
                    ${escapeHTML(medicine.batchNumber || "-")}
                </td>

                <td>
                    ${escapeHTML(medicine.expiryDate || "-")}
                </td>

                <td>
                    <strong>${stock}</strong>
                </td>

                <td>
                    ৳ ${Number(
                        medicine.salePrice || 0
                    ).toFixed(2)}
                </td>

                <td>
                    ${status}
                </td>

                <td>

                    <
