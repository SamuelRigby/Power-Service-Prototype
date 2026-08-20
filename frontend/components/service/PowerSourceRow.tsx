"use client";

import { useState } from "react";
import { POWER_TYPE_COLORS } from "@/lib/powerTypes";
import type { PowerSource } from "@/lib/types";
import styles from "./PowerSourcesView.module.css";

interface PowerSourceRowProps {
  powerSource: PowerSource;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

export function PowerSourceRow({ powerSource, onEdit, onDelete }: PowerSourceRowProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete() {
    setDeleting(true);
    await onDelete();
  }

  return (
    <tr>
      <td className={styles.nameCell}>{powerSource.name}</td>
      <td className={styles.typeCell}>
        <span
          className={styles.typeDot}
          style={{ backgroundColor: POWER_TYPE_COLORS[powerSource.power_type] }}
          aria-hidden="true"
        />
        {powerSource.power_type}
      </td>
      <td className={styles.numberCell}>{powerSource.instantaneous_output_mw.toLocaleString()}</td>
      <td className={styles.numberCell}>{powerSource.actual_output_mwh.toLocaleString()}</td>
      <td className={styles.actionsCell}>
        {confirmingDelete ? (
          <div className={styles.confirmRow}>
            <span>Delete?</span>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className={styles.confirmDeleteButton}
              disabled={deleting}
            >
              {deleting ? "…" : "Yes"}
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
          <div className={styles.actions}>
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
          </div>
        )}
      </td>
    </tr>
  );
}
