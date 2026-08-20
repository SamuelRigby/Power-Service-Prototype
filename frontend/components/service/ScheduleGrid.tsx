"use client";

import { useEffect, useState } from "react";
import { POWER_TYPE_COLORS } from "@/lib/powerTypes";
import { DAYS, HOURS, type PaintTool } from "@/lib/schedule";
import type { PowerSource, ScheduleGrid as ScheduleGridData } from "@/lib/types";
import styles from "./ScheduleGrid.module.css";

interface ScheduleGridProps {
  grid: ScheduleGridData;
  powerSourcesById: Map<string, PowerSource>;
  selectedTool: PaintTool;
  onPaint: (day: number, hour: number, tool: PaintTool) => void;
}

export function ScheduleGrid({ grid, powerSourcesById, selectedTool, onPaint }: ScheduleGridProps) {
  const [isPainting, setIsPainting] = useState(false);

  useEffect(() => {
    function stopPainting() {
      setIsPainting(false);
    }
    window.addEventListener("mouseup", stopPainting);
    return () => window.removeEventListener("mouseup", stopPainting);
  }, []);

  function paintCell(day: number, hour: number) {
    if (selectedTool === null) return;
    onPaint(day, hour, selectedTool);
  }

  return (
    <div className={styles.gridWrap}>
      <table className={styles.grid}>
        <thead>
          <tr>
            <th className={styles.cornerCell} aria-hidden="true" />
            {HOURS.map((hour) => (
              <th key={hour} className={styles.hourHeader}>
                {hour}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day) => (
            <tr key={day.index}>
              <th className={styles.dayHeader} scope="row">
                {day.short}
              </th>
              {HOURS.map((hour) => {
                const sourceId = grid[String(day.index)]?.[String(hour)];
                const source = sourceId ? powerSourcesById.get(sourceId) : undefined;
                const color = source ? POWER_TYPE_COLORS[source.power_type] : undefined;
                const label = source
                  ? `${day.label} ${hour}:00 — assigned to ${source.name}`
                  : `${day.label} ${hour}:00 — unassigned`;
                return (
                  <td key={hour} className={styles.cellWrap}>
                    <button
                      type="button"
                      className={styles.cell}
                      style={color ? { backgroundColor: color } : undefined}
                      title={label}
                      aria-label={label}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        setIsPainting(true);
                        paintCell(day.index, hour);
                      }}
                      onMouseEnter={() => {
                        if (isPainting) paintCell(day.index, hour);
                      }}
                      onClick={() => paintCell(day.index, hour)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
