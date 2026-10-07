// ==========================================
// PHARMACY INVENTORY PRO
// COMPLETE VERSION
// ==========================================
// Medicine Management
// Purchase / Supplier
// Sales / POS
// Customer Search
// Invoice Print
// Due Collection
// Payment History
// Stock Adjustment
// Low Stock Alert
// Expiry Alert
// Purchase History
// Profit / Loss
// Date-wise Report
// Backup / Restore
// ==========================================

// ==========================================
// DATA
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

let payments = JSON.parse(
localStorage.getItem("pharmacy_payments") || "[]"
);

let stockAdjustments = JSON.parse(
localStorage.getItem("pharmacy_stock_adjustments") || "[]"
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

localStorage.setItem(  
    "pharmacy_payments",  
    JSON.stringify(payments)  
);  

localStorage.setItem(  
    "pharmacy_stock_adjustments",  
    JSON.stringify(stockAdjustments)  
);

}

// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (isLoggedIn()) {
            showDashboard();
        } else {
            showLogin();
        }

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

function getMedicineById(id) {

return medicines.find(  
    m => Number(m.id) === Number(id)  
);

}

function getCustomerName(sale) {

return sale.customer ||  
    "Walk-in Customer";

}

function saleCost(sale) {

return (sale.items || []).reduce(  
    (sum, item) => {  

        let buy =  
            Number(  
                item.purchasePrice ??  
                item.buyPrice ??  
                0  
            );  

        if (  
            buy === 0 &&  
            item.medicineId  
        ) {  

            const medicine =  
                getMedicineById(  
                    item.medicineId  
                );  

            buy =  
                Number(  
                    medicine?.purchase || 0  
                );  

        }  

        if (  
            buy === 0 &&  
            item.medicine  
        ) {  

            const medicine =  
                medicines.find(  
                    m =>  
                        m.name ===  
                        item.medicine  
                );  

            buy =  
                Number(  
                    medicine?.purchase || 0  
                );  

        }  

        return sum +  
            (  
                buy *  
                Number(  
                    item.qty ||  
                    item.quantity ||  
                    0  
                )  
            );  

    },  
    0  
);

}

function saleProfit(sale) {

const cost =  
    saleCost(sale);  

return Number(  
    sale.total || 0  
) - cost;

}

// ==========================================
// DASHBOARD
// ==========================================

function showDashboard() {

const salesToday =  

    sales  
        .filter(  
            s =>  
                s.date === today()  
        )  
        .reduce(  
            (sum, s) =>  
                sum +  
                Number(s.total || 0),  
            0  
        );  


const lowStock =  

    medicines.filter(  
        m =>  
            Number(m.stock || 0) <=  
            Number(m.reorder || 0)  
    ).length;  


const nearExpiry =  

    medicines.filter(  
        m => {  

            if (!m.expiry)  
                return false;  

            const d =  
                new Date(m.expiry);  

            const now =  
                new Date();  

            const days =  
                (d - now) /  
                86400000;  

            return (  
                days >= 0 &&  
                days <= 30  
            );  

        }  
    ).length;  


const expired =  

    medicines.filter(  
        m => {  

            if (!m.expiry)  
                return false;  

            return (  
                new Date(m.expiry) <  
                new Date()  
            );  

        }  
    ).length;  


const totalDue =  
    getTotalDue();  


app().innerHTML = `  

    <div class="cards">  

        <div class="card">  

            <h3>  
                💰 Today's Sales  
            </h3>  

            <div class="card-value">  
                ${money(salesToday)}  
            </div>  

        </div>  


        <div class="card">  

            <h3>  
                💊 Medicines  
            </h3>  

            <div class="card-value">  
                ${medicines.length}  
            </div>  

        </div>  


        <div class="card">  

            <h3>  
                ⚠️ Low Stock  
            </h3>  

            <div class="card-value">  
                ${lowStock}  
            </div>  

        </div>  


        <div class="card">  

            <h3>  
                📅 Near Expiry  
            </h3>  

            <div class="card-value">  
                ${nearExpiry}  
            </div>  

        </div>  


        <div class="card">  

            <h3>  
                💵 Total Due  
            </h3>  

            <div class="card-value">  
                ${money(totalDue)}  
            </div>  

        </div>  


        <div class="card">  

            <h3>  
                ❌ Expired  
            </h3>  

            <div class="card-value">  
                ${expired}  
            </div>  

        </div>  

    </div>  


    <div  
        class="panel"  
        style="margin-top:20px;"  
    >  

        <h3>  
            ⚡ Quick Actions  
        </h3>  

        <div style="  
            display:flex;  
            gap:10px;  
            flex-wrap:wrap;  
        ">  

            <button  
                class="btn btn-primary"  
                onclick="showMedicines()"  
            >  
                💊 Medicines  
            </button>  


            <button  
                class="btn btn-primary"  
                onclick="showPurchase()"  
            >  
                📦 Purchase  
            </button>  


            <button  
                class="btn btn-primary"  
                onclick="showSales()"  
            >  
                🧾 New Sale  
            </button>  


            <button  
                class="btn btn-primary"  
                onclick="showSuppliers()"  
            >  
                🏢 Suppliers  
            </button>  


            <button  
                class="btn btn-primary"  
                onclick="showCustomers()"  
            >  
                👤 Customers  
            </button>  


            <button  
                class="btn btn-primary"  
                onclick="showDueCollection()"  
            >  
                💰 Due  
            </button>  


            <button  
                class="btn btn-primary"  
                onclick="showStockAdjustment()"  
            >  
                📦 Stock  
            </button>  


            <button  
                class="btn btn-primary"  
                onclick="showReports()"  
            >  
                📊 Reports  
            </button>  


            <button  
                class="btn btn-primary"  
                onclick="showBackup()"  
            >  
                💾 Backup  
            </button>  

        </div>  

    </div>  


    <div  
        class="panel"  
        style="margin-top:20px;"  
    >  

        <h3>  
            📋 Recent Sales  
        </h3>  

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
                    <th>Customer</th>  
                    <th>Items</th>  
                    <th>Total</th>  

                </tr>  

            </thead>  


            <tbody>  

                ${recent.map(  
                    s => `  

                    <tr>  

                        <td>  
                            ${escapeHTML(  
                                s.date  
                            )}  
                        </td>  


                        <td>  
                            ${escapeHTML(  
                                getCustomerName(s)  
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
                            ${money(s.total)}  
                        </td>  

                    </tr>  

                `  
                ).join("")}  

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
            class="btn btn-primary"  
        >  
            💾 Save Medicine  
        </button>  


        <button  
            id="medicineCancelBtn"  
            type="button"  
            onclick="cancelMedicineEdit()"  
            style="  
                display:none;  
                margin-left:8px;  
            "  
        >  
            ❌ Cancel Edit  
        </button>  

    </form>  


    <hr style="margin:25px 0;">  


    <h3>  
        📋 Medicine List  
    </h3>  


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


        alert(  
            "Medicine successfully updated!"  
        );  

    } else {  

        medicineData.id =  
            Date.now();  


        medicines.push(  
            medicineData  
        );  


        alert(  
            "Medicine successfully saved!"  
        );  

    }  


    saveData();  


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
    medicines.filter(  
        m => {  

            const text =  

                (m.name || "") +  
                " " +  
                (m.generic || "") +  
                " " +  
                (m.company || "") +  
                " " +  
                (m.batch || "");  


            return text  
                .toLowerCase()  
                .includes(search);  

        }  
    );  


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
                    <th>Sale</th>  
                    <th>Expiry</th>  
                    <th>Action</th>  

                </tr>  

            </thead>  


            <tbody>  

                ${filtered.map(  
                    m => {  

                        const index =  
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
                                    ${escapeHTML(  
                                        m.expiry ||  
                                        "-"  
                                    )}  
                                </td>  


                                <td>  

                                    <button  
                                        onclick="  
                                            editMedicine(${index})  
                                        "  
                                    >  
                                        ✏️ Edit  
                                    </button>  


                                    <button  
                                        onclick="  
                                            deleteMedicine(${index})  
                                        "  
                                    >  
                                        🗑️ Delete  
                                    </button>  

                                </td>  

                            </tr>  

                        `;  

                    }  
                ).join("")}  

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
// CANCEL MEDICINE EDIT
// ==========================================

