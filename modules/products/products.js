import {
    addRecord,
    deleteRecord,
    getData,
    saveData,
    STORAGE_KEYS,
    updateRecord
} from "../../shared/store.js";
import { getCurrentUser, seedDemoCatalogue } from "../../shared/auth.js";

/* 
   BRIGHTLOOP SOFTWARE
   Product & Plan Management */

const PRODUCT_KEY = STORAGE_KEYS.PRODUCTS;
const PLAN_KEY = STORAGE_KEYS.PLANS;

let products = [];
let plans = [];

let editingProductId = null;
let editingPlanId = null;
let currentUser = null;

/* INITIALIZATION */
export function initProducts() {
    currentUser = getCurrentUser();
    seedDemoCatalogue();
    loadData();
    setupEvents();
    const page = document.querySelector(".products-page");
    page?.classList.toggle("customer-view", currentUser?.role === "Customer");
    renderAll();
}


/*  DATA */

function loadData() {

    try {

        products = getData(PRODUCT_KEY) || [];
        plans = (getData(PLAN_KEY) || []).map(plan => ({
            ...plan,
            status: plan.status || "active"
        }));
        saveData(PLAN_KEY, plans);

    } catch (error) {

        console.error("Unable to load shared data:", error);

        products = [];
        plans = [];

        showToast("Unable to load shared storage.");

    }

}


/*  EVENT LISTENERS */

function setupEvents() {

    document
        .getElementById("addProductBtn")
        .addEventListener("click", openAddProductModal);

    document
        .getElementById("emptyAddProduct")
        .addEventListener("click", openAddProductModal);

    document
        .getElementById("addPlanBtn")
        .addEventListener("click", openAddPlanModal);

    document
        .getElementById("closeProductModal")
        .addEventListener("click", closeProductModal);

    document
        .getElementById("cancelProduct")
        .addEventListener("click", closeProductModal);

    document
        .getElementById("closePlanModal")
        .addEventListener("click", closePlanModal);

    document
        .getElementById("cancelPlan")
        .addEventListener("click", closePlanModal);

    document
        .getElementById("productForm")
        .addEventListener("submit", saveProduct);

    document
        .getElementById("planForm")
        .addEventListener("submit", savePlan);

    document
        .getElementById("searchInput")
        .addEventListener("input", renderAll);

    document
        .getElementById("typeFilter")
        .addEventListener("change", renderAll);

    /*
       Event delegation for dynamically created buttons.
    */

    document
        .getElementById("productsContainer")
        .addEventListener("click", handleCardActions);

}


/*   RENDER */

function renderAll() {

    renderProducts();

    updateStats();

    populateProductSelect();

}


/*   PRODUCTS */

function renderProducts() {

    const container =
        document.getElementById("productsContainer");

    const empty =
        document.getElementById("emptyProducts");

    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();

    const type =
        document.getElementById("typeFilter").value;

    let filteredProducts = products.filter(product => {

        const matchesSearch =
            !search ||
            product.name.toLowerCase().includes(search) ||
            product.type.toLowerCase().includes(search);

        const matchesType =
            type === "all" ||
            product.type === type;

        return matchesSearch && matchesType;

    });


    if (filteredProducts.length === 0) {

        container.innerHTML = "";

        empty.classList.remove("hidden");

        return;

    }

    empty.classList.add("hidden");


    container.innerHTML = filteredProducts
        .map(product => createProductCard(product))
        .join("");

}


/*  PRODUCT CARD */

