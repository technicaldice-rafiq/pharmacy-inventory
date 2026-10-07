let medicines = JSON.parse(localStorage.getItem("medicines") || "[]");

document.addEventListener("DOMContentLoaded", function () {
    loadMedicines();
    showDashboard();
});

function saveMedicines() {
    localStorage.setItem("medicines", JSON.stringify(medicines));
}

function showDashboard() {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");

    const page = document.getElementById("dashboard");
    if (page) page.style.display = "block";

    updateDashboard();
}

function showMedicines() {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");

    const page = document.getElementById("medicines");
    if (page) page.style.display = "block";

    renderMedicines();
}

function comingSoon(name) {
    if (name === "Sales / POS" || name === "New Sale") {
        alert("Sales / POS এখনো তৈরি করা হয়নি।");
        return;
    }

    alert(name + " শীঘ্রই আসছে।");
}

const medicineForm = document.getElementById("medicineForm");

if (medicineForm) {
    medicineForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const medicine = {
            id: Date.now(),
            name: document.getElementById("medicineName").value.trim(),
            generic: document.getElementById("genericName").value.trim(),
            company: document.getElementById("companyName").value.trim(),
            strength: document.getElementById("strength").value.trim(),
            dosage: document.getElementById("dosageForm").value.trim(),
            barcode: document.getElementById("barcode").value.trim(),
            packSize: document.getElementById("packSize").value.trim(),
            stock: Number(document.getElementById("stock").value) || 0,
            reorder: Number(document.getElementById("reorderLevel").value) || 0,
            batch: document.getElementById("batchNumber").value.trim(),
            mfg: document.getElementById("manufacturingDate").value,
            expiry: document.getElementById("expiryDate").value,
            purchase: Number(document.getElementById("purchasePrice").value) || 0,
            sale: Number(document.getElementById("salePrice").value) || 0
        };

        if (!medicine.name) {
            alert("Medicine name দিন");
            return;
        }

        medicines.push(medicine);
        saveMedicines();

        alert("Medicine saved successfully!");

        medicineForm.reset();
        renderMedicines();
        updateDashboard();
    });
}

function loadMedicines() {
    medicines = JSON.parse(localStorage.getItem("medicines") || "[]");
}

function renderMedicines() {
    const tbody = document.getElementById("medicineTableBody");
    if (!tbody) return;

    const searchBox = document.getElementById("medicineSearch");
    const search = searchBox ? searchBox.value.toLowerCase() : "";

    const filtered = medicines.filter(m =>
        (m.name || "").toLowerCase().includes(search) ||
        (m.company || "").toLowerCase().includes(search)
    );

    tbody.innerHTML = "";

    filtered.forEach(m => {
        tbody.innerHTML += `
            <tr>
                <td>${m.name}</td>
                <td>${m.generic}</td>
                <td>${m.company}</td>
                <td>${m.strength}</td>
                <td>${m.stock}</td>
                <td>৳${m.sale}</td>
            </tr>
        `;
    });
}

function updateDashboard() {
    const total = document.getElementById("totalMedicines");
    const stock = document.getElementById("totalStock");

    if (total) total.textContent = medicines.length;

    if (stock) {
        stock.textContent = medicines.reduce(
            (sum, m) => sum + Number(m.stock || 0),
            0
        );
    }
}
