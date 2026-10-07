// Pharmacy Inventory Pro - Stable Version

let medicines = [];
let suppliers = [];
let customers = [];
let purchases = [];
let sales = [];

document.addEventListener("DOMContentLoaded", function () {
    loadLocalData();
    setupNavigation();
    setupMedicineForm();
    renderMedicines();
    updateDashboard();

    const today = document.getElementById("today");
    if (today) {
        today.textContent = new Date().toLocaleDateString("en-BD", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }
});

function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("open");
}

function setupNavigation() {
    document.querySelectorAll(".nav-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".nav-btn").forEach(function (b) {
                b.classList.remove("active");
            });

            btn.classList.add("active");

            const sidebar = document.getElementById("sidebar");
            if (sidebar) sidebar.classList.remove("open");
        });
    });
}

function showDashboard() {
    const dashboard = document.getElementById("dashboardPage");
    const medicinesPage = document.getElementById("medicinePage");
    const title = document.getElementById("pageTitle");

    if (dashboard) dashboard.style.display = "block";
    if (medicinesPage) medicinesPage.style.display = "none";
    if (title) title.textContent = "Dashboard";

    updateDashboard();
}

function showMedicines() {
    const dashboard = document.getElementById("dashboardPage");
    const medicinesPage = document.getElementById("medicinePage");
    const title = document.getElementById("pageTitle");

    if (dashboard) dashboard.style.display = "none";
    if (medicinesPage) medicinesPage.style.display = "block";
    if (title) title.textContent = "Medicines";

    renderMedicines();
}

function comingSoon(name) {
    alert(name + " module খুব শীঘ্রই চালু করা হবে।");
}

function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
}

function getNumber(id, defaultValue = 0) {
    const element = document.getElementById(id);
    const number = element ? Number(element.value) : defaultValue;

    return Number.isFinite(number) ? number : defaultValue;
}

function setupMedicineForm() {
    const form = document.getElementById("medicineForm");

    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = getValue("medicineName");
        const expiry = getValue("expiryDate");

        if (!name) {
            alert("⚠️ Medicine Name দিন।");

            const field = document.getElementById("medicineName");
            if (field) field.focus();

            return;
        }

        if (!expiry) {
            alert("⚠️ Expiry Date দিন।");

            const field = document.getElementById("expiryDate");
            if (field) field.focus();

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
            reorderLevel: getNumber("reorderLevel", 10),

            batchNumber: getValue("batchNumber"),
            manufacturingDate: getValue("manufacturingDate"),
            expiryDate: expiry,

            purchasePrice: getNumber("purchasePrice"),
            salePrice: getNumber("salePrice"),

            createdAt: new Date().toISOString()
        };

        medicines.push(medicine);

        if (saveLocalData()) {
            renderMedicines();
            updateDashboard();

            alert("✅ Medicine সফলভাবে Save হয়েছে।");

            form.reset();
        }
    });
