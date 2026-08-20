"use client";

import { type FormEvent, useState } from "react";
import type { Customer, PaymentRecord } from "@/lib/types";
import styles from "./CustomerCard.module.css";

interface CustomerCardProps {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onAddPayment: (record: PaymentRecord) => Promise<void>;
  onRemovePayment: (index: number) => Promise<void>;
}

export function CustomerCard({
  customer,
  onEdit,
  onDelete,
  onAddPayment,
  onRemovePayment,
}: CustomerCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [addingPayment, setAddingPayment] = useState(false);

  async function handleConfirmDelete() {
    setDeleting(true);
    await onDelete();
  }

  async function handleAddPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPaymentError(null);
    const amount = Number(paymentAmount);
    if (!paymentDate || !paymentAmount || Number.isNaN(amount)) {
      setPaymentError("Enter a date and amount.");
      return;
    }
    setAddingPayment(true);
    try {
      await onAddPayment({ date: paymentDate, amount });
      setPaymentDate("");
      setPaymentAmount("");
    } catch {
      setPaymentError("Couldn't add that payment. Try again.");
    } finally {
      setAddingPayment(false);
    }
  }

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Account {customer.service_account_number}</p>
          <h3 className={styles.address}>{customer.street_address}</h3>
          <p className={styles.location}>
            {customer.city}, {customer.state} {customer.zip_code}
          </p>
        </div>
        <div className={styles.actions}>
          {confirmingDelete ? (
            <div className={styles.confirmRow}>
              <span>Delete this customer?</span>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className={styles.confirmDeleteButton}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button type="button" onClick={onEdit} className={styles.editButton}>
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </header>

      <dl className={styles.stats}>
        <div>
          <dt>Current cycle</dt>
          <dd>{customer.kwh_consumed_current_cycle.toLocaleString()} kWh</dd>
        </div>
        <div>
          <dt>Lifetime</dt>
          <dd>{customer.lifetime_kwh_consumed.toLocaleString()} kWh</dd>
        </div>
        <div>
          <dt>Overdue</dt>
          <dd className={customer.total_overdue_payment > 0 ? styles.overdue : undefined}>
            ${customer.total_overdue_payment.toFixed(2)}
          </dd>
        </div>
      </dl>

      <div className={styles.payments}>
        <p className={styles.paymentsLabel}>Payment History</p>
        {customer.payment_history.length === 0 ? (
          <p className={styles.paymentsEmpty}>No payments recorded.</p>
        ) : (
          <ul className={styles.paymentsList}>
            {customer.payment_history.map((payment, index) => (
              <li key={`${payment.date}-${index}`}>
                <span>{new Date(payment.date).toLocaleDateString()}</span>
                <span>${payment.amount.toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => onRemovePayment(index)}
                  aria-label="Remove payment"
                  className={styles.removePaymentButton}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <form className={styles.paymentForm} onSubmit={handleAddPayment}>
          <input
            type="date"
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
            aria-label="Payment date"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Amount"
            value={paymentAmount}
            onChange={(event) => setPaymentAmount(event.target.value)}
            aria-label="Payment amount"
          />
          <button type="submit" disabled={addingPayment}>
            Add
          </button>
        </form>
        {paymentError ? <p className={styles.paymentError}>{paymentError}</p> : null}
      </div>
    </article>
  );
}
