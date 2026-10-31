const STORAGE_KEYS = {
    invoices: "bl_invoices",
    payments: "bl_payments",
    subscriptions: "bl_subscriptions",
    customers: "bl_customers"
};



function readData(key) {

    try {

        if (typeof getData === "function") {

            const data = getData(key);

            return Array.isArray(data) ? data : [];

        }

    } catch (error) {

        console.warn("Shared getData failed:", error);

    }


    try {

        const raw = localStorage.getItem(key);

        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);

        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {

        console.error("Could not read:", key, error);

        return [];

    }

}


function writeData(key, data) {

    try {

        if (typeof saveData === "function") {

            saveData(key, data);

            return true;

        }

    } catch (error) {

        console.warn("Shared saveData failed:", error);

    }


    try {

        localStorage.setItem(key, JSON.stringify(data));

        return true;

    } catch (error) {

        console.error("Could not save:", key, error);

        return false;

    }

}


function addSharedRecord(key, record) {

    try {

        if (typeof addRecord === "function") {

            addRecord(key, record);

            return true;

        }

    } catch (error) {

        console.warn("Shared addRecord failed:", error);

    }


    const data = readData(key);

    data.push(record);

    return writeData(key, data);

}


function updateSharedRecord(key, id, updates) {

    try {

        if (typeof updateRecord === "function") {

            updateRecord(key, id, updates);

            return true;

        }

    } catch (error) {

        console.warn("Shared updateRecord failed:", error);

    }


    const data = readData(key);

    const index = data.findIndex(item => String(item.id) === String(id));

    if (index === -1) {
        return false;
    }

    data[index] = {
        ...data[index],
        ...updates
    };

    return writeData(key, data);

}


let invoices = [];
let payments = [];
let subscriptions = [];
let customers = [];

let selectedInvoiceId = null;
let selectedPaymentInvoiceId = null;
let selectedPayNowInvoiceId = null;


document.addEventListener("DOMContentLoaded", () => {

    setDefaultDates();

    loadData();

    updateOverdueInvoices();

    renderDashboard();

    renderInvoices();

    populateSubscriptionSelect();

    setupEventListeners();

});


function loadData() {

    invoices = readData(STORAGE_KEYS.invoices);

    payments = readData(STORAGE_KEYS.payments);

    subscriptions = readData(STORAGE_KEYS.subscriptions);

    customers = readData(STORAGE_KEYS.customers);

    
    if (subscriptions.length === 0) {

        const demoCustomerId = "DEMO-CUSTOMER-001";
        const plans = [
            {
                id: "DEMO-CRM-STARTER",
                productName: "Brightloop CRM",
                planName: "Starter",
                unitPrice: 499,
                description: "Business software",
                features: "Contact management, lead tracking"
            },
            {
                id: "DEMO-CRM-PROFESSIONAL",
                productName: "Brightloop CRM",
                planName: "Professional",
                unitPrice: 999,
                description: "Business software",
                features: "Sales pipeline, team collaboration, reports"
            },
            {
                id: "DEMO-CRM-ENTERPRISE",
                productName: "Brightloop CRM",
                planName: "Enterprise",
                unitPrice: 1999,
                description: "Business software",
                features: "Advanced automation, custom reports, priority support"
            },
            {
                id: "DEMO-FLOW-BASIC",
                productName: "Brightloop Flow",
                planName: "Basic",
                unitPrice: 399,
                description: "Productivity software",
                features: "Task management, personal boards"
            },
            {
                id: "DEMO-FLOW-TEAM",
                productName: "Brightloop Flow",
                planName: "Team",
                unitPrice: 799,
                description: "Productivity software",
                features: "Team workspaces, task assignments, deadlines"
            },
            {
                id: "DEMO-FLOW-BUSINESS",
                productName: "Brightloop Flow",
                planName: "Business",
                unitPrice: 1499,
                description: "Productivity software",
                features: "Multiple projects, advanced reports, automation"
            },
            {
                id: "DEMO-CLOUD-PERSONAL",
                productName: "Brightloop Cloud",
                planName: "Personal",
                unitPrice: 199,
                description: "Cloud storage",
                features: "100 GB storage"
            },
            {
                id: "DEMO-CLOUD-PROFESSIONAL",
                productName: "Brightloop Cloud",
                planName: "Professional",
                unitPrice: 499,
                description: "Cloud storage",
                features: "500 GB storage, file sharing"
            },
            {
                id: "DEMO-CLOUD-BUSINESS",
                productName: "Brightloop Cloud",
                planName: "Business",
                unitPrice: 999,
                description: "Cloud storage",
                features: "2 TB storage, team access, advanced controls"
            },
            {
                id: "DEMO-PREMIUM-ANALYTICS",
                productName: "Premium Analytics",
                planName: "Optional add-on",
                unitPrice: 299,
                description: "Optional add-on for eligible plans",
                features: "Detailed reports, usage statistics, performance dashboards"
            }
        ];

        subscriptions = plans.map(plan => ({
            ...plan,
            customerId: demoCustomerId,
            quantity: 1,
            taxRate: 18,
            status: "Active"
        }));

        if (!customers.some(customer => String(customer.id) === demoCustomerId)) {
            customers = [
                ...customers,
                {
                    id: demoCustomerId,
                    name: "Demo Customer"
                }
            ];
        }

    }

}


function getTodayDate() {

    const today = new Date();

    return today.toISOString().split("T")[0];

}


function getFutureDate(days) {

    const date = new Date();

    date.setDate(date.getDate() + days);

    return date.toISOString().split("T")[0];

}


