export interface DayInfo {
  index: number;
  label: string;
  short: string;
}

/** 0 = Sunday, ..., 6 = Saturday - matches the backend's ScheduleGrid day convention exactly. */
export const DAYS: DayInfo[] = [
  { index: 0, label: "Sunday", short: "Sun" },
  { index: 1, label: "Monday", short: "Mon" },
  { index: 2, label: "Tuesday", short: "Tue" },
  { index: 3, label: "Wednesday", short: "Wed" },
  { index: 4, label: "Thursday", short: "Thu" },
  { index: 5, label: "Friday", short: "Fri" },
  { index: 6, label: "Saturday", short: "Sat" },
];

export const HOURS: number[] = Array.from({ length: 24 }, (_, i) => i);

/** Sentinel paint value for "clear this cell" - not a valid Mongo ObjectId, so it can't collide with a real power_source_id. */
export const ERASER = "ERASER";

/** The grid's currently selected paint tool: a power_source_id, the eraser, or nothing selected. */
export type PaintTool = string | typeof ERASER | null;
