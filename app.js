// Pharmacy Inventory Pro
// Stable Version

let medicines = [];

// START
document.addEventListener("DOMContentLoaded", function () {
    loadData();
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


// MENU
function toggleMenu() {
    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }
}


// DASHBOARD
function showDashboard() {
    const dashboard = document.getElementById("dashboardPage");
    const medicine = document.getElementById("medicinePage");
    const title = document.getElementById("pageTitle");

    if (dashboard) dashboard.style.display = "block";
    if (medicine) medicine.style.display = "none";
    if (title) title.textContent = "Dashboard";

    updateDashboard();
}


// MEDICINES
function showMedicines() {
    const dashboard = document.getElementById("dashboardPage");
    const medicine = document.getElementById("medicinePage");
    const title = document.getElementById("pageTitle");

    if (dashboard) dashboard.style.display = "none";
    if (medicine) medicine.style.display = "block";
    if (title) title.textContent = "Medicines";

    renderMedicines();

    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }
}


// OTHER MENU
function comingSoon(name) {
    alert(name + " module শীঘ্রই চালু করা হবে।");
}


// GET VALUE
function getValue(id) {
    const el = document.getElementById(id);

    if (!el) return "";

    return el.value.trim();
}


// GET NUMBER
function getNumber(id) {
    const el = document.getElementById(id);

    if (!el) return 0;

    const n = Number(el.value);

    return Number.isFinite(n) ? n : 0;
}


// FORM
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
            reorderLevel: getNumber("reorderLevel") || 10,
            batchNumber: getValue("batchNumber"),
            manufacturingDate: getValue("manufacturingDate"),
            expiryDate: expiry,
            purchasePrice: getNumber("purchasePrice"),
            salePrice: getNumber("salePrice")
        };

        medicines.push(medicine);

        saveData();

        renderMedicines();

        updateDashboard();

        alert("Medicine সফলভাবে Save হয়েছে!");

        clearMedicineForm();
    });
}


// CLEAR
function clearMedicineForm() {
    const form = document.getElementById("medicineForm");

    if (!form) return;

    form.reset();

    const stock = document.getElementById("stock");
    const reorder = document.getElementById("reorderLevel");

    if (stock) stock.value = 0;
    if (reorder) reorder.value = 10;
}


// SAVE
function saveData() {
    localStorage.setItem(
        "pharmacy_medicines",
        JSON.stringify(medicines)
    );
}


// LOAD
function loadData() {
    try {

        const data = localStorage.getItem(
            "pharmacy_medicines"
        );

        medicines = data ? JSON.parse(data) : [];

        if (!Array.isArray(medicines)) {
            medicines = [];
        }

    } catch (error) {

        medicines = [];

    }
}


// RENDER
function renderMedicines() {

    const tbody = document.getElementById(
        "medicineTableBody"
    );

    if (!tbody) return;

    const searchBox = document.getElementById(
        "medicineSearch"
    );

    const search = searchBox
        ? searchBox.value.toLowerCase().trim()
        : "";

    const list = medicines.filter(function (m) {

        const text =
            (m.name || "") + " " +
            (m.generic || "") + " " +
            (m.company || "") + " " +
            (m.barcode || "");

        return text.toLowerCase().includes(search);
    });


    if (list.length === 0) {

        tbody.innerHTML =
            '<tr>' +
            '<td colspan="10" style="text-align:center;padding:30px;">' +
            'কোনো Medicine পাওয়া যায়নি।' +
            '</td>' +
            '</tr>';

        return;
    }


    let html = "";

    list.forEach(function (m, index) {

        const stock = Number(m.stock) || 0;
        const reorder = Number(m.reorderLevel) || 0;

        let status = "";

        if (stock === 0) {

            status =
                '<span class="status status-danger">' +
                'Out of Stock' +
                '</span>';

        } else if (stock <= reorder) {

            status =
                '<span class="status status-warning">' +
                'Low Stock' +
                '</span>';

        } else {

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
            Number(m.salePrice || 0).toFixed(2) +
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


// DELETE
function deleteMedicine(id) {

    if (!confirm("Medicine Delete করতে চান?")) {
        return;
    }

    medicines = medicines.filter(function (m) {
        return Number(m.id) !== Number(id);
    });

    saveData();

    renderMedicines();

    updateDashboard();
}


// DASHBOARD
function updateDashboard() {

    const total =
        document.getElementById("totalMedicines");

    const low =
        document.getElementById("lowStockCount");

    const expiry =
        document.getElementById("expiryCount");


    if (total) {
              total.textContent = medicines.length;
    }


    if (low) {

        low.textContent =
            medicines.filter(function (m) {

                const stock = Number(m.stock) || 0;
                const reorder =
                    Number(m.reorderLevel) || 0;

                return stock <= reorder;

            }).length;
    }


    if (expiry) {

        const now = new Date();

        const future = new Date();

        future.setDate(
            now.getDate() + 30
        );


        expiry.textContent =
            medicines.filter(function (m) {

                if (!m.expiryDate) return false;

                const date =
                    new Date(
                        m.expiryDate +
                        "T23:59:59"
                    );

                return date >= now &&
                       date <= future;

            }).length;
    }
}


// ESCAPE HTML
function escapeHTML(value) {

    return String(value || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}