function setDefaultDates() {

    const issueDate = document.getElementById("invoiceIssueDate");

    const dueDate = document.getElementById("invoiceDueDate");

    const paymentDate = document.getElementById("paymentDate");


    if (issueDate) {
        issueDate.value = getTodayDate();
    }

    if (dueDate) {
        dueDate.value = getFutureDate(30);
    }

    if (paymentDate) {
        paymentDate.value = getTodayDate();
    }

}


function generateId(prefix) {

    return (
        prefix +
        "-" +
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).substring(2, 8)
    ).toUpperCase();

}


function generateInvoiceNumber() {

    const year = new Date().getFullYear();

    let highestNumber = 0;

    invoices.forEach(invoice => {

        const number = String(invoice.invoiceNumber || invoice.id || "");

        const match = number.match(/(\d+)$/);

        if (match) {

            const parsed = parseInt(match[1], 10);

            if (parsed > highestNumber) {
                highestNumber = parsed;
            }

        }

    });


    let nextNumber = highestNumber + 1;

    let invoiceNumber =
        `INV-${year}-${String(nextNumber).padStart(4, "0")}`;


    while (
        invoices.some(
            invoice =>
                invoice.invoiceNumber === invoiceNumber ||
                invoice.id === invoiceNumber
        )
    ) {

        nextNumber++;

        invoiceNumber =
            `INV-${year}-${String(nextNumber).padStart(4, "0")}`;

    }


    return invoiceNumber;

}


function firstDefined(object, fields, fallback = "") {

    for (const field of fields) {

        if (
            object &&
            object[field] !== undefined &&
            object[field] !== null &&
            object[field] !== ""
        ) {

            return object[field];

        }

    }

    return fallback;

}


function toNumber(value, fallback = 0) {

    const number = Number(value);

    return Number.isFinite(number) ? number : fallback;

}


function roundMoney(value) {

    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;

}


function getCustomer(customerId) {

    return customers.find(
        customer =>
            String(customer.id) === String(customerId)
    );

}


function getCustomerName(customerId) {

    const customer = getCustomer(customerId);

    if (!customer) {
        return "Unknown Customer";
    }

    return firstDefined(
        customer,
        [
            "name",
            "customerName",
            "companyName",
            "fullName"
        ],
        "Unknown Customer"
    );

}


function getSubscriptionCustomerId(subscription) {

    return firstDefined(
        subscription,
        [
            "customerId",
            "customerID",
            "customer_id"
        ],
        ""
    );

}


function getSubscriptionProductName(subscription) {

    return firstDefined(
        subscription,
        [
            "productName",
            "product",
            "productTitle",
            "name"
        ],
        "Brightloop Software"
    );

}


function getSubscriptionPlanName(subscription) {

    return firstDefined(
        subscription,
        [
            "planName",
            "plan",
            "planTitle"
        ],
        "Standard Plan"
    );

}


function getSubscriptionQuantity(subscription) {

    return Math.max(
        1,
        toNumber(
            firstDefined(
                subscription,
                [
                    "quantity",
                    "qty",
                    "seats",
                    "users"
                ],
                1
            ),
            1
        )
    );

}


function getSubscriptionPrice(subscription) {

    return toNumber(
        firstDefined(
            subscription,
            [
                "unitPrice",
                "price",
                "amount",
                "monthlyPrice",
                "planPrice",
                "subscriptionPrice"
            ],
            0
        ),
        0
    );

}


function getSubscriptionTaxRate(subscription) {

    return toNumber(
        firstDefined(
            subscription,
            [
                "taxRate",
                "tax",
                "gst",
                "gstRate"
            ],
            18
        ),
        18
    );

}


function getSubscriptionDiscount(subscription) {

    return toNumber(
        firstDefined(
            subscription,
            [
                "discount",
                "discountAmount"
            ],
            0
        ),
        0
    );

}


function isSubscriptionEligible(subscription) {

    const status = String(
        firstDefined(
            subscription,
            [
                "status",
                "subscriptionStatus"
            ],
            ""
        )
    ).toLowerCase();


    if (!status) {
        return true;
    }


    return (
        status === "active" ||
        status === "confirmed" ||
        status === "running"
    );

}


function invoiceAlreadyExists(subscriptionId, periodStart, periodEnd) {

    return invoices.some(invoice => {

        if (
            String(invoice.subscriptionId) !==
            String(subscriptionId)
        ) {
            return false;
        }


        if (
            !invoice.billingPeriodStart &&
            !invoice.billingPeriodEnd
        ) {

            return true;

        }


        return (
            invoice.billingPeriodStart === periodStart &&
            invoice.billingPeriodEnd === periodEnd
        );

    });

}


function getBillingPeriod(subscription, issueDate) {

    const start =
        firstDefined(
            subscription,
            [
                "billingPeriodStart",
                "periodStart",
                "startDate"
            ],
            ""
        );


    const end =
        firstDefined(
            subscription,
            [
                "billingPeriodEnd",
                "periodEnd",
                "endDate"
            ],
            ""
        );


    if (start || end) {

        return {
            start: start || issueDate,
            end: end || issueDate
        };

    }


    const startDate = new Date(issueDate);

    const endDate = new Date(issueDate);

    endDate.setMonth(endDate.getMonth() + 1);

    endDate.setDate(endDate.getDate() - 1);


    return {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0]
    };

}


