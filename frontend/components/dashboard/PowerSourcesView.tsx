"use client";

import { useCallback, useEffect, useState } from "react";
import { useDashboardFetch } from "@/lib/useDashboardFetch";
import type { PowerSource, PowerSourceInput } from "@/lib/types";
import { PowerSourceFormModal } from "./PowerSourceFormModal";
import { PowerSourceRow } from "./PowerSourceRow";
import styles from "./PowerSourcesView.module.css";

type ModalState = { mode: "create" } | { mode: "edit"; powerSource: PowerSource } | null;

export function PowerSourcesView() {
  const dashboardFetch = useDashboardFetch();
  const [powerSources, setPowerSources] = useState<PowerSource[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);

  const loadPowerSources = useCallback(async () => {
    try {
      const data = await dashboardFetch<PowerSource[]>("/api/v1/power-sources");
      setPowerSources(data);
      setLoadError(null);
    } catch {
      setLoadError("Couldn't load power sources. Try refreshing the page.");
    }
  }, [dashboardFetch]);

  useEffect(() => {
    let ignore = false;
    async function initialLoad() {
      try {
        const data = await dashboardFetch<PowerSource[]>("/api/v1/power-sources");
        if (!ignore) {
          setPowerSources(data);
          setLoadError(null);
        }
      } catch {
        if (!ignore) {
          setLoadError("Couldn't load power sources. Try refreshing the page.");
        }
      }
    }
    initialLoad();
    return () => {
      ignore = true;
    };
  }, [dashboardFetch]);

  async function handleCreate(data: PowerSourceInput) {
    await dashboardFetch("/api/v1/power-sources", { method: "POST", body: data });
    await loadPowerSources();
  }

  async function handleUpdate(id: string, data: PowerSourceInput) {
    await dashboardFetch(`/api/v1/power-sources/${id}`, { method: "PUT", body: data });
    await loadPowerSources();
  }

  async function handleDelete(id: string) {
    await dashboardFetch(`/api/v1/power-sources/${id}`, { method: "DELETE" });
    await loadPowerSources();
  }

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.headerRow}>
        <div>
          <p className={styles.eyebrow}>Power Sources</p>
          <h1 className={styles.heading}>Power Sources</h1>
        </div>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => setModalState({ mode: "create" })}
        >
          + Add Power Source
        </button>
      </div>

      {loadError ? (
        <p className={styles.loadError} role="alert">
          {loadError}
        </p>
      ) : null}

      {powerSources === null && !loadError ? (
        <p className={styles.loading}>Loading power sources…</p>
      ) : powerSources && powerSources.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No power sources yet</p>
          <p className={styles.emptyBody}>Add your first power source to get started.</p>
          <button
            type="button"
            className={styles.addButton}
            onClick={() => setModalState({ mode: "create" })}
          >
            + Add Power Source
          </button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Instantaneous (MW)</th>
                <th>Actual (MWh)</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {powerSources?.map((source) => (
                <PowerSourceRow
                  key={source.id}
                  powerSource={source}
                  onEdit={() => setModalState({ mode: "edit", powerSource: source })}
                  onDelete={() => handleDelete(source.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalState ? (
        <PowerSourceFormModal
          powerSource={modalState.mode === "edit" ? modalState.powerSource : undefined}
          onClose={() => setModalState(null)}
          onSubmit={(data) =>
            modalState.mode === "edit"
              ? handleUpdate(modalState.powerSource.id, data)
              : handleCreate(data)
          }
        />
      ) : null}
    </div>
  );
}