function cancelMedicineEdit() {

editingMedicineIndex = -1;  

showMedicines();

}

// ==========================================
// DELETE MEDICINE
// ==========================================

function deleteMedicine(index) {

if (!medicines[index])  
    return;  


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
                "  
            >  

                <option value="">  
                    Select Medicine  
                </option>  


                ${medicines.map(  
                    m => `  

                    <option  
                        value="${m.id}"  
                    >  

                        ${escapeHTML(  
                            m.name  
                        )}  

                        |  
                        Stock:  
                        ${m.stock}  

                    </option>  

                `  
                ).join("")}  

            </select>  

        </div>  


        <div style="margin-bottom:12px;">  

            <label>  
                <b>Supplier / Company</b>  
            </label>  


            <select  
                id="purchaseSupplier"  
                class="form-control"  
                style="  
                    width:100%;  
                    padding:10px;  
                    margin-top:5px;  
                "  
            >  

                <option value="">  
                    Select Supplier / Company  
                </option>  


                ${suppliers.map(  
                    s => `  

                    <option  
                        value="${escapeHTML(  
                            s.name  
                        )}"  
                    >  

                        ${escapeHTML(  
                            s.name  
                        )}  

                        ${  
                            s.phone  
                                ? " - " +  
                                  escapeHTML(  
                                      s.phone  
                                  )  
                                : ""  
                        }  

                    </option>  

                `  
                ).join("")}  

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


        <button  
            class="btn btn-primary"  
            type="submit"  
        >  
            📦 Add Purchase  
        </button>  


        <button  
            type="button"  
            onclick="showSuppliers()"  
            style="margin-left:8px;"  
        >  
            ➕ Add Supplier  
        </button>  

    </form>  


    <hr style="margin:25px 0;">  


    <h3>  
        📋 Purchase History  
    </h3>  


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


        const supplier =  
            document.getElementById(  
                "purchaseSupplier"  
            ).value.trim();  


        const medicine =  
            medicines.find(  
                m => Number(m.id) === id  
            );  


        if (!medicine) {  

            alert(  
                "Medicine select করুন"  
            );  

            return;  
        }  


        if (!supplier) {  

            alert(  
                "Supplier / Company select করুন"  
            );  

            return;  
        }  


        if (qty <= 0) {  

            alert(  
                "Quantity সঠিক দিন"  
            );  

            return;  
        }  


        if (price < 0) {  

            alert(  
                "Purchase Price সঠিক দিন"  
            );  

            return;  
        }  


        medicine.stock =  
            Number(  
                medicine.stock || 0  
            ) +  
            qty;  


        purchases.push({  

            id:  
                Date.now(),  

            date:  
                today(),  

            time:  
                currentTime(),  

            medicine:  
                medicine.name,  

            medicineId:  
                medicine.id,  

            qty:  
                qty,  

            price:  
                price,  

            supplier:  
                supplier,  

            total:  
                qty * price  

        });  


        // Update current purchase price  
        medicine.purchase = price;  


        saveData();  


        alert(  
            "Purchase added এবং stock updated!"  
        );  


        showPurchase();  

    };

}