function calculateInvoice(subscription) {

    const productName =
        getSubscriptionProductName(subscription);

    const planName =
        getSubscriptionPlanName(subscription);

    const quantity =
        getSubscriptionQuantity(subscription);

    const unitPrice =
        getSubscriptionPrice(subscription);

    const taxRate =
        getSubscriptionTaxRate(subscription);

    const discount =
        getSubscriptionDiscount(subscription);


    const lineSubtotal =
        roundMoney(quantity * unitPrice);


    const subtotal =
        lineSubtotal;


    const discountAmount =
        Math.min(
            roundMoney(discount),
            subtotal
        );


    const taxableAmount =
        Math.max(
            0,
            roundMoney(subtotal - discountAmount)
        );


    const taxAmount =
        roundMoney(
            taxableAmount * taxRate / 100
        );


    const total =
        roundMoney(
            taxableAmount + taxAmount
        );


    return {

        items: [
            {
                productId:
                    firstDefined(
                        subscription,
                        ["productId"],
                        ""
                    ),

                productName,

                planName,

                quantity,

                unitPrice,

                discount: discountAmount,

                taxRate,

                lineTotal: lineSubtotal
            }
        ],

        subtotal,

        discount: discountAmount,

        tax: taxAmount,

        taxRate,

        totalAmount: total

    };

}


function createInvoiceFromSubscription(
    subscriptionId,
    issueDate,
    dueDate
) {

    const subscription =
        subscriptions.find(
            item =>
                String(item.id) ===
                String(subscriptionId)
        );


    if (!subscription) {

        showToast(
            "Subscription could not be found.",
            "error"
        );

        return null;

    }


    if (!isSubscriptionEligible(subscription)) {

        showToast(
            "Only active or confirmed subscriptions can generate invoices.",
            "error"
        );

        return null;

    }


    const period =
        getBillingPeriod(
            subscription,
            issueDate
        );


    
    if (
        invoiceAlreadyExists(
            subscriptionId,
            period.start,
            period.end
        )
    ) {

        showToast(
            "An invoice already exists for this subscription.",
            "error"
        );

        return null;

    }


    const calculation =
        calculateInvoice(subscription);


    const customerId =
        getSubscriptionCustomerId(subscription);


    const invoiceNumber =
        generateInvoiceNumber();


    const invoice = {

        id: invoiceNumber,

        invoiceNumber,

        subscriptionId,

        customerId,

        billingPeriodStart:
            period.start,

        billingPeriodEnd:
            period.end,

        items:
            calculation.items,

        subtotal:
            calculation.subtotal,

        discount:
            calculation.discount,

        tax:
            calculation.tax,

        taxRate:
            calculation.taxRate,

        totalAmount:
            calculation.totalAmount,

        amount:
            calculation.totalAmount,

        amountPaid: 0,

        amountDue:
            calculation.totalAmount,

        issueDate,

        dueDate,

        status: "Confirmed",

        paymentStatus: "Outstanding",

        createdAt:
            new Date().toISOString()

    };


    const saved =
        addSharedRecord(
            STORAGE_KEYS.invoices,
            invoice
        );


    if (!saved) {

        showToast(
            "Could not save invoice.",
            "error"
        );

        return null;

    }


    invoices.push(invoice);


    showToast(
        `${invoiceNumber} generated successfully.`
    );


    return invoice;

}


function updateOverdueInvoices() {

    const today =
        new Date(
            getTodayDate() + "T23:59:59"
        );


    invoices.forEach(invoice => {

        const paid =
            calculateAmountPaid(invoice.id);


        const total =
            getInvoiceTotal(invoice);


        const amountDue =
            Math.max(
                0,
                roundMoney(total - paid)
            );


        let updates = {};


        if (amountDue <= 0) {

            updates = {

                amountPaid: total,

                amountDue: 0,

                status: "Paid",

                paymentStatus: "Paid"

            };

        } else {

            const dueDate =
                new Date(
                    `${invoice.dueDate}T23:59:59`
                );


            if (dueDate < today) {

                updates = {

                    amountPaid: paid,

                    amountDue,

                    paymentStatus: "Overdue"

                };

            } else {

                updates = {

                    amountPaid: paid,

                    amountDue,

                    paymentStatus: "Outstanding"

                };

            }

        }


        if (
            Object.keys(updates).length > 0
        ) {

            updateSharedRecord(
                STORAGE_KEYS.invoices,
                invoice.id,
                updates
            );


            Object.assign(
                invoice,
                updates
            );

        }

    });

}


function getInvoiceTotal(invoice) {

    return toNumber(
        firstDefined(
            invoice,
            [
                "totalAmount",
                "amount"
            ],
            0
        ),
        0
    );

}


function calculateAmountPaid(invoiceId) {

    return roundMoney(
        payments
            .filter(
                payment =>
                    String(payment.invoiceId) ===
                    String(invoiceId) &&
                    String(payment.status || "Completed")
                        .toLowerCase() !==
                    "failed"
            )
            .reduce(
                (sum, payment) =>
                    sum + toNumber(payment.amount),
                0
            )
    );

}


function renderDashboard() {

    const totalInvoices =
        invoices.length;


    const totalBilled =
        invoices.reduce(
            (sum, invoice) =>
                sum + getInvoiceTotal(invoice),
            0
        );


    const totalCollected =
        invoices.reduce(
            (sum, invoice) =>
                sum + calculateAmountPaid(invoice.id),
            0
        );


    const totalOutstanding =
        invoices.reduce(
            (sum, invoice) => {

                const due =
                    Math.max(
                        0,
                        getInvoiceTotal(invoice) -
                        calculateAmountPaid(invoice.id)
                    );

                return sum + due;

            },
            0
        );


    const totalOverdue =
        invoices.reduce(
            (sum, invoice) => {

                if (
                    invoice.paymentStatus !==
                    "Overdue"
                ) {
                    return sum;
                }


                return (
                    sum +
                    Math.max(
                        0,
                        getInvoiceTotal(invoice) -
                        calculateAmountPaid(invoice.id)
                    )
                );

            },
            0
        );


    setText(
        "totalInvoices",
        totalInvoices
    );

    setText(
        "totalBilled",
        formatCurrency(totalBilled)
    );

    setText(
        "totalOutstanding",
        formatCurrency(totalOutstanding)
    );

    setText(
        "totalOverdue",
        formatCurrency(totalOverdue)
    );

    setText(
        "totalCollected",
        formatCurrency(totalCollected)
    );

}


