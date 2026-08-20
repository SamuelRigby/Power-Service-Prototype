"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useServiceFetch } from "@/lib/useServiceFetch";
import { ERASER, type PaintTool } from "@/lib/schedule";
import type { PowerSource, Schedule, ScheduleGrid as ScheduleGridData } from "@/lib/types";
import { ScheduleLegend } from "./ScheduleLegend";
import { SchedulePalette } from "./SchedulePalette";
import { ScheduleGrid } from "./ScheduleGrid";
import styles from "./ScheduleView.module.css";

export function ScheduleView() {
  const serviceFetch = useServiceFetch();
  const [powerSources, setPowerSources] = useState<PowerSource[] | null>(null);
  const [grid, setGrid] = useState<ScheduleGridData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedTool, setSelectedTool] = useState<PaintTool>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function initialLoad() {
      try {
        const [scheduleData, sourcesData] = await Promise.all([
          serviceFetch<Schedule>("/api/v1/schedules"),
          serviceFetch<PowerSource[]>("/api/v1/power-sources"),
        ]);
        if (!ignore) {
          setGrid(scheduleData.grid);
          setPowerSources(sourcesData);
          setLoadError(null);
        }
      } catch {
        if (!ignore) {
          setLoadError("Couldn't load your schedule. Try refreshing the page.");
        }
      }
    }
    initialLoad();
    return () => {
      ignore = true;
    };
  }, [serviceFetch]);

  const powerSourcesById = useMemo(() => {
    const map = new Map<string, PowerSource>();
    for (const source of powerSources ?? []) {
      map.set(source.id, source);
    }
    return map;
  }, [powerSources]);

  function handlePaint(day: number, hour: number, tool: PaintTool) {
    setGrid((prev) => {
      const current = prev ?? {};
      const dayKey = String(day);
      const hourKey = String(hour);
      const nextDay = { ...(current[dayKey] ?? {}) };

      if (tool === ERASER) {
        delete nextDay[hourKey];
      } else if (tool !== null) {
        nextDay[hourKey] = tool;
      }

      const next = { ...current, [dayKey]: nextDay };
      if (Object.keys(nextDay).length === 0) {
        delete next[dayKey];
      }
      return next;
    });
    setIsDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const result = await serviceFetch<Schedule>("/api/v1/schedules", {
        method: "PUT",
        body: { grid: grid ?? {} },
      });
      setGrid(result.grid);
      setIsDirty(false);
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.headerRow}>
        <div>
          <p className={styles.eyebrow}>Schedule</p>
          <h1 className={styles.heading}>Weekly Schedule</h1>
        </div>
        <div className={styles.saveArea}>
          <span className={isDirty ? styles.statusDirty : styles.statusSaved}>
            {isDirty ? "Unsaved changes" : "All changes saved"}
          </span>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
            disabled={!isDirty || saving || grid === null}
          >
            {saving ? "Saving…" : "Save Schedule"}
          </button>
        </div>
      </div>

      {loadError ? (
        <p className={styles.loadError} role="alert">
          {loadError}
        </p>
      ) : null}
      {saveError ? (
        <p className={styles.loadError} role="alert">
          {saveError}
        </p>
      ) : null}

      {powerSources === null || grid === null ? (
        loadError ? null : <p className={styles.loading}>Loading schedule…</p>
      ) : powerSources.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No power sources yet</p>
          <p className={styles.emptyBody}>
            Add a power source before building your weekly schedule.
          </p>
          <Link href="/service/power-sources" className={styles.addButton}>
            Go to Power Sources
          </Link>
        </div>
      ) : (
        <>
          <p className={styles.hint}>
            Select a power source below, then click or drag across the grid to assign it. Select
            Eraser to clear cells.
          </p>
          <SchedulePalette
            powerSources={powerSources}
            selectedTool={selectedTool}
            onSelect={setSelectedTool}
          />
          <ScheduleGrid
            grid={grid}
            powerSourcesById={powerSourcesById}
            selectedTool={selectedTool}
            onPaint={handlePaint}
          />
          <ScheduleLegend />
        </>
      )}
    </div>
  );
}
