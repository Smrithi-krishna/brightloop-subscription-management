import {
    getData,
    STORAGE_KEYS,
    saveData
} from "../../shared/store.js";
import { getCurrentUser, ensureCustomerRecord } from "../../shared/auth.js";

const CUSTOMER_KEY = STORAGE_KEYS.CUSTOMERS;
const SUBSCRIPTION_KEY = STORAGE_KEYS.SUBSCRIPTIONS;
const PLAN_KEY = STORAGE_KEYS.PLANS;
const PRODUCT_KEY = STORAGE_KEYS.PRODUCTS;

let root;
let customerTableBody;
let subscriptionTableBody;
let customerModal;
let subscriptionModal;
let customerForm;
let subscriptionForm;
let editingCustomerId = null;
let toastTimer;
let currentUser = null;

const $ = selector => root.querySelector(selector);
const $$ = selector => [...root.querySelectorAll(selector)];

function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}

function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function openCustomerModal() {
    if (currentUser?.role !== "Admin") {
        showToast("Only administrators can manage customers.");
        return;
    }
    editingCustomerId = null;
    customerForm.reset();
    $("#customerModalTitle").textContent = "Add Customer";
    customerModal.classList.add("show");
    $("#customerName").focus();
}

function closeCustomerModal() {
    customerModal.classList.remove("show");
    editingCustomerId = null;
    customerForm.reset();
}

function openSubscriptionModal() {
    const customers = getData(CUSTOMER_KEY);
    if (customers.length === 0) {
        showToast("Add a customer before creating a subscription.");
        return;
    }
    if (getData(PLAN_KEY).length === 0) {
        showToast("No plans available. Add plans first.");
        return;
    }
    subscriptionForm.reset();
    updateCustomerDropdown();
    updatePlanDropdown();
    const pending = JSON.parse(sessionStorage.getItem("bl_pending_plan") || "null");
    if (currentUser?.role === "Customer") {
        const customer = ensureCustomerRecord(currentUser);
        $("#subscriptionCustomer").value = customer?.id || "";
        $("#subscriptionCustomer").disabled = true;
    }
    if (pending?.planId) {
        $("#subscriptionPlan").value = pending.planId;
        sessionStorage.removeItem("bl_pending_plan");
    }
    subscriptionModal.classList.add("show");
}

function closeSubscriptionModal() {
    subscriptionModal.classList.remove("show");
    subscriptionForm.reset();
}