function renderInvoices() {

    const tbody =
        document.getElementById(
            "invoiceTableBody"
        );


    if (!tbody) {
        return;
    }


    const search =
        (
            document.getElementById(
                "invoiceSearch"
            )?.value || ""
        )
            .toLowerCase()
            .trim();


    const filter =
        document.getElementById(
            "invoiceFilter"
        )?.value || "all";


    const filtered =
        invoices.filter(invoice => {

            const customerName =
                getCustomerName(
                    invoice.customerId
                ).toLowerCase();


            const invoiceNumber =
                String(
                    invoice.invoiceNumber ||
                    invoice.id ||
                    ""
                ).toLowerCase();


            const subscription =
                getSubscriptionById(
                    invoice.subscriptionId
                );


            const subscriptionText =
                subscription
                    ? getSubscriptionProductName(
                        subscription
                    ).toLowerCase()
                    : "";


            const matchesSearch =
                !search ||
                invoiceNumber.includes(search) ||
                customerName.includes(search) ||
                subscriptionText.includes(search);


            const paymentStatus =
                invoice.paymentStatus ||
                getDerivedPaymentStatus(invoice);


            let matchesFilter = true;


            if (filter !== "all") {

                matchesFilter =
                    invoice.status === filter ||
                    paymentStatus === filter;

            }


            return (
                matchesSearch &&
                matchesFilter
            );

        });


    tbody.innerHTML = "";


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (filtered.length === 0) {

        emptyState.classList.add("show");

        return;

    }


    emptyState.classList.remove("show");


    filtered
        .sort(
            (a, b) =>
                new Date(
                    b.issueDate || b.createdAt
                ) -
                new Date(
                    a.issueDate || a.createdAt
                )
        )
        .forEach(invoice => {

            const row =
                document.createElement("tr");


            const customerName =
                getCustomerName(
                    invoice.customerId
                );


            const subscription =
                getSubscriptionById(
                    invoice.subscriptionId
                );


            const productName =
                subscription
                    ? getSubscriptionProductName(
                        subscription
                    )
                    : getInvoiceProductName(invoice);


            const paymentStatus =
                invoice.paymentStatus ||
                getDerivedPaymentStatus(invoice);


            const total =
                getInvoiceTotal(invoice);


            const paid =
                calculateAmountPaid(
                    invoice.id
                );


            const due =
                Math.max(
                    0,
                    total - paid
                );


            row.innerHTML = `

                <td>
                    <span class="invoice-number">
                        ${escapeHTML(
                            invoice.invoiceNumber ||
                            invoice.id
                        )}
                    </span>
                </td>

                <td>
                    <span class="customer-name">
                        ${escapeHTML(customerName)}
                    </span>
                </td>

                <td>
                    ${escapeHTML(productName)}
                </td>

                <td>
                    <span class="amount">
                        ${formatCurrency(total)}
                    </span>
                </td>

                <td>
                    ${formatDate(invoice.dueDate)}
                </td>

                <td>
                    ${statusBadge(invoice.status)}
                </td>

                <td>
                    ${statusBadge(paymentStatus)}
                    ${
                        paymentStatus !== "Paid"
                            ? `<div style="
                                font-size:10px;
                                color:#73778a;
                                margin-top:4px;
                              ">
                                Due ${formatCurrency(due)}
                              </div>`
                            : ""
                    }
                </td>

                <td>
                    <div class="action-buttons">

                        <button
                            class="small-btn"
                            onclick="openInvoice('${escapeAttribute(invoice.id)}')"
                        >
                            View
                        </button>

                        ${
                            due > 0
                                ? `
                                <button
                                    class="small-btn pay-btn"
                                    onclick="openPaymentModal('${escapeAttribute(invoice.id)}')"
                                >
                                    Pay
                                </button>
                                `
                                : ""
                        }

                    </div>
                </td>

            `;


            tbody.appendChild(row);

        });

}


function getSubscriptionById(id) {

    return subscriptions.find(
        subscription =>
            String(subscription.id) ===
            String(id)
    );

}


function getInvoiceProductName(invoice) {

    if (
        Array.isArray(invoice.items) &&
        invoice.items.length
    ) {

        return (
            invoice.items[0].productName ||
            "Subscription"
        );

    }

    return "Subscription";

}


function getDerivedPaymentStatus(invoice) {

    const total =
        getInvoiceTotal(invoice);


    const paid =
        calculateAmountPaid(invoice.id);


    if (paid >= total && total > 0) {
        return "Paid";
    }


    const dueDate =
        new Date(
            `${invoice.dueDate}T23:59:59`
        );


    if (dueDate < new Date()) {
        return "Overdue";
    }


    return "Outstanding";

}


function statusBadge(status) {

    const safeStatus =
        status || "Draft";


    const className =
        String(safeStatus)
            .toLowerCase()
            .replace(/\s+/g, "-");


    return `
        <span class="status status-${className}">
            ${escapeHTML(safeStatus)}
        </span>
    `;

}


