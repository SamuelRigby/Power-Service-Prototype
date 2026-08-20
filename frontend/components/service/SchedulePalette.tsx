"use client";

import { POWER_TYPE_COLORS } from "@/lib/powerTypes";
import { ERASER, type PaintTool } from "@/lib/schedule";
import type { PowerSource } from "@/lib/types";
import styles from "./SchedulePalette.module.css";

interface SchedulePaletteProps {
  powerSources: PowerSource[];
  selectedTool: PaintTool;
  onSelect: (tool: PaintTool) => void;
}

export function SchedulePalette({ powerSources, selectedTool, onSelect }: SchedulePaletteProps) {
  return (
    <div className={styles.palette}>
      <p className={styles.paletteLabel}>Assign</p>
      <div className={styles.chips}>
        {powerSources.map((source) => (
          <button
            key={source.id}
            type="button"
            className={selectedTool === source.id ? styles.chipActive : styles.chip}
            onClick={() => onSelect(selectedTool === source.id ? null : source.id)}
            aria-pressed={selectedTool === source.id}
          >
            <span
              className={styles.chipDot}
              style={{ backgroundColor: POWER_TYPE_COLORS[source.power_type] }}
              aria-hidden="true"
            />
            {source.name}
          </button>
        ))}
        <button
          type="button"
          className={selectedTool === ERASER ? styles.chipActive : styles.chip}
          onClick={() => onSelect(selectedTool === ERASER ? null : ERASER)}
          aria-pressed={selectedTool === ERASER}
        >
          Eraser
        </button>
      </div>
    </div>
  );
}