function renderPurchases() {

const box =  
    document.getElementById(  
        "purchaseList"  
    );  


if (!box) return;  


const list =  
    [...purchases]  
        .reverse()  
        .slice(0, 50);  


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
                <th>Time</th>  
                <th>Medicine</th>  
                <th>Qty</th>  
                <th>Price</th>  
                <th>Total</th>  
                <th>Supplier / Company</th>  

            </tr>  


            ${list.map(  
                p => `  

                <tr>  

                    <td>  
                        ${escapeHTML(  
                            p.date  
                        )}  
                    </td>  


                    <td>  
                        ${escapeHTML(  
                            p.time || ""  
                        )}  
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
                        ${money(  
                            p.price  
                        )}  
                    </td>  


                    <td>  
                        ${money(  
                            p.total  
                        )}  
                    </td>  


                    <td>  
                        ${escapeHTML(  
                            p.supplier || ""  
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
        "  
    >  

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
                "  
            >  

                <option value="">  
                    Select Medicine  
                </option>  


                ${medicines.map(  
                    m => `  

                    <option  
                        value="${m.id}"  
                    >  

                        ${escapeHTML(  
                            m.name  
                        )}  

                        |  
                        Stock:  
                        ${m.stock}  

                        |  
                        ${money(  
                            m.sale  
                        )}  

                    </option>  

                `  
                ).join("")}  

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
            onclick="addToCart()"  
        >  
            ➕ Add to Cart  
        </button>  


        <hr style="margin:25px 0;">  


        <h3>  
            🛒 Sale Cart  
        </h3>  


        <div id="cartList"></div>  


        <div style="margin-top:15px;">  

            <div style="margin-bottom:12px;">  

                <label>  
                    <b>Customer</b>  
                </label>  


                <select  
                    id="saleCustomer"  
                    class="form-control"  
                    style="  
                        width:100%;  
                        padding:10px;  
                        margin-top:5px;  
                    "  
                >  

                    <option value="">  
                        Walk-in Customer  
                    </option>  


                    ${customers.map(  
                        c => `  

                        <option  
                            value="${escapeHTML(  
                                c.name  
                            )}"  
                        >  

                            ${escapeHTML(  
                                c.name  
                            )}  

                            ${  
                                c.phone  
                                    ? " - " +  
                                      escapeHTML(  
                                          c.phone  
                                      )  
                                    : ""  
                            }  

                        </option>  

                    `  
                    ).join("")}  

                </select>  


                <p style="  
                    font-size:13px;  
                    color:#666;  
                ">  
                    নতুন বা অন্য কোনো ব্যক্তি  
                    কিনলে Walk-in Customer  
                    রাখলেই হবে।  
                </p>  

            </div>  


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
            style="margin-top:15px;"  
        ></div>  


        <button  
            type="button"  
            class="btn btn-primary"  
            onclick="completeCartSale()"  
        >  
            💰 Complete Sale &  
            Print Invoice  
        </button>  


        <hr style="margin:30px 0;">  


        <div  
            style="  
                border:2px solid #ddd;  
                padding:15px;  
                border-radius:10px;  
                margin-bottom:25px;  
            "  
        >  

            <h3>  
                🔎 Customer Sales Search  
            </h3>  


            <p style="  
                color:#666;  
                font-size:14px;  
            ">  
                Customer-এর নাম লিখে তার  
                আগের সব Sale, Date,  
                Amount এবং Invoice দেখতে পারবেন।  
            </p>  


            <input  
                id="customerSalesSearch"  
                class="form-control"  
                placeholder="🔍 Customer Name লিখুন..."  
                oninput="searchCustomerSales()"  
                style="  
                    width:100%;  
                    padding:12px;  
                    box-sizing:border-box;  
                    margin-bottom:10px;  
                "  
            >  


            <div  
                id="customerSalesResult"  
            ></div>  

        </div>  


        <h3>  
            📋 Today's Sales  
        </h3>  


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
                    Number(m.id) ===  
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
        m => Number(m.id) === id  
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
    Number(  
        medicine.stock || 0  
    )  
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
            Number(i.medicineId) === id  
    );  


if (existing) {  

    if (  
        existing.qty + qty >  
        Number(  
            medicine.stock || 0  
        )  
    ) {  

        alert(  
            "Stock-এর চেয়ে বেশি quantity দেওয়া যাবে না!"  
        );  

        return;  
    }  


    existing.qty += qty;  

    existing.price = price;  

} else {  

    saleCart.push({  

        medicineId:  
            id,  

        medicine:  
            medicine.name,  

        qty:  
            qty,  

        price:  
            price,  

        purchasePrice:  
            Number(  
                medicine.purchase || 0  
            )  

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

} else {  

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
                                Number(  
                                    item.qty  
                                ) *  
                                Number(  
                                    item.price  
                                )  
                            )}  
                        </td>  


                        <td>  

                            <button  
                                onclick="  
                                    removeFromCart(  
                                        ${index}  
                                    )  
                                "  
                            >  
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


            <p style="font-size:20px;">  
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


if (paid < 0) {  

    alert(  
        "Paid Amount সঠিক দিন"  
    );  

    return;  
}  


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


for (  
    const item of saleCart  
) {  

    const medicine =  
        medicines.find(  
            m =>  
                Number(m.id) ===  
                Number(item.medicineId)  
        );  


    if (!medicine) {  

        alert(  
            "একটি medicine পাওয়া যাচ্ছে না!"  
        );  

        return;  
    }  


    if (  
        Number(item.qty) >  
        Number(  
            medicine.stock || 0  
        )  
    ) {  

        alert(  
            medicine.name +  
            " এর পর্যাপ্ত stock নেই!"  
        );  

        return;  
    }  

}  


saleCart.forEach(  
    item => {  

        const medicine =  
            medicines.find(  
                m =>  
                    Number(m.id) ===  
                    Number(item.medicineId)  
            );  


        medicine.stock =  
            Number(  
                medicine.stock || 0  
            ) -  
            Number(  
                item.qty  
            );  

    }  
);  


const sale = {  

    id:  
        Date.now(),  

    invoice:  
        "INV-" +  
        Date.now(),  

    date:  
        today(),  

    time:  
        currentTime(),  

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

                purchasePrice:  
                    Number(  
                        item.purchasePrice || 0  
                    ),  

                total:  
                    Number(  
                        item.qty  
                    ) *  
                    Number(  
                        item.price  
                    )  

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
// TODAY SALES
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
                            getCustomerName(s)  
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
                            onclick='  
                                printInvoice(  
                                    ${JSON.stringify(s)}  
                                )  
                            '  
                        >  
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
// CUSTOMER SALES SEARCH
// ==========================================

function searchCustomerSales() {

const box =  
    document.getElementById(  
        "customerSalesResult"  
    );  


const searchBox =  
    document.getElementById(  
        "customerSalesSearch"  
    );  


if (!box || !searchBox)  
    return;  


const search =  
    searchBox.value  
        .trim()  
        .toLowerCase();  


if (!search) {  

    box.innerHTML = `  
        <p style="color:#666;">  
            Customer-এর নাম লিখুন।  
        </p>  
    `;  

    return;  

}  


const results =  
    sales.filter(  
        sale => {  

            const customer =  
                getCustomerName(sale)  
                    .toLowerCase();  


            return customer.includes(  
                search  
            );  

        }  
    ).reverse();  


if (!results.length) {  

    box.innerHTML = `  

        <div style="  
            padding:12px;  
            background:#fff3cd;  
            border-radius:8px;  
        ">  

            ❌ এই নামে কোনো  
            Sales পাওয়া যায়নি।  

        </div>  

    `;  

    return;  

}  


const totalAmount =  
    results.reduce(  
        (sum, sale) =>  
            sum +  
            Number(  
                sale.total || 0  
            ),  
        0  
    );  


const totalDue =  
    results.reduce(  
        (sum, sale) =>  
            sum +  
            Number(  
                sale.due || 0  
            ),  
        0  
    );  


box.innerHTML = `  

    <div style="  
        margin:15px 0;  
        padding:12px;  
        background:#f1f8ff;  
        border-radius:8px;  
    ">  

        <b>  
            মোট ${results.length}  
            টি Invoice  
        </b>  

        <br>  

        মোট Sale:  
        <b>  
            ${money(totalAmount)}  
        </b>  

        <br>  

        মোট Due:  
        <b>  
            ${money(totalDue)}  
        </b>  

    </div>  


    <div style="overflow:auto;">  

        <table>  

            <thead>  

                <tr>  

                    <th>Date</th>  
                    <th>Time</th>  
                    <th>Customer</th>  
                    <th>Invoice</th>  
                    <th>Items</th>  
                    <th>Total</th>  
                    <th>Paid</th>  
                    <th>Due</th>  
                    <th>Invoice</th>  

                </tr>  

            </thead>  


            <tbody>  

                ${results.map(  
                    sale => `  

                    <tr>  

                        <td>  
                            ${escapeHTML(  
                                sale.date || ""  
                            )}  
                        </td>  


                        <td>  
                            ${escapeHTML(  
                                sale.time || ""  
                            )}  
                        </td>  


                        <td>  
                            ${escapeHTML(  
                                getCustomerName(sale)  
                            )}  
                        </td>  


                        <td>  
                            ${escapeHTML(  
                                sale.invoice ||  
                                "-"  
                            )}  
                        </td>  


                        <td>  
                            ${  
                                sale.items  
                                    ? sale.items.length  
                                    : 1  
                            }  
                        </td>  


                        <td>  
                            ${money(  
                                sale.total  
                            )}  
                        </td>  


                        <td>  
                            ${money(  
                                sale.paid  
                            )}  
                        </td>  


                        <td>  
                            ${money(  
                                sale.due  
                            )}  
                        </td>  


                        <td>  

                            <button  
                                onclick='  
                                    printInvoice(  
                                        ${JSON.stringify(  
                                            sale  
                                        )}  
                                    )  
                                '  
                            >  
                                🖨️ Print  
                            </button>  

                        </td>  

                    </tr>  

                `  
                ).join("")}  

            </tbody>  

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
                    sale.price,  

                total:  
                    sale.total  

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
                    Arial,  
                    sans-serif;  

                padding:  
                    25px;  

            }  


            .invoice {  

                max-width:  
                    650px;  

                margin:  
                    auto;  

            }  


            h1,  
            h2 {  

                text-align:  
                    center;  

            }  


            table {  

                width:  
                    100%;  

                border-collapse:  
                    collapse;  

                margin-top:  
                    20px;  

            }  


            th,  
            td {  

                border:  
                    1px solid #999;  

                padding:  
                    9px;  

                text-align:  
                    left;  

            }  


            .right {  

                text-align:  
                    right;  

            }  


            .total {  

                font-size:  
                    18px;  

                font-weight:  
                    bold;  

            }  

        </style>  

    </head>  


    <body  
        onload="window.print()"  
    >  

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
                    sale.invoice ||  
                    "-"  
                )}  

                <br>  


                <b>Date:</b>  
                ${escapeHTML(  
                    sale.date ||  
                    ""  
                )}  

                <br>  


                <b>Time:</b>  
                ${escapeHTML(  
                    sale.time ||  
                    ""  
                )}  

                <br>  


                <b>Customer:</b>  
                ${escapeHTML(  
                    getCustomerName(sale)  
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
                                item.medicine ||  
                                item.name ||  
                                "-"  
                            )}  
                        </td>  


                        <td>  
                            ${item.qty ||  
                                item.quantity ||  
                                0}  
                        </td>  


                        <td>  
                            ${money(  
                                item.price  
                            )}  
                        </td>  


                        <td>  
                            ${money(  
                                item.total ??  
                                (  
                                    Number(  
                                        item.qty ||  
                                        item.quantity ||  
                                        0  
                                    ) *  
                                    Number(  
                                        item.price ||  
                                        0  
                                    )  
                                )  
                            )}  
                        </td>  

                    </tr>  

                `  
                ).join("")}  

            </table>  


            <p class="right">  

                <b>  
                    Subtotal:  
                </b>  

                ${money(  
                    sale.subtotal ??  
                    sale.total  
                )}  

            </p>  


            <p class="right">  

                <b>  
                    Discount:  
                </b>  

                ${money(  
                    sale.discount ||  
                    0  
                )}  

            </p>  


            <p  
                class="right total"  
            >  

                <b>  
                    Grand Total:  
                </b>  

                ${money(  
                    sale.total  
                )}  

            </p>  


            <p class="right">  

                <b>  
                    Paid:  
                </b>  

                ${money(  
                    sale.paid ||  
                    0  
                )}  

            </p>  


            <p class="right">  

                <b>  
                    Due:  
                </b>  

                ${money(  
                    sale.due ||  
                    0  
                )}  

            </p>  


            <p class="right">  

                <b>  
                    Change:  
                </b>  

                ${money(  
                    sale.change ||  
                    0  
                )}  

            </p>  


            <p style="  
                text-align:center;  
                margin-top:40px;  
            ">  

                Thank you for  
                your purchase!  

            </p>  

        </div>  

    </body>  

    </html>  

`);  


w.document.close();

}

// ==========================================
// SUPPLIERS / COMPANIES
// ==========================================

