
/* =========================================
   BRIGHTLOOP - SHARED STORAGE
========================================= */

// Common localStorage keys
export const STORAGE_KEYS = {
    PRODUCTS: "bl_products",
    PLANS: "bl_plans",
    CUSTOMERS: "bl_customers",
    SUBSCRIPTIONS: "bl_subscriptions",
    INVOICES: "bl_invoices",
    PAYMENTS: "bl_payments",
    DISCOUNTS: "bl_discounts"
};


// 1. Get all records
export function getData(key) {
    try {
        const storedData = localStorage.getItem(key);

        if (!storedData) {
            return [];
        }

        const parsedData = JSON.parse(storedData);

        if (!Array.isArray(parsedData)) {
            return [];
        }

        if (key === STORAGE_KEYS.PAYMENTS) {
            const normalizedPayments = parsedData.map(payment =>
                payment.status === "Completed"
                    ? { ...payment, status: "Successful" }
                    : payment
            );

            if (normalizedPayments.some((payment, index) => payment !== parsedData[index])) {
                localStorage.setItem(key, JSON.stringify(normalizedPayments));
            }

            return normalizedPayments;
        }

        return parsedData;

    } catch (error) {
        console.error(`Error reading ${key}:`, error);
        return [];
    }
}


// 2. Save all records
export function saveData(key, data) {
    if (!Array.isArray(data)) {
        throw new Error("Data must be an array.");
    }

    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;

    } catch (error) {
        console.error(`Error saving ${key}:`, error);
        throw error;
    }
}


// 3. Add a new record
export function addRecord(key, record) {
    if (!record || record.id === undefined || record.id === null) {
        throw new Error("Every record must have a unique ID.");
    }

    const records = getData(key);

    const alreadyExists = records.some(
        item => String(item.id) === String(record.id)
    );

    if (alreadyExists) {
        throw new Error(`Record with ID ${record.id} already exists.`);
    }

    records.push(record);

    saveData(key, records);

    return record;
}


// 4. Update an existing record
export function updateRecord(key, id, updates) {
    const records = getData(key);

    const index = records.findIndex(
        item => String(item.id) === String(id)
    );

    if (index === -1) {
        throw new Error(`Record with ID ${id} not found.`);
    }

    records[index] = {
        ...records[index],
        ...updates,
        id: records[index].id
    };

    saveData(key, records);

    return records[index];
}


// 5. Delete a record
export function deleteRecord(key, id) {
    const records = getData(key);

    const updatedRecords = records.filter(
        item => String(item.id) !== String(id)
    );

    if (updatedRecords.length === records.length) {
        return false;
    }

    saveData(key, updatedRecords);

    return true;
}


// 6. record by ID
export function getRecordById(key, id) {
    const records = getData(key);

    return records.find(
        item => String(item.id) === String(id)
    ) || null;
}


// unique record ID
export function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase()}`;
}
