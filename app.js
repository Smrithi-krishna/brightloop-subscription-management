
import { initProducts } from "./modules/products/products.js";
import { initSubscriptions } from "./modules/subscriptions/subscriptions.js";
import { initBilling } from "./modules/billing/billing.js";
import { initDashboard } from "./modules/dashboard/dashboard.js";

// Page configuration. Module HTML is injected into the shell, then initialized
// explicitly so navigation works after the initial document has loaded.
const pages = {
    dashboard: {
        title: "Dashboard",
        html: "./modules/dashboard/dashboard.html",
        init: initDashboard
    },

    products: {
        title: "Products & Plans",
        html: "./modules/products/products.html",
        init: initProducts
    },

    subscriptions: {
        title: "Subscriptions",
        html: "./modules/subscriptions/subscriptions.html",
        init: initSubscriptions
    },

    billing: {
        title: "Billing & Payments",
        html: "./modules/billing/billing.html",
        init: initBilling
    }
};


// Main page container
const pageContent = document.getElementById("page-content");
const currentPageTitle = document.getElementById("current-page");


// Load a page
async function loadPage(pageName) {

    const page = pages[pageName];

    if (!page) {
        console.error("Page not found:", pageName);
        return;
    }

    // Update sidebar selection
    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    currentPageTitle.textContent = page.title;

    // Loading state
    pageContent.innerHTML = `
        <div class="loading-message">
            Loading ${page.title}...
        </div>
    `;

    try {

        // Load module HTML
        const response = await fetch(page.html);

        if (!response.ok) {
            throw new Error(`Could not load ${page.html}`);
        }

        const html = await response.text();

        pageContent.innerHTML = html;

        // Initialize the module
        page.init(pageContent);

    } catch (error) {

        console.error("Page loading error:", error);

        pageContent.innerHTML = `
            <div class="error-message">
                <h2>Unable to load this page</h2>
                <p>${page.title} could not be loaded.</p>
                <small>Check whether the module files have been created.</small>
            </div>
        `;
    }
}


// Sidebar navigation
document.querySelector(".navigation").addEventListener("click", event => {
    const button = event.target.closest(".nav-item");
    if (button) {
        loadPage(button.dataset.page);
    }
});


// Load dashboard when application starts
loadPage("dashboard");
