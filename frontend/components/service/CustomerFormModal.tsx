"use client";

import { type FormEvent, useState } from "react";
import { ApiError } from "@/lib/api";
import type { Customer, CustomerInput } from "@/lib/types";
import { Modal } from "./Modal";
import styles from "./ServiceForm.module.css";

interface CustomerFormModalProps {
  customer?: Customer;
  onClose: () => void;
  onSubmit: (data: CustomerInput) => Promise<void>;
}

const emptyForm: CustomerInput = {
  service_account_number: "",
  zip_code: "",
  state: "",
  city: "",
  street_address: "",
  kwh_consumed_current_cycle: 0,
  lifetime_kwh_consumed: 0,
  total_overdue_payment: 0,
};

export function CustomerFormModal({ customer, onClose, onSubmit }: CustomerFormModalProps) {
  const [form, setForm] = useState<CustomerInput>(
    customer
      ? {
          service_account_number: customer.service_account_number,
          zip_code: customer.zip_code,
          state: customer.state,
          city: customer.city,
          street_address: customer.street_address,
          kwh_consumed_current_cycle: customer.kwh_consumed_current_cycle,
          lifetime_kwh_consumed: customer.lifetime_kwh_consumed,
          total_overdue_payment: customer.total_overdue_payment,
        }
      : emptyForm,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (
      !form.service_account_number.trim() ||
      !form.zip_code.trim() ||
      !form.state.trim() ||
      !form.city.trim() ||
      !form.street_address.trim()
    ) {
      setError("Fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("A customer with that service account number already exists.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <Modal title={customer ? "Edit Customer" : "Add Customer"} onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.field}>
          <label htmlFor="customer-account">Service Account Number</label>
          <input
            id="customer-account"
            type="text"
            required
            value={form.service_account_number}
            onChange={(event) => updateField("service_account_number", event.target.value)}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="customer-city">City</label>
            <input
              id="customer-city"
              type="text"
              required
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="customer-state">State</label>
            <input
              id="customer-state"
              type="text"
              required
              value={form.state}
              onChange={(event) => updateField("state", event.target.value)}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="customer-street">Street Address</label>
            <input
              id="customer-street"
              type="text"
              required
              value={form.street_address}
              onChange={(event) => updateField("street_address", event.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="customer-zip">ZIP Code</label>
            <input
              id="customer-zip"
              type="text"
              required
              value={form.zip_code}
              onChange={(event) => updateField("zip_code", event.target.value)}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="customer-current-kwh">Current Cycle (kWh)</label>
            <input
              id="customer-current-kwh"
              type="number"
              step="0.01"
              min="0"
              value={form.kwh_consumed_current_cycle}
              onChange={(event) =>
                updateField("kwh_consumed_current_cycle", Number(event.target.value))
              }
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="customer-lifetime-kwh">Lifetime (kWh)</label>
            <input
              id="customer-lifetime-kwh"
              type="number"
              step="0.01"
              min="0"
              value={form.lifetime_kwh_consumed}
              onChange={(event) => updateField("lifetime_kwh_consumed", Number(event.target.value))}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="customer-overdue">Total Overdue Payment ($)</label>
          <input
            id="customer-overdue"
            type="number"
            step="0.01"
            min="0"
            value={form.total_overdue_payment}
            onChange={(event) => updateField("total_overdue_payment", Number(event.target.value))}
          />
        </div>

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? "Saving…" : customer ? "Save Changes" : "Add Customer"}
        </button>
      </form>
    </Modal>
  );
}