function populateSubscriptionSelect() {

    const select =
        document.getElementById(
            "subscriptionSelect"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Select subscription
        </option>
    `;


    const eligible =
        subscriptions.filter(
            isSubscriptionEligible
        );

    
    const seenPlans = new Set();

    eligible.forEach(subscription => {

        const customerId =
            getSubscriptionCustomerId(
                subscription
            );


        const customerName =
            getCustomerName(
                customerId
            );


        const product =
            getSubscriptionProductName(
                subscription
            );


        const plan =
            getSubscriptionPlanName(
                subscription
            );

        const planKey = [
            customerId,
            product,
            plan,
            getSubscriptionPrice(subscription)
        ].join("|").toLowerCase();

        if (seenPlans.has(planKey)) {
            return;
        }

        seenPlans.add(planKey);

        const option =
            document.createElement("option");


        option.value =
            subscription.id;


        option.textContent =
            `${product} — ${plan} — ${customerName}`;


        select.appendChild(option);

    });

}


function showSubscriptionPreview(id) {

    const preview =
        document.getElementById(
            "subscriptionPreview"
        );


    const subscription =
        getSubscriptionById(id);


    if (!subscription) {

        preview.innerHTML = "";

        preview.classList.remove("show");

        return;

    }


    const customerId =
        getSubscriptionCustomerId(
            subscription
        );


    const customerName =
        getCustomerName(
            customerId
        );


    const product =
        getSubscriptionProductName(
            subscription
        );


    const plan =
        getSubscriptionPlanName(
            subscription
        );


    const quantity =
        getSubscriptionQuantity(
            subscription
        );


    const price =
        getSubscriptionPrice(
            subscription
        );


    const calculation =
        calculateInvoice(
            subscription
        );


    preview.innerHTML = `

        <div class="preview-title">
            ${escapeHTML(product)}
        </div>

        <div class="preview-row">
            <span>Customer</span>
            <strong>
                ${escapeHTML(customerName)}
            </strong>
        </div>

        <div class="preview-row">
            <span>Plan</span>
            <strong>
                ${escapeHTML(plan)}
            </strong>
        </div>

        ${subscription.description ? `
            <div class="preview-row">
                <span>Type</span>
                <strong>${escapeHTML(subscription.description)}</strong>
            </div>
        ` : ""}

        ${subscription.features ? `
            <div class="preview-row">
                <span>Features</span>
                <strong>${escapeHTML(subscription.features)}</strong>
            </div>
        ` : ""}

        <div class="preview-row">
            <span>Quantity</span>
            <strong>
                ${quantity}
            </strong>
        </div>

        <div class="preview-row">
            <span>Unit price</span>
            <strong>
                ${formatCurrency(price)}
            </strong>
        </div>

        <div class="preview-row">
            <span>Estimated total</span>
            <strong>
                ${formatCurrency(
                    calculation.totalAmount
                )}
            </strong>
        </div>

    `;


    preview.classList.add("show");

}


function openInvoice(invoiceId) {

    loadData();

    updateOverdueInvoices();

    const invoice =
        invoices.find(
            item =>
                String(item.id) ===
                String(invoiceId)
        );


    if (!invoice) {

        showToast(
            "Invoice not found.",
            "error"
        );

        return;

    }


    selectedInvoiceId =
        invoice.id;


    renderInvoiceDetails(invoice);


    document
        .getElementById("invoiceModal")
        .classList.add("show");

}


function renderInvoiceDetails(invoice) {

    const container =
        document.getElementById(
            "invoiceDetails"
        );


    const customer =
        getCustomer(
            invoice.customerId
        );


    const customerName =
        getCustomerName(
            invoice.customerId
        );


    const customerEmail =
        customer
            ? firstDefined(
                customer,
                [
                    "email",
                    "emailAddress"
                ],
                ""
            )
            : "";


    const subscription =
        getSubscriptionById(
            invoice.subscriptionId
        );


    const items =
        Array.isArray(invoice.items) &&
        invoice.items.length
            ? invoice.items
            : buildFallbackInvoiceItems(
                invoice,
                subscription
            );


    const total =
        getInvoiceTotal(invoice);


    const paid =
        calculateAmountPaid(
            invoice.id
        );


    const due =
        Math.max(
            0,
            roundMoney(total - paid)
        );


    const paymentStatus =
        due <= 0
            ? "Paid"
            : getDerivedPaymentStatus(
                invoice
            );


    container.innerHTML = `

        <div class="invoice-document"
             id="printInvoiceArea">

            <div class="invoice-top">

                <div>

                    <div class="company-name">
                        Brightloop Software
                    </div>

                    <p style="
                        margin:6px 0 0;
                        color:#73778a;
                        font-size:12px;
                    ">
                        Subscription Management Platform
                    </p>

                </div>


                <div class="invoice-title">

                    <h2>INVOICE</h2>

                    <p>
                        ${escapeHTML(
                            invoice.invoiceNumber ||
                            invoice.id
                        )}
                    </p>

                </div>

            </div>


            <div class="invoice-meta">

                <div class="meta-block">

                    <h4>Billed To</h4>

                    <p>
                        <strong>
                            ${escapeHTML(customerName)}
                        </strong>
                    </p>

                    ${
                        customerEmail
                            ? `
                                <p>
                                    ${escapeHTML(
                                        customerEmail
                                    )}
                                </p>
                              `
                            : ""
                    }

                </div>


                <div class="meta-block">

                    <h4>Invoice Information</h4>

                    <p>
                        Issue Date:
                        <strong>
                            ${formatDate(
                                invoice.issueDate
                            )}
                        </strong>
                    </p>

                    <p>
                        Due Date:
                        <strong>
                            ${formatDate(
                                invoice.dueDate
                            )}
                        </strong>
                    </p>

                    <p>
                        Status:
                        ${statusBadge(
                            invoice.status
                        )}
                    </p>

                </div>

            </div>


            <table class="invoice-items">

                <thead>

                    <tr>
                        <th>Product / Plan</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Tax</th>
                        <th>Total</th>
                    </tr>

                </thead>

                <tbody>

                    ${items.map(item => {

                        const lineTotal =
                            toNumber(
                                item.lineTotal
                            );


                        const itemTax =
                            roundMoney(
                                Math.max(
                                    0,
                                    (
                                        lineTotal -
                                        toNumber(
                                            item.discount
                                        )
                                    ) *
                                    toNumber(
                                        item.taxRate,
                                        18
                                    ) /
                                    100
                                )
                            );


                        return `

                            <tr>

                                <td>
                                    <strong>
                                        ${escapeHTML(
                                            item.productName ||
                                            "Subscription"
                                        )}
                                    </strong>

                                    ${
                                        item.planName
                                            ? `
                                                <div style="
                                                    color:#73778a;
                                                    font-size:11px;
                                                    margin-top:3px;
                                                ">
                                                    ${escapeHTML(
                                                        item.planName
                                                    )}
                                                </div>
                                              `
                                            : ""
                                    }
                                </td>

                                <td>
                                    ${toNumber(
                                        item.quantity,
                                        1
                                    )}
                                </td>

                                <td>
                                    ${formatCurrency(
                                        item.unitPrice
                                    )}
                                </td>

                                <td>
                                    ${formatCurrency(
                                        itemTax
                                    )}
                                </td>

                                <td>
                                    <strong>
                                        ${formatCurrency(
                                            lineTotal
                                        )}
                                    </strong>
                                </td>

                            </tr>

                        `;

                    }).join("")}

                </tbody>

            </table>


            <div class="invoice-total-section">

                <div class="invoice-totals">

                    <div class="total-row">

                        <span>Subtotal</span>

                        <strong>
                            ${formatCurrency(
                                invoice.subtotal ||
                                calculateFallbackSubtotal(
                                    items
                                )
                            )}
                        </strong>

                    </div>


                    <div class="total-row">

                        <span>Discount</span>

                        <strong>
                            -${formatCurrency(
                                invoice.discount || 0
                            )}
                        </strong>

                    </div>


                    <div class="total-row">

                        <span>Tax</span>

                        <strong>
                            ${formatCurrency(
                                invoice.tax || 0
                            )}
                        </strong>

                    </div>


                    <div class="total-row grand-total">

                        <span>Total</span>

                        <strong>
                            ${formatCurrency(total)}
                        </strong>

                    </div>

                </div>

            </div>


            <div class="invoice-payment-info">

                <strong>
                    Payment Summary
                </strong>

                <div style="
                    display:flex;
                    justify-content:space-between;
                    margin-top:8px;
                ">

                    <span>
                        Paid:
                        <strong>
                            ${formatCurrency(paid)}
                        </strong>
                    </span>

                    <span>
                        Amount Due:
                        <strong>
                            ${formatCurrency(due)}
                        </strong>
                    </span>

                    <span>
                        ${statusBadge(
                            paymentStatus
                        )}
                    </span>

                </div>

            </div>


            ${
                invoice.billingPeriodStart
                    ? `
                        <div style="
                            margin-top:12px;
                            font-size:11px;
                            color:#73778a;
                        ">
                            Billing period:
                            ${formatDate(
                                invoice.billingPeriodStart
                            )}
                            –
                            ${formatDate(
                                invoice.billingPeriodEnd
                            )}
                        </div>
                      `
                    : ""
            }


            <div class="invoice-footer">

                Thank you for choosing Brightloop Software.

                <br>

                This invoice is generated by the Brightloop
                Subscription Management System.

            </div>


            <div class="invoice-actions no-print">

                ${
                    due > 0
                        ? `
                            <button
                                class="secondary-btn"
                                onclick="openPaymentModal('${escapeAttribute(invoice.id)}')"
                            >
                                Record Payment
                            </button>

                            <button
                                class="secondary-btn"
                                onclick="openPayNowModal('${escapeAttribute(invoice.id)}')"
                            >
                                Demo Pay Now
                            </button>
                          `
                        : ""
                }


                <button
                    class="secondary-btn"
                    onclick="printInvoice()"
                >
                    Print Invoice
                </button>


                <button
                    class="primary-btn"
                    onclick="sendInvoiceDemo('${escapeAttribute(invoice.id)}')"
                >
                    Send Invoice
                </button>

            </div>

        </div>

    `;

}




function buildFallbackInvoiceItems(
    invoice,
    subscription
) {

    if (!subscription) {

        return [
            {
                productName: "Subscription",
                planName: "",
                quantity: 1,
                unitPrice: getInvoiceTotal(invoice),
                discount: 0,
                taxRate: 0,
                lineTotal: getInvoiceTotal(invoice)
            }
        ];

    }


    return calculateInvoice(
        subscription
    ).items;

}




function calculateFallbackSubtotal(items) {

    return roundMoney(
        items.reduce(
            (sum, item) =>
                sum +
                toNumber(item.lineTotal),
            0
        )
    );

}




function openPaymentModal(invoiceId) {

    loadData();

    updateOverdueInvoices();

    const invoice =
        invoices.find(
            item =>
                String(item.id) ===
                String(invoiceId)
        );


    if (!invoice) {

        showToast(
            "Invoice not found.",
            "error"
        );

        return;

    }


    const total =
        getInvoiceTotal(invoice);


    const paid =
        calculateAmountPaid(
            invoice.id
        );


    const due =
        Math.max(
            0,
            roundMoney(total - paid)
        );


    if (due <= 0) {

        showToast(
            "This invoice is already fully paid.",
            "error"
        );

        return;

    }


    selectedPaymentInvoiceId =
        invoice.id;


    setText(
        "paymentInvoiceLabel",
        `Invoice ${invoice.invoiceNumber || invoice.id}`
    );


    setText(
        "paymentInvoiceTotal",
        formatCurrency(total)
    );


    setText(
        "paymentAlreadyPaid",
        formatCurrency(paid)
    );


    setText(
        "paymentAmountDue",
        formatCurrency(due)
    );


    document.getElementById(
        "paymentAmount"
    ).value = due.toFixed(2);


    document.getElementById(
        "paymentDate"
    ).value = getTodayDate();


    document.getElementById(
        "paymentNotes"
    ).value = "";


    document
        .getElementById("paymentModal")
        .classList.add("show");

}




function recordPayment() {

    if (!selectedPaymentInvoiceId) {

        showToast(
            "No invoice selected.",
            "error"
        );

        return;

    }


    loadData();


    const invoice =
        invoices.find(
            item =>
                String(item.id) ===
                String(selectedPaymentInvoiceId)
        );


    if (!invoice) {

        showToast(
            "Invoice not found.",
            "error"
        );

        return;

    }


    const total =
        getInvoiceTotal(invoice);


    const alreadyPaid =
        calculateAmountPaid(
            invoice.id
        );


    const amountInput =
        document.getElementById(
            "paymentAmount"
        );


    const amount =
        roundMoney(
            toNumber(
                amountInput.value,
                0
            )
        );


    if (amount <= 0) {

        showToast(
            "Enter a valid payment amount.",
            "error"
        );

        return;

    }


    const amountDue =
        Math.max(
            0,
            roundMoney(
                total - alreadyPaid
            )
        );


    if (amount > amountDue) {

        showToast(
            "Payment cannot exceed the outstanding amount.",
            "error"
        );

        return;

    }


    if (amountDue <= 0) {

        showToast(
            "This invoice is already paid.",
            "error"
        );

        return;

    }


    const method =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        )?.value || "UPI";


    const date =
        document.getElementById(
            "paymentDate"
        ).value ||
        getTodayDate();


    const notes =
        document.getElementById(
            "paymentNotes"
        ).value.trim();


    const payment = {

        id:
            generateId("PAY"),

        invoiceId:
            invoice.id,

        amount,

        method,

        date,

        status:
            "Completed",

        notes,

        demo:
            true,

        createdAt:
            new Date().toISOString()

    };


    const saved =
        addSharedRecord(
            STORAGE_KEYS.payments,
            payment
        );


    if (!saved) {

        showToast(
            "Could not save payment.",
            "error"
        );

        return;

    }


    payments.push(payment);


    const newPaid =
        roundMoney(
            alreadyPaid + amount
        );


    const newDue =
        Math.max(
            0,
            roundMoney(
                total - newPaid
            )
        );


    const fullyPaid =
        newDue <= 0;


    const updates = {

        amountPaid:
            newPaid,

        amountDue:
            newDue,

        status:
            fullyPaid
                ? "Paid"
                : invoice.status === "Draft"
                    ? "Confirmed"
                    : invoice.status,

        paymentStatus:
            fullyPaid
                ? "Paid"
                : (
                    new Date(
                        `${invoice.dueDate}T23:59:59`
                    ) < new Date()
                        ? "Overdue"
                        : "Outstanding"
                )

    };


    updateSharedRecord(
        STORAGE_KEYS.invoices,
        invoice.id,
        updates
    );


    Object.assign(
        invoice,
        updates
    );


    closeModal(
        "paymentModal"
    );


    showToast(
        fullyPaid
            ? "Invoice marked as paid."
            : "Payment recorded successfully."
    );


    renderDashboard();

    renderInvoices();


    if (
        selectedInvoiceId &&
        String(selectedInvoiceId) ===
        String(invoice.id)
    ) {

        renderInvoiceDetails(invoice);

    }

}




function openPayNowModal(invoiceId) {

    loadData();

    const invoice =
        invoices.find(
            item =>
                String(item.id) ===
                String(invoiceId)
        );


    if (!invoice) {

        showToast(
            "Invoice not found.",
            "error"
        );

        return;

    }


    const total =
        getInvoiceTotal(invoice);


    const paid =
        calculateAmountPaid(
            invoice.id
        );


    const due =
        Math.max(
            0,
            roundMoney(
                total - paid
            )
        );


    if (due <= 0) {

        showToast(
            "This invoice is already paid.",
            "error"
        );

        return;

    }


    selectedPayNowInvoiceId =
        invoice.id;


    setText(
        "payNowAmount",
        formatCurrency(due)
    );


    document
        .getElementById("payNowModal")
        .classList.add("show");

}




function simulatePayment() {

    if (!selectedPayNowInvoiceId) {

        showToast(
            "No invoice selected.",
            "error"
        );

        return;

    }


    loadData();


    const invoice =
        invoices.find(
            item =>
                String(item.id) ===
                String(selectedPayNowInvoiceId)
        );


    if (!invoice) {

        showToast(
            "Invoice not found.",
            "error"
        );

        return;

    }


    const total =
        getInvoiceTotal(invoice);


    const alreadyPaid =
        calculateAmountPaid(
            invoice.id
        );


    const amountDue =
        Math.max(
            0,
            roundMoney(
                total - alreadyPaid
            )
        );


    if (amountDue <= 0) {

        showToast(
            "Invoice is already paid.",
            "error"
        );

        closeModal("payNowModal");

        return;

    }


    const method =
        document.querySelector(
            'input[name="payNowMethod"]:checked'
        )?.value || "UPI";


    const payment = {

        id:
            generateId("PAY"),

        invoiceId:
            invoice.id,

        amount:
            amountDue,

        method,

        date:
            getTodayDate(),

        status:
            "Completed",

        notes:
            "Customer-side simulated demo payment.",

        demo:
            true,

        createdAt:
            new Date().toISOString()

    };


    const saved =
        addSharedRecord(
            STORAGE_KEYS.payments,
            payment
        );


    if (!saved) {

        showToast(
            "Could not save demo payment.",
            "error"
        );

        return;

    }


    payments.push(payment);


    updateSharedRecord(
        STORAGE_KEYS.invoices,
        invoice.id,
        {

            amountPaid:
                total,

            amountDue:
                0,

            status:
                "Paid",

            paymentStatus:
                "Paid"

        }
    );


    Object.assign(
        invoice,
        {

            amountPaid:
                total,

            amountDue:
                0,

            status:
                "Paid",

            paymentStatus:
                "Paid"

        }
    );


    closeModal("payNowModal");


    showToast(
        "Demo payment successful — no real money was transferred."
    );


    renderDashboard();

    renderInvoices();


    if (
        selectedInvoiceId &&
        String(selectedInvoiceId) ===
        String(invoice.id)
    ) {

        renderInvoiceDetails(invoice);

    }

}




function printInvoice() {

    if (!selectedInvoiceId) {

        showToast(
            "Open an invoice first.",
            "error"
        );

        return;

    }


    window.print();

}




function sendInvoiceDemo(invoiceId) {

    const invoice =
        invoices.find(
            item =>
                String(item.id) ===
                String(invoiceId)
        );


    if (!invoice) {

        showToast(
            "Invoice not found.",
            "error"
        );

        return;

    }


    const invoiceNumber =
        invoice.invoiceNumber ||
        invoice.id;


    const customerName =
        getCustomerName(
            invoice.customerId
        );


    const message =
        `Invoice ${invoiceNumber} for ${customerName} is ready to be sent.`;


    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {

        navigator.clipboard
            .writeText(message)
            .catch(() => {});

    }


    showToast(
        `Demo invoice prepared for ${customerName}. No real email was sent.`
    );

}




function setupEventListeners() {

    const generateBtn =
        document.getElementById(
            "generateInvoiceBtn"
        );


    generateBtn.addEventListener(
        "click",
        () => {

            loadData();

            populateSubscriptionSelect();

            setDefaultDates();

            document
                .getElementById(
                    "generateModal"
                )
                .classList.add("show");

        }
    );


    const subscriptionSelect =
        document.getElementById(
            "subscriptionSelect"
        );


    subscriptionSelect.addEventListener(
        "change",
        event => {

            showSubscriptionPreview(
                event.target.value
            );

        }
    );


    document
        .getElementById(
            "createInvoiceBtn"
        )
        .addEventListener(
            "click",
            () => {

                const subscriptionId =
                    document.getElementById(
                        "subscriptionSelect"
                    ).value;


                const issueDate =
                    document.getElementById(
                        "invoiceIssueDate"
                    ).value ||
                    getTodayDate();


                const dueDate =
                    document.getElementById(
                        "invoiceDueDate"
                    ).value ||
                    getFutureDate(30);


                if (!subscriptionId) {

                    showToast(
                        "Select a subscription first.",
                        "error"
                    );

                    return;

                }


                if (dueDate < issueDate) {

                    showToast(
                        "Due date cannot be before the issue date.",
                        "error"
                    );

                    return;

                }


                const invoice =
                    createInvoiceFromSubscription(
                        subscriptionId,
                        issueDate,
                        dueDate
                    );


                if (invoice) {

                    closeModal(
                        "generateModal"
                    );

                    renderDashboard();

                    renderInvoices();

                    openInvoice(
                        invoice.id
                    );

                }

            }
        );


    document
        .getElementById(
            "recordPaymentBtn"
        )
        .addEventListener(
            "click",
            recordPayment
        );


    document
        .getElementById(
            "simulatePaymentBtn"
        )
        .addEventListener(
            "click",
            simulatePayment
        );


    document
        .getElementById(
            "invoiceSearch"
        )
        .addEventListener(
            "input",
            renderInvoices
        );


    document
        .getElementById(
            "invoiceFilter"
        )
        .addEventListener(
            "change",
            renderInvoices
        );


    document
        .querySelectorAll(
            "[data-close]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.dataset.close
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(overlay => {

            overlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target === overlay
                    ) {

                        overlay.classList.remove(
                            "show"
                        );

                    }

                }
            );

        });


    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }


            document
                .querySelectorAll(
                    ".modal-overlay.show"
                )
                .forEach(modal => {

                    modal.classList.remove(
                        "show"
                    );

                });

        }
    );

}




function closeModal(id) {

    const modal =
        document.getElementById(id);


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}




function formatCurrency(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(
        toNumber(value)
    );

}




function formatDate(value) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    if (Number.isNaN(date.getTime())) {
        return value;
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}




function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {
        element.textContent = value;
    }

}




let toastTimer = null;


function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (!toast || !toastMessage) {
        return;
    }


    toastMessage.textContent =
        message;


    if (type === "error") {

        toast.style.background =
            "#c53b3b";

    } else {

        toast.style.background =
            "#1d2232";

    }


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}




function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}




function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}




window.openInvoice =
    openInvoice;

window.openPaymentModal =
    openPaymentModal;

window.openPayNowModal =
    openPayNowModal;

window.printInvoice =
    printInvoice;

window.sendInvoiceDemo =
    sendInvoiceDemo;





window.billingDebug = function () {

    loadData();

    console.table(invoices);

    console.table(payments);

    console.table(subscriptions);

    console.table(customers);

};
