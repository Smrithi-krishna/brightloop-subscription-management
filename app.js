
import { initProducts } from "./modules/products/products.js";
import { initSubscriptions } from "./modules/subscriptions/subscriptions.js";
import { initBilling } from "./modules/billing/billings.js";
import { initDashboard } from "./modules/dashboard/dashboard.js";
import { getCurrentUser, login, logout, signup } from "./shared/auth.js";

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
const authScreen = document.getElementById("auth-screen");
const appContainer = document.querySelector(".app-container");
let activeUser = getCurrentUser();

function updateUserChrome() {
    activeUser = getCurrentUser();
    const name = activeUser?.name || "Guest";
    const role = activeUser?.role || "";
    document.getElementById("sidebar-user-name").textContent = name;
    document.getElementById("sidebar-user-role").textContent = role;
    document.getElementById("sidebar-avatar").textContent = name.charAt(0).toUpperCase();
    document.getElementById("topbar-user-name").textContent = name;
    document.getElementById("topbar-avatar").textContent = name.charAt(0).toUpperCase();
}

function showApp() {
    authScreen.classList.add("hidden");
    appContainer.classList.remove("hidden");
    updateUserChrome();
    loadPage("dashboard");
}

function showAuth() {
    appContainer.classList.add("hidden");
    authScreen.classList.remove("hidden");
}


// Load a page
async function loadPage(pageName) {

    const page = pages[pageName];

    if (!page) {
        console.error("Page not found:", pageName);
        return;
    }

    if (!activeUser) {
        showAuth();
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
        page.init(pageContent, activeUser);

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

document.getElementById("login-form").addEventListener("submit", event => {
    event.preventDefault();
    const error = document.getElementById("login-error");
    try {
        login(document.getElementById("login-name").value, document.getElementById("login-password").value);
        error.textContent = "";
        showApp();
    } catch (loginError) {
        error.textContent = loginError.message;
    }
});

document.getElementById("signupToggle").addEventListener("click", () => {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const isSignup = signupForm.classList.toggle("hidden") === false;
    loginForm.classList.toggle("hidden", isSignup);
    document.getElementById("signupToggle").textContent = isSignup
        ? "Back to demo sign in"
        : "Create a customer account";
});

document.getElementById("signup-form").addEventListener("submit", event => {
    event.preventDefault();
    const error = document.getElementById("signup-error");
    try {
        signup(
            document.getElementById("signup-name").value,
            document.getElementById("signup-password").value
        );
        error.textContent = "";
        showApp();
    } catch (signupError) {
        error.textContent = signupError.message;
    }
});

document.querySelectorAll("[data-demo-login]").forEach(button => {
    button.addEventListener("click", () => {
        const admin = button.dataset.demoLogin === "admin";
        document.getElementById("login-name").value = admin ? "Smrithi Krishna" : "Letchu";
        document.getElementById("login-password").value = admin ? "admin123" : "customer123";
        document.getElementById("login-form").requestSubmit();
    });
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    logout();
    activeUser = null;
    showAuth();
});

document.getElementById("mobileMenuBtn").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("open");
});

document.querySelector(".sidebar").addEventListener("click", event => {
    if (event.target.closest(".nav-item")) {
        document.querySelector(".sidebar").classList.remove("open");
    }
});

window.Brightloop = {
    navigate: pageName => loadPage(pageName),
    getCurrentUser
};

if (activeUser) showApp();
else showAuth();
