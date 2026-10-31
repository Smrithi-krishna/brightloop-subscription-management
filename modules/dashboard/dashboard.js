
import {
    STORAGE_KEYS,
    getData
} from "../../shared/store.js";

/* =================================
   BRIGHTLOOP DASHBOARD
================================= */

export function initDashboard(container) {

    // Read data from shared localStorage
    const subscriptions = getData(STORAGE_KEYS.SUBSCRIPTIONS);
    const invoices = getData(STORAGE_KEYS.INVOICES);
    const payments = getData(STORAGE_KEYS.PAYMENTS);
    const customers = getData(STORAGE_KEYS.CUSTOMERS);

    // Currency formatter
    const formatMoney = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }).format(Number(amount) || 0);
    };

    // Date formatter
    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    // Get current date
    const today = new Date();
    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    const dateElement = container.querySelector("#dashboard-date");

    if (dateElement) {
        dateElement.textContent = today.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    // Successful payments only
    const successfulPayments = payments.filter(
        payment => payment.status === "Successful"
    );

    // 1. Active Subscriptions
    const activeSubscriptions = subscriptions.filter(
        subscription => subscription.status === "Active"
    );

    // 2. Revenue Collected
    const revenueCollected = successfulPayments.reduce(
        (total, payment) => {
            return total + Number(payment.amount || 0);
        },
        0
    );

    // 3. Outstanding Amount
    const outstandingAmount = invoices.reduce((total, invoice) => {

        const invoicePayments = successfulPayments
            .filter(payment => payment.invoiceId === invoice.id)
            .reduce((sum, payment) => {
                return sum + Number(payment.amount || 0);
            }, 0);

        const remaining = Math.max(
            0,
            Number(invoice.amount || 0) - invoicePayments
        );

        return total + remaining;

    }, 0);

    // 4. Overdue Invoices
    const overdueInvoices = invoices.filter(invoice => {

        if (invoice.status === "Paid") return false;

        return invoice.dueDate &&
            invoice.dueDate < todayString;

    });

    // Update dashboard statistics
    const updateText = (selector, value) => {
        const element = container.querySelector(selector);

        if (element) {
            element.textContent = value;
        }
    };

    updateText(
        "#active-subscriptions",
        activeSubscriptions.length
    );

    updateText(
        "#revenue-collected",
        formatMoney(revenueCollected)
    );

    updateText(
        "#outstanding-amount",
        formatMoney(outstandingAmount)
    );

    updateText(
        "#overdue-invoices",
        overdueInvoices.length
    );

    // 5. Invoice Overview
    const paidInvoices = invoices.filter(
        invoice => invoice.status === "Paid"
    );

    const pendingInvoices = invoices.filter(
        invoice => invoice.status !== "Paid"
    );

    updateText("#total-invoices", invoices.length);
    updateText("#paid-invoices", paidInvoices.length);
    updateText("#pending-invoices", pendingInvoices.length);

    // 6. Recent Subscriptions
    const recentSubscriptions = [...subscriptions]
        .sort((a, b) => {
            return new Date(b.createdAt || 0) -
                   new Date(a.createdAt || 0);
        })
        .slice(0, 5);

    const subscriptionBody = container.querySelector(
        "#recent-subscriptions"
    );

    if (subscriptionBody) {

        if (recentSubscriptions.length === 0) {

            subscriptionBody.innerHTML = `
                <tr>
                    <td colspan="3">No subscriptions yet.</td>
                </tr>
            `;

        } else {

            subscriptionBody.innerHTML = recentSubscriptions.map(
                subscription => {

                    const customer = customers.find(
                        item => item.id === subscription.customerId
                    );

                    return `
                        <tr>
                            <td>${escapeHTML(subscription.id)}</td>
                            <td>${escapeHTML(customer?.name || "Unknown customer")}</td>
                            <td>${escapeHTML(subscription.status || "Draft")}</td>
                        </tr>
                    `;

                }
            ).join("");

        }
    }

    // 7. Recent Successful Payments
    const recentPayments = [...successfulPayments]
        .sort((a, b) => {
            return new Date(b.date || 0) -
                   new Date(a.date || 0);
        })
        .slice(0, 5);

    const paymentBody = container.querySelector(
        "#recent-payments"
    );

    if (paymentBody) {

        if (recentPayments.length === 0) {

            paymentBody.innerHTML = `
                <tr>
                    <td colspan="3">No payments yet.</td>
                </tr>
            `;

        } else {

            paymentBody.innerHTML = recentPayments.map(
                payment => {

                    return `
                        <tr>
                            <td>${escapeHTML(payment.invoiceId || "N/A")}</td>
                            <td>${formatMoney(payment.amount)}</td>
                            <td>${escapeHTML(payment.method || "N/A")}</td>
                        </tr>
                    `;

                }
            ).join("");

        }
    }

}

/* Escape user-provided values before inserting into HTML */
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}