function createProductCard(product) {

    const productPlans =
        plans.filter(plan => plan.productId === product.id);

    const notes =
        product.notes ||
        "No product description available.";

    if (currentUser?.role === "Customer") {
        return `
        <article class="product-card customer-product-card">
            <div class="product-top">
                <div><div class="product-name">${escapeHTML(product.name)}</div><span class="product-type">${escapeHTML(product.type)}</span></div>
                <div class="product-illustration">◈</div>
            </div>
            <p class="product-notes">${escapeHTML(notes)}</p>
            ${productPlans.length ? createPlanList(productPlans) : '<p class="text-muted">Plans are being prepared.</p>'}
            <div class="card-actions">
                ${productPlans.filter(isPlanActive).map(plan => `
                    <button class="btn btn-primary" data-action="select-plan" data-id="${escapeHTML(plan.id)}">Select ${escapeHTML(plan.name)}</button>
                `).join("")}
            </div>
        </article>`;
    }

    return `
        <article class="product-card">

            <div class="product-top">

                <div>
                    <div class="product-name">
                        ${escapeHTML(product.name)}
                    </div>

                    <span class="product-type">
                        ${escapeHTML(product.type)}
                    </span>
                </div>

            </div>

            <p class="product-notes">
                ${escapeHTML(notes)}
            </p>

            <div class="price-row">

                <div class="price-item">
                    <span>SALES PRICE</span>
                    <strong>
                        ₹${formatMoney(product.price)}
                    </strong>
                </div>

                <div class="price-item">
                    <span>COST PRICE</span>
                    <strong>
                        ₹${formatMoney(product.cost)}
                    </strong>
                </div>

            </div>

            <div class="plan-count">
                ${productPlans.length}
                ${productPlans.length === 1 ? "Plan" : "Plans"}
            </div>

            ${
                productPlans.length > 0
                    ? createPlanList(productPlans)
                    : ""
            }

            <div class="card-actions">

                <button
                    class="small-btn"
                    data-action="add-plan"
                    data-id="${product.id}"
                >
                    + Plan
                </button>

                <button
                    class="small-btn"
                    data-action="edit-product"
                    data-id="${product.id}"
                >
                    Edit
                </button>

                <button
                    class="small-btn delete"
                    data-action="delete-product"
                    data-id="${product.id}"
                >
                    Delete
                </button>

            </div>

        </article>
    `;
}


/*   PLAN LIST */

function createPlanList(productPlans) {

    return `
        <div class="plans-container">

            <div class="plans-title">
                AVAILABLE PLANS
            </div>

            <div class="plan-list">

                ${productPlans
                    .map(plan => createPlanItem(plan))
                    .join("")}

            </div>

        </div>
    `;

}


/* PLAN ITEM */

function createPlanItem(plan) {

    const active =
        isPlanActive(plan);

    return `
        <div class="plan-item">

            <div class="plan-main">

                <span class="plan-name">
                    ${escapeHTML(plan.name)}
                </span>

                <span class="plan-price">
                    ₹${formatMoney(plan.price)}
                    / ${escapeHTML(plan.interval)}
                </span>

            </div>

            <div class="plan-meta">

                <span>
                    Min. quantity: ${plan.minQuantity || 1}
                </span>

                <span class="
                    plan-status
                    ${active ? "status-active" : "status-inactive"}
                ">
                    ● ${active ? "Active" : "Not Available"}
                </span>

            </div>

            <div class="plan-actions">

                <button
                    data-action="edit-plan"
                    data-id="${plan.id}"
                >
                    Edit
                </button>

                <button
                    data-action="delete-plan"
                    data-id="${plan.id}"
                >
                    Delete
                </button>

            </div>

        </div>
    `;

}


/*  CARD ACTIONS */

function handleCardActions(event) {

    const button =
        event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const id = button.dataset.id;


    switch (action) {

        case "add-plan":
            openAddPlanModal(id);
            break;

        case "edit-product":
            openEditProductModal(id);
            break;

        case "delete-product":
            deleteProduct(id);
            break;

        case "edit-plan":
            openEditPlanModal(id);
            break;

        case "delete-plan":
            deletePlan(id);
            break;

        case "select-plan": {
            const selectedPlan = plans.find(plan => plan.id === id);
            if (!selectedPlan) {
                showToast("That plan is no longer available.");
                return;
            }
            sessionStorage.setItem("bl_pending_plan", JSON.stringify({
                productId: selectedPlan.productId,
                planId: selectedPlan.id
            }));
            window.Brightloop?.navigate("subscriptions");
            break;
        }

    }

}


/*  PRODUCT MODAL */

function openAddProductModal() {
    if (currentUser?.role !== "Admin") {
        showToast("Only administrators can manage products.");
        return;
    }

    editingProductId = null;

    document.getElementById("productModalTitle")
        .textContent = "Add Product";

    document.getElementById("productForm").reset();

    document.getElementById("productId").value = "";

    document
        .getElementById("productModal")
        .classList.remove("hidden");
    document.getElementById("productModal").classList.add("show");

}


function openEditProductModal(id) {
    if (currentUser?.role !== "Admin") {
        showToast("Only administrators can manage products.");
        return;
    }

    const product =
        products.find(item => item.id === id);

    if (!product) {
        return;
    }

    editingProductId = id;

    document.getElementById("productModalTitle")
        .textContent = "Edit Product";

    document.getElementById("productId").value = product.id;

    document.getElementById("productName").value =
        product.name;

    document.getElementById("productType").value =
        product.type;

    document.getElementById("productPrice").value =
        product.price;

    document.getElementById("productCost").value =
        product.cost;

    document.getElementById("productNotes").value =
        product.notes || "";

    document
        .getElementById("productModal")
        .classList.remove("hidden");
    document.getElementById("productModal").classList.add("show");

}


