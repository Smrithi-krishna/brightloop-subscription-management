# Brightloop – Subscription Management System

A unified subscription management platform built for **Brightloop Software** to manage products, plans, subscriptions, invoices, payments, discounts, and business analytics in one place.

**Live Demo:** [Brightloop Subscription Management](https://smrithi-krishna.github.io/brightloop-subscription-management/)

**GitHub Repository:** [Brightloop Subscription Management](https://github.com/Vedavarsha-S/brightloop-subscription-management)

---

## 🚀 Problem Statement

Brightloop Software manages subscription-based products and services. Its existing process relies heavily on spreadsheets and manual work for:

- Tracking customer subscriptions
- Remembering renewals
- Creating invoices
- Matching payments with invoices
- Calculating recurring revenue
- Managing discounts

This can result in missed renewals, incorrect invoices, payment tracking difficulties, and limited visibility into business revenue.

## 💡 Our Solution

Brightloop Subscription Management System brings the complete subscription lifecycle into one platform.

The system allows businesses to:

**Manage Products → Create Plans → Manage Subscriptions → Generate Invoices → Track Payments → Apply Discounts → Monitor Revenue**

This provides a centralized view of the company's subscription and billing operations.

---

## ✨ Key Features

### 📊 Dashboard
Provides a centralized overview of business operations, including:

- Active subscriptions
- Revenue collected
- Payments received
- Outstanding invoices
- Overdue invoices
- Business analytics

### 📦 Product Management
Admins can manage subscription products and their details:

- Product name and type
- Sales price and cost price
- Notes and descriptions
- Product variants

### 💳 Plan Management
Create and manage subscription plans with:

- Pricing
- Billing frequency
- Minimum quantity
- Availability period
- Subscription lifecycle options

Supported billing frequencies:
- Daily
- Weekly
- Monthly
- Yearly

### 👥 Subscription Management

Manage the complete subscription lifecycle:

**Draft → Quotation → Confirmed → Active → Closed**

Each subscription contains customer, plan, product, quantity, pricing, tax, and payment information.

### 🧾 Invoice Management

Generate invoices from subscriptions with:

- Customer details
- Product lines
- Taxes
- Discounts
- Total amount
- Payment status

Invoice lifecycle:

**Draft → Confirmed → Paid**

### 🎁 Discount Management

Supports configurable discounts based on business rules:

- Percentage discounts
- Fixed-amount discounts
- Minimum purchase and quantity requirements
- Start and end dates
- Usage limits
- Product and subscription applicability

### 💰 Payment Tracking

Record and track payments against invoices:

- Payment amount
- Payment method
- Payment date
- Notes
- Related invoice

Identify paid, outstanding, and overdue invoices.

### 📈 Business Analytics

Provides management with a centralized view of subscription and billing performance.

---

## 🔄 Subscription Workflow

```text
Customer
   ↓
Select Product / Plan
   ↓
Create Subscription
   ↓
Quotation
   ↓
Confirmation
   ↓
Active Subscription
   ↓
Billing
   ↓
Invoice Generation
   ↓
Payment
   ↓
Paid / Outstanding / Overdue
   ↓
Renewal / Closure
```

---

## 🛠️ Technology Stack

- HTML5
- CSS3
- JavaScript
- Modular JavaScript architecture
- Responsive web interface
- Browser-based application storage

---

## 📁 Project Structure

```text
brightloop-subscription-management/
│
├── index.html
├── app.js
├── README.md
├── LICENSE
│
├── modules/
│   ├── billing/
│   │   ├── billing.html
│   │   ├── billing.css
│   │   └── billings.js
│   │
│   ├── dashboard/
│   │   ├── dashboard.html
│   │   ├── dashboard.css
│   │   └── dashboard.js
│   │
│   ├── products/
│   │   ├── products.html
│   │   ├── products.css
│   │   └── products.js
│   │
│   └── subscriptions/
│       ├── subscriptions.html
│       ├── subscriptions.css
│       └── subscriptions.js
│
├── shared/
│   ├── auth.js
│   ├── schema.md
│   └── store.js
│
└── styles/
    └── main.css
```

---

## ▶️ Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/Vedavarsha-S/brightloop-subscription-management.git
```

### 2. Navigate to the project directory

```bash
cd brightloop-subscription-management
```

### 3. Run the application

Open the project in Visual Studio Code and launch `index.html` using the **Live Server** extension.

---

## 🌐 Live Demo

Explore the application:

[**Brightloop Subscription Management – Live Demo**](https://smrithi-krishna.github.io/brightloop-subscription-management/)

---

## 🎯 Hackathon Focus

The project focuses on reducing manual subscription and billing operations by bringing the entire subscription lifecycle into a single platform.

Instead of managing subscriptions in spreadsheets, manually preparing invoices, and separately tracking payments, Brightloop provides a unified workflow for subscription-based businesses.

---

## 👥 Team

**Brightloop Subscription Management Team**

Developed as part of the **Odoo × Make-A-Ton 9.0 Hackathon**.

---

## 📄 License

This project is licensed under the terms specified in the repository's LICENSE file.
