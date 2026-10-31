
# Brightloop - Shared Data Schema

All modules must use this common data structure.
Do not rename fields or localStorage keys without team agreement.

## 1. Products

Storage key: `bl_products`

Fields:
- id: unique string
- name: product name
- type: product category
- price: base sales price
- cost: product cost price
- notes: product description or notes
- variants: array of product variants
- createdAt: creation date

Example:

{
  "id": "PROD-001",
  "name": "Brightloop CRM",
  "type": "Software",
  "price": 999,
  "cost": 400,
  "notes": "Customer relationship management software",
  "variants": [
    {
      "id": "VAR-001",
      "name": "Odoo Brand",
      "additionalPrice": 560
    }
  ],
  "createdAt": "2026-10-31"
}

## 2. Plans

Storage key: `bl_plans`

Fields:
- id: unique string
- productId: linked product ID
- name: plan name
- interval: daily, weekly, monthly or yearly
- price: plan price per billing period
- minQuantity: minimum subscription quantity
- startDate: plan availability start date
- endDate: plan availability end date
- status: active or inactive

Example:

{
  "id": "PLAN-001",
  "productId": "PROD-001",
  "name": "Professional",
  "interval": "monthly",
  "price": 999,
  "minQuantity": 1,
  "startDate": "2026-10-01",
  "endDate": "2027-10-01",
  "status": "active"
}

## 3. Customers

Storage key: `bl_customers`

Fields:
- id: unique string
- name: customer name
- email: unique email address
- phone: optional phone number
- createdAt: creation date

Example:

{
  "id": "CUST-001",
  "name": "ABC Stores",
  "email": "abc@example.com",
  "phone": "9876543210",
  "createdAt": "2026-10-31"
}

## 4. Subscriptions

Storage key: `bl_subscriptions`

Fields:
- id: unique subscription number
- customerId: linked customer ID
- planId: linked plan ID
- productId: linked product ID
- quantity: subscribed quantity
- unitPrice: price per unit at subscription creation
- variantId: optional selected variant ID
- startDate: subscription start date
- expiryDate: subscription expiry date
- paymentTerms: payment terms
- status: Draft, Quotation, Confirmed, Active or Closed
- nextBillingDate: next invoice date
- createdAt: creation date

Example:

{
  "id": "SUB-001",
  "customerId": "CUST-001",
  "planId": "PLAN-001",
  "productId": "PROD-001",
  "quantity": 1,
  "unitPrice": 999,
  "variantId": "VAR-001",
  "startDate": "2026-10-31",
  "expiryDate": "2027-10-31",
  "paymentTerms": "Monthly",
  "status": "Active",
  "nextBillingDate": "2026-11-30",
  "createdAt": "2026-10-31"
}

## 5. Invoices

Storage key: `bl_invoices`

Fields:
- id: unique invoice number
- subscriptionId: linked subscription ID
- customerId: linked customer ID
- items: array of invoice line items
- billingPeriodStart: billing period start date
- billingPeriodEnd: billing period end date
- subtotal: amount before discount and tax
- discount: discount amount
- taxRate: tax percentage
- taxAmount: calculated tax amount
- amount: final invoice total
- dueDate: payment due date
- status: Draft, Confirmed, Paid or Cancelled
- createdAt: invoice creation date

Each item contains:
- productId
- planId
- description
- quantity
- unitPrice
- amount

Example:

{
  "id": "INV-001",
  "subscriptionId": "SUB-001",
  "customerId": "CUST-001",
  "items": [
    {
      "productId": "PROD-001",
      "planId": "PLAN-001",
      "description": "Brightloop CRM Professional",
      "quantity": 1,
      "unitPrice": 999,
      "amount": 999
    }
  ],
  "billingPeriodStart": "2026-10-31",
  "billingPeriodEnd": "2026-11-30",
  "subtotal": 999,
  "discount": 0,
  "taxRate": 18,
  "taxAmount": 179.82,
  "amount": 1178.82,
  "dueDate": "2026-11-07",
  "status": "Confirmed",
  "createdAt": "2026-10-31"
}

## 6. Payments

Storage key: `bl_payments`

Fields:
- id: unique payment number
- invoiceId: linked invoice ID
- amount: payment amount
- method: UPI, Card, Cash or Bank Transfer
- date: payment date
- note: optional payment note
- status: Successful, Pending or Failed

Example:

{
  "id": "PAY-001",
  "invoiceId": "INV-001",
  "amount": 1178.82,
  "method": "UPI",
  "date": "2026-10-31",
  "note": "Demo payment",
  "status": "Successful"
}

## 7. Discounts

Storage key: `bl_discounts`

Fields:
- id: unique discount ID
- name: discount name
- type: fixed or percentage
- value: discount value
- minPurchase: minimum purchase amount
- minQuantity: minimum quantity
- startDate: validity start
- endDate: validity end
- usageLimit: maximum allowed uses
- usedCount: number of uses
- productIds: applicable product IDs
- status: active or inactive

## 8. Common localStorage keys

bl_products
bl_plans
bl_customers
bl_subscriptions
bl_invoices
bl_payments
bl_discounts

## 9. Relationships

- A product can have multiple plans.
- A product can have multiple variants.
- A customer can have multiple subscriptions.
- A subscription belongs to one customer and one plan.
- A subscription can have multiple invoices over time.
- An invoice belongs to one customer and one subscription.
- An invoice can have multiple payments.
- Discounts can apply to eligible products or subscriptions.

## 10. Important rules

1. Every record must have a unique ID.
2. Use the shared storage functions from `store.js`.
3. Store linked record IDs, not duplicate customer or product objects.
4. Store the agreed price on the subscription and invoice so later price changes do not rewrite old transactions.
5. Never create duplicate invoices for the same subscription and billing period.
6. Never allow successful payments to exceed the invoice's outstanding balance.
7. Only successful payments count towards collected revenue.
8. Calculate outstanding balance as invoice amount minus successful payments.
9. Use consistent status spelling and capitalization.
10. All prices are stored as numbers in INR.
11. Payment processing in this demo is simulated. Never store card numbers, CVVs, passwords or real payment credentials.