function closeProductModal() {

    document
        .getElementById("productModal")
        .classList.remove("show");
    document.getElementById("productModal").classList.add("hidden");

    editingProductId = null;

}


/*  SAVE PRODUCT */

function saveProduct(event) {

    event.preventDefault();
    if (currentUser?.role !== "Admin") {
        showToast("Only administrators can manage products.");
        return;
    }

    const name =
        document.getElementById("productName").value.trim();

    const type =
        document.getElementById("productType").value;

    const price =
        Number(document.getElementById("productPrice").value);

    const cost =
        Number(document.getElementById("productCost").value);

    const notes =
        document.getElementById("productNotes").value.trim();


    if (!name) {

        showToast("Product name is required.");

        return;

    }

    if (!type) {

        showToast("Please select a product type.");

        return;

    }

    if (price < 0 || Number.isNaN(price)) {

        showToast("Enter a valid sales price.");

        return;

    }

    if (cost < 0 || Number.isNaN(cost)) {

        showToast("Enter a valid cost price.");

        return;

    }


    const existingProduct = editingProductId
        ? products.find(item => item.id === editingProductId)
        : null;

    const product = {

        id:
            editingProductId ||
            generateId("prod"),

        name,
        type,
        price,
        cost,
        notes,
        variants: existingProduct?.variants || [],
        createdAt: existingProduct?.createdAt || new Date().toISOString().slice(0, 10)

    };


    try {

        if (editingProductId) {

            updateRecord(
                PRODUCT_KEY,
                editingProductId,
                product
            );

            showToast("Product updated successfully.");

        } else {

            addRecord(
                PRODUCT_KEY,
                product
            );

            showToast("Product added successfully.");

        }

        loadData();

        renderAll();

        closeProductModal();

    } catch (error) {

        console.error(error);

        showToast("Unable to save product.");

    }

}


/*   DELETE PRODUCT */

function deleteProduct(id) {
    if (currentUser?.role !== "Admin") {
        showToast("Only administrators can manage products.");
        return;
    }

    const product =
        products.find(item => item.id === id);

    if (!product) {
        return;
    }


    const productPlans =
        plans.filter(plan => plan.productId === id);


    let message =
        `Delete "${product.name}"?`;


    if (productPlans.length > 0) {

        message +=
            ` This product has ${productPlans.length} associated plan(s).`;

    }


    if (!confirm(message)) {
        return;
    }


    try {

        /*
           Delete associated plans first.
           This prevents orphaned plans.
        */

        productPlans.forEach(plan => {

            deleteRecord(
                PLAN_KEY,
                plan.id
            );

        });


        deleteRecord(
            PRODUCT_KEY,
            id
        );


        loadData();

        renderAll();

        showToast("Product deleted successfully.");

    } catch (error) {

        console.error(error);

        showToast("Unable to delete product.");

    }

}


/*  PLAN MODAL*/

function openAddPlanModal(productId = "") {
    if (currentUser?.role !== "Admin") {
        showToast("Only administrators can manage plans.");
        return;
    }

    if (products.length === 0) {

        showToast("Create a product before adding a plan.");

        return;

    }

    editingPlanId = null;

    document.getElementById("planModalTitle")
        .textContent = "Add Plan";

    document.getElementById("planForm").reset();

    document.getElementById("planId").value = "";

    document.getElementById("planQuantity").value = 1;


    populateProductSelect();


    if (productId) {

        document.getElementById("planProduct").value =
            productId;

    }


    document
        .getElementById("planModal")
        .classList.remove("hidden");
    document.getElementById("planModal").classList.add("show");

}


function openEditPlanModal(id) {
    if (currentUser?.role !== "Admin") {
        showToast("Only administrators can manage plans.");
        return;
    }

    const plan =
        plans.find(item => item.id === id);

    if (!plan) {
        return;
    }

    editingPlanId = id;

    populateProductSelect();

    document.getElementById("planModalTitle")
        .textContent = "Edit Plan";

    document.getElementById("planId").value =
        plan.id;

    document.getElementById("planProduct").value =
        plan.productId;

    document.getElementById("planName").value =
        plan.name;

    document.getElementById("planPrice").value =
        plan.price;

    document.getElementById("planInterval").value =
        plan.interval;

    document.getElementById("planQuantity").value =
        plan.minQuantity || 1;

    document.getElementById("planStartDate").value =
        plan.startDate || "";

    document.getElementById("planEndDate").value =
        plan.endDate || "";


    document
        .getElementById("planModal")
        .classList.remove("hidden");
    document.getElementById("planModal").classList.add("show");

}


