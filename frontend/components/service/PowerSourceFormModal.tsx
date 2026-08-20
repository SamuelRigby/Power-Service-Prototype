"use client";

import { type FormEvent, useState } from "react";
import { ApiError } from "@/lib/api";
import { POWER_TYPES } from "@/lib/powerTypes";
import type { PowerSource, PowerSourceInput, PowerType } from "@/lib/types";
import { Modal } from "./Modal";
import styles from "./ServiceForm.module.css";

interface PowerSourceFormModalProps {
  powerSource?: PowerSource;
  onClose: () => void;
  onSubmit: (data: PowerSourceInput) => Promise<void>;
}

const emptyForm: PowerSourceInput = {
  name: "",
  power_type: "solar",
  instantaneous_output_mw: 0,
  actual_output_mwh: 0,
};

export function PowerSourceFormModal({ powerSource, onClose, onSubmit }: PowerSourceFormModalProps) {
  const [form, setForm] = useState<PowerSourceInput>(
    powerSource
      ? {
          name: powerSource.name,
          power_type: powerSource.power_type,
          instantaneous_output_mw: powerSource.instantaneous_output_mw,
          actual_output_mwh: powerSource.actual_output_mwh,
        }
      : emptyForm,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof PowerSourceInput>(key: K, value: PowerSourceInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Enter a name.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("A power source with that name already exists.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <Modal title={powerSource ? "Edit Power Source" : "Add Power Source"} onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.field}>
          <label htmlFor="power-source-name">Name</label>
          <input
            id="power-source-name"
            type="text"
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="power-source-type">Power Type</label>
          <select
            id="power-source-type"
            required
            value={form.power_type}
            onChange={(event) => updateField("power_type", event.target.value as PowerType)}
          >
            {POWER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="power-source-instantaneous">Instantaneous Output (MW)</label>
            <input
              id="power-source-instantaneous"
              type="number"
              step="0.01"
              min="0"
              value={form.instantaneous_output_mw}
              onChange={(event) =>
                updateField("instantaneous_output_mw", Number(event.target.value))
              }
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="power-source-actual">Actual Output (MWh)</label>
            <input
              id="power-source-actual"
              type="number"
              step="0.01"
              min="0"
              value={form.actual_output_mwh}
              onChange={(event) => updateField("actual_output_mwh", Number(event.target.value))}
            />
          </div>
        </div>

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? "Saving…" : powerSource ? "Save Changes" : "Add Power Source"}
        </button>
      </form>
    </Modal>
  );
}