function displayCustomers() {
    const allCustomers = getData(CUSTOMER_KEY) || [];
    const customers = currentUser?.role === "Customer"
        ? allCustomers.filter(customer => customer.id === ensureCustomerRecord(currentUser)?.id)
        : allCustomers;
    customerTableBody.innerHTML = "";

    if (!customers.length) {
        customerTableBody.innerHTML = '<tr><td colspan="4">No customers added yet.</td></tr>';
    } else {
        customers.forEach(customer => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${escapeHTML(customer.id)}</td>
                <td>${escapeHTML(customer.name)}</td>
                <td>${escapeHTML(customer.email)}</td>
                <td><div class="action-buttons">
                    <button type="button" class="action-btn" data-action="edit-customer" data-id="${escapeHTML(customer.id)}">Edit</button>
                    <button type="button" class="action-btn" data-action="delete-customer" data-id="${escapeHTML(customer.id)}">Delete</button>
                </div></td>`;
            customerTableBody.appendChild(row);
        });
    }
    updateStatistics();
    updateCustomerDropdown();
}

function handleCustomerSubmit(event) {
    event.preventDefault();
    const name = $("#customerName").value.trim();
    const email = $("#customerEmail").value.trim();

    if (!name || !email) {
        showToast("Please enter the customer name and email address.");
        return;
    }

    const customers = getData(CUSTOMER_KEY) || [];
    const duplicate = customers.some(customer =>
        String(customer.email).toLowerCase() === email.toLowerCase() &&
        customer.id !== editingCustomerId
    );

    if (duplicate) {
        showToast("This email address is already registered.");
        return;
    }

    let updatedCustomers;
    if (editingCustomerId) {
        updatedCustomers = customers.map(customer =>
            customer.id === editingCustomerId ? { ...customer, name, email } : customer
        );
        saveData(CUSTOMER_KEY, updatedCustomers);
        showToast("Customer updated successfully.");
    } else {
        updatedCustomers = [...customers, {
            id: generateId("CUS"),
            name,
            email
        }];
        saveData(CUSTOMER_KEY, updatedCustomers);
        showToast("Customer added successfully.");
    }

    closeCustomerModal();
    displayCustomers();
}

function editCustomer(id) {
    if (currentUser?.role !== "Admin") {
        showToast("Only administrators can manage customers.");
        return;
    }
    const customer = (getData(CUSTOMER_KEY) || []).find(item => item.id === id);
    if (!customer) return;

    editingCustomerId = id;
    $("#customerModalTitle").textContent = "Edit Customer";
    $("#customerName").value = customer.name || "";
    $("#customerEmail").value = customer.email || "";
    customerModal.classList.add("show");
    $("#customerName").focus();
}

function deleteCustomer(id) {
    if (currentUser?.role !== "Admin") {
        showToast("Only administrators can manage customers.");
        return;
    }
    const subscriptions = getData(SUBSCRIPTION_KEY) || [];
    if (subscriptions.some(subscription => subscription.customerId === id)) {
        showToast("Cannot delete a customer with existing subscriptions.");
        return;
    }
    if (!confirm("Are you sure you want to delete this customer?")) return;

    const customers = (getData(CUSTOMER_KEY) || []).filter(customer => customer.id !== id);
    saveData(CUSTOMER_KEY, customers);
    showToast("Customer deleted successfully.");
    displayCustomers();
}

function displaySubscriptions() {
    const allSubscriptions = getData(SUBSCRIPTION_KEY) || [];
    const customer = currentUser?.role === "Customer" ? ensureCustomerRecord(currentUser) : null;
    const subscriptions = customer
        ? allSubscriptions.filter(subscription => subscription.customerId === customer.id)
        : allSubscriptions;
    const customers = getData(CUSTOMER_KEY) || [];
    const plans = getData(PLAN_KEY) || [];
    subscriptionTableBody.innerHTML = "";

    if (!subscriptions.length) {
        subscriptionTableBody.innerHTML = '<tr><td colspan="7">No subscriptions created yet.</td></tr>';
    } else {
        subscriptions.forEach(subscription => {
            const customer = customers.find(item => item.id === subscription.customerId);
            const plan = plans.find(item => item.id === subscription.planId);
            const customerName = customer ? customer.name : "Unknown Customer";
            const planName = plan ? (plan.name || plan.title || plan.planName || "Plan") : "Unknown Plan";
            const status = subscription.isPaused ? "Paused" : (subscription.status || "Draft");
            const statusClass = status.toLowerCase();

            const row = document.createElement("tr");
            let actions = "";
            if (subscription.status === "Active" && !subscription.isPaused) {
                actions += `<button type="button" class="action-btn" data-action="pause-subscription" data-id="${escapeHTML(subscription.id)}">Pause</button>`;
            }
            if (subscription.isPaused) {
                actions += `<button type="button" class="action-btn" data-action="resume-subscription" data-id="${escapeHTML(subscription.id)}">Resume</button>`;
            }
            if (subscription.status !== "Closed" && subscription.status !== "Cancelled") {
                actions += `<button type="button" class="action-btn" data-action="cancel-subscription" data-id="${escapeHTML(subscription.id)}">Cancel</button>`;
            }

            row.innerHTML = `
                <td>${escapeHTML(subscription.id)}</td>
                <td>${escapeHTML(customerName)}</td>
                <td>${escapeHTML(planName)}</td>
                <td>${escapeHTML(subscription.startDate)}</td>
                <td>${escapeHTML(subscription.expiryDate)}</td>
                <td><span class="status status-${escapeHTML(statusClass)}">${escapeHTML(status)}</span></td>
                <td><div class="action-buttons">${actions || "—"}</div></td>`;
            subscriptionTableBody.appendChild(row);
        });
    }
    updateStatistics();
}

function handleSubscriptionSubmit(event) {
    event.preventDefault();
    const customerId = currentUser?.role === "Customer"
        ? ensureCustomerRecord(currentUser)?.id
        : $("#subscriptionCustomer").value;
    const planId = $("#subscriptionPlan").value;
    const startDate = $("#startDate").value;
    const expiryDate = $("#expiryDate").value;
    const paymentTerms = $("#paymentTerms").value;
    const status = $("#subscriptionStatus").value;

    if (!customerId || !planId || !startDate || !expiryDate || !paymentTerms) {
        showToast("Please complete all subscription details.");
        return;
    }
    if (expiryDate <= startDate) {
        showToast("Expiry date must be after the start date.");
        return;
    }

    const customers = getData(CUSTOMER_KEY) || [];
    const plans = getData(PLAN_KEY) || [];
    const selectedPlan = plans.find(plan => plan.id === planId);
    if (!customers.some(customer => customer.id === customerId) || !selectedPlan) {
        showToast("Please select a valid customer and plan.");
        return;
    }

    const subscriptions = getData(SUBSCRIPTION_KEY) || [];
    subscriptions.push({
        id: generateId("SUB"),
        customerId,
        planId,
        productId: selectedPlan.productId,
        quantity: 1,
        unitPrice: Number(selectedPlan.price) || 0,
        startDate,
        expiryDate,
        paymentTerms,
        status,
        isPaused: false,
        nextBillingDate: expiryDate,
        createdAt: new Date().toISOString()
    });
    saveData(SUBSCRIPTION_KEY, subscriptions);
    closeSubscriptionModal();
    showToast("Subscription created successfully.");
    displaySubscriptions();
    if (currentUser?.role === "Customer") {
        window.Brightloop?.navigate("billing");
    }
}

function updateSubscription(id, updates) {
    const subscriptions = (getData(SUBSCRIPTION_KEY) || []).map(subscription =>
        subscription.id === id ? { ...subscription, ...updates } : subscription
    );
    saveData(SUBSCRIPTION_KEY, subscriptions);
    displaySubscriptions();
}

function updateCustomerDropdown() {
    const dropdown = $("#subscriptionCustomer");
    if (!dropdown) return;
    const previous = dropdown.value;
    dropdown.innerHTML = '<option value="">Choose a customer</option>';
    (getData(CUSTOMER_KEY) || []).forEach(customer => {
        const option = document.createElement("option");
        option.value = customer.id;
        option.textContent = customer.name;
        dropdown.appendChild(option);
    });
    if ([...dropdown.options].some(option => option.value === previous)) dropdown.value = previous;
}

function updatePlanDropdown() {
    const dropdown = $("#subscriptionPlan");
    if (!dropdown) return;
    dropdown.innerHTML = '<option value="">Choose a plan</option>';
    const products = getData(PRODUCT_KEY) || [];
    (getData(PLAN_KEY) || []).forEach(plan => {
        const product = products.find(item => item.id === plan.productId);
        const planName = plan.name || plan.title || plan.planName || "Plan";
        const productName = product ? (product.name || product.title || "") : "";
        const option = document.createElement("option");
        option.value = plan.id;
        option.textContent = productName ? `${planName} - ${productName}` : planName;
        dropdown.appendChild(option);
    });
}

function updateStatistics() {
    const allCustomers = getData(CUSTOMER_KEY) || [];
    const customers = currentUser?.role === "Customer"
        ? allCustomers.filter(item => item.id === ensureCustomerRecord(currentUser)?.id)
        : allCustomers;
    const allSubscriptions = getData(SUBSCRIPTION_KEY) || [];
    const subscriptions = currentUser?.role === "Customer"
        ? allSubscriptions.filter(item => item.customerId === ensureCustomerRecord(currentUser)?.id)
        : allSubscriptions;
    const today = new Date().toISOString().slice(0, 10);
    const active = subscriptions.filter(item => item.status === "Active" && !item.isPaused).length;
    const expired = subscriptions.filter(item =>
        item.status !== "Cancelled" && item.status !== "Closed" && item.expiryDate < today
    ).length;

    $("#totalCustomers").textContent = customers.length;
    $("#totalSubscriptions").textContent = subscriptions.length;
    $("#activeSubscriptions").textContent = active;
    $("#expiredSubscriptions").textContent = expired;
}

function initSearch(inputSelector, tableBody) {
    const input = $(inputSelector);
    input.addEventListener("input", () => {
        const term = input.value.toLowerCase();
        tableBody.querySelectorAll("tr").forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
        });
    });
}

export function initSubscriptions(container) {
    root = container;
    currentUser = getCurrentUser();
    root.querySelector(".container")?.classList.toggle("customer-view", currentUser?.role === "Customer");
    customerTableBody = $("#customerTableBody");
    subscriptionTableBody = $("#subscriptionTableBody");
    customerModal = $("#customerModal");
    subscriptionModal = $("#subscriptionModal");
    customerForm = $("#customerForm");
    subscriptionForm = $("#subscriptionForm");

    if (!customerTableBody || !subscriptionTableBody || !customerModal || !customerForm) {
        console.error("Subscriptions module HTML is missing required elements.");
        return;
    }

    $("#addCustomerBtn")?.addEventListener("click", openCustomerModal);
    $("#addCustomerBtn2")?.addEventListener("click", openCustomerModal);
    $("#closeCustomerModal").addEventListener("click", closeCustomerModal);
    $("#cancelCustomer").addEventListener("click", closeCustomerModal);
    $("#addSubscriptionBtn").addEventListener("click", openSubscriptionModal);
    $("#closeSubscriptionModal").addEventListener("click", closeSubscriptionModal);
    $("#cancelSubscription").addEventListener("click", closeSubscriptionModal);

    customerForm.addEventListener("submit", handleCustomerSubmit);
    subscriptionForm.addEventListener("submit", handleSubscriptionSubmit);

    customerModal.addEventListener("click", event => {
        if (event.target === customerModal) closeCustomerModal();
    });
    subscriptionModal.addEventListener("click", event => {
        if (event.target === subscriptionModal) closeSubscriptionModal();
    });

    initSearch("#customerSearch", customerTableBody);
    initSearch("#subscriptionSearch", subscriptionTableBody);

    $$(".tab-btn").forEach(button => {
        button.addEventListener("click", () => {
            const tabId = button.dataset.tab;
            $$(".tab-btn").forEach(tab => tab.classList.toggle("active", tab === button));
            $$(".tab-content").forEach(panel => panel.classList.toggle("active", panel.id === tabId));
        });
    });

    // Event delegation keeps Edit/Delete/Pause/Resume/Cancel working after table redraws.
    root.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");
        if (!button || !root.contains(button)) return;
        const { action, id } = button.dataset;

        if (action === "edit-customer") editCustomer(id);
        if (action === "delete-customer") deleteCustomer(id);
        if (action === "pause-subscription") {
            updateSubscription(id, { isPaused: true });
            showToast("Subscription paused.");
        }
        if (action === "resume-subscription") {
            updateSubscription(id, { isPaused: false });
            showToast("Subscription resumed.");
        }
        if (action === "cancel-subscription") {
            if (confirm("Are you sure you want to cancel this subscription?")) {
                updateSubscription(id, { status: "Cancelled", isPaused: false });
                showToast("Subscription cancelled.");
            }
        }
    });

    displayCustomers();
    displaySubscriptions();
    updateCustomerDropdown();
    updatePlanDropdown();
    if (currentUser?.role === "Customer") {
        document.querySelector(".tab-btn[data-tab='subscriptions']")?.click();
        openSubscriptionModalIfPending();
    }
}

function openSubscriptionModalIfPending() {
    if (sessionStorage.getItem("bl_pending_plan")) openSubscriptionModal();
}