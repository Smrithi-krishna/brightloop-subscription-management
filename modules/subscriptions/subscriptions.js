
import {
    addRecord,
    getData,
    STORAGE_KEYS,
    updateRecord,
    deleteRecord,
    saveData
} from "../../shared/store.js";

// BRIGHTLOOP - customer and subscription module

// Shared storage keys
const CUSTOMER_KEY = STORAGE_KEYS.CUSTOMERS;
const SUBSCRIPTION_KEY = STORAGE_KEYS.SUBSCRIPTIONS;
const PLAN_KEY = STORAGE_KEYS.PLANS;
const PRODUCT_KEY = STORAGE_KEYS.PRODUCTS;



// 1. STORAGE FUNCTIONS
// 2. GENERATE UNIQUE IDs


function generateId(prefix) {
    return prefix + "-" + Date.now() + "-" +
        Math.floor(Math.random() * 1000);
}



// 3. GET ELEMENTS


let customerTableBody;
let subscriptionTableBody;
let customerModal;
let subscriptionModal;
let customerForm;
let subscriptionForm;
let tabButtons = [];

let editingCustomerId = null;


// 4. SHOW TOAST MESSAGE


function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}



// 5. CUSTOMER MANAGEMENT


// Display customers in the table

function displayCustomers() {
    const customers = getData(CUSTOMER_KEY);

    customerTableBody.innerHTML = "";

    if (customers.length === 0) {
        customerTableBody.innerHTML = `
            <tr>
                <td colspan="4">No customers added yet.</td>
            </tr>
        `;
    }

    customers.forEach(customer => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(customer.id)}</td>
            <td>${escapeHTML(customer.name)}</td>
            <td>${escapeHTML(customer.email)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn"
                        onclick="editCustomer('${customer.id}')">
                        Edit
                    </button>

                    <button class="action-btn"
                        onclick="deleteCustomer('${customer.id}')">
                        Delete
                    </button>
                </div>
            </td>
        `;

        customerTableBody.appendChild(row);
    });

    updateStatistics();
    updateCustomerDropdown();
}



function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}


// Add or edit a customer

function handleCustomerSubmit(event) {
    event.preventDefault();

    const name =
        document.getElementById("customerName").value.trim();

    const email =
        document.getElementById("customerEmail").value.trim();

    if (!name || !email) {
        showToast("Please enter all customer details.");
        return;
    }

    const customers = getData(CUSTOMER_KEY);

    const duplicateEmail = customers.some(customer =>
        customer.email.toLowerCase() === email.toLowerCase() &&
        customer.id !== editingCustomerId
    );

    if (duplicateEmail) {
        showToast("This email is already registered.");
        return;
    }

    if (editingCustomerId) {

        const updatedCustomers = customers.map(customer => {
            if (customer.id === editingCustomerId) {
                return {
                    ...customer,
                    name: name,
                    email: email
                };
            }

            return customer;
        });

        saveData(CUSTOMER_KEY, updatedCustomers);
        showToast("Customer updated successfully!");

    } else {

        const newCustomer = {
            id: generateId("CUS"),
            name: name,
            email: email
        };

        customers.push(newCustomer);

        saveData(CUSTOMER_KEY, customers);
        showToast("Customer added successfully!");
    }

    customerForm.reset();
    customerModal.classList.remove("show");
    editingCustomerId = null;

    displayCustomers();
}


// Edit customer

function editCustomer(id) {
    const customers = getData(CUSTOMER_KEY);

    const customer = customers.find(item => item.id === id);

    if (!customer) return;

    editingCustomerId = id;

    document.getElementById("customerModalTitle")
        .textContent = "Edit Customer";

    document.getElementById("customerName").value =
        customer.name;

    document.getElementById("customerEmail").value =
        customer.email;

    customerModal.classList.add("show");
}


// Delete customer

function deleteCustomer(id) {
    const subscriptions = getData(SUBSCRIPTION_KEY);

    const hasSubscriptions = subscriptions.some(
        subscription => subscription.customerId === id
    );

    if (hasSubscriptions) {
        showToast(
            "Cannot delete customer with existing subscriptions."
        );
        return;
    }

    if (!confirm("Are you sure you want to delete this customer?")) {
        return;
    }

    const customers = getData(CUSTOMER_KEY);

    const updatedCustomers = customers.filter(
        customer => customer.id !== id
    );

    saveData(CUSTOMER_KEY, updatedCustomers);

    showToast("Customer deleted successfully!");

    displayCustomers();
}


// ==========================================
// 6. SUBSCRIPTION MANAGEMENT
// ==========================================

// Display subscriptions

function displaySubscriptions() {
    const subscriptions = getData(SUBSCRIPTION_KEY);
    const customers = getData(CUSTOMER_KEY);
    const plans = getData(PLAN_KEY);

    subscriptionTableBody.innerHTML = "";

    if (subscriptions.length === 0) {
        subscriptionTableBody.innerHTML = `
            <tr>
                <td colspan="7">No subscriptions created yet.</td>
            </tr>
        `;
    }

    subscriptions.forEach(subscription => {

        const customer = customers.find(
            item => item.id === subscription.customerId
        );

        const plan = plans.find(
            item => item.id === subscription.planId
        );

        const customerName = customer
            ? customer.name
            : "Unknown Customer";

        const planName = plan
            ? (plan.name || plan.title || plan.planName || "Plan")
            : "Unknown Plan";

        let status = subscription.status;

        if (subscription.isPaused) {
            status = "Paused";
        }

        const row = document.createElement("tr");

        const statusClass = status.toLowerCase();

        row.innerHTML = `
            <td>${escapeHTML(subscription.id)}</td>
            <td>${escapeHTML(customerName)}</td>
            <td>${escapeHTML(planName)}</td>
            <td>${escapeHTML(subscription.startDate)}</td>
            <td>${escapeHTML(subscription.expiryDate)}</td>
            <td>
                <span class="status status-${escapeHTML(statusClass)}">
                    ${escapeHTML(status)}
                </span>
            </td>
            <td>
                <div class="action-buttons">

                    ${subscription.status === "Active" &&
                        !subscription.isPaused ? `
                        <button class="action-btn"
                            onclick="pauseSubscription('${subscription.id}')">
                            Pause
                        </button>
                    ` : ""}

                    ${subscription.isPaused ? `
                        <button class="action-btn"
                            onclick="resumeSubscription('${subscription.id}')">
                            Resume
                        </button>
                    ` : ""}

                    ${subscription.status !== "Closed" &&
                        subscription.status !== "Cancelled" ? `
                        <button class="action-btn"
                            onclick="cancelSubscription('${subscription.id}')">
                            Cancel
                        </button>
                    ` : ""}

                </div>
            </td>
        `;

        subscriptionTableBody.appendChild(row);
    });

    updateStatistics();
}


// Create subscription

function handleSubscriptionSubmit(event) {
    event.preventDefault();

    const customerId =
        document.getElementById("subscriptionCustomer").value;

    const planId =
        document.getElementById("subscriptionPlan").value;

    const startDate =
        document.getElementById("startDate").value;

    const expiryDate =
        document.getElementById("expiryDate").value;

    const paymentTerms =
        document.getElementById("paymentTerms").value;

    const status =
        document.getElementById("subscriptionStatus").value;

    if (!customerId || !planId || !startDate || !expiryDate) {
        showToast("Please complete all subscription details.");
        return;
    }

    if (expiryDate <= startDate) {
        showToast("Expiry date must be after the start date.");
        return;
    }

    const customers = getData(CUSTOMER_KEY);
    const plans = getData(PLAN_KEY);

    const customerExists = customers.some(
        customer => customer.id === customerId
    );

    const selectedPlan = plans.find(
        plan => plan.id === planId
    );

    if (!customerExists || !selectedPlan) {
        showToast("Please select a valid customer and plan.");
        return;
    }

    const newSubscription = {
        id: generateId("SUB"),
        customerId: customerId,
        planId: planId,
        productId: selectedPlan.productId,
        quantity: 1,
        unitPrice: Number(selectedPlan.price) || 0,
        startDate: startDate,
        expiryDate: expiryDate,
        paymentTerms: paymentTerms,
        status: status,
        isPaused: false,
        nextBillingDate: expiryDate,
        createdAt: new Date().toISOString()
    };

    const subscriptions = getData(SUBSCRIPTION_KEY);

    subscriptions.push(newSubscription);

    saveData(SUBSCRIPTION_KEY, subscriptions);

    subscriptionForm.reset();

    subscriptionModal.classList.remove("show");

    showToast("Subscription created successfully!");

    displaySubscriptions();
}


// Pause subscription

function pauseSubscription(id) {
    updateSubscription(id, {
        isPaused: true
    });

    showToast("Subscription paused.");
}


// Resume subscription

function resumeSubscription(id) {
    updateSubscription(id, {
        isPaused: false
    });

    showToast("Subscription resumed.");
}


// Cancel subscription

function cancelSubscription(id) {
    if (!confirm("Are you sure you want to cancel this subscription?")) {
        return;
    }

    updateSubscription(id, {
        status: "Cancelled",
        isPaused: false
    });

    showToast("Subscription cancelled.");
}


// Update subscription

function updateSubscription(id, updates) {
    const subscriptions = getData(SUBSCRIPTION_KEY);

    const updatedSubscriptions = subscriptions.map(subscription => {
        if (subscription.id === id) {
            return {
                ...subscription,
                ...updates
            };
        }

        return subscription;
    });

    saveData(SUBSCRIPTION_KEY, updatedSubscriptions);

    displaySubscriptions();
}



// 7. DROPDOWN FUNCTIONS


// Load customers into subscription form

function updateCustomerDropdown() {
    const dropdown =
        document.getElementById("subscriptionCustomer");

    const selectedValue = dropdown.value;

    dropdown.innerHTML =
        '<option value="">Choose a customer</option>';

    const customers = getData(CUSTOMER_KEY);

    customers.forEach(customer => {
        const option = document.createElement("option");

        option.value = customer.id;
        option.textContent = customer.name;

        dropdown.appendChild(option);
    });

    if (customers.some(customer => customer.id === selectedValue)) {
        dropdown.value = selectedValue;
    }
}


// Load plans into subscription form

function updatePlanDropdown() {
    const dropdown =
        document.getElementById("subscriptionPlan");

    dropdown.innerHTML =
        '<option value="">Choose a plan</option>';

    const plans = getData(PLAN_KEY);
    const products = getData(PRODUCT_KEY);

    plans.forEach(plan => {
        const option = document.createElement("option");

        const product = products.find(
            item => item.id === plan.productId
        );

        const planName =
            plan.name || plan.title || plan.planName || "Plan";

        const productName = product
            ? (product.name || product.title || "")
            : "";

        option.value = plan.id;

        option.textContent = productName
            ? `${planName} - ${productName}`
            : planName;

        dropdown.appendChild(option);
    });
}


// 8. DASHBOARD STATISTICS


function updateStatistics() {
    const customers = getData(CUSTOMER_KEY);
    const subscriptions = getData(SUBSCRIPTION_KEY);

    const activeCount = subscriptions.filter(
        item => item.status === "Active" && !item.isPaused
    ).length;

    const expiredCount = subscriptions.filter(
        item =>
            item.status !== "Cancelled" &&
            item.status !== "Closed" &&
            item.expiryDate < new Date().toISOString().slice(0, 10)
    ).length;

    document.getElementById("totalCustomers").textContent =
        customers.length;

    document.getElementById("totalSubscriptions").textContent =
        subscriptions.length;

    document.getElementById("activeSubscriptions").textContent =
        activeCount;

    document.getElementById("expiredSubscriptions").textContent =
        expiredCount;
}



// 9. SEARCH AND TAB HANDLERS ARE WIRED BY initSubscriptions


// 11. MODAL FUNCTIONS


// Open customer modal

function openCustomerModal() {
    editingCustomerId = null;

    customerForm.reset();

    document.getElementById("customerModalTitle")
        .textContent = "Add Customer";

    customerModal.classList.add("show");
}


// Open subscription modal

function openSubscriptionModal() {
    if (getData(CUSTOMER_KEY).length === 0) {
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

    subscriptionModal.classList.add("show");
}


// 12. INITIALIZE DASHBOARD

export function initSubscriptions() {
    customerTableBody = document.getElementById("customerTableBody");
    subscriptionTableBody = document.getElementById("subscriptionTableBody");
    customerModal = document.getElementById("customerModal");
    subscriptionModal = document.getElementById("subscriptionModal");
    customerForm = document.getElementById("customerForm");
    subscriptionForm = document.getElementById("subscriptionForm");
    tabButtons = [...document.querySelectorAll(".tab-btn")];

    customerForm.addEventListener("submit", handleCustomerSubmit);
    subscriptionForm.addEventListener("submit", handleSubscriptionSubmit);
    document.getElementById("customerSearch").addEventListener("input", function() {
        const searchValue = this.value.toLowerCase();
        customerTableBody.querySelectorAll("tr").forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(searchValue) ? "" : "none";
        });
    });
    document.getElementById("subscriptionSearch").addEventListener("input", function() {
        const searchValue = this.value.toLowerCase();
        subscriptionTableBody.querySelectorAll("tr").forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(searchValue) ? "" : "none";
        });
    });
    tabButtons.forEach(button => button.addEventListener("click", function() {
        const selectedTab = this.dataset.tab;
        tabButtons.forEach(tab => tab.classList.toggle("active", tab === this));
        document.querySelectorAll(".tab-content").forEach(content => {
            content.classList.toggle("active", content.id === selectedTab);
        });
    }));

    document.getElementById("addCustomerBtn").addEventListener("click", openCustomerModal);
    document.getElementById("addCustomerBtn2").addEventListener("click", openCustomerModal);
    document.getElementById("addSubscriptionBtn").addEventListener("click", openSubscriptionModal);
    document.getElementById("closeCustomerModal").addEventListener("click", () => customerModal.classList.remove("show"));
    document.getElementById("cancelCustomer").addEventListener("click", () => customerModal.classList.remove("show"));
    document.getElementById("closeSubscriptionModal").addEventListener("click", () => subscriptionModal.classList.remove("show"));
    document.getElementById("cancelSubscription").addEventListener("click", () => subscriptionModal.classList.remove("show"));

    displayCustomers();
    displaySubscriptions();
    updateCustomerDropdown();
    updatePlanDropdown();
}
