import { getData, saveData, STORAGE_KEYS } from "./store.js";

export const SESSION_KEY = "bl_session";

const DEMO_USERS = {
    "smrithi krishna": { name: "Smrithi Krishna", role: "Admin", password: "admin123" },
    "letchu": { name: "Letchu", role: "Customer", password: "customer123" }
};

export function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (error) {
        console.error("Unable to read demo session:", error);
        return null;
    }
}

export function isAdmin() {
    return getCurrentUser()?.role === "Admin";
}

export function isCustomer() {
    return getCurrentUser()?.role === "Customer";
}

export function login(name, password) {
    const identity = DEMO_USERS[String(name).trim().toLowerCase()];
    if (!identity || identity.password !== password) {
        throw new Error("Use a valid demo identity and password.");
    }

    const user = { name: identity.name, role: identity.role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    ensureCustomerRecord(user);
    return user;
}

export function signup(name, password, role = "Customer") {
    const normalizedName = String(name).trim();
    if (!normalizedName || String(password).length < 4) {
        throw new Error("Enter a name and a password with at least 4 characters.");
    }
    if (role === "Admin") {
        throw new Error("Admin accounts are limited to the predefined demo identity.");
    }

    const user = { name: normalizedName, role: "Customer" };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    ensureCustomerRecord(user);
    return user;
}

export function logout() {
    localStorage.removeItem(SESSION_KEY);
}

export function ensureCustomerRecord(user = getCurrentUser()) {
    if (!user || user.role !== "Customer") return null;
    const customers = getData(STORAGE_KEYS.CUSTOMERS);
    const existing = customers.find(customer =>
        String(customer.name).toLowerCase() === String(user.name).toLowerCase()
    );
    if (existing) return existing;

    const customer = {
        id: `CUS-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        name: user.name,
        email: `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@demo.brightloop.local`,
        createdAt: new Date().toISOString().slice(0, 10)
    };
    saveData(STORAGE_KEYS.CUSTOMERS, [...customers, customer]);
    return customer;
}

export function seedDemoCatalogue() {
    const products = getData(STORAGE_KEYS.PRODUCTS);
    if (products.length) return;

    const catalogue = [
        ["Brightloop CRM", "SaaS", "A customer relationship management platform to manage contacts, track leads and organize sales activities.", [
            ["Starter", 499, ["Contact management", "Lead tracking"]],
            ["Professional", 999, ["Sales pipeline", "Team collaboration", "Reports"]],
            ["Enterprise", 1199, ["Automation", "Custom reports", "Priority support"]]
        ]],
        ["Brightloop Flow", "SaaS", "A productivity and workflow management platform for organizing tasks, projects and team activities.", [
            ["Basic", 299, ["Personal task management", "Personal boards"]],
            ["Team", 799, ["Team workspaces", "Task assignments", "Deadlines"]],
            ["Business", 1499, ["Multiple projects", "Reports", "Automation"]]
        ]],
        ["Brightloop Cloud", "Service", "A cloud storage and file management service.", [
            ["Personal", 199, ["100 GB storage"]],
            ["Professional", 499, ["500 GB storage", "File sharing"]],
            ["Business", 999, ["2 TB storage", "Team access", "Advanced controls"]]
        ]],
        ["Premium Analytics", "Add-on", "An additional analytics service that helps customers understand their business performance through insights and reports.", [
            ["Premium Analytics Add-on", 299, ["Detailed reports", "Usage statistics", "Performance dashboards"]]
        ]]
    ];

    const today = new Date().toISOString().slice(0, 10);
    const seededProducts = catalogue.map(([name, type, notes]) => ({
        id: `PROD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        name, type, notes, price: 0, cost: 0, variants: [], createdAt: today
    }));
    const seededPlans = catalogue.flatMap(([name, , , entries], productIndex) =>
        entries.map(([planName, price, features]) => ({
            id: `PLAN-${Date.now()}-${productIndex}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
            productId: seededProducts[productIndex].id,
            name: planName,
            interval: "monthly",
            price,
            minQuantity: 1,
            startDate: today,
            endDate: "",
            status: "active",
            features
        }))
    );
    saveData(STORAGE_KEYS.PRODUCTS, seededProducts);
    saveData(STORAGE_KEYS.PLANS, seededPlans);
}
