"use client";

import { useCallback, useEffect, useState } from "react";
import { useDashboardFetch } from "@/lib/useDashboardFetch";
import type { Customer, CustomerInput, PaymentRecord } from "@/lib/types";
import { CustomerCard } from "./CustomerCard";
import { CustomerFormModal } from "./CustomerFormModal";
import styles from "./CustomersView.module.css";

type ModalState = { mode: "create" } | { mode: "edit"; customer: Customer } | null;

export function CustomersView() {
  const dashboardFetch = useDashboardFetch();
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);

  const loadCustomers = useCallback(async () => {
    try {
      const data = await dashboardFetch<Customer[]>("/api/v1/customers");
      setCustomers(data);
      setLoadError(null);
    } catch {
      setLoadError("Couldn't load customers. Try refreshing the page.");
    }
  }, [dashboardFetch]);

  useEffect(() => {
    let ignore = false;
    async function initialLoad() {
      try {
        const data = await dashboardFetch<Customer[]>("/api/v1/customers");
        if (!ignore) {
          setCustomers(data);
          setLoadError(null);
        }
      } catch {
        if (!ignore) {
          setLoadError("Couldn't load customers. Try refreshing the page.");
        }
      }
    }
    initialLoad();
    return () => {
      ignore = true;
    };
  }, [dashboardFetch]);

  async function handleCreate(data: CustomerInput) {
    await dashboardFetch("/api/v1/customers", { method: "POST", body: data });
    await loadCustomers();
  }

  async function handleUpdate(id: string, data: CustomerInput) {
    await dashboardFetch(`/api/v1/customers/${id}`, { method: "PUT", body: data });
    await loadCustomers();
  }

  async function handleDelete(id: string) {
    await dashboardFetch(`/api/v1/customers/${id}`, { method: "DELETE" });
    await loadCustomers();
  }

  async function handleAddPayment(customer: Customer, record: PaymentRecord) {
    const updated = [...customer.payment_history, record];
    await dashboardFetch(`/api/v1/customers/${customer.id}`, {
      method: "PUT",
      body: { payment_history: updated },
    });
    await loadCustomers();
  }

  async function handleRemovePayment(customer: Customer, index: number) {
    const updated = customer.payment_history.filter((_, i) => i !== index);
    await dashboardFetch(`/api/v1/customers/${customer.id}`, {
      method: "PUT",
      body: { payment_history: updated },
    });
    await loadCustomers();
  }

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.headerRow}>
        <div>
          <p className={styles.eyebrow}>Customers</p>
          <h1 className={styles.heading}>Customer Accounts</h1>
        </div>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => setModalState({ mode: "create" })}
        >
          + Add Customer
        </button>
      </div>

      {loadError ? (
        <p className={styles.loadError} role="alert">
          {loadError}
        </p>
      ) : null}

      {customers === null && !loadError ? (
        <p className={styles.loading}>Loading customers…</p>
      ) : customers && customers.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No customers yet</p>
          <p className={styles.emptyBody}>Add your first customer to get started.</p>
          <button
            type="button"
            className={styles.addButton}
            onClick={() => setModalState({ mode: "create" })}
          >
            + Add Customer
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {customers?.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={() => setModalState({ mode: "edit", customer })}
              onDelete={() => handleDelete(customer.id)}
              onAddPayment={(record) => handleAddPayment(customer, record)}
              onRemovePayment={(index) => handleRemovePayment(customer, index)}
            />
          ))}
        </div>
      )}

      {modalState ? (
        <CustomerFormModal
          customer={modalState.mode === "edit" ? modalState.customer : undefined}
          onClose={() => setModalState(null)}
          onSubmit={(data) =>
            modalState.mode === "edit" ? handleUpdate(modalState.customer.id, data) : handleCreate(data)
          }
        />
      ) : null}
    </div>
  );
}
