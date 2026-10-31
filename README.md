# Brightloop Subscription Management System

A unified subscription management platform built for **Brightloop Software** to manage products, plans, subscriptions, invoices, payments, discounts, and business analytics in one place.

🔗 **Live Demo:** https://smrithi-krishna.github.io/brightloop-subscription-management/

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

Provides a centralized overview of the business with important subscription and billing information such as:

- Active subscriptions
- Revenue
- Payments
- Outstanding invoices
- Overdue invoices
- Business analytics

### 📦 Product Management

Admins can manage subscription products and their details, including:

- Product name
- Product type
- Sales price
- Cost price
- Notes
- Product variants

### 💳 Plan Management

Create and manage subscription plans with:

- Pricing
- Billing frequency
- Minimum quantity
- Availability period
- Subscription lifecycle options

Supported billing frequencies include:

- Daily
- Weekly
- Monthly
- Yearly

### 👥 Subscription Management

Manage the complete subscription lifecycle:

**Draft → Quotation → Confirmed → Active → Closed**

Each subscription contains relevant customer, plan, product, quantity, pricing, tax, and payment information.

### 🧾 Invoice Management

Invoices can be generated from subscriptions with:

- Customer details
- Product lines
- Taxes
- Discounts
- Total amount
- Payment status

Invoice lifecycle:

**Draft → Confirmed → Paid**

### 🎁 Discount Management

Supports configurable discounts based on business rules, including:

- Percentage discounts
- Fixed-amount discounts
- Minimum purchase/quantity
- Start and end dates
- Usage limits
- Product/subscription applicability

### 💰 Payment Tracking

Payments can be recorded against invoices with:

- Payment amount
- Payment method
- Payment date
- Notes
- Related invoice

The system helps identify paid, outstanding, and overdue invoices.

### 📈 Business Analytics

Provides management with a centralized view of:

- Active subscriptions
- Revenue
- Payments received
- Outstanding payments
- Overdue invoices

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

- **HTML5**
- **JavaScript**
- **CSS3**
- Modular JavaScript architecture
- Responsive web interface

---

## 📁 Project Structure

```text
brightloop-subscription-management/
│
├── index.html
├── app.js
│
├── modules/
│   └── Application modules
│
├── shared/
│   └── Shared functionality
│
├── styles/
│   └── Styling and UI
│
├── README.md
└── LICENSE
```

---

## ▶️ Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/Vedavarsha-S/brightloop-subscription-management.git
```

### 2. Navigate to the project

```bash
cd brightloop-subscription-management
```

### 3. Run the application

Since the project is a frontend web application, it can be opened directly through `index.html` or served using a local development server.

For example, with VS Code, use **Live Server** to launch the application.

---

## 🌐 Live Demo

Try the deployed application:

**https://smrithi-krishna.github.io/brightloop-subscription-management/**

---

## 🎯 Hackathon Focus

The project focuses on reducing manual subscription and billing operations by bringing the entire subscription lifecycle into a single platform.

Instead of managing subscriptions in spreadsheets, manually preparing invoices, and separately tracking payments, Brightloop provides a unified workflow for subscription-based businesses.

---

## 👥 Team

**Brightloop Subscription Management Team**

Built as a hackathon project.

---

## 📄 License

This project is licensed under the terms specified in the repository's LICENSE file.
