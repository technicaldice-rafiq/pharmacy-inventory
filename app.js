// ========================================
// Pharmacy Inventory Pro
// Main Application JavaScript
// ========================================

document.addEventListener("DOMContentLoaded", function () {

  setTodayDate();
  setupNavigation();

});


// ========================================
// Today's Date
// ========================================

function setTodayDate() {

  const dateElement = document.getElementById("today");

  if (!dateElement) return;

  const today = new Date();

  dateElement.innerText = today.toLocaleDateString(
    "en-BD",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );

}


// ========================================
// Mobile Sidebar
// ========================================

function toggleMenu() {

  const sidebar = document.getElementById("sidebar");

  if (!sidebar) return;

  sidebar.classList.toggle("open");

}


// ========================================
// Navigation
// ========================================

function setupNavigation() {

  const buttons = document.querySelectorAll(".nav-btn");

  buttons.forEach(function (button) {

    button.addEventListener("click", function () {

      buttons.forEach(function (btn) {
        btn.classList.remove("active");
      });

      this.classList.add("active");

      // Mobile menu automatically close
      const sidebar = document.getElementById("sidebar");

      if (sidebar) {
        sidebar.classList.remove("open");
      }

    });

  });

}


// ========================================
// Dashboard
// ========================================

function showDashboard() {

  const title = document.getElementById("pageTitle");

  if (title) {
    title.innerText = "Dashboard";
  }

}


// ========================================
// Temporary Module
// ========================================

function comingSoon(moduleName) {

  alert(
    moduleName +
    " module খুব শীঘ্রই চালু করা হবে।"
  );

}


// ========================================
// Application Data
// Future database connection will use
// these structures.
// ========================================

let medicines = [];

let suppliers = [];

let customers = [];

let purchases = [];

let sales = [];


// ========================================
// Medicine Object Structure
// ========================================

function createMedicine(data) {

  return {

    id: Date.now(),

    name: data.name || "",

    generic: data.generic || "",

    company: data.company || "",

    strength: data.strength || "",

    dosageForm: data.dosageForm || "",

    barcode: data.barcode || "",

    packSize: data.packSize || "",

    reorderLevel:
      Number(data.reorderLevel) || 0,

    createdAt:
      new Date().toISOString()

  };

}


// ========================================
// Add Medicine
// ========================================

function addMedicine(data) {

  const medicine =
    createMedicine(data);

  medicines.push(medicine);

  saveLocalData();

  return medicine;

}


// ========================================
// Find Medicine
// ========================================

function findMedicine(id) {

  return medicines.find(
    medicine =>
      medicine.id === Number(id)
  );

}


// ========================================
// Search Medicine
// ========================================

function searchMedicine(keyword) {

  keyword =
    String(keyword)
      .toLowerCase()
      .trim();

  return medicines.filter(
    medicine =>

      medicine.name
        .toLowerCase()
        .includes(keyword)

      ||

      medicine.generic
        .toLowerCase()
        .includes(keyword)

      ||

      medicine.company
        .toLowerCase()
        .includes(keyword)

      ||

      medicine.barcode
        .toLowerCase()
        .includes(keyword)

  );

}


// ========================================
// Local Storage
// Temporary storage before Supabase
// ========================================

function saveLocalData() {

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


// ========================================
// Load Local Storage
// ========================================

function loadLocalData() {

  medicines =
    JSON.parse(
      localStorage.getItem(
        "pharmacy_medicines"
      )
    ) || [];

  suppliers =
    JSON.parse(
      localStorage.getItem(
        "pharmacy_suppliers"
      )
    ) || [];

  customers =
    JSON.parse(
      localStorage.getItem(
        "pharmacy_customers"
      )
    ) || [];

  purchases =
    JSON.parse(
      localStorage.getItem(
        "pharmacy_purchases"
      )
    ) || [];

  sales =
    JSON.parse(
      localStorage.getItem(
        "pharmacy_sales"
      )
    ) || [];

}


// Load saved data

loadLocalData();


// ========================================
// Stock Calculation
// ========================================

function calculateStock() {

  let totalStock = 0;

  medicines.forEach(function (medicine) {

    totalStock +=
      Number(medicine.stock) || 0;

  });

  return totalStock;

}


// ========================================
// Low Stock Check
// ========================================

function getLowStockMedicines() {

  return medicines.filter(
    medicine => {

      const stock =
        Number(medicine.stock) || 0;

      const reorder =
        Number(medicine.reorderLevel) || 0;

      return stock <= reorder;

    }
  );

}


// ========================================
// Expiry Check
// ========================================

function getExpiringMedicines(days = 30) {

  const today =
    new Date();

  const future =
    new Date();

  future.setDate(
    today.getDate() + days
  );

  return medicines.filter(
    medicine => {

      if (!medicine.expiryDate) {
        return false;
      }

      const expiry =
        new Date(
          medicine.expiryDate
        );

      return (
        expiry >= today &&
        expiry <= future
      );

    }
  );

}


// ========================================
// Format Currency
// ========================================

function formatCurrency(amount) {

  return "৳ " +
    Number(amount || 0)
      .toLocaleString("en-BD");

}


// ========================================
// Generate ID
// ========================================

function generateId(prefix) {

  return (
    prefix +
    "-" +
    Date.now() +
    "-" +
    Math.floor(
      Math.random() * 1000
    )
  );

}


// ========================================
// Console Information
// ========================================

console.log(
  "Pharmacy Inventory Pro loaded successfully."
);