function closePlanModal() {

    document
        .getElementById("planModal")
        .classList.remove("show");
    document.getElementById("planModal").classList.add("hidden");

    editingPlanId = null;

}


/* =========================================================
   PRODUCT SELECT
   ========================================================= */

function populateProductSelect() {

    const select =
        document.getElementById("planProduct");

    const currentValue =
        select.value;

    select.innerHTML =
        `<option value="">Select product</option>`;


    products.forEach(product => {

        const option =
            document.createElement("option");

        option.value = product.id;

        option.textContent =
            product.name;

        select.appendChild(option);

    });


    if (currentValue) {
        select.value = currentValue;
    }

}


/*   SAVE PLAN */

function savePlan(event) {

    event.preventDefault();
    if (currentUser?.role !== "Admin") {
        showToast("Only administrators can manage plans.");
        return;
    }


    const productId =
        document.getElementById("planProduct").value;

    const name =
        document.getElementById("planName").value.trim();

    const price =
        Number(document.getElementById("planPrice").value);

    const interval =
        document.getElementById("planInterval").value;

    const minQuantity =
        Number(document.getElementById("planQuantity").value) || 1;

    const startDate =
        document.getElementById("planStartDate").value;

    const endDate =
        document.getElementById("planEndDate").value;


    if (!productId) {

        showToast("Please select a product.");

        return;

    }

    if (!name) {

        showToast("Plan name is required.");

        return;

    }

    if (price < 0 || Number.isNaN(price)) {

        showToast("Enter a valid plan price.");

        return;

    }

    if (!interval) {

        showToast("Please select a billing interval.");

        return;

    }

    if (minQuantity < 1) {

        showToast("Minimum quantity must be at least 1.");

        return;

    }

    if (
        startDate &&
        endDate &&
        endDate < startDate
    ) {

        showToast("End date cannot be before start date.");

        return;

    }


    const plan = {

        id:
            editingPlanId ||
            generateId("plan"),

        productId,
        name,
        interval,
        price,
        minQuantity,
        startDate,
        endDate,
        status: editingPlanId
            ? (plans.find(item => item.id === editingPlanId)?.status || "active")
            : "active"

    };


    try {

        if (editingPlanId) {

            updateRecord(
                PLAN_KEY,
                editingPlanId,
                plan
            );

            showToast("Plan updated successfully.");

        } else {

            addRecord(
                PLAN_KEY,
                plan
            );

            showToast("Plan added successfully.");

        }


        loadData();

        renderAll();

        closePlanModal();

    } catch (error) {

        console.error(error);

        showToast("Unable to save plan.");

    }

}


/* =========================================================
   DELETE PLAN
   ========================================================= */

function deletePlan(id) {
    if (currentUser?.role !== "Admin") {
        showToast("Only administrators can manage plans.");
        return;
    }

    const plan =
        plans.find(item => item.id === id);

    if (!plan) {
        return;
    }


    if (
        !confirm(
            `Delete the "${plan.name}" plan?`
        )
    ) {

        return;

    }


    try {

        deleteRecord(
            PLAN_KEY,
            id
        );

        loadData();

        renderAll();

        showToast("Plan deleted successfully.");

    } catch (error) {

        console.error(error);

        showToast("Unable to delete plan.");

    }

}


/*  STATISTICS*/

function updateStats() {

    document.getElementById("totalProducts")
        .textContent = products.length;

    document.getElementById("totalPlans")
        .textContent = plans.length;

    const active =
        plans.filter(plan => isPlanActive(plan)).length;

    document.getElementById("activePlans")
        .textContent = active;

}


/*    PLAN AVAILABILITY */

function isPlanActive(plan) {

    const today =
        new Date();

    today.setHours(0, 0, 0, 0);


    if (plan.startDate) {

        const start =
            new Date(plan.startDate);

        if (today < start) {
            return false;
        }

    }


    if (plan.endDate) {

        const end =
            new Date(plan.endDate);

        if (today > end) {
            return false;
        }

    }


    return true;

}


/*
   UTILITIES
   */

function generateId(prefix) {

    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


function formatMoney(value) {

    return Number(value || 0)
        .toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}