function showSuppliers() {

layout(  
    "🏢 Suppliers / Companies",  
    `  

    <form id="supplierForm">  

        ${input(  
            "supplierName",  
            "Company / Supplier Name"  
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
            type="submit"  
        >  
            💾 Save Supplier / Company  
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
                "Company / Supplier Name দিন"  
            );  

            return;  

        }  


        suppliers.push({  

            id:  
                Date.now(),  

            name:  
                name,  

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


        alert(  
            "Supplier / Company saved!"  
        );  


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
        "<p>কোনো Supplier / Company নেই।</p>";  

    return;  

}  


box.innerHTML = `  

    <h3>  
        Supplier / Company List  
    </h3>  


    <div style="overflow:auto;">  

        <table>  

            <tr>  

                <th>Name</th>  
                <th>Phone</th>  
                <th>Address</th>  
                <th>Action</th>  

            </tr>  


            ${suppliers.map(  
                (s, i) => `  

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


                    <td>  

                        <button  
                            onclick="  
                                deleteSupplier(${i})  
                            "  
                        >  
                            🗑️ Delete  
                        </button>  

                    </td>  

                </tr>  

            `  
            ).join("")}  

        </table>  

    </div>  

`;

}

function deleteSupplier(index) {

if (  
    !confirm(  
        "এই Supplier / Company delete করবেন?"  
    )  
) {  
    return;  
}  


suppliers.splice(  
    index,  
    1  
);  


saveData();  


showSuppliers();

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
            type="submit"  
        >  
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

            id:  
                Date.now(),  

            name:  
                name,  

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


        alert(  
            "Customer saved!"  
        );  


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
                <th>Action</th>  

            </tr>  


            ${customers.map(  
                (c, i) => `  

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


                    <td>  

                        <button  
                            onclick="  
                                deleteCustomer(${i})  
                            "  
                        >  
                            🗑️ Delete  
                        </button>  

                    </td>  

                </tr>  

            `  
            ).join("")}  

        </table>  

    </div>  

`;

}

function deleteCustomer(index) {

if (  
    !confirm(  
        "এই Customer delete করবেন?"  
    )  
) {  
    return;  
}  


customers.splice(  
    index,  
    1  
);  


saveData();  


showCustomers();

}

// ==========================================
// DUE / PAYMENT
// ==========================================

function getTotalDue() {

const totalSaleDue =  
    sales.reduce(  
        (sum, sale) =>  
            sum +  
            Number(  
                sale.due || 0  
            ),  
        0  
    );  


const totalPayments =  
    payments.reduce(  
        (sum, payment) =>  
            sum +  
            Number(  
                payment.amount || 0  
            ),  
        0  
    );  


return Math.max(  
    0,  
    totalSaleDue - totalPayments  
);

}

function customerDueTotal(name) {

const saleDue =  
    sales  
        .filter(  
            s =>  
                getCustomerName(s) ===  
                name  
        )  
        .reduce(  
            (sum, s) =>  
                sum +  
                Number(s.due || 0),  
            0  
        );  


const collected =  
    payments  
        .filter(  
            p =>  
                p.customer === name  
        )  
        .reduce(  
            (sum, p) =>  
                sum +  
                Number(  
                    p.amount || 0  
                ),  
            0  
        );  


return Math.max(  
    0,  
    saleDue - collected  
);

}

function showDueCollection() {

const customerNames =  
    [  
        ...new Set(  
            sales.map(  
                s =>  
                    getCustomerName(s)  
            )  
        )  
    ];  


layout(  
    "💰 Due / বাকি আদায়",  
    `  

    <div style="margin-bottom:15px;">  

        <label>  
            <b>Customer</b>  
        </label>  

        <select  
            id="dueCustomer"  
            class="form-control"  
            style="  
                width:100%;  
                padding:10px;  
                margin-top:5px;  
            "  
        >  

            <option value="">  
                Customer নির্বাচন করুন  
            </option>  

            ${customerNames.map(  
                n => `  

                <option  
                    value="${escapeHTML(n)}"  
                >  
                    ${escapeHTML(n)}  
                    — Due:  
                    ${money(  
                        customerDueTotal(n)  
                    )}  
                </option>  

            `  
            ).join("")}  

        </select>  

    </div>  


    ${input(  
        "dueAmount",  
        "Payment Amount",  
        "number",  
        "0"  
    )}  


    ${input(  
        "dueNote",  
        "Note"  
    )}  


    <button  
        class="btn btn-primary"  
        onclick="collectDue()"  
    >  
        💾 Payment Save  
    </button>  


    <hr style="margin:25px 0;">  


    <h3>  
        📋 Customer Due List  
    </h3>  


    <div id="dueList"></div>  

    `  
);  


renderDueList();

}

function renderDueList() {

const box =  
    document.getElementById(  
        "dueList"  
    );  


if (!box) return;  


const names =  
    [  
        ...new Set(  
            sales.map(  
                s =>  
                    getCustomerName(s)  
            )  
        )  
    ];  


const rows =  
    names.map(  
        name => {  

            const originalDue =  
                sales  
                    .filter(  
                        s =>  
                            getCustomerName(s) ===  
                            name  
                    )  
                    .reduce(  
                        (sum, s) =>  
                            sum +  
                            Number(  
                                s.due || 0  
                            ),  
                        0  
                    );  


            const paid =  
                payments  
                    .filter(  
                        p =>  
                            p.customer ===  
                            name  
                    )  
                    .reduce(  
                        (sum, p) =>  
                            sum +  
                            Number(  
                                p.amount || 0  
                            ),  
                        0  
                    );  


            const due =  
                Math.max(  
                    0,  
                    originalDue - paid  
                );  


            return {  
                name,  
                originalDue,  
                paid,  
                due  
            };  

        }  
    )  
    .filter(  
        x =>  
            x.originalDue > 0 ||  
            x.paid > 0  
    );  


if (!rows.length) {  

    box.innerHTML =  
        "<p>কোনো Customer Due নেই।</p>";  

} else {  

    box.innerHTML = `  

        <div style="overflow:auto;">  

            <table>  

                <thead>  

                    <tr>  

                        <th>Customer</th>  
                        <th>Total Due</th>  
                        <th>Collected</th>  
                        <th>Current Due</th>  

                    </tr>  

                </thead>  


                <tbody>  

                    ${rows.map(  
                        r => `  

                        <tr>  

                            <td>  
                                ${escapeHTML(  
                                    r.name  
                                )}  
                            </td>  

                            <td>  
                                ${money(  
                                    r.originalDue  
                                )}  
                            </td>  

                            <td>  
                                ${money(  
                                    r.paid  
                                )}  
                            </td>  

                            <td>  
                                <b>  
                                    ${money(  
                                        r.due  
                                    )}  
                                </b>  
                            </td>  

                        </tr>  

                    `  
                    ).join("")}  

                </tbody>  

            </table>  

        </div>  

    `;  

}  


box.innerHTML += `  

    <h3 style="margin-top:25px;">  
        💳 Payment History  
    </h3>  


    ${  
        payments.length  

            ? `  

            <div style="overflow:auto;">  

                <table>  

                    <tr>  

                        <th>Date</th>  
                        <th>Time</th>  
                        <th>Customer</th>  
                        <th>Amount</th>  
                        <th>Note</th>  

                    </tr>  


                    ${[...payments]  
                        .reverse()  
                        .map(  
                            p => `  

                            <tr>  

                                <td>  
                                    ${escapeHTML(  
                                        p.date  
                                    )}  
                                </td>  

                                <td>  
                                    ${escapeHTML(  
                                        p.time || ""  
                                    )}  
                                </td>  

                                <td>  
                                    ${escapeHTML(  
                                        p.customer  
                                    )}  
                                </td>  

                                <td>  
                                    ${money(  
                                        p.amount  
                                    )}  
                                </td>  

                                <td>  
                                    ${escapeHTML(  
                                        p.note || ""  
                                    )}  
                                </td>  

                            </tr>  

                        `  
                        )  
                        .join("")}  

                </table>  

            </div>  

        `  

            : `  
                <p>  
                    এখনো কোনো payment history নেই।  
                </p>  
            `  
    }  

`;

}

function collectDue() {

const customer =  
    document.getElementById(  
        "dueCustomer"  
    )?.value;  


const amount =  
    Number(  
        document.getElementById(  
            "dueAmount"  
        )?.value || 0  
    );  


const note =  
    document.getElementById(  
        "dueNote"  
    )?.value.trim() || "";  


if (!customer) {  

    alert(  
        "Customer নির্বাচন করুন"  
    );  

    return;  

}  


if (amount <= 0) {  

    alert(  
        "Payment Amount দিন"  
    );  

    return;  

}  


const currentDue =  
    customerDueTotal(  
        customer  
    );  


if (currentDue <= 0) {  

    alert(  
        "এই Customer-এর কোনো Current Due নেই।"  
    );  

    return;  

}  


if (amount > currentDue) {  

    alert(  
        "বর্তমান Due-এর চেয়ে বেশি টাকা দেওয়া যাবে না। Current Due: " +  
        money(currentDue)  
    );  

    return;  

}  


payments.push({  

    id:  
        Date.now(),  

    date:  
        today(),  

    time:  
        currentTime(),  

    customer:  
        customer,  

    amount:  
        amount,  

    note:  
        note  

});  


saveData();  


alert(  
    "Payment successfully saved!"  
);  


showDueCollection();

}

// ==========================================
// STOCK ADJUSTMENT
// ==========================================

function showStockAdjustment() {

layout(  
    "📦 Stock Adjustment",  
    `  

    <div style="margin-bottom:15px;">  

        <label>  
            <b>Medicine</b>  
        </label>  


        <select  
            id="adjustMedicine"  
            class="form-control"  
            style="  
                width:100%;  
                padding:10px;  
                margin-top:5px;  
            "  
        >  

            <option value="">  
                Medicine নির্বাচন করুন  
            </option>  


            ${medicines.map(  
                (m, i) => `  

                <option value="${i}">  

                    ${escapeHTML(  
                        m.name  
                    )}  

                    — Stock:  
                    ${Number(  
                        m.stock || 0  
                    )}  

                </option>  

            `  
            ).join("")}  

        </select>  

    </div>  


    <div style="margin-bottom:12px;">  

        <label>  
            <b>Adjustment Type</b>  
        </label>  


        <select  
            id="adjustType"  
            class="form-control"  
            style="  
                width:100%;  
                padding:10px;  
                margin-top:5px;  
            "  
        >  

            <option value="add">  
                ➕ Stock Add  
            </option>  

            <option value="remove">  
                ➖ Stock Remove  
            </option>  

            <option value="damage">  
                🗑️ Damaged / Expired Remove  
            </option>  

        </select>  

    </div>  


    ${input(  
        "adjustQty",  
        "Quantity",  
        "number",  
        "1"  
    )}  


    ${input(  
        "adjustNote",  
        "Reason / Note"  
    )}  


    <button  
        class="btn btn-primary"  
        onclick="saveStockAdjustment()"  
    >  
        💾 Save Adjustment  
    </button>  


    <hr style="margin:25px 0;">  


    <div id="adjustmentHistory"></div>  

    `  
);  


renderAdjustmentHistory();

}

function saveStockAdjustment() {

const i =  
    Number(  
        document.getElementById(  
            "adjustMedicine"  
        )?.value  
    );  


const type =  
    document.getElementById(  
        "adjustType"  
    )?.value;  


const qty =  
    Number(  
        document.getElementById(  
            "adjustQty"  
        )?.value || 0  
    );  


const note =  
    document.getElementById(  
        "adjustNote"  
    )?.value.trim() || "";  


if (!medicines[i]) {  

    alert(  
        "Medicine নির্বাচন করুন"  
    );  

    return;  

}  


if (qty <= 0) {  

    alert(  
        "Quantity দিন"  
    );  

    return;  

}  


const oldStock =  
    Number(  
        medicines[i].stock || 0  
    );  


if (  
    type !== "add" &&  
    qty > oldStock  
) {  

    alert(  
        "Stock-এর চেয়ে বেশি কমানো যাবে না।"  
    );  

    return;  

}  


medicines[i].stock =  
    type === "add"  
        ? oldStock + qty  
        : oldStock - qty;  


stockAdjustments.push({  

    id:  
        Date.now(),  

    date:  
        today(),  

    time:  
        currentTime(),  

    medicine:  
        medicines[i].name,  

    medicineId:  
        medicines[i].id,  

    type:  
        type,  

    qty:  
        qty,  

    oldStock:  
        oldStock,  

    newStock:  
        medicines[i].stock,  

    note:  
        note  

});  


saveData();  


alert(  
    "Stock successfully updated!"  
);  


showStockAdjustment();

}

function renderAdjustmentHistory() {

const box =  
    document.getElementById(  
        "adjustmentHistory"  
    );  


if (!box) return;  


if (!stockAdjustments.length) {  

    box.innerHTML =  
        "<p>কোনো Stock Adjustment নেই।</p>";  

    return;  

}  


box.innerHTML = `  

    <h3>  
        📋 Adjustment History  
    </h3>  


    <div style="overflow:auto;">  

        <table>  

            <tr>  

                <th>Date</th>  
                <th>Time</th>  
                <th>Medicine</th>  
                <th>Type</th>  
                <th>Qty</th>  
                <th>Stock</th>  
                <th>Note</th>  

            </tr>  


            ${[  
                ...stockAdjustments  
            ]  
                .reverse()  
                .map(  
                    a => `  

                    <tr>  

                        <td>  
                            ${escapeHTML(  
                                a.date  
                            )}  
                        </td>  

                        <td>  
                            ${escapeHTML(  
                                a.time || ""  
                            )}  
                        </td>  

                        <td>  
                            ${escapeHTML(  
                                a.medicine  
                            )}  
                        </td>  

                        <td>  
                            ${escapeHTML(  
                                a.type  
                            )}  
                        </td>  

                        <td>  
                            ${a.qty}  
                        </td>  

                        <td>  
                            ${a.oldStock}  
                            →  
                            ${a.newStock}  
                        </td>  

                        <td>  
                            ${escapeHTML(  
                                a.note || ""  
                            )}  
                        </td>  

                    </tr>  

                `  
                )  
                .join("")}  

        </table>  

    </div>  

`;

}

// ==========================================
// ALERTS
// ==========================================

function showLowStock() {

const list =  
    medicines.filter(  
        m =>  
            Number(m.stock || 0) <=  
            Number(m.reorder || 0)  
    );  


layout(  
    "⚠️ Low Stock Alert",  
    `  

    ${  
        list.length  

            ? `  

            <div style="overflow:auto;">  

                <table>  

                    <tr>  

                        <th>Medicine</th>  
                        <th>Stock</th>  
                        <th>Reorder Level</th>  

                    </tr>  


                    ${list.map(  
                        m => `  

                        <tr>  

                            <td>  
                                ${escapeHTML(  
                                    m.name  
                                )}  
                            </td>  

                            <td>  
                                <b>  
                                    ${m.stock || 0}  
                                </b>  
                            </td>  

                            <td>  
                                ${m.reorder || 0}  
                            </td>  

                        </tr>  

                    `  
                    ).join("")}  

                </table>  

            </div>  

        `  

            : `  
                <p>  
                    ✅ কোনো Low Stock নেই।  
                </p>  
            `  
    }  

    `  
);

}

function showExpiryAlert() {

const expired =  
    medicines.filter(  
        m =>  
            m.expiry &&  
            new Date(m.expiry) <  
            new Date()  
    );  


const near =  
    medicines.filter(  
        m => {  

            if (!m.expiry)  
                return false;  

            const days =  
                (  
                    new Date(m.expiry) -  
                    new Date()  
                ) /  
                86400000;  

            return (  
                days >= 0 &&  
                days <= 30  
            );  

        }  
    );  


layout(  
    "📅 Expiry Alert",  
    `  

    <h3>  
        ❌ Expired Medicines  
    </h3>  


    ${  
        expired.length  

            ? expired.map(  
                m => `  

                <p>  

                    <b>  
                        ${escapeHTML(  
                            m.name  
                        )}  
                    </b>  

                    —  
                    Expiry:  
                    ${escapeHTML(  
                        m.expiry  
                    )}  

                </p>  

            `  
            ).join("")  

            : `  
                <p>  
                    ✅ কোনো expired medicine নেই।  
                </p>  
            `  
    }  


    <h3 style="margin-top:25px;">  
        ⚠️ আগামী ৩০ দিনের মধ্যে Expiry  
    </h3>  


    ${  
        near.length  

            ? near.map(  
                m => `  

                <p>  

                    <b>  
                        ${escapeHTML(  
                            m.name  
                        )}  
                    </b>  

                    —  
                    Expiry:  
                    ${escapeHTML(  
                        m.expiry  
                    )}  

                </p>  

            `  
            ).join("")  

            : `  
                <p>  
                    ✅ আগামী ৩০ দিনের মধ্যে  
                    কোনো expiry নেই।  
                </p>  
            `  
    }  

    `  
);

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


const totalProfit =  
    sales.reduce(  
        (sum, sale) =>  
            sum +  
            saleProfit(sale),  
        0  
    );  


const totalDue =  
    getTotalDue();  


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


const expired =  
    medicines.filter(  
        m =>  
            m.expiry &&  
            new Date(m.expiry) <  
            new Date()  
    );  


const nearExpiry =  
    medicines.filter(  
        m => {  

            if (!m.expiry)  
                return false;  

            const days =  
                (  
                    new Date(m.expiry) -  
                    new Date()  
                ) /  
                86400000;  

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
                ${money(todaySales)}  
            </div>  

        </div>  


        <div class="card">  

            <h3>  
                Total Sales  
            </h3>  

            <div class="card-value">  
                ${money(totalSales)}  
            </div>  

        </div>  


        <div class="card">  

            <h3>  
                Total Purchase  
            </h3>  

            <div class="card-value">  
                ${money(totalPurchase)}  
            </div>  

        </div>  


        <div class="card">  

            <h3>  
                Estimated Profit  
            </h3>  

            <div class="card-value">  
                ${money(totalProfit)}  
            </div>  

        </div>  


        <div class="card">  

            <h3>  
                Total Due  
            </h3>  

            <div class="card-value">  
                ${money(totalDue)}  
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
        📅 Date-wise Sales  
    </h3>  


    ${input(  
        "reportDate",  
        "Select Date",  
        "date",  
        today()  
    )}  


    <button  
        class="btn btn-primary"  
        onclick="showDateReport()"  
    >  
        🔎 View Date Report  
    </button>  


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

                    —  
                    Stock:  
                    ${m.stock}  

                </p>  

            `  
            ).join("")  

            : `  
                <p>  
                    ✅ কোনো Low Stock নেই।  
                </p>  
            `  
    }  


    <h3 style="margin-top:25px;">  
        ❌ Expired Medicines  
    </h3>  


    ${  
        expired.length  

            ? expired.map(  
                m => `  

                <p>  

                    <b>  
                        ${escapeHTML(  
                            m.name  
                        )}  
                    </b>  

                    —  
                    Expiry:  
                    ${escapeHTML(  
                        m.expiry  
                    )}  

                </p>  

            `  
            ).join("")  

            : `  
                <p>  
                    ✅ কোনো expired medicine নেই।  
                </p>  
            `  
    }  


    <h3 style="margin-top:25px;">  
        📅 Near Expiry  
        (30 days)  
    </h3>  


    ${  
        nearExpiry.length  

            ? nearExpiry.map(  
                m => `  

                <p>  

                    <b>  
                        ${escapeHTML(  
                            m.name  
                        )}  
                    </b>  

                    —  
                    Expiry:  
                    ${escapeHTML(  
                        m.expiry  
                    )}  

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
        onclick="window.print()"  
    >  
        🖨️ Print Report  
    </button>  

    `  
);

}

function showDateReport() {

const date =  
    document.getElementById(  
        "reportDate"  
    )?.value;  


if (!date) {  

    alert(  
        "Date নির্বাচন করুন"  
    );  

    return;  

}  


const dateSales =  
    sales.filter(  
        s =>  
            s.date === date  
    );  


const datePurchases =  
    purchases.filter(  
        p =>  
            p.date === date  
    );  


const salesTotal =  
    dateSales.reduce(  
        (sum, s) =>  
            sum +  
            Number(  
                s.total || 0  
            ),  
        0  
    );  


const purchaseTotal =  
    datePurchases.reduce(  
        (sum, p) =>  
            sum +  
            Number(  
                p.total || 0  
            ),  
        0  
    );  


const profit =  
    dateSales.reduce(  
        (sum, s) =>  
            sum +  
            saleProfit(s),  
        0  
    );  


layout(  
    "📅 Date Report — " +  
    escapeHTML(date),  
    `  

    <div class="cards">  

        <div class="card">  

            <h3>  
                Sales  
            </h3>  

            <div class="card-value">  
                ${money(salesTotal)}  
            </div>  

        </div>  


        <div class="card">  

            <h3>  
                Purchase  
            </h3>  

            <div class="card-value">  
                ${money(purchaseTotal)}  
            </div>  

        </div>  


        <div class="card">  

            <h3>  
                Estimated Profit  
            </h3>  

            <div class="card-value">  
                ${money(profit)}  
            </div>  

        </div>  


        <div class="card">  

            <h3>  
                Invoices  
            </h3>  

            <div class="card-value">  
                ${dateSales.length}  
            </div>  

        </div>  

    </div>  


    <hr style="margin:25px 0;">  


    <h3>  
        🧾 Sales List  
    </h3>  


    ${  
        dateSales.length  

            ? `  

            <div style="overflow:auto;">  

                <table>  

                    <tr>  

                        <th>Invoice</th>  
                        <th>Time</th>  
                        <th>Customer</th>  
                        <th>Total</th>  
                        <th>Paid</th>  
                        <th>Due</th>  
                        <th>Print</th>  

                    </tr>  


                    ${dateSales.map(  
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
                                    getCustomerName(s)  
                                )}  
                            </td>  

                            <td>  
                                ${money(  
                                    s.total  
                                )}  
                            </td>  

                            <td>  
                                ${money(  
                                    s.paid  
                                )}  
                            </td>  

                            <td>  
                                ${money(  
                                    s.due  
                                )}  
                            </td>  

                            <td>  

                                <button  
                                    onclick='  
                                        printInvoice(  
                                            ${JSON.stringify(s)}  
                                        )  
                                    '  
                                >  
                                    🖨️  
                                </button>  

                            </td>  

                        </tr>  

                    `  
                    ).join("")}  

                </table>  

            </div>  

        `  

            : `  
                <p>  
                    এই তারিখে কোনো Sales নেই।  
                </p>  
            `  
    }  


    <hr style="margin:25px 0;">  


    <h3>  
        📦 Purchase List  
    </h3>  


    ${  
        datePurchases.length  

            ? `  

            <div style="overflow:auto;">  

                <table>  

                    <tr>  

                        <th>Time</th>  
                        <th>Medicine</th>  
                        <th>Qty</th>  
                        <th>Total</th>  
                        <th>Supplier</th>  

                    </tr>  


                    ${datePurchases.map(  
                        p => `  

                        <tr>  

                            <td>  
                                ${escapeHTML(  
                                    p.time || ""  
                                )}  
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
                                ${money(  
                                    p.total  
                                )}  
                            </td>  

                            <td>  
                                ${escapeHTML(  
                                    p.supplier || ""  
                                )}  
                            </td>  

                        </tr>  

                    `  
                    ).join("")}  

                </table>  

            </div>  

        `  

            : `  
                <p>  
                    এই তারিখে কোনো Purchase নেই।  
                </p>  
            `  
    }  


    <hr style="margin:25px 0;">  


    <button  
        class="btn btn-primary"  
        onclick="window.print()"  
    >  
        🖨️ Print Date Report  
    </button>  

    `  
);

}

// ==========================================
// BACKUP / RESTORE
// ==========================================

function showBackup() {

layout(  
    "💾 Backup / Restore",  
    `  

    <div style="  
        padding:15px;  
        border:1px solid #ddd;  
        border-radius:10px;  
    ">  

        <h3>  
            💾 Backup  
        </h3>  


        <p>  
            আপনার Pharmacy-এর সব data  
            একটি JSON file হিসেবে  
            Backup করতে পারবেন।  
        </p>  


        <button  
            class="btn btn-primary"  
            onclick="downloadBackup()"  
        >  
            ⬇️ Download Backup  
        </button>  

    </div>  


    <hr style="margin:25px 0;">  


    <div style="  
        padding:15px;  
        border:1px solid #ddd;  
        border-radius:10px;  
    ">  

        <h3>  
            ♻️ Restore  
        </h3>  


        <p>  
            আগের Backup JSON file  
            নির্বাচন করে Restore করুন।  
        </p>  


        <input  
            id="restoreFile"  
            type="file"  
            accept=".json,application/json"  
            class="form-control"  
            style="  
                width:100%;  
                padding:10px;  
                box-sizing:border-box;  
            "  
        >  


        <button  
            class="btn btn-primary"  
            onclick="restoreBackup()"  
            style="margin-top:10px;"  
        >  
            ⬆️ Restore Backup  
        </button>  

    </div>  

    `  
);

}

function downloadBackup() {

const data = {  

    version:  
        3,  

    exportedAt:  
        new Date().toISOString(),  

    medicines:  
        medicines,  

    purchases:  
        purchases,  

    sales:  
        sales,  

    customers:  
        customers,  

    suppliers:  
        suppliers,  

    payments:  
        payments,  

    stockAdjustments:  
        stockAdjustments  

};  


const blob =  
    new Blob(  
        [  
            JSON.stringify(  
                data,  
                null,  
                2  
            )  
        ],  
        {  
            type:  
                "application/json"  
        }  
    );  


const url =  
    URL.createObjectURL(  
        blob  
    );  


const a =  
    document.createElement(  
        "a"  
    );  


a.href =  
    url;  


a.download =  
    "pharmacy-inventory-backup-" +  
    today() +  
    ".json";  


document.body.appendChild(a);  


a.click();  


a.remove();  


setTimeout(  
    function() {  

        URL.revokeObjectURL(  
            url  
        );  

    },  
    1000  
);

}

function restoreBackup() {

const file =  
    document.getElementById(  
        "restoreFile"  
    )?.files?.[0];  


if (!file) {  

    alert(  
        "Backup file নির্বাচন করুন"  
    );  

    return;  

}  


const reader =  
    new FileReader();  


reader.onload =  
    function(e) {  

        try {  

            const d =  
                JSON.parse(  
                    e.target.result  
                );  


            if (  
                !d ||  
                !Array.isArray(  
                    d.medicines  
                ) ||  
                !Array.isArray(  
                    d.sales  
                )  
            ) {  

                throw new Error(  
                    "Invalid backup"  
                );  

            }  


            if (  
                !confirm(  
                    "বর্তমান data-এর জায়গায় Backup restore করবেন?"  
                )  
            ) {  

                return;  

            }  


            medicines =  
                d.medicines || [];  


            purchases =  
                d.purchases || [];  


            sales =  
                d.sales || [];  


            customers =  
                d.customers || [];  


            suppliers =  
                d.suppliers || [];  


            payments =  
                d.payments || [];  


            stockAdjustments =  
                d.stockAdjustments || [];  


            saleCart = [];  


            saveData();  


            alert(  
                "Backup successfully restored!"  
            );  


            showDashboard();  

        } catch (err) {  

            alert(  
                "Backup file সঠিক নয়।"  
            );  

        }  

    };  


reader.readAsText(file);

}

// ==========================================
// COMPATIBILITY
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
    name === "Suppliers" ||  
    name === "Supplier"  
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


if (  
    name === "Due" ||  
    name === "Due Collection" ||  
    name === "বাকি আদায়"  
) {  

    showDueCollection();  

    return;  

}  


if (  
    name === "Stock" ||  
    name === "Stock Adjustment" ||  
    name === "Stock Management"  
) {  

    showStockAdjustment();  

    return;  

}  


if (  
    name === "Low Stock"  
) {  

    showLowStock();  

    return;  

}  


if (  
    name === "Expiry" ||  
    name === "Expiry Alert"  
) {  

    showExpiryAlert();  

    return;  

}  


if (  
    name === "Backup" ||  
    name === "Backup / Restore"  
) {  

    showBackup();  

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
        nav.style.display ===  
        "none"  

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

// ==========================================
// END
// ==========================================

// ==========================================
// PHARMACY LOGIN + DASHBOARD SETTINGS
// ==========================================

const ADMIN_USERNAME_KEY = "pharmacy_admin_username";
const ADMIN_PASSWORD_KEY = "pharmacy_admin_password";
const ADMIN_LOGIN_KEY = "pharmacy_admin_logged_in";

const PHARMACY_NAME_KEY = "pharmacy_name";
const PHARMACY_LOGO_KEY = "pharmacy_logo";


// ==========================================
// DEFAULT ADMIN
// ==========================================

function setupDefaultAdmin() {

    if (!localStorage.getItem(ADMIN_USERNAME_KEY)) {
        localStorage.setItem(
            ADMIN_USERNAME_KEY,
            "admin"
        );
    }

    if (!localStorage.getItem(ADMIN_PASSWORD_KEY)) {
        localStorage.setItem(
            ADMIN_PASSWORD_KEY,
            "1234"
        );
    }

    if (!localStorage.getItem(PHARMACY_NAME_KEY)) {
        localStorage.setItem(
            PHARMACY_NAME_KEY,
            "Pharmacy Inventory Pro"
        );
    }
}


// ==========================================
// LOGIN CHECK
// ==========================================

function isLoggedIn() {

    return localStorage.getItem(
        ADMIN_LOGIN_KEY
    ) === "true";
}


// ==========================================
// HIDE / SHOW NAVIGATION
// ==========================================

function setNavVisible(show) {

    const nav = document.querySelector("nav");

    if (nav) {
        nav.style.display =
            show ? "" : "none";
    }
}


// ==========================================
// LOGIN PAGE
// ==========================================

function showLogin() {

    setupDefaultAdmin();

    setNavVisible(false);

    const app =
        document.getElementById("app");

    if (!app) return;

    app.innerHTML = `

        <div style="
            min-height:85vh;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
        ">

            <div style="
                width:100%;
                max-width:400px;
                background:#fff;
                padding:30px;
                border-radius:20px;
                box-shadow:0 8px 30px rgba(0,0,0,.15);
            ">

                <div style="
                    text-align:center;
                    margin-bottom:15px;
                ">

                    <div id="loginLogo"
                        style="
                            font-size:60px;
                            margin-bottom:10px;
                        ">
                        💊
                    </div>

                    <h2 id="loginPharmacyName">
                        Pharmacy Inventory Pro
                    </h2>

                    <p style="color:#666;">
                        🔐 Admin Sign In
                    </p>

                </div>


                <label>
                    <b>Username</b>
                </label>

                <input
                    id="loginUsername"
                    type="text"
                    placeholder="Enter username"
                    autocomplete="username"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:13px;
                        margin:7px 0 15px;
                        border:1px solid #ccc;
                        border-radius:9px;
                    "
                >


                <label>
                    <b>Password</b>
                </label>

                <input
                    id="loginPassword"
                    type="password"
                    placeholder="Enter password"
                    autocomplete="current-password"
                    onkeydown="
                        if(event.key==='Enter'){
                            adminLogin();
                        }
                    "
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:13px;
                        margin:7px 0 18px;
                        border:1px solid #ccc;
                        border-radius:9px;
                    "
                >


                <button
                    type="button"
                    onclick="adminLogin()"
                    style="
                        width:100%;
                        padding:14px;
                        font-size:17px;
                        border:0;
                        border-radius:9px;
                        cursor:pointer;
                    "
                >
                    🔐 Sign In
                </button>

            </div>

        </div>
    `;


    // Saved pharmacy branding

    const savedName =
        localStorage.getItem(
            PHARMACY_NAME_KEY
        );

    const savedLogo =
        localStorage.getItem(
            PHARMACY_LOGO_KEY
        );


    if (savedName) {

        const name =
            document.getElementById(
                "loginPharmacyName"
            );

        if (name) {
            name.textContent =
                savedName;
        }
    }


    if (savedLogo) {

        const logo =
            document.getElementById(
                "loginLogo"
            );

        if (logo) {

            logo.innerHTML = `
                <img
                    src="${savedLogo}"
                    style="
                        width:80px;
                        height:80px;
                        object-fit:contain;
                        border-radius:15px;
                    "
                >
            `;
        }
    }


    setTimeout(function() {

        const username =
            document.getElementById(
                "loginUsername"
            );

        if (username) {
            username.focus();
        }

    }, 100);
}


// ==========================================
// ADMIN LOGIN
// ==========================================

function adminLogin() {

    setupDefaultAdmin();

    const username =
        document.getElementById(
            "loginUsername"
        )?.value.trim() || "";

    const password =
        document.getElementById(
            "loginPassword"
        )?.value || "";


    const savedUsername =
        localStorage.getItem(
            ADMIN_USERNAME_KEY
        );

    const savedPassword =
        localStorage.getItem(
            ADMIN_PASSWORD_KEY
        );


    if (!username || !password) {

        alert(
            "Username এবং Password দিন।"
        );

        return;
    }


    if (
        username === savedUsername &&
        password === savedPassword
    ) {

        localStorage.setItem(
            ADMIN_LOGIN_KEY,
            "true"
        );

        setNavVisible(true);

        showDashboard();

    } else {

        alert(
            "❌ Username অথবা Password ভুল!"
        );

        const pass =
            document.getElementById(
                "loginPassword"
            );

        if (pass) {

            pass.value = "";

            pass.focus();
        }
    }
}


// ==========================================
// LOGOUT
// ==========================================

function adminLogout() {

    if (
        !confirm(
            "আপনি কি Logout করতে চান?"
        )
    ) {
        return;
    }


    localStorage.removeItem(
        ADMIN_LOGIN_KEY
    );


    if (
        typeof saleCart !== "undefined"
    ) {
        saleCart = [];
    }


    showLogin();
}


// ==========================================
// SESSION CHECK
// ==========================================

function checkAdminSession() {

    if (!isLoggedIn()) {

        showLogin();

        return false;
    }

    return true;
}


// ==========================================
// PHARMACY SETTINGS
// ==========================================

function showPharmacySettings() {

    if (!checkAdminSession()) return;


    const name =
        localStorage.getItem(
            PHARMACY_NAME_KEY
        ) ||
        "Pharmacy Inventory Pro";


    const logo =
        localStorage.getItem(
            PHARMACY_LOGO_KEY
        ) || "";


    layout(
        "🏥 Pharmacy Settings",

        `

        <div style="
            max-width:600px;
            margin:auto;
        ">


            <div style="
                background:white;
                padding:20px;
                border-radius:15px;
                margin-bottom:20px;
            ">

                <h3>
                    🏥 Pharmacy Information
                </h3>


                <label>
                    <b>Pharmacy / Company Name</b>
                </label>


                <input
                    id="pharmacyNameInput"
                    type="text"
                    value="${escapeHTML(name)}"
                    placeholder="Pharmacy Name"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:13px;
                        margin:8px 0 18px;
                        border:1px solid #ccc;
                        border-radius:8px;
                    "
                >


                <label>
                    <b>Pharmacy Logo</b>
                </label>


                <input
                    id="pharmacyLogoInput"
                    type="file"
                    accept="image/*"
                    onchange="previewPharmacyLogo(event)"
                    style="
                        width:100%;
                        margin:10px 0 15px;
                    "
                >


                <div
                    id="pharmacyLogoPreview"
                    style="
                        text-align:center;
                        margin:15px 0;
                    "
                >

                    ${
                        logo
                        ?
                        `
                        <img
                            src="${logo}"
                            style="
                                width:110px;
                                height:110px;
                                object-fit:contain;
                                border-radius:15px;
                            "
                        >
                        `
                        :
                        `
                        <div style="
                            font-size:60px;
                        ">
                            💊
                        </div>
                        `
                    }

                </div>


                <button
                    type="button"
                    onclick="savePharmacySettings()"
                    style="
                        width:100%;
                        padding:14px;
                        font-size:16px;
                    "
                >
                    💾 Save Pharmacy Settings
                </button>

            </div>


            <div style="
                background:white;
                padding:20px;
                border-radius:15px;
            ">

                <h3>
                    🔐 Admin Security
                </h3>


                <button
                    type="button"
                    onclick="showChangePassword()"
                    style="
                        width:100%;
                        padding:13px;
                        margin:5px 0;
                    "
                >
                    🔑 Change Password
                </button>


                <button
                    type="button"
                    onclick="adminLogout()"
                    style="
                        width:100%;
                        padding:13px;
                        margin:5px 0;
                    "
                >
                    🚪 Logout
                </button>

            </div>

        </div>

        `
    );
}


// ==========================================
// LOGO PREVIEW
// ==========================================

function previewPharmacyLogo(event) {

    const file =
        event.target.files[0];

    if (!file) return;


    if (!file.type.startsWith("image/")) {

        alert(
            "শুধু Image File নির্বাচন করুন।"
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload = function(e) {

        const preview =
            document.getElementById(
                "pharmacyLogoPreview"
            );


        if (preview) {

            preview.innerHTML = `

                <img
                    src="${e.target.result}"
                    style="
                        width:110px;
                        height:110px;
                        object-fit:contain;
                        border-radius:15px;
                    "
                >

            `;


            preview.dataset.logo =
                e.target.result;
        }
    };


    reader.readAsDataURL(file);
}


// ==========================================
// SAVE PHARMACY NAME + LOGO
// ==========================================

function savePharmacySettings() {

    if (!checkAdminSession()) return;


    const name =
        document.getElementById(
            "pharmacyNameInput"
        )?.value.trim();


    const preview =
        document.getElementById(
            "pharmacyLogoPreview"
        );


    if (!name) {

        alert(
            "Pharmacy / Company Name দিন।"
        );

        return;
    }


    localStorage.setItem(
        PHARMACY_NAME_KEY,
        name
    );


    if (
        preview &&
        preview.dataset.logo
    ) {

        localStorage.setItem(
            PHARMACY_LOGO_KEY,
            preview.dataset.logo
        );
    }


    alert(
        "✅ Pharmacy Name এবং Logo Save হয়েছে।"
    );


    showDashboard();
}


// ==========================================
// CHANGE PASSWORD
// ==========================================

function showChangePassword() {

    if (!checkAdminSession()) return;


    layout(
        "🔑 Change Password",

        `

        <div style="
            max-width:500px;
            margin:auto;
        ">

            <label>
                <b>Current Password</b>
            </label>

            <input
                id="oldAdminPassword"
                type="password"
                style="
                    width:100%;
                    box-sizing:border-box;
                    padding:12px;
                    margin:7px 0 15px;
                "
            >


            <label>
                <b>New Password</b>
            </label>

            <input
                id="newAdminPassword"
                type="password"
                style="
                    width:100%;
                    box-sizing:border-box;
                    padding:12px;
                    margin:7px 0 15px;
                "
            >


            <label>
                <b>Confirm New Password</b>
            </label>

            <input
                id="confirmAdminPassword"
                type="password"
                style="
                    width:100%;
                    box-sizing:border-box;
                    padding:12px;
                    margin:7px 0 18px;
                "
            >


            <button
                type="button"
                onclick="changeAdminPassword()"
                style="
                    width:100%;
                    padding:13px;
                "
            >
                🔑 Change Password
            </button>

        </div>

        `
    );
}


function changeAdminPassword() {

    if (!checkAdminSession()) return;


    const oldPassword =
        document.getElementById(
            "oldAdminPassword"
        )?.value || "";


    const newPassword =
        document.getElementById(
            "newAdminPassword"
        )?.value || "";


    const confirmPassword =
        document.getElementById(
            "confirmAdminPassword"
        )?.value || "";


    const savedPassword =
        localStorage.getItem(
            ADMIN_PASSWORD_KEY
        );


    if (
        oldPassword !== savedPassword
    ) {

        alert(
            "❌ Current Password ভুল!"
        );

        return;
    }


    if (newPassword.length < 4) {

        alert(
            "Password কমপক্ষে ৪ অক্ষরের হতে হবে।"
        );

        return;
    }


    if (
        newPassword !== confirmPassword
    ) {

        alert(
            "New Password এবং Confirm Password মিলছে না।"
        );

        return;
    }


    localStorage.setItem(
        ADMIN_PASSWORD_KEY,
        newPassword
    );


    alert(
        "✅ Password successfully changed!"
    );


    showDashboard();
}


// ==========================================
// ADD SETTINGS BUTTON TO DASHBOARD
// ==========================================

function openPharmacySettings() {

    showPharmacySettings();

}



